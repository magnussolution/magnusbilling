<?php

/**
 * Builds a deterministic diagnostic for one persisted failed CDR.
 *
 * This service is read-only. It correlates the originating channel uniqueid
 * and CDR server with the compact Sentinel event table and never reads
 * Asterisk logs or contacts another server.
 */
class FailedCallDiagnosticService
{
    const CONTRACT = 'magnusbilling.call-diagnostic/v1';
    const CATALOG = 'magnusbilling.call-diagnostic-catalog/v1';
    const EVENT_LIMIT = 50;
    const EVENT_WINDOW_MARGIN_SECONDS = 300;

    private $db;
    private $healthResolver;
    private $runtimeProbe;

    public function __construct(
        $db,
        $healthResolver = null,
        $runtimeProbe = null
    )
    {
        $this->db = $db;
        $this->healthResolver = $healthResolver;
        $this->runtimeProbe = $runtimeProbe;
    }

    public function diagnose($cdrFailedId)
    {
        $cdr = $this->queryRow(
            "
            SELECT c.id,c.uniqueid,c.starttime,c.src,c.callerid,
                   c.calledstation,c.terminatecauseid,c.hangupcause,
                   c.id_user,c.id_plan,c.id_prefix,c.id_trunk,c.id_server,
                   u.username,p.name plan_name,px.destination prefix_name,
                   t.trunkcode trunk_name,s.name server_name
            FROM pkg_cdr_failed c
            LEFT JOIN pkg_user u ON u.id=c.id_user
            LEFT JOIN pkg_plan p ON p.id=c.id_plan
            LEFT JOIN pkg_prefix px ON px.id=c.id_prefix
            LEFT JOIN pkg_trunk t ON t.id=c.id_trunk
            LEFT JOIN pkg_servers s ON s.id=c.id_server
            WHERE c.id=:id
            LIMIT 1
            ",
            [':id' => (int) $cdrFailedId]
        );
        if (! $cdr) {
            return null;
        }

        $eventsTable = $this->tableExists(
            'pkg_magnus_sentinel_trunk_event'
        );
        if (! $eventsTable) {
            return $this->withoutEvents(
                $cdr,
                'sentinel_not_installed',
                'Advanced details require Magnus Sentinel.',
                false
            );
        }

        $eventWindow = $this->eventWindow($cdr);
        $eventParams = [
            ':uniqueid' => (string) $cdr['uniqueid'],
            ':event_window_start' => $eventWindow['start'],
            ':event_window_end' => $eventWindow['end'],
        ];
        if ($cdr['id_server'] === null) {
            $serverCondition = 'e.id_server IS NULL';
        } else {
            $serverCondition = 'e.id_server=:id_server';
            $eventParams[':id_server'] = (int) $cdr['id_server'];
        }
        $rows = $this->queryAll(
            "
            SELECT e.id,e.event_time,e.id_trunk,e.id_server,e.callerid,
                   e.response_code,e.response_reason,
                   t.trunkcode trunk_name,s.name server_name
            FROM pkg_magnus_sentinel_trunk_event e FORCE INDEX (ix_uniqueid)
            LEFT JOIN pkg_trunk t ON t.id=e.id_trunk
            LEFT JOIN pkg_servers s ON s.id=e.id_server
            WHERE e.uniqueid=:uniqueid
              AND " . $serverCondition . "
              AND e.event_time BETWEEN :event_window_start
                                   AND :event_window_end
            ORDER BY e.event_time ASC,e.id ASC
            LIMIT 51
            ",
            $eventParams
        );
        $truncated = count($rows) > self::EVENT_LIMIT;
        if ($truncated) {
            $rows = array_slice($rows, 0, self::EVENT_LIMIT);
        }

        $earliestEventAt = $this->queryScalar(
            'SELECT MIN(event_time)
             FROM pkg_magnus_sentinel_trunk_event FORCE INDEX (ix_event_time)',
            []
        );
        $health = $this->pipelineHealth();

        if (! $rows) {
            $expired = $earliestEventAt
                && strtotime((string) $cdr['starttime'])
                    < strtotime((string) $earliestEventAt);
            return $this->withoutEvents(
                $cdr,
                $expired ? 'events_expired' : 'exact_event_not_found',
                $expired
                    ? 'The events for this call may already have expired.'
                    : 'There is not enough evidence yet to determine what happened.',
                $expired,
                $health,
                $earliestEventAt
            );
        }

        $attempts = [];
        foreach ($rows as $index => $row) {
            $classification = self::classify(
                (int) $row['response_code'],
                (string) $row['response_reason']
            );
            $eventCallerId = isset($row['callerid'])
                ? trim((string) $row['callerid'])
                : '';
            $attempts[] = [
                'sequence' => $index + 1,
                'eventId' => (int) $row['id'],
                'eventTime' => (string) $row['event_time'],
                'trunk' => $this->entity(
                    $row['id_trunk'],
                    $row['trunk_name']
                ),
                'server' => $this->entity(
                    $row['id_server'],
                    $row['server_name']
                ),
                'raw' => [
                    'code' => (int) $row['response_code'],
                    'reason' => (string) $row['response_reason'],
                ],
                'callerIdSent' => [
                    'available' => $eventCallerId !== '',
                    'value' => $eventCallerId !== ''
                        ? $eventCallerId
                        : null,
                    'source' => $eventCallerId !== ''
                        ? 'pkg_magnus_sentinel_trunk_event.callerid'
                        : null,
                    'reason' => $eventCallerId !== ''
                        ? null
                        : 'event_callerid_empty',
                ],
                'classification' => $classification,
            ];
        }
        $runtimeChecks = $this->runtimeChecks($attempts);
        foreach ($attempts as $index => $attempt) {
            $runtimeKey = $this->runtimeKey(
                $attempt['server']['id'],
                $attempt['trunk']['id']
            );
            $attempts[$index]['currentTrunkStatus'] = isset(
                $runtimeChecks['byTarget'][$runtimeKey]
            ) ? $runtimeChecks['byTarget'][$runtimeKey] : $this->runtimeUnknown();
        }
        unset($runtimeChecks['byTarget']);
        $trunkAlerts = $this->activeTrunkAlerts($attempts);
        foreach ($attempts as $index => $attempt) {
            $idTrunk = $attempt['trunk']['id'];
            $attempts[$index]['sentinelAlerts'] = (
                $idTrunk !== null
                && isset($trunkAlerts['byTrunk'][(string) $idTrunk])
                ? $trunkAlerts['byTrunk'][(string) $idTrunk]
                : []
            );
        }
        unset($trunkAlerts['byTrunk']);
        $history = $this->buildHistory($cdr, $attempts);
        $operational = $this->operationalFindings($attempts);

        $last = $attempts[count($attempts) - 1];
        $classification = $last['classification'];
        $limitations = [];
        $status = 'confirmed';
        if ($truncated) {
            $status = 'partial';
            $limitations[] = $this->limitation(
                'event_limit_reached',
                'Only the first 50 correlated events are shown.'
            );
        }
        if ($health['status'] !== 'HEALTHY') {
            $status = 'partial';
            $limitations[] = $this->limitation(
                'pipeline_' . strtolower($health['status']),
                'The evidence may be incomplete because the Sentinel pipeline is not healthy.'
            );
        }
        if (in_array(
            $classification['key'],
            ['internal_unknown', 'unknown'],
            true
        )) {
            $status = 'partial';
            $limitations[] = $this->limitation(
                'unclassified_result',
                'The observed result has no proven meaning in the current catalog.'
            );
        }
        if (! $this->containsTrunk($attempts, $cdr['id_trunk'])) {
            $status = 'partial';
            $limitations[] = $this->limitation(
                'cdr_trunk_not_observed',
                'The trunk stored in the failed CDR was not present in the correlated events.'
            );
        }

        return [
            'contract' => self::CONTRACT,
            'status' => $status,
            'summary' => $classification['summary'],
            'call' => $this->call($cdr),
            'history' => $history,
            'attempts' => $attempts,
            'operationalFindings' => $operational['findings'],
            'runtimeChecks' => $runtimeChecks,
            'trunkAlerts' => $trunkAlerts,
            'lastObservedResult' => [
                'sequence' => $last['sequence'],
                'raw' => $last['raw'],
                'classificationKey' => $classification['key'],
            ],
            'facts' => [
                [
                    'key' => 'exact_uniqueid_server_match',
                    'text' => self::translate(
                        'The events have the same uniqueid and server as the failed CDR.'
                    ),
                ],
                [
                    'key' => 'observed_attempt_count',
                    'text' => self::translate(count($attempts) === 1
                        ? 'One correlated trunk event was observed.'
                        : 'Multiple correlated trunk events were observed.'),
                ],
            ],
            'probableCause' => [
                'key' => $classification['causeKey'],
                'text' => $classification['cause'],
                'confidence' => $classification['confidence'],
                'basis' => $classification['basis'],
            ],
            'recommendedActions' => $this->mergeActions(
                $classification['actions'],
                $operational['actions']
            ),
            'limitations' => $limitations,
            'evidence' => [
                'sentinelAvailable' => true,
                'correlation' => 'exact_uniqueid_server',
                'pipeline' => $health,
                'retention' => [
                    'earliestEventAt' => (
                        $earliestEventAt !== false
                        ? $earliestEventAt
                        : null
                    ),
                    'possiblyExpired' => false,
                ],
                'eventLimit' => self::EVENT_LIMIT,
                'returnedEvents' => count($attempts),
                'truncated' => $truncated,
            ],
            'technicalDetails' => [
                'cdrTerminateCauseId' => (
                    $cdr['terminatecauseid'] !== null
                    ? (int) $cdr['terminatecauseid']
                    : null
                ),
                'cdrHangupCause' => (
                    $cdr['hangupcause'] !== null
                    ? (int) $cdr['hangupcause']
                    : null
                ),
                'rawUniqueid' => (string) $cdr['uniqueid'],
                'correlationServerId' => (
                    $cdr['id_server'] !== null
                    ? (int) $cdr['id_server']
                    : null
                ),
                'catalog' => self::CATALOG,
                'queryOrder' => ['event_time', 'id'],
                'eventWindow' => $eventWindow,
            ],
        ];
    }

    public static function classify($code, $reason)
    {
        $code = (int) $code;
        $reason = trim((string) $reason);
        $normalized = strtolower($reason);
        $explicit = $reason !== ''
            && $normalized !== 'unknown'
            && $normalized !== 'undefined';

        if ($code >= 612 && $code <= 618) {
            return self::result(
                'internal_unknown',
                'An internal result was observed, but its meaning is not proven.',
                'internal_result_unknown',
                'The internal code cannot be safely interpreted.',
                'low',
                ['internal_code_' . $code],
                ['Review the raw code and provider response before changing routing.']
            );
        }
        if ($code === 486) {
            return self::result(
                'busy',
                'The destination was busy in the last observed attempt.',
                'destination_busy',
                'The destination was probably busy.',
                'high',
                ['sip_code_486'],
                ['Try the call again later.']
            );
        }
        if ($code === 487) {
            return self::result(
                'cancelled',
                'The last observed attempt was cancelled.',
                'call_cancelled',
                'The call was probably cancelled before completion.',
                'high',
                ['sip_code_487'],
                ['Confirm whether the caller or an upstream timeout cancelled the call.']
            );
        }
        if ($code === 404 || $code === 484) {
            $format = self::containsAny(
                $normalized,
                ['format', 'address incomplete', 'invalid number', 'not numeric']
            );
            return self::result(
                $format ? 'invalid_format' : 'number_not_found',
                $format
                    ? 'The provider explicitly reported an invalid number format.'
                    : 'The number was not found or was incomplete in the last observed attempt.',
                $format ? 'invalid_number_format' : 'number_not_found',
                $format
                    ? 'The dialled number probably has an invalid format.'
                    : 'The provider probably could not locate the dialled number.',
                $format ? 'high' : 'medium',
                array_merge(
                    ['sip_code_' . $code],
                    $format ? ['explicit_provider_reason'] : []
                ),
                $format
                    ? ['Review the country code, area code and number formatting.']
                    : ['Verify that the destination number exists and is complete.']
            );
        }
        if ($code === 401 || $code === 407
            || ($code === 403 && self::containsAny(
                $normalized,
                ['auth', 'credential', 'password', 'unauthorized ip', 'ip not allowed']
            ))
        ) {
            return self::result(
                'authentication',
                'The provider rejected authentication or authorization.',
                'trunk_authentication',
                'The trunk credentials or authorized source may be incorrect.',
                self::containsAny(
                    $normalized,
                    ['auth', 'credential', 'password', 'unauthorized ip', 'ip not allowed']
                ) ? 'high' : 'medium',
                array_merge(
                    ['sip_code_' . $code],
                    self::containsAny(
                        $normalized,
                        ['auth', 'credential', 'password', 'unauthorized ip', 'ip not allowed']
                    ) ? ['explicit_provider_reason'] : []
                ),
                ['Verify trunk credentials and the source IP authorized by the provider.']
            );
        }
        if ($code === 403 || $code === 603) {
            $explicitRejection = self::containsAny(
                $normalized,
                ['blocked', 'not allowed', 'denied', 'blacklist', 'policy', 'limit']
            );
            return self::result(
                'rejected',
                'The provider rejected the last observed attempt.',
                'provider_rejection',
                'The provider probably rejected the call.',
                $explicitRejection ? 'high' : 'medium',
                array_merge(
                    ['sip_code_' . $code],
                    $explicitRejection ? ['explicit_provider_reason'] : []
                ),
                ['Review the raw provider reason and the trunk account policy.']
            );
        }
        if ($code === 408 || $code === 504
            || self::containsAny($normalized, ['timeout', 'timed out'])
        ) {
            return self::result(
                'timeout',
                'The last observed attempt timed out.',
                'provider_timeout',
                'The trunk or an upstream provider probably did not respond in time.',
                $explicit || $code === 408 || $code === 504 ? 'high' : 'medium',
                ['sip_code_' . $code],
                ['Retry safely and check trunk reachability if the timeout repeats.']
            );
        }
        if ($code === 488
            || self::containsAny(
                $normalized,
                ['codec', 'media', 'sdp', 'not acceptable']
            )
        ) {
            $explicitMedia = self::containsAny(
                $normalized,
                ['codec', 'media', 'sdp']
            );
            return self::result(
                'codec_or_media',
                'The last observed attempt reported incompatible media or codec.',
                'codec_or_media_mismatch',
                'The call probably failed because media negotiation was not accepted.',
                $explicitMedia ? 'high' : 'medium',
                array_merge(
                    ['sip_code_' . $code],
                    $explicitMedia ? ['explicit_provider_reason'] : []
                ),
                ['Compare the codecs allowed by MagnusBilling and the provider.']
            );
        }
        if ($code === 480) {
            return self::result(
                'temporarily_unavailable',
                'The destination was temporarily unavailable.',
                'destination_temporarily_unavailable',
                'The destination or its route was probably temporarily unavailable.',
                'high',
                ['sip_code_480'],
                ['Try the call again later.']
            );
        }
        if ($code === 500) {
            $explicitServerFailure = self::containsAny(
                $normalized,
                ['database', 'routing', 'upstream', 'overload']
            );
            return self::result(
                'provider_server_error',
                'The provider reported an internal server error.',
                'provider_server_error',
                'The provider probably encountered an internal error.',
                $explicitServerFailure ? 'high' : 'medium',
                array_merge(
                    ['sip_code_500'],
                    $explicitServerFailure ? ['explicit_provider_reason'] : []
                ),
                ['Retry once and contact the provider if the error repeats.']
            );
        }
        if ($code === 503) {
            $explicitUnavailable = self::containsAny(
                $normalized,
                ['blocked', 'capacity', 'overload', 'maintenance']
            );
            return self::result(
                'service_unavailable',
                'The provider reported that the service was unavailable.',
                'provider_service_unavailable',
                'The provider or route was probably unavailable.',
                $explicitUnavailable ? 'high' : 'medium',
                array_merge(
                    ['sip_code_503'],
                    $explicitUnavailable ? ['explicit_provider_reason'] : []
                ),
                ['Retry safely or use an approved alternate trunk if configured.']
            );
        }

        return self::result(
            'unknown',
            'A correlated result was observed, but it is not classified.',
            'unclassified_result',
            'There is not enough proven information to identify a probable cause.',
            'low',
            ['raw_code_' . $code],
            ['Review the raw code and reason without changing routing automatically.']
        );
    }

    private static function result(
        $key,
        $summary,
        $causeKey,
        $cause,
        $confidence,
        array $basis,
        array $actions
    ) {
        return [
            'key' => $key,
            'label' => self::translate(ucwords(str_replace('_', ' ', $key))),
            'summary' => self::translate($summary),
            'causeKey' => $causeKey,
            'cause' => self::translate($cause),
            'confidence' => $confidence,
            'basis' => array_values($basis),
            'catalog' => self::CATALOG,
            'actions' => array_map(function ($text) {
                return [
                    'key' => strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($text, '.'))),
                    'text' => self::translate($text),
                    'safety' => 'safe',
                ];
            }, $actions),
        ];
    }

    private function withoutEvents(
        array $cdr,
        $key,
        $message,
        $expired,
        $health = null,
        $earliestEventAt = null
    ) {
        $message = self::translate($message);
        $cdrOutcome = $this->cdrOutcome($cdr);
        if ($health === null) {
            $health = [
                'status' => 'UNKNOWN',
                'checkedAt' => null,
                'reasons' => ['sentinel_not_installed'],
            ];
        }
        return [
            'contract' => self::CONTRACT,
            'status' => $cdrOutcome ? 'partial' : 'inconclusive',
            'summary' => $cdrOutcome
                ? $cdrOutcome['summary']
                : $message,
            'call' => $this->call($cdr),
            'history' => $this->buildHistory($cdr, []),
            'attempts' => [],
            'operationalFindings' => [],
            'runtimeChecks' => [
                'scope' => 'current',
                'checkedAt' => null,
                'items' => [],
                'truncated' => false,
            ],
            'trunkAlerts' => [
                'available' => false,
                'scope' => 'active_now',
                'checkedAt' => null,
                'trunks' => [],
                'truncated' => false,
            ],
            'lastObservedResult' => null,
            'facts' => $cdrOutcome ? [[
                'key' => $cdrOutcome['key'],
                'text' => $cdrOutcome['fact'],
            ]] : [],
            'probableCause' => $cdrOutcome ? [
                'key' => $cdrOutcome['causeKey'],
                'text' => $cdrOutcome['cause'],
                'confidence' => $cdrOutcome['confidence'],
                'basis' => $cdrOutcome['basis'],
            ] : [
                'key' => null,
                'text' => self::translate(
                    'No probable cause can be established from the available evidence.'
                ),
                'confidence' => 'none',
                'basis' => [],
            ],
            'recommendedActions' => $cdrOutcome ? [[
                'key' => $cdrOutcome['actionKey'],
                'text' => $cdrOutcome['action'],
                'safety' => 'safe',
            ]] : [[
                'key' => 'verify_evidence_availability',
                'text' => $expired
                    ? self::translate('Use a more recent call for advanced diagnosis.')
                    : self::translate(
                        'Wait briefly and retry the diagnostic if the call is recent.'
                    ),
                'safety' => 'safe',
            ]],
            'limitations' => [$this->limitation($key, $message)],
            'evidence' => [
                'sentinelAvailable' => $key !== 'sentinel_not_installed',
                'correlation' => 'none',
                'pipeline' => $health,
                'retention' => [
                    'earliestEventAt' => (
                        $earliestEventAt !== false
                        ? $earliestEventAt
                        : null
                    ),
                    'possiblyExpired' => (bool) $expired,
                ],
                'eventLimit' => self::EVENT_LIMIT,
                'returnedEvents' => 0,
                'truncated' => false,
            ],
            'technicalDetails' => [
                'cdrTerminateCauseId' => (
                    $cdr['terminatecauseid'] !== null
                    ? (int) $cdr['terminatecauseid']
                    : null
                ),
                'cdrHangupCause' => (
                    $cdr['hangupcause'] !== null
                    ? (int) $cdr['hangupcause']
                    : null
                ),
                'rawUniqueid' => (string) $cdr['uniqueid'],
                'correlationServerId' => (
                    $cdr['id_server'] !== null
                    ? (int) $cdr['id_server']
                    : null
                ),
                'catalog' => self::CATALOG,
                'queryOrder' => ['event_time', 'id'],
            ],
        ];
    }

    private function call(array $cdr)
    {
        $cdrOutcome = $this->cdrOutcome($cdr);
        return [
            'cdrFailedId' => (int) $cdr['id'],
            'uniqueid' => (string) $cdr['uniqueid'],
            'startedAt' => (string) $cdr['starttime'],
            'source' => (string) $cdr['src'],
            'callerId' => (string) $cdr['callerid'],
            'calledNumber' => (string) $cdr['calledstation'],
            'cdrResult' => $cdrOutcome ? [
                'key' => $cdrOutcome['key'],
                'label' => $cdrOutcome['label'],
                'terminateCauseId' => (int) $cdr['terminatecauseid'],
                'durationSeconds' => $cdrOutcome['durationSeconds'],
            ] : null,
            'user' => $this->entity($cdr['id_user'], $cdr['username']),
            'plan' => $this->entity($cdr['id_plan'], $cdr['plan_name']),
            'prefix' => $this->entity($cdr['id_prefix'], $cdr['prefix_name']),
            'cdrTrunk' => $this->entity($cdr['id_trunk'], $cdr['trunk_name']),
            'server' => $this->entity(
                $cdr['id_server'],
                $cdr['server_name'] !== null
                    ? $cdr['server_name']
                    : ($cdr['id_server'] === null ? 'MASTER' : null)
            ),
        ];
    }

    private function buildHistory(array $cdr, array $attempts)
    {
        $inviteAt = $this->inviteTime(
            (string) $cdr['uniqueid'],
            (string) $cdr['starttime']
        );
        $server = $this->entity(
            $cdr['id_server'],
            $cdr['server_name'] !== null
                ? $cdr['server_name']
                : ($cdr['id_server'] === null ? 'MASTER' : null)
        );
        $cdrOutcome = $this->cdrOutcome($cdr);
        $entries = [];
        $previousAt = $inviteAt['at'];
        $previousTrunkId = null;
        foreach ($attempts as $attempt) {
            $entries[] = [
                'sequence' => $attempt['sequence'],
                'eventTime' => $attempt['eventTime'],
                'secondsAfterInvite' => $this->secondsBetween(
                    $inviteAt['at'],
                    $attempt['eventTime']
                ),
                'secondsAfterPrevious' => $this->secondsBetween(
                    $previousAt,
                    $attempt['eventTime']
                ),
                'isNextTrunk' => (
                    $previousTrunkId !== null
                    && $attempt['trunk']['id'] !== $previousTrunkId
                ),
                'trunk' => $attempt['trunk'],
                'server' => $attempt['server'],
                'raw' => $attempt['raw'],
                'classification' => $attempt['classification'],
                'callerIdSent' => $attempt['callerIdSent'],
                'currentTrunkStatus' => $attempt['currentTrunkStatus'],
                'sentinelAlerts' => $attempt['sentinelAlerts'],
            ];
            $previousAt = $attempt['eventTime'];
            $previousTrunkId = $attempt['trunk']['id'];
        }
        return [
            'invite' => [
                'at' => $inviteAt['at'],
                'unixTimestamp' => $inviteAt['unixTimestamp'],
                'uniqueid' => (string) $cdr['uniqueid'],
                'server' => $server,
                'source' => $inviteAt['source'],
            ],
            'entries' => $entries,
            'outcome' => $cdrOutcome ? [
                'at' => (string) $cdr['starttime'],
                'secondsAfterInvite' => $this->secondsBetween(
                    $inviteAt['at'],
                    (string) $cdr['starttime']
                ),
                'key' => $cdrOutcome['key'],
                'label' => $cdrOutcome['label'],
                'text' => $cdrOutcome['summary'],
                'source' => 'pkg_cdr_failed.terminatecauseid',
            ] : null,
        ];
    }

    /**
     * Classifies only outcomes whose meaning is explicit in pkg_cdr_failed.
     * This evidence remains available when Sentinel is not installed.
     */
    private function cdrOutcome(array $cdr)
    {
        if ((int) $cdr['terminatecauseid'] !== 4) {
            return null;
        }

        $invite = $this->inviteTime(
            (string) $cdr['uniqueid'],
            (string) $cdr['starttime']
        );
        $durationSeconds = $invite['source'] === 'uniqueid_epoch'
            ? $this->secondsBetween(
                $invite['at'],
                (string) $cdr['starttime']
            )
            : null;
        $summary = $durationSeconds !== null
            ? self::translate(
                'The caller cancelled the call after {seconds} seconds, before it was answered.',
                ['{seconds}' => $durationSeconds]
            )
            : self::translate(
                'The caller cancelled the call before it was answered.'
            );

        return [
            'key' => 'caller_cancelled',
            'label' => self::translate('Cancel'),
            'summary' => $summary,
            'durationSeconds' => $durationSeconds,
            'causeKey' => 'caller_cancelled_before_answer',
            'cause' => self::translate(
                'The originating user ended the call before it was answered.'
            ),
            'confidence' => 'high',
            'basis' => ['cdr_terminatecauseid_4'],
            'fact' => self::translate(
                'The failed CDR records the call result as Cancel.'
            ),
            'actionKey' => 'no_trunk_change_for_caller_cancel',
            'action' => self::translate(
                'No trunk configuration change is indicated. Retry only if the caller did not intend to cancel the call.'
            ),
        ];
    }

    private function inviteTime($uniqueid, $fallback)
    {
        $parts = explode('.', $uniqueid, 2);
        $epoch = isset($parts[0]) && preg_match('/^[0-9]{9,12}$/', $parts[0])
            ? (int) $parts[0]
            : null;
        if ($epoch === null) {
            return [
                'at' => $fallback,
                'unixTimestamp' => null,
                'source' => 'cdr_starttime',
            ];
        }
        $date = new DateTime('@' . $epoch);
        $date->setTimezone(new DateTimeZone(date_default_timezone_get()));
        return [
            'at' => $date->format('Y-m-d H:i:s'),
            'unixTimestamp' => $epoch,
            'source' => 'uniqueid_epoch',
        ];
    }

    /**
     * Bounds the indexed uniqueid lookup to the observed call interval.
     * Time is never used as a fallback correlation key: uniqueid and server
     * equality remain mandatory in the SQL query.
     */
    private function eventWindow(array $cdr)
    {
        $invite = $this->inviteTime(
            (string) $cdr['uniqueid'],
            (string) $cdr['starttime']
        );
        $inviteTimestamp = strtotime((string) $invite['at']);
        $cdrTimestamp = strtotime((string) $cdr['starttime']);

        if ($inviteTimestamp === false && $cdrTimestamp === false) {
            $inviteTimestamp = $cdrTimestamp = 0;
        } elseif ($inviteTimestamp === false) {
            $inviteTimestamp = $cdrTimestamp;
        } elseif ($cdrTimestamp === false) {
            $cdrTimestamp = $inviteTimestamp;
        }

        return [
            'start' => date(
                'Y-m-d H:i:s',
                min($inviteTimestamp, $cdrTimestamp)
                    - self::EVENT_WINDOW_MARGIN_SECONDS
            ),
            'end' => date(
                'Y-m-d H:i:s',
                max($inviteTimestamp, $cdrTimestamp)
                    + self::EVENT_WINDOW_MARGIN_SECONDS
            ),
            'marginSeconds' => self::EVENT_WINDOW_MARGIN_SECONDS,
        ];
    }

    private function secondsBetween($from, $to)
    {
        $fromTimestamp = strtotime((string) $from);
        $toTimestamp = strtotime((string) $to);
        if ($fromTimestamp === false || $toTimestamp === false) {
            return null;
        }
        $difference = $toTimestamp - $fromTimestamp;
        return $difference >= 0 ? $difference : null;
    }

    private function runtimeChecks(array $attempts)
    {
        $targets = [];
        $entities = [];
        foreach ($attempts as $attempt) {
            if ($attempt['trunk']['id'] === null) {
                continue;
            }
            $key = $this->runtimeKey(
                $attempt['server']['id'],
                $attempt['trunk']['id']
            );
            if (isset($entities[$key])) {
                continue;
            }
            $targets[] = [
                'idTrunk' => $attempt['trunk']['id'],
                'idServer' => $attempt['server']['id'],
            ];
            $entities[$key] = [
                'trunk' => $attempt['trunk'],
                'server' => $attempt['server'],
            ];
        }
        $resolved = [];
        if (is_callable($this->runtimeProbe)) {
            $resolved = call_user_func($this->runtimeProbe, $targets);
        } elseif (is_object($this->runtimeProbe)
            && method_exists($this->runtimeProbe, 'probe')
        ) {
            $resolved = $this->runtimeProbe->probe($targets);
        }
        if (! is_array($resolved)) {
            $resolved = [];
        }

        $items = [];
        $byTarget = [];
        $checkedAt = null;
        foreach ($entities as $key => $entity) {
            $status = isset($resolved[$key])
                && is_array($resolved[$key])
                ? $resolved[$key]
                : $this->runtimeUnknown();
            $byTarget[$key] = $status;
            if ($checkedAt === null && ! empty($status['checkedAt'])) {
                $checkedAt = $status['checkedAt'];
            }
            $items[] = [
                'trunk' => $entity['trunk'],
                'server' => $entity['server'],
                'result' => $status,
            ];
        }
        return [
            'scope' => 'current',
            'checkedAt' => $checkedAt,
            'items' => $items,
            'truncated' => count($targets) > 3,
            'byTarget' => $byTarget,
        ];
    }

    private function runtimeKey($idServer, $idTrunk)
    {
        return ($idServer === null ? 'master' : (string) (int) $idServer)
            . ':' . ($idTrunk !== null ? (int) $idTrunk : 0);
    }

    private function runtimeUnknown()
    {
        return [
            'checked' => false,
            'checkedAt' => null,
            'status' => 'probe_unavailable',
            'summary' => self::translate(
                'The current trunk status is unavailable.'
            ),
            'source' => null,
            'technology' => null,
            'endpoint' => null,
            'latencyMs' => null,
            'contactIps' => [],
            'firewall' => [
                'checked' => false,
                'blocked' => null,
                'checkedIps' => [],
                'matches' => [],
                'source' => 'fail2ban',
            ],
        ];
    }

    private function operationalFindings(array $attempts)
    {
        $findings = [];
        $actions = [];
        $seen = [];
        foreach ($attempts as $attempt) {
            $key = $this->runtimeKey(
                $attempt['server']['id'],
                $attempt['trunk']['id']
            );
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $status = $attempt['currentTrunkStatus'];
            $firewall = isset($status['firewall'])
                ? $status['firewall']
                : [];
            if (isset($firewall['blocked']) && $firewall['blocked'] === true) {
                $blockedIps = [];
                foreach ($firewall['matches'] as $match) {
                    $blockedIps[] = $match['ip'];
                }
                $findings[] = [
                    'key' => 'trunk_ip_blocked',
                    'severity' => 'critical',
                    'trunk' => $attempt['trunk'],
                    'server' => $attempt['server'],
                    'text' => self::translate(
                        'The provider IP is currently blocked by Fail2ban.'
                    ),
                    'details' => [
                        'ips' => array_values(array_unique($blockedIps)),
                    ],
                    'currentState' => true,
                ];
                $actions[] = [
                    'key' => 'review_trunk_firewall_block',
                    'text' => self::translate(
                        'Review the Fail2ban block and jail for this provider IP; remove the block only after confirming the IP is legitimate.'
                    ),
                    'safety' => 'safe',
                ];
            }
            if (in_array(
                $status['status'],
                [
                    'unavailable',
                    'no_contact',
                    'not_found',
                    'configured_inactive',
                ],
                true
            )) {
                $findings[] = [
                    'key' => 'trunk_' . $status['status'],
                    'severity' => $status['status'] === 'unavailable'
                        ? 'critical'
                        : 'warning',
                    'trunk' => $attempt['trunk'],
                    'server' => $attempt['server'],
                    'text' => $status['summary'],
                    'currentState' => true,
                ];
                $actions[] = [
                    'key' => 'review_current_trunk_status',
                    'text' => self::translate(
                        'Check the trunk registration, contact and provider reachability on the affected server before changing the route.'
                    ),
                    'safety' => 'safe',
                ];
            }
        }
        return [
            'findings' => $findings,
            'actions' => $actions,
        ];
    }

    private function mergeActions(array $catalogActions, array $runtimeActions)
    {
        $merged = [];
        foreach (array_merge($catalogActions, $runtimeActions) as $action) {
            $key = isset($action['key'])
                ? (string) $action['key']
                : md5(json_encode($action));
            $merged[$key] = $action;
        }
        return array_values($merged);
    }

    private function activeTrunkAlerts(array $attempts)
    {
        $result = [
            'available' => false,
            'scope' => 'active_now',
            'checkedAt' => null,
            'trunks' => [],
            'truncated' => false,
            'byTrunk' => [],
        ];
        if (! $this->tableExists('pkg_magnus_sentinel_incident')) {
            return $result;
        }
        $trunks = [];
        foreach ($attempts as $attempt) {
            if ($attempt['trunk']['id'] !== null) {
                $trunks[(string) $attempt['trunk']['id']] =
                    $attempt['trunk'];
            }
        }
        if (! $trunks) {
            $result['available'] = true;
            return $result;
        }
        $params = [];
        $placeholders = [];
        foreach (array_keys($trunks) as $index => $idTrunk) {
            $key = ':trunk' . $index;
            $params[$key] = (int) $idTrunk;
            $placeholders[] = $key;
        }
        $rows = $this->queryAll(
            "
            SELECT id,incident_type,state,severity,entity_id,
                   first_seen,last_seen,occurrence_count,incident_json
            FROM pkg_magnus_sentinel_incident FORCE INDEX (ix_incident_entity)
            WHERE entity_kind='trunk'
              AND entity_id IN (" . implode(',', $placeholders) . ")
              AND state IN ('new','acknowledged')
            ORDER BY severity DESC,last_seen DESC,id DESC
            LIMIT 51
            ",
            $params
        );
        if (count($rows) > self::EVENT_LIMIT) {
            $rows = array_slice($rows, 0, self::EVENT_LIMIT);
            $result['truncated'] = true;
        }
        foreach ($trunks as $idTrunk => $trunk) {
            $result['byTrunk'][$idTrunk] = [];
        }
        foreach ($rows as $row) {
            $idTrunk = (string) (int) $row['entity_id'];
            if (! isset($result['byTrunk'][$idTrunk])) {
                continue;
            }
            $contract = json_decode((string) $row['incident_json'], true);
            $result['byTrunk'][$idTrunk][] = [
                'id' => (int) $row['id'],
                'type' => (string) $row['incident_type'],
                'state' => (string) $row['state'],
                'severity' => (string) $row['severity'],
                'firstSeen' => (string) $row['first_seen'],
                'lastSeen' => (string) $row['last_seen'],
                'occurrenceCount' => (int) $row['occurrence_count'],
                'summary' => (
                    is_array($contract) && isset($contract['summary'])
                    ? (string) $contract['summary']
                    : null
                ),
            ];
        }
        foreach ($trunks as $idTrunk => $trunk) {
            $result['trunks'][] = [
                'trunk' => $trunk,
                'activeAlerts' => $result['byTrunk'][$idTrunk],
            ];
        }
        $result['available'] = true;
        $result['checkedAt'] = $this->queryScalar(
            'SELECT UTC_TIMESTAMP(6)',
            []
        );
        return $result;
    }

    private function entity($id, $name)
    {
        return [
            'id' => $id !== null ? (int) $id : null,
            'name' => $name !== null ? (string) $name : null,
        ];
    }

    private function pipelineHealth()
    {
        if (is_callable($this->healthResolver)) {
            return call_user_func($this->healthResolver);
        }
        if (! $this->tableExists(
            'pkg_magnus_sentinel_component_health'
        )) {
            return [
                'status' => 'UNKNOWN',
                'checkedAt' => null,
                'reasons' => ['health_table_missing'],
            ];
        }
        $health = MagnusSentinelIncidentApiV1::getHealth($this->db);
        return [
            'status' => (string) $health['health_status'],
            'checkedAt' => (string) $health['evaluated_at'],
            'reasons' => array_values(array_map(function ($item) {
                return isset($item['reason'])
                    ? (string) $item['reason']
                    : 'unknown';
            }, $health['health_reasons'])),
        ];
    }

    private function containsTrunk(array $attempts, $idTrunk)
    {
        if ($idTrunk === null) {
            return true;
        }
        foreach ($attempts as $attempt) {
            if ($attempt['trunk']['id'] === (int) $idTrunk) {
                return true;
            }
        }
        return false;
    }

    private function limitation($key, $text)
    {
        return ['key' => $key, 'text' => self::translate($text)];
    }

    private static function translate($message, array $params = [])
    {
        if (class_exists('Yii', false)) {
            return Yii::t('zii', $message, $params);
        }
        return $params ? strtr($message, $params) : $message;
    }

    private function tableExists($table)
    {
        return (bool) $this->queryScalar(
            'SELECT COUNT(*)
             FROM information_schema.tables
             WHERE table_schema=DATABASE() AND table_name=:table',
            [':table' => $table]
        );
    }

    private static function containsAny($haystack, array $needles)
    {
        foreach ($needles as $needle) {
            if (strpos($haystack, $needle) !== false) {
                return true;
            }
        }
        return false;
    }

    private function queryAll($sql, array $params)
    {
        $command = $this->db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryAll();
    }

    private function queryRow($sql, array $params)
    {
        $command = $this->db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryRow();
    }

    private function queryScalar($sql, array $params)
    {
        $command = $this->db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryScalar();
    }
}
