<?php

/**
 * Performs a bounded, read-only check of fixed-IP SIP authentication.
 *
 * The probe deliberately distinguishes chan_sip from PJSIP. The legacy
 * "insecure" option belongs to chan_sip and must not be recommended for a
 * PJSIP endpoint.
 */
class SipIpAuthenticationProbe
{
    private $commandRunner;
    private $asterisk;

    public function __construct($commandRunner = null)
    {
        $this->commandRunner = $commandRunner;
    }

    public function inspect(array $sip)
    {
        $name = isset($sip['name']) ? trim((string) $sip['name']) : '';
        $host = isset($sip['host']) ? trim((string) $sip['host']) : '';
        if (! $this->isFixedIp($host)) {
            return null;
        }

        if (! preg_match('/^[A-Za-z0-9_.@+-]{1,128}$/D', $name)) {
            return $this->step(
                'SIP_IP_AUTH_DRIVER_INCONCLUSIVE',
                'inconclusive',
                'SIP IP authentication',
                'The SIP driver could not be checked safely for this account.',
                'Verify the SIP account name and run Call Check again.',
                $host,
                Yii::t('zii', 'Not determined'),
                isset($sip['insecure']) ? (string) $sip['insecure'] : ''
            );
        }

        try {
            $pjsipOutput = $this->run('pjsip', $name);
            $sipOutput = $this->run('sip', $name);
            $hasPjsipEndpoint = $this->pjsipEndpointExists($pjsipOutput, $name);
            $hasChanSipPeer = $this->chanSipPeerExists($sipOutput, $name);

            if ($hasPjsipEndpoint && $hasChanSipPeer) {
                return $this->step(
                    'SIP_IP_AUTH_DRIVER_INCONCLUSIVE',
                    'inconclusive',
                    'SIP IP authentication',
                    'The fixed-IP account appears in both chan_sip and PJSIP, so Call Check cannot determine which driver received the INVITE.',
                    'Confirm the SIP driver and listening port used by the client before changing insecure.',
                    $host,
                    Yii::t('zii', 'Multiple drivers'),
                    isset($sip['insecure']) ? (string) $sip['insecure'] : ''
                );
            }

            if ($hasPjsipEndpoint) {
                return $this->step(
                    'SIP_IP_AUTH_PJSIP_IDENTIFY',
                    'passed',
                    'SIP IP authentication',
                    'This fixed-IP account is loaded by PJSIP, which identifies the endpoint by IP without using the chan_sip insecure option.',
                    'No insecure change is required. If the endpoint still receives a 401 response, verify its PJSIP identify match and the source IP of the INVITE.',
                    $host,
                    'PJSIP',
                    Yii::t('zii', 'Not applicable')
                );
            }

            if (! $hasChanSipPeer) {
                return $this->step(
                    'SIP_IP_AUTH_DRIVER_INCONCLUSIVE',
                    'inconclusive',
                    'SIP IP authentication',
                    'The account uses a fixed IP, but Call Check could not confirm whether it is loaded by chan_sip or PJSIP.',
                    'Reload the SIP configuration and run Call Check again. Do not change insecure until the active SIP driver is confirmed.',
                    $host,
                    Yii::t('zii', 'Not determined'),
                    isset($sip['insecure']) ? (string) $sip['insecure'] : ''
                );
            }

            $loadedInsecure = $this->chanSipInsecure($sipOutput);
            $effectiveInsecure = $loadedInsecure !== null
                ? $loadedInsecure
                : (isset($sip['insecure']) ? (string) $sip['insecure'] : '');
            $tokens = preg_split('/[\s,]+/', strtolower($effectiveInsecure), -1, PREG_SPLIT_NO_EMPTY);
            $hasPort = in_array('port', $tokens, true);
            $hasInvite = in_array('invite', $tokens, true);

            if ($hasPort && $hasInvite) {
                return $this->step(
                    'SIP_IP_AUTH_CHAN_SIP_READY',
                    'passed',
                    'SIP IP authentication',
                    'This fixed-IP chan_sip account accepts INVITEs from a different source port without requesting digest authentication.',
                    'No insecure change is required.',
                    $host,
                    'chan_sip',
                    $effectiveInsecure
                );
            }

            return $this->step(
                'SIP_IP_AUTH_SOURCE_PORT_RISK',
                'warning',
                'SIP IP authentication',
                'This fixed-IP chan_sip account may answer with 401 when an INVITE arrives from the configured IP but uses a different source port.',
                'After confirming that the configured IP belongs to this trusted client or provider, set insecure to port,invite and reload the SIP configuration.',
                $host,
                'chan_sip',
                $effectiveInsecure === '' ? Yii::t('zii', 'Not configured') : $effectiveInsecure
            );
        } catch (Throwable $e) {
            return $this->step(
                'SIP_IP_AUTH_DRIVER_INCONCLUSIVE',
                'inconclusive',
                'SIP IP authentication',
                'The account uses a fixed IP, but Asterisk did not provide enough information to check its authentication behavior.',
                'Verify that Asterisk Manager is available, then run Call Check again. Do not change insecure without confirming the active SIP driver.',
                $host,
                Yii::t('zii', 'Not determined'),
                isset($sip['insecure']) ? (string) $sip['insecure'] : ''
            );
        }
    }

    private function run($driver, $name)
    {
        if (is_callable($this->commandRunner)) {
            return $this->normalizeOutput(call_user_func($this->commandRunner, $driver, $name));
        }

        if ($this->asterisk === null) {
            $this->asterisk = AsteriskAccess::instance();
        }
        return $this->normalizeOutput(
            $driver === 'pjsip'
                ? $this->asterisk->pjsipShowEndpoint($name)
                : $this->asterisk->sipShowPeer($name)
        );
    }

    private function normalizeOutput($output)
    {
        if (is_array($output)) {
            $parts = [];
            array_walk_recursive($output, function ($value) use (&$parts) {
                if (is_scalar($value)) {
                    $parts[] = (string) $value;
                }
            });
            return implode("\n", $parts);
        }
        return is_scalar($output) ? (string) $output : '';
    }

    private function isFixedIp($host)
    {
        if ($host === '' || strtolower($host) === 'dynamic') {
            return false;
        }
        $candidate = $host;
        if ($candidate[0] === '[' && preg_match('/^\[([^\]]+)\](?::\d+)?$/', $candidate, $match)) {
            $candidate = $match[1];
        } elseif (substr_count($candidate, ':') === 1) {
            list($candidate) = explode(':', $candidate, 2);
        }
        return filter_var($candidate, FILTER_VALIDATE_IP) !== false;
    }

    private function pjsipEndpointExists($output, $name)
    {
        if ($output === '' || preg_match('/unable to find|could not find|no such endpoint/i', $output)) {
            return false;
        }
        return preg_match('/Endpoint:\s*' . preg_quote($name, '/') . '(?:\/|\s|$)/i', $output) === 1;
    }

    private function chanSipPeerExists($output, $name)
    {
        if ($output === '' || preg_match('/not found|no such command|unknown command/i', $output)) {
            return false;
        }
        return preg_match('/^\s*\*?\s*Name\s*:\s*' . preg_quote($name, '/') . '\s*$/mi', $output) === 1;
    }

    private function chanSipInsecure($output)
    {
        return preg_match('/^\s*Insecure\s*:\s*([^\r\n]*)/mi', $output, $match)
            ? trim($match[1])
            : null;
    }

    private function step($code, $status, $label, $message, $action, $host, $driver, $insecure)
    {
        return [
            'code' => strtolower($code),
            'resultCode' => $code,
            'label' => Yii::t('zii', $label),
            'status' => $status,
            'message' => Yii::t('zii', $message),
            'displayDetails' => [
                ['label' => Yii::t('zii', 'Authentication method'), 'value' => Yii::t('zii', 'Fixed IP')],
                ['label' => Yii::t('zii', 'Configured host'), 'value' => $host],
                ['label' => Yii::t('zii', 'Active SIP driver'), 'value' => Yii::t('zii', $driver)],
                ['label' => Yii::t('zii', 'Loaded insecure value'), 'value' => Yii::t('zii', $insecure)],
            ],
            'resolution' => ['message' => Yii::t('zii', $action)],
        ];
    }
}
