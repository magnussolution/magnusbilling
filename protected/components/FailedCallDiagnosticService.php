<?php

/**
 * Builds a deterministic diagnostic for one persisted failed CDR.
 *
 * This service is read-only. It correlates the originating channel uniqueid
 * with the compact Sentinel event table and never reads Asterisk logs or
 * contacts another server.
 */
class FailedCallDiagnosticService
{
    const CONTRACT = 'magnusbilling.call-diagnostic/v1';
    const CATALOG = 'magnusbilling.call-diagnostic-catalog/v1';
    const EVENT_LIMIT = 50;

    private $db;
    private $healthResolver;

    public function __construct($db, $healthResolver = null)
    {
        $this->db = $db;
        $this->healthResolver = $healthResolver;
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

        $rows = $this->queryAll(
            "
            SELECT e.id,e.event_time,e.id_trunk,e.id_server,
                   e.response_code,e.response_reason,
                   t.trunkcode trunk_name,s.name server_name
            FROM pkg_magnus_sentinel_trunk_event e FORCE INDEX (ix_uniqueid)
            LEFT JOIN pkg_trunk t ON t.id=e.id_trunk
            LEFT JOIN pkg_servers s ON s.id=e.id_server
            WHERE e.uniqueid=:uniqueid
            ORDER BY e.event_time ASC,e.id ASC
            LIMIT 51
            ",
            [':uniqueid' => (string) $cdr['uniqueid']]
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
                'classification' => $classification,
            ];
        }

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
            'attempts' => $attempts,
            'lastObservedResult' => [
                'sequence' => $last['sequence'],
                'raw' => $last['raw'],
                'classificationKey' => $classification['key'],
            ],
            'facts' => [
                [
                    'key' => 'exact_uniqueid_match',
                    'text' => 'The events have the same uniqueid as the failed CDR.',
                ],
                [
                    'key' => 'observed_attempt_count',
                    'text' => count($attempts)
                        . ' correlated trunk event(s) were observed.',
                ],
            ],
            'probableCause' => [
                'key' => $classification['causeKey'],
                'text' => $classification['cause'],
                'confidence' => $classification['confidence'],
                'basis' => $classification['basis'],
            ],
            'recommendedActions' => $classification['actions'],
            'limitations' => $limitations,
            'evidence' => [
                'sentinelAvailable' => true,
                'correlation' => 'exact_uniqueid',
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
                'catalog' => self::CATALOG,
                'queryOrder' => ['event_time', 'id'],
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
            'label' => ucwords(str_replace('_', ' ', $key)),
            'summary' => $summary,
            'causeKey' => $causeKey,
            'cause' => $cause,
            'confidence' => $confidence,
            'basis' => array_values($basis),
            'catalog' => self::CATALOG,
            'actions' => array_map(function ($text) {
                return [
                    'key' => strtolower(preg_replace('/[^a-z0-9]+/i', '_', trim($text, '.'))),
                    'text' => $text,
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
        if ($health === null) {
            $health = [
                'status' => 'UNKNOWN',
                'checkedAt' => null,
                'reasons' => ['sentinel_not_installed'],
            ];
        }
        return [
            'contract' => self::CONTRACT,
            'status' => 'inconclusive',
            'summary' => $message,
            'call' => $this->call($cdr),
            'attempts' => [],
            'lastObservedResult' => null,
            'facts' => [],
            'probableCause' => [
                'key' => null,
                'text' => 'No probable cause can be established from the available evidence.',
                'confidence' => 'none',
                'basis' => [],
            ],
            'recommendedActions' => [[
                'key' => 'verify_evidence_availability',
                'text' => $expired
                    ? 'Use a more recent call for advanced diagnosis.'
                    : 'Wait briefly and retry the diagnostic if the call is recent.',
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
                'catalog' => self::CATALOG,
                'queryOrder' => ['event_time', 'id'],
            ],
        ];
    }

    private function call(array $cdr)
    {
        return [
            'cdrFailedId' => (int) $cdr['id'],
            'uniqueid' => (string) $cdr['uniqueid'],
            'startedAt' => (string) $cdr['starttime'],
            'source' => (string) $cdr['src'],
            'callerId' => (string) $cdr['callerid'],
            'calledNumber' => (string) $cdr['calledstation'],
            'user' => $this->entity($cdr['id_user'], $cdr['username']),
            'plan' => $this->entity($cdr['id_plan'], $cdr['plan_name']),
            'prefix' => $this->entity($cdr['id_prefix'], $cdr['prefix_name']),
            'cdrTrunk' => $this->entity($cdr['id_trunk'], $cdr['trunk_name']),
            'server' => $this->entity($cdr['id_server'], $cdr['server_name']),
        ];
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
        return ['key' => $key, 'text' => $text];
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
