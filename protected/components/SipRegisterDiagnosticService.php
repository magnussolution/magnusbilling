<?php

/**
 * Read-only REGISTER troubleshooting using recent Asterisk evidence.
 */
class SipRegisterDiagnosticService
{
    const LOG_FILE = '/var/log/asterisk/messages';
    const PJSIP_FILE = '/etc/asterisk/pjsip_magnus_user.conf';
    const MAX_LOG_BYTES = 4194304;
    const MAX_JAILS = 20;

    private $db;
    private $logReader;
    private $commandRunner;
    private $asteriskRunner;

    public function __construct($db, $logReader = null, $commandRunner = null, $asteriskRunner = null)
    {
        $this->db = $db;
        $this->logReader = $logReader;
        $this->commandRunner = $commandRunner;
        $this->asteriskRunner = $asteriskRunner;
    }

    public function diagnose($sipId)
    {
        $sipTable = $this->db->schema->getTable('pkg_sip', true);
        $maxContactsSelect = $sipTable !== null && $sipTable->getColumn('max_contacts') !== null
            ? 's.max_contacts' : '1 AS max_contacts';
        $sip = $this->db->createCommand(
            'SELECT s.id,s.name,s.defaultuser,s.host,s.status,s.context,s.insecure,s.permit,
                    ' . $maxContactsSelect . ',s.allow,s.port,
                    CASE WHEN s.secret IS NULL OR s.secret="" THEN 0 ELSE 1 END AS has_secret,
                    u.active AS user_active
             FROM pkg_sip s
             JOIN pkg_user u ON u.id=s.id_user
             WHERE s.id=:id LIMIT 1'
        )->queryRow(true, [':id' => (int) $sipId]);
        if (! $sip) {
            return $this->result('failed', 'SIP account was not found.', [
                $this->step('REGISTER_ACCOUNT_NOT_FOUND', 'SIP account', 'failed',
                    'The selected SIP account does not exist.', 'Select an existing SIP account.')
            ]);
        }

        $names = array_values(array_unique(array_filter([
            trim((string) $sip['name']),
            trim((string) $sip['defaultuser']),
        ])));
        $log = $this->readLog($names);
        $evidence = $this->parseRegisterEvidence($log['content'], $names);
        $ips = $evidence['ips'];
        $steps = [];
        $accountDetails = [
            ['label' => Yii::t('zii', 'SIP username'), 'value' => (string) $sip['name']],
            ['label' => Yii::t('zii', 'Authentication username'), 'value' => trim((string) $sip['defaultuser']) !== '' ? (string) $sip['defaultuser'] : (string) $sip['name']],
            ['label' => Yii::t('zii', 'Configured host'), 'value' => (string) $sip['host']],
            ['label' => Yii::t('zii', 'Context'), 'value' => trim((string) $sip['context']) !== '' ? (string) $sip['context'] : 'billing'],
            ['label' => Yii::t('zii', 'Password configured'), 'value' => ! empty($sip['has_secret']) ? Yii::t('zii', 'Yes') : Yii::t('zii', 'No')],
            ['label' => Yii::t('zii', 'Maximum contacts'), 'value' => (string) $sip['max_contacts']],
        ];

        if ((int) $sip['status'] !== 1 || (int) $sip['user_active'] !== 1) {
            $steps[] = $this->step('REGISTER_ACCOUNT_INACTIVE', 'SIP account', 'failed',
                'The SIP account is inactive.', 'Activate the SIP account and try to register again.', $accountDetails);
        } else {
            $steps[] = $this->step('REGISTER_ACCOUNT_ACTIVE', 'SIP account', 'passed',
                'The SIP account is active.', 'No account status change is required.', $accountDetails);
        }

        $configuration = $this->inspectGeneratedConfiguration($sip);
        $steps = array_merge($steps, $configuration['steps']);
        $runtime = $this->inspectRuntimeEndpoint($sip);
        $steps = array_merge($steps, $runtime['steps']);

        if (! $log['readable']) {
            $steps[] = $this->step('REGISTER_LOG_UNAVAILABLE', 'Asterisk REGISTER log', 'inconclusive',
                'The Asterisk messages log could not be read by the diagnostic.',
                'Allow the web service to read the Asterisk messages log without granting write access.', [[
                    'label' => Yii::t('zii', 'Log file'), 'value' => self::LOG_FILE,
                ]]);
        } elseif ($evidence['classification'] === null) {
            $steps[] = $this->step('REGISTER_ATTEMPT_NOT_FOUND', 'Asterisk REGISTER log', 'inconclusive',
                'No recent REGISTER attempt for this SIP account was found in the available Asterisk log.',
                'Confirm the SIP username, server address, SIP port and transport on the device. Try REGISTER again, then rerun the check immediately.', [[
                    'label' => Yii::t('zii', 'Log bytes analyzed'), 'value' => (string) $log['bytes'],
                ]]);
        } else {
            $steps[] = $this->evidenceStep($evidence);
        }

        $firewall = $this->firewall($ips);
        $steps = array_merge($steps, $firewall['steps']);
        $status = $this->overallStatus($steps);
        $summary = $status === 'failed'
            ? 'A likely reason for the REGISTER failure was identified.'
            : ($status === 'passed'
                ? 'The latest REGISTER evidence does not show an authentication or firewall failure.'
                : 'There is not enough recent evidence to explain the REGISTER failure.');

        return $this->result($status, $summary, $steps, [
            'logFile' => self::LOG_FILE,
            'logBytesRead' => $log['bytes'],
            'sipAccount' => (string) $sip['name'],
            'attemptIps' => $ips,
            'latestAttemptAt' => $evidence['timestamp'],
            'fail2banChecked' => $firewall['liveChecked'],
            'pjsipConfigurationFile' => self::PJSIP_FILE,
            'pjsipConfigurationReadable' => $configuration['readable'],
            'asteriskEndpointChecked' => $runtime['checked'],
        ]);
    }

    public function unexpectedFailure($error)
    {
        $message = is_object($error) && method_exists($error, 'getMessage')
            ? (string) $error->getMessage() : '';
        $message = preg_replace('/(password|secret|token|authorization)\s*[=:]\s*[^\s,;]+/i', '$1=***', $message);
        $message = substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $message), 0, 1000);
        return $this->result('failed', 'The REGISTER diagnostic stopped because of an internal verification error.', [
            $this->step(
                'REGISTER_DIAGNOSTIC_ERROR', 'REGISTER diagnostic execution', 'failed',
                'One of the REGISTER verification sources could not be processed.',
                'Use the error type and safe message below to correct the unavailable source.',
                [
                    ['label' => Yii::t('zii', 'Error type'), 'value' => is_object($error) ? get_class($error) : 'Unknown'],
                    ['label' => Yii::t('zii', 'Safe error message'), 'value' => $message],
                ]
            )
        ]);
    }

    private function inspectGeneratedConfiguration(array $sip)
    {
        $name = trim((string) $sip['name']);
        if (! preg_match('/^[A-Za-z0-9_.@+-]{1,128}$/D', $name)) {
            return ['readable' => false, 'steps' => [$this->step(
                'REGISTER_PJSIP_NAME_INVALID', 'Generated PJSIP configuration', 'failed',
                'The SIP account name cannot be checked safely in the generated PJSIP configuration.',
                'Correct the SIP account name and regenerate the PJSIP configuration.'
            )]];
        }
        $sections = $this->readPjsipSections([$name, $name . '_auth', $name . '_identify']);
        if (! $sections['readable']) {
            return ['readable' => false, 'steps' => [$this->step(
                'REGISTER_PJSIP_FILE_UNAVAILABLE', 'Generated PJSIP configuration', 'inconclusive',
                'The diagnostic could not read pjsip_magnus_user.conf.',
                'Grant the web service read-only access to pjsip_magnus_user.conf.'
            )]];
        }

        $endpoint = isset($sections['sections'][$name]) ? $sections['sections'][$name] : [];
        $auth = isset($sections['sections'][$name . '_auth']) ? $sections['sections'][$name . '_auth'] : [];
        $identify = isset($sections['sections'][$name . '_identify']) ? $sections['sections'][$name . '_identify'] : [];
        $steps = [];
        if (! $endpoint || strtolower($this->lastValue($endpoint, 'type')) !== 'endpoint') {
            $steps[] = $this->step('REGISTER_PJSIP_ENDPOINT_NOT_GENERATED', 'Generated PJSIP endpoint', 'failed',
                'The selected SIP endpoint is missing from pjsip_magnus_user.conf.',
                'Regenerate the MagnusBilling PJSIP user configuration and reload PJSIP.');
            return ['readable' => true, 'steps' => $steps];
        }

        $host = strtolower(trim((string) $sip['host']));
        $ipOnly = $host !== '' && $host !== 'dynamic' && PjsipAuthenticationMode::isIpOnly([
            'host' => $sip['host'], 'insecure' => $sip['insecure'],
            'secret' => ! empty($sip['has_secret']) ? '__configured__' : '',
        ]);
        $details = [
            ['label' => Yii::t('zii', 'Configuration file'), 'value' => self::PJSIP_FILE],
            ['label' => Yii::t('zii', 'Endpoint section'), 'value' => $name],
            ['label' => Yii::t('zii', 'Context'), 'value' => $this->lastValue($endpoint, 'context')],
            ['label' => Yii::t('zii', 'Identify by'), 'value' => $this->lastValue($endpoint, 'identify_by')],
            ['label' => Yii::t('zii', 'AOR'), 'value' => $this->lastValue($endpoint, 'aors')],
            ['label' => Yii::t('zii', 'Authentication configured'), 'value' => $auth ? Yii::t('zii', 'Yes') : Yii::t('zii', 'No')],
            ['label' => Yii::t('zii', 'Maximum contacts'), 'value' => $this->lastValue($sections['sections'][$name], 'max_contacts')],
            ['label' => Yii::t('zii', 'Allowed codecs'), 'value' => implode(', ', $this->values($endpoint, 'allow'))],
        ];
        $errors = [];
        $expectedContext = trim((string) $sip['context']) !== '' ? trim((string) $sip['context']) : 'billing';
        if ($this->lastValue($endpoint, 'context') !== $expectedContext) $errors[] = 'context';
        if ($this->lastValue($endpoint, 'aors') !== $name) $errors[] = 'aors';
        if (! in_array('aor', array_map('strtolower', $this->values($endpoint, 'type')), true)) $errors[] = 'aor';
        $expectedIdentifyBy = PjsipAuthenticationMode::endpointIdentifyBy([
            'host' => $sip['host'], 'insecure' => $sip['insecure'],
            'secret' => ! empty($sip['has_secret']) ? '__configured__' : '',
        ]);
        if ($this->lastValue($endpoint, 'identify_by') !== $expectedIdentifyBy) $errors[] = 'identify_by';
        if ($ipOnly) {
            if ($auth || $this->lastValue($endpoint, 'auth') !== '') $errors[] = 'auth';
            if (! $identify || $this->lastValue($identify, 'endpoint') !== $name) $errors[] = 'identify';
            $expectedHost = preg_replace('/:\d+$/', '', trim((string) $sip['host']));
            if ($identify && $this->lastValue($identify, 'match') !== $expectedHost) $errors[] = 'identify.match';
        } else {
            $expectedUsername = trim((string) $sip['defaultuser']) !== ''
                ? trim((string) $sip['defaultuser']) : $name;
            if (! $auth || $this->lastValue($endpoint, 'auth') !== $name . '_auth') $errors[] = 'auth';
            if ($auth && $this->lastValue($auth, 'username') !== $expectedUsername) $errors[] = 'auth.username';
            if ($auth && $this->lastValue($auth, 'password') === '') $errors[] = 'auth.password';
            if ((int) $this->lastValue($endpoint, 'max_contacts') < 1) $errors[] = 'max_contacts';
        }
        if ($errors) {
            $details[] = ['label' => Yii::t('zii', 'Inconsistent fields'), 'value' => implode(', ', $errors)];
            $steps[] = $this->step('REGISTER_PJSIP_CONFIGURATION_INCONSISTENT', 'Generated PJSIP endpoint', 'failed',
                'The generated PJSIP endpoint does not match the SIP account configuration.',
                'Regenerate the MagnusBilling PJSIP user configuration and reload PJSIP.', $details);
        } else {
            $message = $ipOnly
                ? 'The generated endpoint is configured for authentication exclusively by IP and is not expected to REGISTER with a password.'
                : 'The generated endpoint, AOR and authentication association are present and consistent.';
            $steps[] = $this->step('REGISTER_PJSIP_CONFIGURATION_READY', 'Generated PJSIP endpoint', 'passed',
                $message, 'No manual edit of pjsip_magnus_user.conf is required.', $details);
        }
        return ['readable' => true, 'steps' => $steps];
    }

    private function inspectRuntimeEndpoint(array $sip)
    {
        $name = trim((string) $sip['name']);
        if (! preg_match('/^[A-Za-z0-9_.@+-]{1,128}$/D', $name)) {
            return ['checked' => false, 'steps' => []];
        }
        try {
            if (is_callable($this->asteriskRunner)) {
                $endpoint = (string) call_user_func($this->asteriskRunner, 'endpoint', $name);
                $aor = (string) call_user_func($this->asteriskRunner, 'aor', $name);
            } else {
                $asterisk = AsteriskAccess::instance();
                $endpoint = $this->outputText($asterisk->pjsipShowEndpoint($name));
                $aor = $this->outputText($asterisk->pjsipShowAor($name));
            }
        } catch (Throwable $error) {
            return ['checked' => false, 'steps' => [$this->step(
                'REGISTER_ASTERISK_RUNTIME_UNAVAILABLE', 'Asterisk loaded endpoint', 'inconclusive',
                'The diagnostic could not query the endpoint currently loaded by Asterisk.',
                'Verify Asterisk Manager connectivity and run Check REGISTER again.'
            )]];
        }
        if ($endpoint === '' || preg_match('/unable to find|not found|no such endpoint/i', $endpoint)) {
            return ['checked' => true, 'steps' => [$this->step(
                'REGISTER_ASTERISK_ENDPOINT_NOT_LOADED', 'Asterisk loaded endpoint', 'failed',
                'The endpoint exists in MagnusBilling but is not loaded in Asterisk.',
                'Regenerate the PJSIP configuration and reload PJSIP.'
            )]];
        }
        $contact = preg_match(
            '/^\s*Contact:\s+' . preg_quote($name, '/') . '\/\S+/mi',
            $aor,
            $match
        ) ? trim($match[0]) : '';
        $endpointState = preg_match(
            '/^\s*Endpoint:\s+' . preg_quote($name, '/') . '\s+(Available|Unavailable|Not in use|In use|Busy|Ringing|On hold)/mi',
            $endpoint,
            $stateMatch
        ) ? trim($stateMatch[1]) : '';
        $transport = preg_match('/^\s*Transport:\s+([^\r\n]+)/mi', $endpoint, $transportMatch)
            && strpos($transportMatch[1], '<TransportId') === false
            ? preg_replace('/\s+/', ' ', trim($transportMatch[1])) : '';
        return ['checked' => true, 'steps' => [$this->step(
            $contact !== '' ? 'REGISTER_ASTERISK_CONTACT_AVAILABLE' : 'REGISTER_ASTERISK_ENDPOINT_LOADED',
            'Asterisk loaded endpoint', $contact !== '' ? 'passed' : 'warning',
            $contact !== ''
                ? 'The endpoint is loaded in Asterisk and currently has a contact.'
                : 'The endpoint is loaded in Asterisk, but its AOR currently has no registered contact. The device is not registered.',
            $contact !== '' ? 'No endpoint reload is required.' : 'Confirm that the device is sending REGISTER with this exact SIP username to the configured server address and port.',
            [
                ['label' => Yii::t('zii', 'Endpoint state'), 'value' => $endpointState],
                ['label' => Yii::t('zii', 'Loaded transport'), 'value' => $transport],
                ['label' => Yii::t('zii', 'Loaded contact'),
                    'value' => $contact !== '' ? $this->sanitizeContact($contact) : Yii::t('zii', 'None')],
            ]
        )]];
    }

    private function evidenceStep(array $evidence)
    {
        $map = [
            'auth_failed' => ['REGISTER_AUTH_FAILED', 'failed',
                'Asterisk rejected the REGISTER authentication. The username or password sent by the device does not match this SIP account.',
                'Confirm the SIP username and password on the device, then try again.'],
            'username_mismatch' => ['REGISTER_USERNAME_MISMATCH', 'failed',
                'A REGISTER attempt reached Asterisk from a similar SIP username, but it is not the selected account username.',
                'Correct the authentication username on the device so it exactly matches the selected SIP account.'],
            'endpoint_missing' => ['REGISTER_ENDPOINT_MISSING', 'failed',
                'Asterisk could not match the REGISTER request to a loaded SIP endpoint.',
                'Regenerate and reload the MagnusBilling PJSIP configuration, then try again.'],
            'acl_failed' => ['REGISTER_ACL_FAILED', 'failed',
                'Asterisk rejected the REGISTER source address because it is not permitted by the endpoint access rules.',
                'Review the permitted IP or network configured for this SIP account.'],
            'max_contacts' => ['REGISTER_MAX_CONTACTS_REACHED', 'failed',
                'Asterisk rejected the REGISTER because the AOR reached its maximum number of contacts.',
                'Remove the obsolete contact or increase Max Contacts for this SIP account.'],
            'aor_missing' => ['REGISTER_AOR_MISSING', 'failed',
                'Asterisk could not find a valid AOR for the REGISTER request.',
                'Regenerate the PJSIP user configuration and confirm the endpoint aors setting.'],
            'malformed' => ['REGISTER_REQUEST_MALFORMED', 'failed',
                'Asterisk rejected a malformed or unsupported REGISTER request from the device.',
                'Review the SIP server, transport, port and SIP URI configured on the device.'],
            'success' => ['REGISTER_ACCEPTED', 'passed',
                'Asterisk accepted the latest REGISTER and created or updated the contact.',
                'No REGISTER correction is required.'],
            'challenge' => ['REGISTER_CHALLENGE_SENT', 'warning',
                'Asterisk sent the normal authentication challenge, but the available log does not show a later successful response.',
                'Check whether the device answered the challenge and try to register again.'],
            'unknown_failure' => ['REGISTER_REJECTED', 'failed',
                'Asterisk rejected the REGISTER request.',
                'Use the source IP and time shown below to review the matching Asterisk event.'],
        ];
        $item = $map[$evidence['classification']];
        if ($evidence['classification'] === 'auth_failed') {
            $item[2] = ! empty($evidence['sameAttemptFailures']) && $evidence['sameAttemptFailures'] > 1
                ? 'Asterisk received REGISTER for this exact SIP account, but rejected the authentication repeatedly. The password sent by the device does not match the account, or the device did not send a valid authenticated response.'
                : 'Asterisk received REGISTER for this exact SIP account, but could not validate the authentication response from the device.';
            $item[3] = 'Configure the device with this exact SIP username and the current SIP password, then try REGISTER again.';
        }
        $details = [];
        if ($evidence['timestamp'] !== '') {
            $details[] = [
                'label' => Yii::t(
                    'zii',
                    $evidence['classification'] === 'username_mismatch'
                        ? 'Latest similar REGISTER found' : 'Last exact REGISTER found'
                ),
                'value' => $evidence['timestamp'],
            ];
        }
        if ($evidence['ips']) {
            $details[] = ['label' => Yii::t('zii', 'Source IP'), 'value' => implode(', ', $evidence['ips'])];
        }
        if (! empty($evidence['observedUsername'])) {
            $details[] = ['label' => Yii::t('zii', 'Username received by Asterisk'), 'value' => $evidence['observedUsername']];
        }
        if (! empty($evidence['sameAttemptFailures'])) {
            $details[] = [
                'label' => Yii::t('zii', 'Rejected messages for the same attempt'),
                'value' => (string) $evidence['sameAttemptFailures'],
            ];
        }
        return $this->step($item[0], 'Asterisk REGISTER log', $item[1], $item[2], $item[3], $details);
    }

    private function parseRegisterEvidence($content, array $names)
    {
        $result = [
            'classification' => null, 'ips' => [], 'timestamp' => '',
            'observedUsername' => '', 'callId' => '', 'sameAttemptFailures' => 0,
        ];
        if ($content === '' || ! $names) {
            return $result;
        }
        $matched = [];
        $latestRegister = null;
        foreach (preg_split('/\r?\n/', $content) as $line) {
            if (! preg_match('/REGISTER|contact|AOR|endpoint|authenticat/i', $line)) {
                continue;
            }
            $belongs = false;
            foreach ($names as $name) {
                if ($name !== '' && preg_match('/(?<![A-Za-z0-9_.-])' . preg_quote($name, '/') . '(?![A-Za-z0-9_.-])/i', $line)) {
                    $belongs = true;
                    break;
                }
            }
            if ($belongs) {
                $matched[] = $line;
            }
            if (preg_match("/Request 'REGISTER' from '<sip:([^@;>]+)@/i", $line, $userMatch)) {
                $observed = trim($userMatch[1]);
                foreach ($names as $name) {
                    if (strcasecmp($observed, $name) === 0 || $this->similarSipUsername($name, $observed)) {
                        $latestRegister = [
                            'line' => $line,
                            'username' => $observed,
                            'exact' => strcasecmp($observed, $name) === 0,
                        ];
                        break;
                    }
                }
            }
        }
        if (! $matched && $latestRegister !== null && ! $latestRegister['exact']) {
            $matched = [$latestRegister['line']];
            $result['classification'] = 'username_mismatch';
            $result['observedUsername'] = $latestRegister['username'];
        }
        if (! $matched) return $result;
        $line = end($matched);
        $text = implode("\n", array_slice($matched, -8));
        if (preg_match('/\(callid:\s*([^\)\s]+)\)/i', $line, $callIdMatch)) {
            $result['callId'] = substr($callIdMatch[1], 0, 160);
            $result['sameAttemptFailures'] = preg_match_all(
                '/^.*' . preg_quote($callIdMatch[1], '/') . '.*(?:failed|wrong password).*$/mi',
                $content
            );
        }
        if ($result['classification'] === 'username_mismatch') {
            // Preserve the more useful mismatch classification over the generic auth failure.
        } elseif (preg_match('/failed to authenticate|authentication failed|wrong password|invalid password/i', $line)) {
            $result['classification'] = 'auth_failed';
        } elseif (preg_match('/maximum contacts|max_contacts|exceeded.*contacts|contacts.*limit/i', $line)) {
            $result['classification'] = 'max_contacts';
        } elseif (preg_match('/AOR.*(?:not found|does not exist|unable to find|no configured)|unable to find.*AOR/i', $line)) {
            $result['classification'] = 'aor_missing';
        } elseif (preg_match('/no matching endpoint|unable to find endpoint|endpoint.*not found/i', $line)) {
            $result['classification'] = 'endpoint_missing';
        } elseif (preg_match('/ACL|not permitted|not allowed/i', $line)) {
            $result['classification'] = 'acl_failed';
        } elseif (preg_match('/malformed|invalid (?:URI|request)|unsupported (?:URI|transport)|parse error/i', $line)) {
            $result['classification'] = 'malformed';
        } elseif (preg_match('/added contact|updated contact|registered contact|registration.*successful/i', $line)) {
            $result['classification'] = 'success';
        } elseif (preg_match('/challenge|401 Unauthorized/i', $line)) {
            $result['classification'] = 'challenge';
        } elseif (preg_match('/failed|rejected|forbidden|not found/i', $line)) {
            $result['classification'] = 'unknown_failure';
        }
        if (preg_match_all("/failed for '((?:[0-9]{1,3}\\.){3}[0-9]{1,3})(?::[0-9]+)?'/i", $text, $sourceMatches)) {
            $ipMatches = [$sourceMatches[1]];
        } else {
            preg_match_all('/(?<![0-9])(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?![0-9])/', $text, $ipMatches);
        }
        foreach ($ipMatches[0] as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                $result['ips'][] = $ip;
            }
        }
        $result['ips'] = array_slice(array_values(array_unique($result['ips'])), 0, 10);
        if (preg_match('/\[([^\]]+)\]/', $line, $date)) {
            $result['timestamp'] = substr($date[1], 0, 40);
        }
        return $result;
    }

    private function similarSipUsername($expected, $observed)
    {
        $expected = strtolower((string) $expected);
        $observed = strtolower((string) $observed);
        if ($expected === '' || $observed === '' || $expected === $observed) return false;
        return strpos($observed, $expected) === 0
            || strpos($expected, $observed) === 0
            || (max(strlen($expected), strlen($observed)) <= 32 && levenshtein($expected, $observed) <= 2);
    }

    private function firewall(array $ips)
    {
        if (! $ips) {
            return ['liveChecked' => false, 'steps' => [
                $this->step('REGISTER_SOURCE_IP_UNKNOWN', 'Firewall', 'inconclusive',
                    'No source IP was found in the recent REGISTER evidence, so firewall blocks could not be correlated.',
                    'Try to register again and rerun the diagnostic immediately.')
            ]];
        }
        $params = [];
        $holders = [];
        foreach ($ips as $index => $ip) {
            $holders[] = ':ip' . $index;
            $params[':ip' . $index] = $ip;
        }
        $rows = $this->db->createCommand(
            'SELECT ip,action,date,jail,id_server FROM pkg_firewall '
            . 'WHERE action IN (0,1) AND ip IN (' . implode(',', $holders) . ') ORDER BY date DESC LIMIT 20'
        )->queryAll(true, $params);
        $cidrRows = $this->db->createCommand(
            "SELECT ip,action,date,jail,id_server FROM pkg_firewall "
            . "WHERE action IN (0,1) AND ip LIKE '%/%' ORDER BY date DESC LIMIT 100"
        )->queryAll();
        foreach ($cidrRows as $row) {
            foreach ($ips as $ip) {
                if ($this->ipInCidr($ip, (string) $row['ip'])) {
                    $rows[] = $row;
                    break;
                }
            }
        }
        $live = $this->liveFail2ban($ips);
        $steps = [];
        if ($rows) {
            $details = [];
            foreach ($rows as $row) {
                $details[] = [
                    'label' => Yii::t('zii', 'Firewall block'),
                    'value' => $row['ip'] . ($row['jail'] ? ' — ' . $row['jail'] : '') . ' — ' . $row['date'],
                ];
            }
            $steps[] = $this->step('REGISTER_FIREWALL_BLOCKED', 'MagnusBilling firewall', 'failed',
                'The REGISTER source IP is recorded as blocked in the MagnusBilling firewall.',
                'Confirm that the IP belongs to the customer before removing the block.', $details);
        } else {
            $steps[] = $this->step('REGISTER_FIREWALL_CLEAR', 'MagnusBilling firewall', 'passed',
                'The REGISTER source IP is not listed as blocked in pkg_firewall.',
                'No MagnusBilling firewall change is required.');
        }
        if ($live['checked'] && $live['matches']) {
            $steps[] = $this->step('REGISTER_FAIL2BAN_BLOCKED', 'Fail2Ban', 'failed',
                'Fail2Ban currently has the REGISTER source IP banned.',
                'Confirm that the IP belongs to the customer before unbanning it.', [[
                    'label' => Yii::t('zii', 'Fail2Ban jail'),
                    'value' => implode(', ', $live['matches']),
                ]]);
        } elseif ($live['checked']) {
            $steps[] = $this->step('REGISTER_FAIL2BAN_CLEAR', 'Fail2Ban', 'passed',
                'The REGISTER source IP is not currently banned by Fail2Ban.',
                'No Fail2Ban change is required.');
        } else {
            $steps[] = $this->step('REGISTER_FAIL2BAN_UNAVAILABLE', 'Fail2Ban', 'inconclusive',
                'The diagnostic could not read the live Fail2Ban status.',
                'Verify read-only permission to run fail2ban-client status.');
        }
        return ['liveChecked' => $live['checked'], 'steps' => $steps];
    }

    private function ipInCidr($ip, $cidr)
    {
        $parts = explode('/', $cidr, 2);
        if (count($parts) !== 2 || ! ctype_digit($parts[1])) return false;
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)
            || ! filter_var($parts[0], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) return false;
        $bits = (int) $parts[1];
        if ($bits < 0 || $bits > 32) return false;
        $mask = $bits === 0 ? 0 : (-1 << (32 - $bits));
        return (ip2long($ip) & $mask) === (ip2long($parts[0]) & $mask);
    }

    private function liveFail2ban(array $ips)
    {
        $status = $this->runCommand(['sudo', '-n', 'fail2ban-client', 'status']);
        if (! $status['ok'] || ! preg_match('/Jail list:\s*(.+)$/mi', $status['output'], $match)) {
            return ['checked' => false, 'matches' => []];
        }
        $jails = array_slice(array_filter(array_map('trim', explode(',', $match[1]))), 0, self::MAX_JAILS);
        $matches = [];
        foreach ($jails as $jail) {
            if (! preg_match('/^[A-Za-z0-9_.-]{1,80}$/D', $jail)) {
                continue;
            }
            $item = $this->runCommand(['sudo', '-n', 'fail2ban-client', 'status', $jail]);
            if (! $item['ok']) {
                continue;
            }
            foreach ($ips as $ip) {
                if (preg_match('/(?<![0-9.])' . preg_quote($ip, '/') . '(?![0-9.])/', $item['output'])) {
                    $matches[] = $jail . ': ' . $ip;
                }
            }
        }
        return ['checked' => true, 'matches' => array_values(array_unique($matches))];
    }

    private function readPjsipSections(array $wanted)
    {
        if (is_callable($this->logReader)) {
            $content = (string) call_user_func($this->logReader, self::PJSIP_FILE, 16777216);
            return ['readable' => true, 'sections' => $this->parsePjsipSections($content, $wanted)];
        }
        if (! is_file(self::PJSIP_FILE) || ! is_readable(self::PJSIP_FILE)) {
            return ['readable' => false, 'sections' => []];
        }
        $handle = fopen(self::PJSIP_FILE, 'rb');
        if ($handle === false) return ['readable' => false, 'sections' => []];
        $sections = [];
        $current = null;
        $wantedMap = array_fill_keys($wanted, true);
        while (($line = fgets($handle, 16384)) !== false) {
            $line = trim($line);
            if (preg_match('/^\[([^\]]+)\]$/', $line, $match)) {
                $current = isset($wantedMap[$match[1]]) ? $match[1] : null;
                if ($current !== null && ! isset($sections[$current])) $sections[$current] = [];
                continue;
            }
            if ($current === null || $line === '' || $line[0] === ';' || strpos($line, '=') === false) continue;
            list($key, $value) = array_map('trim', explode('=', $line, 2));
            $key = strtolower($key);
            if (in_array($key, ['password', 'secret', 'md5_cred'], true)) $value = '__configured__';
            $sections[$current][$key][] = substr($value, 0, 512);
        }
        fclose($handle);
        return ['readable' => true, 'sections' => $sections];
    }

    private function parsePjsipSections($content, array $wanted)
    {
        $sections = [];
        $wantedMap = array_fill_keys($wanted, true);
        $current = null;
        foreach (preg_split('/\r?\n/', (string) $content) as $line) {
            $line = trim($line);
            if (preg_match('/^\[([^\]]+)\]$/', $line, $match)) {
                $current = isset($wantedMap[$match[1]]) ? $match[1] : null;
                if ($current !== null && ! isset($sections[$current])) $sections[$current] = [];
                continue;
            }
            if ($current === null || $line === '' || $line[0] === ';' || strpos($line, '=') === false) continue;
            list($key, $value) = array_map('trim', explode('=', $line, 2));
            $key = strtolower($key);
            if (in_array($key, ['password', 'secret', 'md5_cred'], true)) $value = '__configured__';
            $sections[$current][$key][] = substr($value, 0, 512);
        }
        return $sections;
    }

    private function values(array $section, $key)
    {
        return isset($section[strtolower($key)]) ? $section[strtolower($key)] : [];
    }

    private function lastValue(array $section, $key)
    {
        $values = $this->values($section, $key);
        return $values ? (string) end($values) : '';
    }

    private function outputText($output)
    {
        if (is_array($output)) {
            if (isset($output['data'])) return trim((string) $output['data']);
            if (isset($output['Output'])) $output = $output['Output'];
            else {
                $parts = [];
                array_walk_recursive($output, function ($value) use (&$parts) {
                    if (is_scalar($value)) $parts[] = (string) $value;
                });
                return trim(implode("\n", $parts));
            }
        }
        return is_array($output) ? trim(implode("\n", $output)) : trim((string) $output);
    }

    private function sanitizeContact($contact)
    {
        $contact = preg_replace('/(password|secret|auth|token)=([^;\s]+)/i', '$1=***', (string) $contact);
        return substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $contact), 0, 512);
    }

    private function readLog(array $names)
    {
        if (is_callable($this->logReader)) {
            $content = (string) call_user_func($this->logReader, self::LOG_FILE, self::MAX_LOG_BYTES);
            return ['readable' => true, 'content' => $content, 'bytes' => strlen($content)];
        }
        if (! is_file(self::LOG_FILE) || ! is_readable(self::LOG_FILE)) {
            return ['readable' => false, 'content' => '', 'bytes' => 0];
        }
        $handle = fopen(self::LOG_FILE, 'rb');
        if ($handle === false) {
            return ['readable' => false, 'content' => '', 'bytes' => 0];
        }
        $bytes = 0;
        $matchedLines = [];
        while (($line = fgets($handle, 16384)) !== false) {
            $bytes += strlen($line);
            $keep = false;
            foreach ($names as $name) {
                if ($name !== '' && stripos($line, $name) !== false) {
                    $keep = true;
                    break;
                }
            }
            if ($keep && preg_match('/REGISTER|contact|AOR|endpoint|authenticat/i', $line)) {
                $matchedLines[] = rtrim($line, "\r\n");
                if (count($matchedLines) > 500) array_shift($matchedLines);
            }
        }
        fclose($handle);
        $content = implode("\n", $matchedLines);
        return ['readable' => true, 'content' => $content, 'bytes' => $bytes];
    }

    private function runCommand(array $command)
    {
        if (is_callable($this->commandRunner)) {
            $value = call_user_func($this->commandRunner, $command);
            return is_array($value) ? $value : ['ok' => true, 'output' => (string) $value];
        }
        if (! function_exists('proc_open')) {
            return ['ok' => false, 'output' => ''];
        }
        $pipes = [];
        $process = @proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
        if (! is_resource($process)) {
            return ['ok' => false, 'output' => ''];
        }
        fclose($pipes[0]);
        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);
        $output = '';
        $started = microtime(true);
        do {
            $output .= stream_get_contents($pipes[1], 65536);
            $output .= stream_get_contents($pipes[2], 65536);
            $state = proc_get_status($process);
            if (! $state['running']) break;
            usleep(20000);
        } while (microtime(true) - $started < 2.0 && strlen($output) < 262144);
        if (isset($state) && $state['running']) proc_terminate($process, 15);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $exit = proc_close($process);
        return ['ok' => isset($state) && ! $state['running'] && ($exit === 0 || $state['exitcode'] === 0), 'output' => $output];
    }

    private function step($code, $label, $status, $message, $action, array $details = [])
    {
        return [
            'code' => strtolower($code), 'resultCode' => $code,
            'label' => Yii::t('zii', $label), 'status' => $status,
            'message' => Yii::t('zii', $message),
            'displayDetails' => $details,
            'resolution' => ['message' => Yii::t('zii', $action)],
        ];
    }

    private function overallStatus(array $steps)
    {
        foreach ($steps as $step) if ($step['status'] === 'failed') return 'failed';
        foreach ($steps as $step) if ($step['status'] === 'warning') return 'warning';
        foreach ($steps as $step) if ($step['status'] === 'inconclusive') return 'inconclusive';
        return 'passed';
    }

    private function result($status, $summary, array $steps, array $technical = [])
    {
        return [
            'diagnosticId' => $this->uuid(), 'type' => 'register', 'status' => $status,
            'summary' => Yii::t('zii', $summary), 'resultCode' => 'REGISTER_DIAGNOSTIC',
            'steps' => $steps, 'warnings' => [], 'technicalDetails' => $technical,
        ];
    }

    private function uuid()
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 15) | 64);
        $bytes[8] = chr((ord($bytes[8]) & 63) | 128);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
