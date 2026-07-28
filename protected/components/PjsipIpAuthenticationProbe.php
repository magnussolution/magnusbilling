<?php

/**
 * Performs a bounded, read-only check of fixed-IP PJSIP authentication.
 */
class PjsipIpAuthenticationProbe
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
        $hostData = $this->fixedIp($host);
        if ($hostData === null) {
            return null;
        }

        if (! preg_match('/^[A-Za-z0-9_.@+-]{1,128}$/D', $name)) {
            return $this->step(
                'PJSIP_IP_AUTH_INCONCLUSIVE',
                'inconclusive',
                'The PJSIP endpoint could not be checked safely for this account.',
                'Verify the SIP account name and run Call Check again.',
                $host,
                Yii::t('zii', 'Not determined'),
                Yii::t('zii', 'Not determined')
            );
        }

        try {
            $output = $this->run($name);
        } catch (Throwable $e) {
            return $this->step(
                'PJSIP_IP_AUTH_INCONCLUSIVE',
                'inconclusive',
                'Asterisk did not provide enough information to check PJSIP authentication for this fixed-IP account.',
                'Verify that Asterisk Manager is available, then run Call Check again.',
                $host,
                Yii::t('zii', 'Not determined'),
                Yii::t('zii', 'Not determined')
            );
        }

        if (! $this->endpointExists($output, $name)) {
            return $this->step(
                'PJSIP_ENDPOINT_NOT_LOADED',
                'warning',
                'The fixed-IP PJSIP endpoint is not loaded in Asterisk.',
                'Regenerate and reload the PJSIP configuration, then run Call Check again.',
                $host,
                Yii::t('zii', 'Not loaded'),
                Yii::t('zii', 'Not determined')
            );
        }

        $identify = $this->identify($output, $hostData['ip']);
        $inboundAuth = $this->inboundAuth($output);

        if (! $identify['present'] || ! $identify['matchesIp']) {
            return $this->step(
                'PJSIP_IP_IDENTIFY_MISSING',
                'warning',
                'The PJSIP endpoint is loaded, but its Identify does not match the configured IP. Asterisk may not recognize the INVITE as belonging to this account.',
                'Regenerate and reload the PJSIP configuration, then confirm that Identify matches the trusted source IP.',
                $host,
                $identify['value'] !== '' ? $identify['value'] : Yii::t('zii', 'Not loaded'),
                $inboundAuth !== null ? $inboundAuth : Yii::t('zii', 'Not configured')
            );
        }

        if ($identify['port'] !== null) {
            return $this->step(
                'PJSIP_IP_IDENTIFY_PORT_RESTRICTED',
                'warning',
                'The PJSIP Identify match includes a source port. An INVITE from the same IP using a different source port will not match this endpoint and may receive 401.',
                'After confirming the trusted source IP, remove the port restriction from the Identify match and reload PJSIP.',
                $host,
                $identify['value'],
                $inboundAuth !== null ? $inboundAuth : Yii::t('zii', 'Not configured')
            );
        }

        if ($inboundAuth !== null) {
            return $this->step(
                'PJSIP_IP_INBOUND_AUTH_ENABLED',
                'warning',
                'The endpoint matches the configured IP, but inbound authentication is also enabled. Asterisk will request credentials with 401 even after identifying the endpoint by IP.',
                'If this trusted account must authenticate only by IP, remove its inbound authentication association and reload PJSIP. Keep authentication enabled if the client must also send credentials.',
                $host,
                $identify['value'],
                $inboundAuth
            );
        }

        return $this->step(
            'PJSIP_IP_AUTH_READY',
            'passed',
            'The endpoint is identified by the configured IP without a source-port restriction and does not require inbound credentials.',
            'No authentication change is required. If a real INVITE still receives 401, verify that its source IP is the same IP shown here.',
            $host,
            $identify['value'],
            Yii::t('zii', 'Not configured')
        );
    }

    private function run($name)
    {
        if (is_callable($this->commandRunner)) {
            return $this->normalizeOutput(call_user_func($this->commandRunner, $name));
        }
        if ($this->asterisk === null) {
            $this->asterisk = AsteriskAccess::instance();
        }
        return $this->normalizeOutput($this->asterisk->pjsipShowEndpoint($name));
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

    private function fixedIp($host)
    {
        if ($host === '' || strtolower($host) === 'dynamic') {
            return null;
        }
        $ip = $host;
        $port = null;
        if ($ip[0] === '[' && preg_match('/^\[([^\]]+)\](?::(\d+))?$/', $ip, $match)) {
            $ip = $match[1];
            $port = isset($match[2]) ? (int) $match[2] : null;
        } elseif (substr_count($ip, ':') === 1) {
            list($ip, $rawPort) = explode(':', $ip, 2);
            $port = ctype_digit($rawPort) ? (int) $rawPort : null;
        }
        return filter_var($ip, FILTER_VALIDATE_IP) !== false
            ? ['ip' => $ip, 'port' => $port]
            : null;
    }

    private function endpointExists($output, $name)
    {
        if ($output === '' || preg_match('/unable to find|could not find|no such endpoint/i', $output)) {
            return false;
        }
        return preg_match('/Endpoint:\s*' . preg_quote($name, '/') . '(?:\/|\s|$)/i', $output) === 1;
    }

    private function identify($output, $ip)
    {
        $present = false;
        $matchesIp = false;
        $port = null;
        $values = [];
        foreach (preg_split('/\r?\n/', $output) as $line) {
            if (! preg_match('/^\s*(Identify|Match)\s*:\s*(.+?)\s*$/i', $line, $match)) {
                continue;
            }
            $present = true;
            $label = strtolower($match[1]);
            $value = trim($match[2]);
            $values[] = $value;
            $normalizedValue = str_replace(['[', ']'], '', $value);
            $ipPattern = preg_quote($ip, '/');
            $matches = $label === 'identify'
                ? preg_match('/^' . $ipPattern . '(?::\d+)?(?:\/\d+)?$/i', $normalizedValue)
                : preg_match('/(?<![0-9A-Fa-f:.])' . $ipPattern . '(?=:\d+|\/|,|\s|$)/i', $normalizedValue);
            if (! $matches) {
                continue;
            }
            $matchesIp = true;
            if (preg_match('/' . $ipPattern . ':(\d+)/', $normalizedValue, $portMatch)) {
                $port = (int) $portMatch[1];
            }
        }
        return [
            'present' => $present,
            'matchesIp' => $matchesIp,
            'port' => $port,
            'value' => implode(', ', array_unique($values)),
        ];
    }

    private function inboundAuth($output)
    {
        if (! preg_match('/^\s*InAuth\s*:\s*([^\r\n]*)/mi', $output, $match)) {
            return null;
        }
        $value = trim($match[1]);
        return $value !== '' && ! preg_match('/^(?:none|n\/a)$/i', $value) ? $value : null;
    }

    private function step($code, $status, $message, $action, $host, $identify, $inboundAuth)
    {
        return [
            'code' => strtolower($code),
            'resultCode' => $code,
            'label' => Yii::t('zii', 'PJSIP IP authentication'),
            'status' => $status,
            'message' => Yii::t('zii', $message),
            'displayDetails' => [
                ['label' => Yii::t('zii', 'Authentication method'), 'value' => Yii::t('zii', 'Fixed IP')],
                ['label' => Yii::t('zii', 'Configured host'), 'value' => $host],
                ['label' => Yii::t('zii', 'PJSIP Identify'), 'value' => $identify],
                ['label' => Yii::t('zii', 'PJSIP inbound authentication'), 'value' => $inboundAuth],
            ],
            'resolution' => ['message' => Yii::t('zii', $action)],
        ];
    }
}
