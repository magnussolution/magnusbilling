<?php

/**
 * Executes the production AGI routing flow in its protected dry-run mode.
 *
 * Routing decisions belong to resources/asterisk. This service only resolves
 * the selected database entity, starts the isolated CLI process and converts
 * its structured output to the format consumed by the web interface.
 */
class CallDiagnosticService
{
    const MAX_OUTPUT_BYTES = 1048576;

    private $db;
    private $deadline;
    private $isAdmin;
    private $pjsipIpAuthenticationProbe;

    public function __construct(
        $db,
        $isAdmin,
        $sessionUserId,
        $timeoutSeconds = 8,
        $pjsipIpAuthenticationProbe = null
    )
    {
        $this->db = $db;
        $this->isAdmin = (bool) $isAdmin;
        $this->deadline = microtime(true) + min(15, max(1, (int) $timeoutSeconds));
        $this->pjsipIpAuthenticationProbe = $pjsipIpAuthenticationProbe;
    }

    public static function catalog()
    {
        return [
            'USER_NOT_FOUND' => ['failed', 'User was not found.', 'Select an existing SIP user.'],
            'DID_NOT_FOUND' => ['failed', 'DID was not found.', 'Select an existing DID.'],
            'RATE_NOT_FOUND' => ['failed', 'No matching rate was found.', 'Add a matching rate to the user plan.'],
            'AUTH_FAILED' => ['failed', 'Call authentication failed or the user account is inactive.', 'Verify the account status and authentication data.'],
            'INVALID_DESTINATION' => ['failed', 'The destination is empty or invalid after normalization.', 'Enter a valid destination number.'],
            'INSUFFICIENT_CREDIT' => ['failed', 'Available credit does not cover the minimum call duration.', 'Add credit or review the account credit limit.'],
            'TRUNK_GROUP_EMPTY' => ['failed', 'The selected trunk group has no configured trunks.', 'Add one or more trunks to the selected trunk group.'],
            'DID_DESTINATION_MISSING' => ['failed', 'The DID has no configured routing destination.', 'Create and activate a destination for the DID.'],
            'DID_DESTINATION_EMPTY' => ['failed', 'The configured DID destination is empty.', 'Enter a destination for the DID route or replace the empty route.'],
            'DID_IVR_MISSING' => ['failed', 'The DID route is configured as IVR, but no valid IVR is selected.', 'Select an existing IVR in the DID destination.'],
            'DID_IVR_AUDIO_MISSING' => ['warning', 'The IVR audio for the current schedule was not found.', 'Upload the open or closed IVR audio if callers should hear a prompt.'],
            'DID_IVR_AUDIO_INCOMPATIBLE' => ['warning', 'The IVR audio is not mono at 8000 Hz or has an invalid format.', 'Convert the IVR audio to mono, 8000 Hz, in WAV or GSM format.'],
            'DID_IVR_NO_OPTIONS' => ['failed', 'The IVR has no options configured for the current schedule.', 'Configure at least one IVR option for the current schedule.'],
            'DID_IVR_OUT_OF_HOURS' => ['warning', 'The IVR is outside its service hours.', 'Review the IVR schedule if it should be open at this time.'],
            'DID_SIP_GROUP_EMPTY' => ['failed', 'The selected SIP group has no SIP accounts.', 'Add at least one SIP account to the selected SIP group.'],
            'DID_MULTIPLE_IPS_EMPTY' => ['failed', 'The multiple IP destination has no valid IP addresses.', 'Add at least one valid IP address to the DID destination.'],
            'DID_QUEUE_MISSING' => ['failed', 'The DID route is configured as Queue, but no valid Queue is selected.', 'Select an existing Queue in the DID destination.'],
            'DID_QUEUE_NO_AGENTS' => ['warning', 'The Queue selected for the DID has no agents.', 'Add at least one agent to the selected Queue if this Queue should receive calls.'],
            'DID_CALLERID_BLOCKED' => ['failed', 'The DID blocked the call because the CallerID matched a blocking expression.', 'Review the DID blocking expressions or use an allowed CallerID.'],
            'DID_CALL_LIMIT_REACHED' => ['failed', 'The DID simultaneous call limit has been reached.', 'Wait for an active call to end or increase the DID call limit.'],
            'DID_USER_INBOUND_LIMIT_REACHED' => ['failed', 'The user inbound simultaneous call limit has been reached.', 'Wait for an active inbound call to end or increase the user inbound call limit.'],
            'DID_CALLERID_NOT_AUTHORIZED' => ['failed', 'The CallerID is not authorized to pay for this DID call.', 'Add and activate the CallerID for a user or change the DID charge setting.'],
            'DID_OWNER_INACTIVE' => ['failed', 'The user linked to the DID is inactive.', 'Activate the user linked to the DID.'],
            'DID_OWNER_NO_CREDIT' => ['failed', 'The user linked to the DID has insufficient credit for the inbound charge.', 'Add credit to the user linked to the DID or review the DID selling rate.'],
            'ALL_TRUNKS_INACTIVE' => ['failed', 'The trunk group has trunks, but they are all inactive.', 'Activate at least one trunk in the selected trunk group.'],
            'NO_ELIGIBLE_TRUNK' => ['failed', 'No eligible trunk is available.', 'Review the AGI trace and trunk group configuration.'],
            'AGI_BLOCKED' => ['failed', 'The AGI stopped the call before Dial.', 'Review the last AGI validation message.'],
            'AGI_TIMEOUT' => ['failed', 'The AGI diagnostic timed out.', 'Review external routing checks and try again.'],
            'AGI_INVALID_OUTPUT' => ['failed', 'The AGI returned an invalid diagnostic result.', 'Review the AGI diagnostic log.'],
            'AGI_RESULT_SERIALIZATION_FAILED' => ['failed', 'The AGI diagnostic result could not be serialized.', 'Review the diagnostic data encoding and run the test again.'],
            'OUTBOUND_READY' => ['passed', 'MagnusBilling can send this call to a trunk.', 'No configuration change is required.'],
            'DID_READY' => ['passed', 'The internal DID routing configuration is valid.', 'No configuration change is required.'],
            'ROUTING_LOOP_DETECTED' => ['failed', 'A routing loop was detected.', 'Remove the circular destination or forward.'],
        ];
    }

    public static function failureCatalog()
    {
        return [
            'AGI_SCRIPT_NOT_ACCESSIBLE' => [
                'The AGI script is not accessible.',
                'The diagnostic process could not read the AGI script or access its directory.',
                'Verify the MagnusBilling installation path and the file permissions shown below.',
            ],
            'PHP_CLI_NOT_FOUND' => [
                'PHP CLI was not found.',
                'The diagnostic requires an executable PHP command-line binary on the MagnusBilling server.',
                'Install or configure PHP CLI and run the diagnostic again.',
            ],
            'AGI_PROCESS_START_FAILED' => [
                'The AGI diagnostic process could not be started.',
                'The operating system rejected the attempt to start the isolated AGI diagnostic process.',
                'Verify that proc_open is enabled and that the web server user can execute PHP CLI.',
            ],
            'AGI_PROCESS_TIMEOUT' => [
                'The AGI diagnostic exceeded the safe time limit.',
                'The AGI did not finish within the diagnostic timeout.',
                'Review the process errors below and any slow external routing checks, then try again.',
            ],
            'AGI_OUTPUT_LIMIT_EXCEEDED' => [
                'The AGI produced more output than the diagnostic safety limit.',
                'The process was stopped because its output exceeded the maximum size accepted by the diagnostic.',
                'Review the process output below for a repeated error or excessive debug logging.',
            ],
            'AGI_DEBUG_ARGUMENTS_INVALID' => [
                'The AGI rejected the diagnostic input.',
                'One of the values sent to the AGI does not match the safe debug format.',
                'Review the destination, account and CallerID values shown in the diagnostic form.',
            ],
            'AGI_PHP_FATAL_ERROR' => [
                'The AGI stopped because of a PHP error.',
                'PHP terminated the AGI before it could return the required diagnostic result.',
                'Use the process error shown below to correct the code, dependency or configuration.',
            ],
            'AGI_PROCESS_EXITED_WITH_ERROR' => [
                'The AGI process exited with an error.',
                'The process returned a non-zero exit code before producing a diagnostic result.',
                'Use the exit code and process output shown below to identify the failing dependency.',
            ],
            'AGI_RESULT_JSON_INVALID' => [
                'The AGI generated invalid JSON.',
                'The result marker was produced, but its JSON could not be decoded. Invalid text encoding is a common cause.',
                'Use the JSON error and process output shown below to correct the data or code that generated the result.',
            ],
            'MBILLING_RESULT_NOT_FOUND' => [
                'The AGI ended without returning a diagnostic result.',
                'The process did not produce the required MBILLING_RESULT marker.',
                'Use the process output shown below to identify where the AGI stopped.',
            ],
            'AGI_FAILURE_UNCLASSIFIED' => [
                'The AGI diagnostic failed before routing was evaluated.',
                'The diagnostic process did not provide enough structured information to classify the failure.',
                'Send the diagnostic ID and the technical evidence shown below to support.',
            ],
            'DIAGNOSTIC_CODE_ERROR' => [
                'The diagnostic stopped because of an application error.',
                'MagnusBilling caught an unexpected code error before the diagnostic could finish.',
                'Send the diagnostic ID and the application error shown below to support.',
            ],
        ];
    }

    public function unexpectedFailure($type, $error)
    {
        return $this->failure($type, 'AGI_INVALID_OUTPUT', [
            'reason' => 'DIAGNOSTIC_CODE_ERROR',
            'errorType' => is_object($error) ? get_class($error) : 'Unknown',
            'errorMessage' => is_object($error) && method_exists($error, 'getMessage')
                ? $this->limit($error->getMessage())
                : null,
            'errorFile' => is_object($error) && method_exists($error, 'getFile')
                ? $error->getFile()
                : null,
            'errorLine' => is_object($error) && method_exists($error, 'getLine')
                ? $error->getLine()
                : null,
        ]);
    }

    public function outbound($sipId, $number, $callerId = null, $at = null)
    {
        $sip = $this->row(
            'SELECT s.name,s.callerid,s.host,s.insecure,
                    CASE WHEN s.secret IS NULL OR s.secret = "" THEN 0 ELSE 1 END AS hasSecret,
                    u.username
             FROM pkg_sip s
             JOIN pkg_user u ON u.id=s.id_user
             WHERE s.id=:id LIMIT 1',
            [':id' => (int) $sipId]
        );
        if (! $sip) {
            return $this->failure('outbound', 'USER_NOT_FOUND');
        }

        $pjsipAuthenticationStep = $this->pjsipIpAuthenticationProbe !== null
            ? $this->pjsipIpAuthenticationProbe->inspect($sip)
            : null;
        $number = $this->normalizeOutboundDestination((string) $number);
        $result = $this->executeAgi(
            'outbound',
            $number,
            (string) $sip['username'],
            $callerId !== null && $callerId !== '' ? (string) $callerId : (string) $sip['callerid'],
            (string) $sip['name']
        );
        if ($pjsipAuthenticationStep !== null) {
            array_unshift($result['steps'], $pjsipAuthenticationStep);
            if ($pjsipAuthenticationStep['status'] === 'warning' && $result['status'] === 'passed') {
                $result['status'] = 'warning';
                $result['summary'] = Yii::t(
                    'zii',
                    'A fixed-IP PJSIP authentication risk was found before the route check.'
                );
                $result['resultCode'] = $pjsipAuthenticationStep['resultCode'];
            }
        }
        return $result;
    }

    /**
     * Mirrors the international access-prefix cleanup expected by Check User.
     * Only a prefix at the beginning is removed; digits elsewhere are kept.
     */
    private function normalizeOutboundDestination($number)
    {
        $configuration = $this->row(
            'SELECT config_value FROM pkg_configuration '
            . 'WHERE config_key=:configKey ORDER BY id LIMIT 1',
            [':configKey' => 'international_prefixes']
        );
        $configured = $configuration && isset($configuration['config_value'])
            ? (string) $configuration['config_value']
            : '';
        return self::stripInternationalPrefix((string) $number, $configured);
    }

    private static function stripInternationalPrefix($number, $configured)
    {
        $prefixes = preg_split('/[,;\s]+/', (string) $configured, -1, PREG_SPLIT_NO_EMPTY);
        $prefixes[] = '+';
        $prefixes = array_values(array_unique(array_filter(array_map('trim', $prefixes), function ($prefix) {
            return $prefix !== '';
        })));
        usort($prefixes, function ($left, $right) {
            return strlen($right) - strlen($left);
        });
        foreach ($prefixes as $prefix) {
            if (strncmp($number, $prefix, strlen($prefix)) === 0 && strlen($number) > strlen($prefix)) {
                return substr($number, strlen($prefix));
            }
        }
        return $number;
    }

    public function inbound($didId, $callerId = null, $at = null)
    {
        $did = $this->row(
            'SELECT d.did,u.username
             FROM pkg_did d
             LEFT JOIN pkg_user u ON u.id=d.id_user
             WHERE d.id=:id LIMIT 1',
            [':id' => (int) $didId]
        );
        if (! $did) {
            return $this->failure('inbound', 'DID_NOT_FOUND');
        }

        $account = ! empty($did['username']) ? (string) $did['username'] : 'debug';
        return $this->executeAgi(
            'inbound',
            (string) $did['did'],
            $account,
            (string) $callerId,
            $account
        );
    }

    public function failedCalls($sipId, $number, $uniqueId = null, $minutes = 120)
    {
        return [];
    }

    private function executeAgi($type, $number, $accountcode, $callerId, $sipAccount)
    {
        $script = dirname(__DIR__, 2) . '/resources/asterisk/mbilling.php';
        if (! is_file($script) || ! is_readable($script) || ! is_executable(dirname($script))) {
            return $this->failure($type, 'AGI_INVALID_OUTPUT', [
                'reason' => 'AGI_SCRIPT_NOT_ACCESSIBLE',
                'script' => $script,
                'isFile' => is_file($script),
                'isReadable' => is_readable($script),
                'directoryAccessible' => is_executable(dirname($script)),
            ]);
        }

        $phpCli = $this->resolvePhpCli();
        if ($phpCli === null) {
            return $this->failure($type, 'AGI_INVALID_OUTPUT', [
                'reason' => 'PHP_CLI_NOT_FOUND',
                'phpBinary' => defined('PHP_BINARY') ? PHP_BINARY : null,
                'phpBindir' => defined('PHP_BINDIR') ? PHP_BINDIR : null,
            ]);
        }

        $command = [
            $phpCli,
            $script,
            'debug',
            $number,
            $accountcode,
            $callerId,
            $sipAccount,
        ];
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];
        try {
            $process = proc_open(
                $command,
                $descriptors,
                $pipes,
                dirname($script)
            );
        } catch (Throwable $error) {
            return $this->failure($type, 'AGI_INVALID_OUTPUT', [
                'reason' => 'AGI_PROCESS_START_FAILED',
                'phpCli' => $phpCli,
                'errorType' => get_class($error),
                'errorMessage' => $this->limit($error->getMessage()),
            ]);
        }
        if (! is_resource($process)) {
            return $this->failure($type, 'AGI_INVALID_OUTPUT', [
                'reason' => 'AGI_PROCESS_START_FAILED',
                'phpCli' => $phpCli,
            ]);
        }

        fclose($pipes[0]);
        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);
        $stdout = '';
        $stderr = '';
        $timedOut = false;
        $outputLimitExceeded = false;
        $lastProcessStatus = null;

        do {
            $stdout .= stream_get_contents($pipes[1]);
            $stderr .= stream_get_contents($pipes[2]);
            if (strlen($stdout) + strlen($stderr) > self::MAX_OUTPUT_BYTES) {
                proc_terminate($process, 9);
                $timedOut = true;
                $outputLimitExceeded = true;
                break;
            }
            $status = proc_get_status($process);
            $lastProcessStatus = $status;
            if (! $status['running']) {
                break;
            }
            if (microtime(true) >= $this->deadline) {
                proc_terminate($process, 9);
                $timedOut = true;
                break;
            }
            usleep(20000);
        } while (true);

        $stdout .= stream_get_contents($pipes[1]);
        $stderr .= stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $closeExitCode = proc_close($process);
        $exitCode = is_array($lastProcessStatus)
            && isset($lastProcessStatus['exitcode'])
            && (int) $lastProcessStatus['exitcode'] >= 0
            ? (int) $lastProcessStatus['exitcode']
            : ($closeExitCode >= 0 ? (int) $closeExitCode : null);

        if ($timedOut) {
            return $this->failure($type, 'AGI_TIMEOUT', [
                'reason' => $outputLimitExceeded
                    ? 'AGI_OUTPUT_LIMIT_EXCEEDED'
                    : 'AGI_PROCESS_TIMEOUT',
                'exitCode' => $exitCode,
                'stdout' => $this->limit($stdout),
                'stderr' => $this->limit($stderr),
            ]);
        }

        $parsedOutput = self::parseAgiResultOutput($stdout, $stderr);
        $agiResult = $parsedOutput['result'];
        $resultMarkerFound = $parsedOutput['resultMarkerFound'];
        $jsonError = $parsedOutput['jsonError'];
        if (! $agiResult) {
            $reason = self::classifyInvalidOutputFailure(
                $resultMarkerFound,
                $stderr . "\n" . $stdout,
                $exitCode
            );
            return $this->failure($type, 'AGI_INVALID_OUTPUT', [
                'reason' => $reason,
                'phpCli' => $phpCli,
                'exitCode' => $exitCode,
                'resultMarkerFound' => $resultMarkerFound,
                'jsonError' => $jsonError,
                'rawPayloadBytes' => $parsedOutput['rawPayloadBytes'],
                'rawPayload' => $this->safeRawPayload($parsedOutput['rawPayload']),
                'invalidUtf8' => $parsedOutput['invalidUtf8'],
                'additionalOutputAfterMarker' => $parsedOutput['additionalOutputAfterMarker'],
                'warningOrErrorOutputDetected' => $parsedOutput['warningOrErrorOutputDetected'],
                'payloadTruncated' => $outputLimitExceeded,
                'resultStage' => $parsedOutput['resultStage'],
                'stdoutBytes' => strlen($stdout),
                'stderrBytes' => strlen($stderr),
                'stdout' => $this->safeDiagnosticOutput($stdout),
                'stderr' => $this->safeDiagnosticOutput($stderr),
            ]);
        }

        return $this->formatAgiResult($type, $agiResult, $stderr);
    }

    public static function parseAgiResultOutput($stdout, $stderr = '')
    {
        $lines = preg_split('/\\r\\n|\\n|\\r/', (string) $stdout);
        $result = null;
        $rawPayload = '';
        $jsonError = null;
        $markerFound = false;
        $markerLine = -1;
        foreach ($lines as $lineNumber => $line) {
            $normalizedLine = ltrim($line, "\xEF\xBB\xBF \t");
            if (strpos($normalizedLine, 'MBILLING_RESULT ') !== 0) {
                continue;
            }
            $markerFound = true;
            $markerLine = $lineNumber;
            $rawPayload = substr($normalizedLine, 16);
            $decoded = json_decode($rawPayload, true);
            if (is_array($decoded)) {
                $result = $decoded;
                $jsonError = null;
            } else {
                $result = null;
                $jsonError = function_exists('json_last_error_msg')
                    ? json_last_error_msg()
                    : (string) json_last_error();
            }
        }

        $additional = [];
        if ($markerLine >= 0) {
            foreach (array_slice($lines, $markerLine + 1) as $line) {
                if (trim($line) !== '') {
                    $additional[] = $line;
                }
            }
        }
        $nonPayloadLines = [];
        foreach ($lines as $line) {
            $normalizedLine = ltrim($line, "\xEF\xBB\xBF \t");
            if (strpos($normalizedLine, 'MBILLING_RESULT ') !== 0 && trim($line) !== '') {
                $nonPayloadLines[] = $line;
            }
        }
        $combinedOutput = (string) $stderr . "\n" . implode("\n", $nonPayloadLines);
        return [
            'result' => $result,
            'resultMarkerFound' => $markerFound,
            'rawPayload' => $rawPayload,
            'rawPayloadBytes' => strlen($rawPayload),
            'jsonError' => $jsonError,
            'invalidUtf8' => $rawPayload !== '' && preg_match('//u', $rawPayload) !== 1,
            'additionalOutputAfterMarker' => count($additional) > 0,
            'warningOrErrorOutputDetected' => preg_match(
                '/\\b(?:PHP\\s+)?(?:warning|notice|deprecated|fatal|parse)\\b/i',
                $combinedOutput
            ) === 1,
            'resultStage' => is_array($result)
                && isset($result['context']['resultStage'])
                ? (string) $result['context']['resultStage']
                : 'MBILLING_RESULT.decode',
        ];
    }

    private function formatAgiResult($type, array $agiResult, $stderr)
    {
        $ready = isset($agiResult['status']) && $agiResult['status'] === 'ready_to_dial';
        $code = $ready ? ($type === 'inbound' ? 'DID_READY' : 'OUTBOUND_READY') : 'AGI_BLOCKED';
        $item = self::catalog()[$code];
        $messages = isset($agiResult['messages']) && is_array($agiResult['messages'])
            ? $agiResult['messages']
            : [];
        $events = isset($agiResult['events']) && is_array($agiResult['events'])
            ? $agiResult['events']
            : [];
        $lastMessage = $this->lastRelevantMessage($messages);

        if (! $ready) {
            $blockingCode = $this->lastBlockingEventCode($events);
            if ($blockingCode !== null && isset(self::catalog()[$blockingCode])) {
                $code = $blockingCode;
                $item = self::catalog()[$code];
                $lastMessage = Yii::t('zii', $item[1]);
            }
        }

        if (! $ready && $code === 'AGI_BLOCKED' && isset($agiResult['context']['hangupCause'])
            && (string) $agiResult['context']['hangupCause'] === '34'
        ) {
            $code = $this->traceContains($messages, 'Trunk is inactive')
                ? 'ALL_TRUNKS_INACTIVE'
                : 'NO_ELIGIBLE_TRUNK';
            $item = self::catalog()[$code];
            $lastMessage = Yii::t('zii', $item[1]);
        }

        $steps = $this->formatEvents($events);
        if (! $steps) {
            $steps = [[
                'code' => 'agi_dry_run',
                'resultCode' => $code,
                'label' => Yii::t('zii', 'AGI dry-run'),
                'status' => $item[0],
                'message' => ! $ready && $lastMessage !== ''
                    ? $lastMessage
                    : Yii::t('zii', $item[1]),
                'resolution' => ['message' => Yii::t('zii', $item[2])],
            ]];
        } else {
            $last = count($steps) - 1;
            $steps[$last]['resolution'] = ['message' => Yii::t('zii', $item[2])];
        }

        return [
            'diagnosticId' => $this->uuid(),
            'type' => $type,
            'status' => $item[0],
            'summary' => Yii::t('zii', $item[1]),
            'resultCode' => $code,
            'steps' => $steps,
            'warnings' => [],
            'technicalDetails' => $this->isAdmin ? [
                'status' => isset($agiResult['status']) ? $agiResult['status'] : null,
                'context' => isset($agiResult['context']) ? $agiResult['context'] : [],
                'events' => $this->localizeEvents($events),
                'trace' => $messages,
                'stderr' => $this->limit($stderr),
            ] : [],
        ];
    }

    private function lastRelevantMessage(array $messages)
    {
        for ($index = count($messages) - 1; $index >= 0; $index--) {
            $message = isset($messages[$index]['message']) ? trim((string) $messages[$index]['message']) : '';
            if ($message !== ''
                && stripos($message, 'SELECT ') !== 0
                && stripos($message, 'Hangup Call ') !== 0
            ) {
                return $message;
            }
        }
        return '';
    }

    private function traceContains(array $messages, $needle)
    {
        foreach ($messages as $item) {
            if (isset($item['message']) && stripos((string) $item['message'], $needle) !== false) {
                return true;
            }
        }
        return false;
    }

    private function lastBlockingEventCode(array $events)
    {
        for ($index = count($events) - 1; $index >= 0; $index--) {
            if (isset($events[$index]['level']) && (int) $events[$index]['level'] === 1) {
                return isset($events[$index]['code']) ? (string) $events[$index]['code'] : null;
            }
        }
        return null;
    }

    private function formatEvents(array $events)
    {
        $steps = [];
        $planByTechPrefix = null;
        $didRate = null;
        foreach ($events as $candidate) {
            if (isset($candidate['code']) && $candidate['code'] === 'DID_RATE_SELECTED') {
                $didRate = isset($candidate['context']) && is_array($candidate['context'])
                    ? $candidate['context']
                    : [];
            }
        }
        foreach ($events as $event) {
            $level = isset($event['level']) ? (int) $event['level'] : 4;
            $code = isset($event['code']) ? (string) $event['code'] : 'AGI_EVENT';
            if ($code === 'PLAN_BY_TECHPREFIX') {
                $planByTechPrefix = isset($event['context']) && is_array($event['context'])
                    ? $event['context']
                    : [];
                continue;
            }
            if ($level >= 4 || in_array($code, ['AGI_STARTED', 'CONFIG_LOADED', 'DID_LOOKUP', 'OFFER_APPLIED', 'PLAN_BY_TECHPREFIX', 'DID_RATE_SELECTED'], true)) {
                continue;
            }
            $context = isset($event['context']) && is_array($event['context'])
                ? $event['context']
                : [];
            if ($code === 'RATE_SELECTED' && is_array($planByTechPrefix)) {
                $context['planSource'] = 'plan_techprefix';
                if ((! isset($context['planTechPrefix']) || $context['planTechPrefix'] === '')
                    && isset($planByTechPrefix['techPrefix'])
                ) {
                    $context['planTechPrefix'] = $planByTechPrefix['techPrefix'];
                }
            }
            if ($code === 'DID_FOUND' && is_array($didRate)) {
                $context = array_merge($context, $didRate);
            }
            $step = [
                'code' => strtolower($code),
                'resultCode' => $code,
                'label' => Yii::t('zii', isset($event['component']) ? (string) $event['component'] : 'AGI'),
                'status' => $level === 1 ? 'failed' : ($level === 2 ? 'warning' : 'passed'),
                'message' => Yii::t('zii', isset($event['message']) ? (string) $event['message'] : $code),
                'technicalDetails' => $this->isAdmin ? $context : [],
            ];
            $step['displayDetails'] = $this->eventDisplayDetails(
                $code,
                $context
            );
            $steps[] = $step;
        }
        return $steps;
    }

    private function eventDisplayDetails($code, array $context)
    {
        if ($code === 'DID_DESTINATION_ATTEMPT') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Destination type'), 'value' => Yii::t('zii', $this->didDestinationTypeLabel(isset($context['typeCode']) ? $context['typeCode'] : null))],
                ['label' => Yii::t('zii', 'Destination'), 'value' => isset($context['destination']) ? $context['destination'] : ''],
                ['label' => Yii::t('zii', 'Priority'), 'value' => isset($context['priority']) ? $context['priority'] : ''],
            ];
        }
        if ($code === 'DID_FOUND') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Sell rate'), 'value' => $this->currencyValue(isset($context['sellRate']) ? $context['sellRate'] : null)],
                ['label' => Yii::t('zii', 'Buy rate'), 'value' => $this->currencyValue(isset($context['buyRate']) ? $context['buyRate'] : null)],
                ['label' => Yii::t('zii', 'Matched expression'), 'value' => isset($context['expressionNumber']) && (int) $context['expressionNumber'] > 0
                    ? $context['expressionNumber'] . ' — ' . $context['expression']
                    : ''],
            ];
        }
        if ($code === 'DID_IVR_MISSING') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Configured IVR ID'), 'value' => isset($context['ivrId']) && (int) $context['ivrId'] > 0 ? $context['ivrId'] : Yii::t('zii', 'No IVR selected')],
            ];
        }
        if ($code === 'DID_IVR_SELECTED') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'IVR'), 'value' => isset($context['ivrName']) ? $context['ivrName'] : ''],
                ['label' => Yii::t('zii', 'IVR ID'), 'value' => isset($context['ivrId']) ? $context['ivrId'] : ''],
            ];
        }
        if (in_array($code, ['DID_IVR_SCHEDULE', 'DID_IVR_OUT_OF_HOURS'], true)) {
            return [
                ['label' => Yii::t('zii', 'IVR'), 'value' => isset($context['ivrName']) ? $context['ivrName'] : ''],
                ['label' => Yii::t('zii', 'Schedule status'), 'value' => isset($context['scheduleStatus']) ? Yii::t('zii', ucfirst($context['scheduleStatus'])) : ''],
                ['label' => Yii::t('zii', 'Holiday applied'), 'value' => ! empty($context['holidayApplied']) ? Yii::t('zii', 'Yes') : Yii::t('zii', 'No')],
            ];
        }
        if (in_array($code, ['DID_IVR_AUDIO_FOUND', 'DID_IVR_AUDIO_MISSING', 'DID_IVR_AUDIO_INCOMPATIBLE'], true)) {
            return [
                ['label' => Yii::t('zii', 'IVR'), 'value' => isset($context['ivrName']) ? $context['ivrName'] : ''],
                ['label' => Yii::t('zii', 'Schedule status'), 'value' => isset($context['scheduleStatus']) ? Yii::t('zii', ucfirst($context['scheduleStatus'])) : ''],
                ['label' => Yii::t('zii', $code === 'DID_IVR_AUDIO_MISSING' ? 'Expected IVR audio' : 'IVR audio file'), 'value' => isset($context['audio']) ? $context['audio'] : (isset($context['expectedAudio']) ? $context['expectedAudio'] . '.gsm / .wav' : '')],
                ['label' => Yii::t('zii', 'Audio channels'), 'value' => isset($context['channels']) ? $context['channels'] : ''],
                ['label' => Yii::t('zii', 'Sample rate'), 'value' => isset($context['sampleRate']) ? $context['sampleRate'] . ' Hz' : ''],
            ];
        }
        if ($code === 'DID_IVR_NO_OPTIONS') {
            return [
                ['label' => Yii::t('zii', 'IVR'), 'value' => isset($context['ivrName']) ? $context['ivrName'] : ''],
                ['label' => Yii::t('zii', 'Schedule status'), 'value' => isset($context['scheduleStatus']) ? Yii::t('zii', ucfirst($context['scheduleStatus'])) : ''],
                ['label' => Yii::t('zii', 'Configured options'), 'value' => 0],
            ];
        }
        if ($code === 'DID_SIP_GROUP_EMPTY') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'IVR'), 'value' => isset($context['ivrName']) ? $context['ivrName'] : ''],
                ['label' => Yii::t('zii', 'SIP group'), 'value' => isset($context['sipGroup']) ? $context['sipGroup'] : ''],
                ['label' => Yii::t('zii', 'SIP accounts'), 'value' => 0],
            ];
        }
        if ($code === 'DID_MULTIPLE_IPS_EMPTY') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Configured IP addresses'), 'value' => isset($context['configuredIPs']) ? $context['configuredIPs'] : ''],
                ['label' => Yii::t('zii', 'Valid IP addresses'), 'value' => isset($context['validIPCount']) ? $context['validIPCount'] : 0],
            ];
        }
        if ($code === 'DID_QUEUE_MISSING') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Configured Queue ID'), 'value' => isset($context['queueId']) && (int) $context['queueId'] > 0 ? $context['queueId'] : Yii::t('zii', 'No Queue selected')],
            ];
        }
        if ($code === 'DID_QUEUE_SELECTED') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Queue'), 'value' => isset($context['queueName']) ? $context['queueName'] : ''],
                ['label' => Yii::t('zii', 'Queue ID'), 'value' => isset($context['queueId']) ? $context['queueId'] : ''],
                ['label' => Yii::t('zii', 'Queue agents'), 'value' => isset($context['agentCount']) ? $context['agentCount'] : ''],
                ['label' => Yii::t('zii', 'Unpaused agents'), 'value' => isset($context['availableAgentCount']) ? $context['availableAgentCount'] : ''],
            ];
        }
        if ($code === 'DID_QUEUE_NO_AGENTS') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Queue'), 'value' => isset($context['queueName']) ? $context['queueName'] : ''],
                ['label' => Yii::t('zii', 'Queue ID'), 'value' => isset($context['queueId']) ? $context['queueId'] : ''],
                ['label' => Yii::t('zii', 'Queue agents'), 'value' => 0],
            ];
        }
        if ($code === 'DID_CALLERID_BLOCKED') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'CallerID'), 'value' => isset($context['callerId']) ? $context['callerId'] : ''],
                ['label' => Yii::t('zii', 'Blocking expression'), 'value' => isset($context['expressionNumber']) ? $context['expressionNumber'] : ''],
                ['label' => Yii::t('zii', 'Matched expression'), 'value' => isset($context['expression']) ? $context['expression'] : ''],
            ];
        }
        if (in_array($code, ['DID_CALL_LIMIT_REACHED', 'DID_USER_INBOUND_LIMIT_REACHED'], true)) {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Linked user'), 'value' => isset($context['username']) ? $context['username'] : ''],
                ['label' => Yii::t('zii', 'Active calls'), 'value' => isset($context['activeCalls']) ? $context['activeCalls'] : ''],
                ['label' => Yii::t('zii', 'Configured limit'), 'value' => isset($context['callLimit']) ? $context['callLimit'] : ''],
            ];
        }
        if ($code === 'DID_CALLERID_NOT_AUTHORIZED') {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'CallerID'), 'value' => isset($context['callerId']) ? $context['callerId'] : ''],
            ];
        }
        if (in_array($code, ['DID_OWNER_INACTIVE', 'DID_OWNER_NO_CREDIT'], true)) {
            return [
                ['label' => Yii::t('zii', 'DID'), 'value' => isset($context['did']) ? $context['did'] : ''],
                ['label' => Yii::t('zii', 'Linked user'), 'value' => isset($context['username']) ? $context['username'] : ''],
                ['label' => Yii::t('zii', 'Available credit'), 'value' => $this->currencyValue(isset($context['credit']) ? $context['credit'] : null)],
                ['label' => Yii::t('zii', 'Inbound rate'), 'value' => $this->currencyValue(isset($context['rate']) ? $context['rate'] : null)],
            ];
        }
        if ($code === 'AUTH_BY_TECHPREFIX') {
            return [
                ['label' => Yii::t('zii', 'Authentication method'), 'value' => Yii::t('zii', 'SIP account tech prefix')],
                ['label' => Yii::t('zii', 'Tech prefix used'), 'value' => isset($context['techPrefix']) ? $context['techPrefix'] : ''],
                ['label' => Yii::t('zii', 'Authenticated SIP account'), 'value' => isset($context['username']) ? $context['username'] : ''],
            ];
        }
        if ($code === 'DESTINATION_NORMALIZED') {
            return [[
                'label' => Yii::t('zii', 'Number after prefix_local'),
                'value' => isset($context['destination']) ? $context['destination'] : '',
            ]];
        }
        if ($code === 'RATE_SELECTED') {
            $details = [
                ['label' => Yii::t('zii', 'Plan used'), 'value' => isset($context['planName']) ? $context['planName'] : (isset($context['plan']) ? $context['plan'] : '')],
                ['label' => Yii::t('zii', 'Rate per minute'), 'value' => $this->currencyValue(isset($context['rateInitial']) ? $context['rateInitial'] : null)],
                ['label' => Yii::t('zii', 'Connection charge'), 'value' => $this->currencyValue(isset($context['connectCharge']) ? $context['connectCharge'] : null)],
                ['label' => Yii::t('zii', 'Initial block'), 'value' => isset($context['initBlock']) ? $context['initBlock'] : ''],
                ['label' => Yii::t('zii', 'Billing block'), 'value' => isset($context['billingBlock']) ? $context['billingBlock'] : ''],
            ];
            if (isset($context['planSource']) && $context['planSource'] === 'plan_techprefix') {
                $details[] = ['label' => Yii::t('zii', 'Plan selection'), 'value' => Yii::t('zii', 'Selected by plan tech prefix')];
                $details[] = ['label' => Yii::t('zii', 'Plan tech prefix used'), 'value' => isset($context['planTechPrefix']) ? $context['planTechPrefix'] : ''];
            }
            if (isset($context['offerName']) && $context['offerName'] !== '') {
                $details[] = ['label' => Yii::t('zii', 'Offer package used'), 'value' => $context['offerName'] . ' (ID ' . $context['offerId'] . ')'];
                $details[] = ['label' => Yii::t('zii', 'Offer package type'), 'value' => isset($context['offerType']) ? Yii::t('zii', $context['offerType']) : ''];
            }
            return $details;
        }
        if ($code === 'TRUNK_SELECTED') {
            $group = isset($context['trunkGroupName']) ? $context['trunkGroupName'] : '';
            if (isset($context['trunkGroup']) && $context['trunkGroup'] !== '') {
                $group .= ($group !== '' ? ' ' : '') . '(ID ' . $context['trunkGroup'] . ')';
            }
            return [
                ['label' => Yii::t('zii', 'Trunk group used'), 'value' => $group],
                ['label' => Yii::t('zii', 'Selected trunk'), 'value' => isset($context['trunk']) ? $context['trunk'] : ''],
                ['label' => Yii::t('zii', 'Number sent to trunk'), 'value' => isset($context['numberToTrunk']) ? $context['numberToTrunk'] : ''],
                ['label' => Yii::t('zii', 'Dial string'), 'value' => isset($context['dialString']) ? $context['dialString'] : ''],
            ];
        }
        return [];
    }

    private function didDestinationTypeLabel($typeCode)
    {
        $types = [
            0 => 'Call to PSTN',
            1 => 'PJSIP',
            2 => 'IVR',
            3 => 'CallingCard',
            4 => 'Direct extension',
            5 => 'CID Callback',
            6 => '0800 Callback',
            7 => 'Queue',
            8 => 'SIP group',
            9 => 'Custom',
            10 => 'Context',
            11 => 'Multiples IPs',
        ];
        $typeCode = is_numeric($typeCode) ? (int) $typeCode : -1;
        return isset($types[$typeCode]) ? $types[$typeCode] : 'Unknown';
    }

    private function currencyValue($value)
    {
        if ($value === null || $value === '') {
            return '';
        }
        $currency = isset(Yii::app()->session['currency'])
            ? trim((string) Yii::app()->session['currency'])
            : '';
        return ($currency !== '' ? $currency . ' ' : '') . $value;
    }

    private function localizeEvents(array $events)
    {
        foreach ($events as &$event) {
            if (isset($event['component'])) {
                $event['component'] = Yii::t('zii', (string) $event['component']);
            }
            if (isset($event['message'])) {
                $event['message'] = Yii::t('zii', (string) $event['message']);
            }
        }
        return $events;
    }

    private function failure($type, $code, array $details = [])
    {
        $item = self::catalog()[$code];
        $diagnosticId = $this->uuid();
        $failureCause = $this->failureCause($code, $details);
        if ($failureCause !== null) {
            $logDetails = $details;
            $logDetails['stdoutBytes'] = isset($details['stdoutBytes'])
                ? (int) $details['stdoutBytes']
                : (isset($details['stdout'])
                ? strlen((string) $details['stdout'])
                : 0);
            $logDetails['stderrBytes'] = isset($details['stderrBytes'])
                ? (int) $details['stderrBytes']
                : (isset($details['stderr'])
                ? strlen((string) $details['stderr'])
                : 0);
            unset($logDetails['stdout'], $logDetails['stderr']);
            Yii::log(
                'Call diagnostic ID=' . $diagnosticId
                    . ' result=' . $code
                    . ' details=' . json_encode(
                        $logDetails,
                        JSON_UNESCAPED_UNICODE
                            | JSON_UNESCAPED_SLASHES
                            | JSON_INVALID_UTF8_SUBSTITUTE
                    ),
                CLogger::LEVEL_ERROR,
                'callDiagnostic'
            );
        }
        return [
            'diagnosticId' => $diagnosticId,
            'type' => $type,
            'status' => $item[0],
            'summary' => Yii::t('zii', $item[1]),
            'resultCode' => $code,
            'failureCause' => $failureCause,
            'steps' => [[
                'code' => strtolower($code),
                'resultCode' => $code,
                'label' => Yii::t('zii', ucwords(str_replace('_', ' ', strtolower($code)))),
                'status' => $item[0],
                'message' => Yii::t('zii', $item[1]),
                'resolution' => [
                    'message' => $failureCause !== null
                        ? $failureCause['action']
                        : Yii::t('zii', $item[2]),
                ],
            ]],
            'warnings' => [],
            'technicalDetails' => $this->isAdmin ? $details : [],
        ];
    }

    public static function classifyInvalidOutputFailure(
        $resultMarkerFound,
        $stderr,
        $exitCode
    )
    {
        if ($resultMarkerFound) {
            return 'AGI_RESULT_JSON_INVALID';
        }
        if (stripos((string) $stderr, 'Invalid debug arguments.') !== false) {
            return 'AGI_DEBUG_ARGUMENTS_INVALID';
        }
        if (preg_match(
            '/(?:PHP\\s+)?(?:Fatal|Parse) error|Uncaught\\s+(?:Error|Exception)/i',
            (string) $stderr
        )) {
            return 'AGI_PHP_FATAL_ERROR';
        }
        if ($exitCode !== null && (int) $exitCode !== 0) {
            return 'AGI_PROCESS_EXITED_WITH_ERROR';
        }
        return 'MBILLING_RESULT_NOT_FOUND';
    }

    private function failureCause($code, array $details)
    {
        if (! in_array($code, ['AGI_INVALID_OUTPUT', 'AGI_TIMEOUT'], true)) {
            return null;
        }
        $reason = isset($details['reason'])
            ? (string) $details['reason']
            : 'AGI_FAILURE_UNCLASSIFIED';
        $causes = self::failureCatalog();
        $cause = isset($causes[$reason])
            ? $causes[$reason]
            : $causes['AGI_FAILURE_UNCLASSIFIED'];
        return [
            'code' => $reason,
            'title' => Yii::t('zii', $cause[0]),
            'explanation' => Yii::t('zii', $cause[1]),
            'action' => Yii::t('zii', $cause[2]),
        ];
    }

    private function limit($value)
    {
        return substr((string) $value, 0, 8192);
    }

    private function safeRawPayload($value)
    {
        return '<MBILLING_RESULT_PAYLOAD>'
            . $this->safeDiagnosticOutput($value)
            . '</MBILLING_RESULT_PAYLOAD>';
    }

    private function safeDiagnosticOutput($value)
    {
        $value = $this->limit($value);
        $value = preg_replace(
            '/\\b(password|passwd|secret|token|authorization|api[_-]?key|dsn)\\b'
                . '(\\s*["\\\']?\\s*[:=]\\s*["\\\']?)[^\\s,"\\\'}]+/i',
            '$1$2[REDACTED]',
            $value
        );
        $value = preg_replace(
            '~(\\b(?:mysql|pgsql|postgres|mongodb|redis)://[^:/\\s]+:)[^@\\s]+@~i',
            '$1[REDACTED]@',
            $value
        );

        $safe = '';
        for ($index = 0, $length = strlen($value); $index < $length; $index++) {
            $ord = ord($value[$index]);
            if ($ord >= 32 && $ord <= 126) {
                $safe .= $value[$index];
            } elseif ($value[$index] === "\n") {
                $safe .= '\\n';
            } elseif ($value[$index] === "\r") {
                $safe .= '\\r';
            } elseif ($value[$index] === "\t") {
                $safe .= '\\t';
            } else {
                $safe .= sprintf('\\x%02X', $ord);
            }
        }
        return $safe;
    }

    private function resolvePhpCli()
    {
        $configured = getenv('MAGNUSBILLING_PHP_CLI');
        $candidates = [
            $configured !== false ? $configured : null,
            defined('PHP_BINDIR') ? PHP_BINDIR . '/php' : null,
            '/usr/bin/php',
            '/usr/local/bin/php',
            '/opt/homebrew/bin/php',
            defined('PHP_BINARY') ? PHP_BINARY : null,
        ];
        foreach (array_unique(array_filter($candidates)) as $candidate) {
            $name = strtolower(basename($candidate));
            if ($name !== 'php' && ! preg_match('/^php[0-9.]+$/', $name)) {
                continue;
            }
            if (is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }
        }
        return null;
    }

    private function row($sql, $params = [])
    {
        return $this->db->createCommand($sql)->queryRow(true, $params);
    }

    private function uuid()
    {
        $bytes = function_exists('random_bytes') ? random_bytes(16) : openssl_random_pseudo_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
