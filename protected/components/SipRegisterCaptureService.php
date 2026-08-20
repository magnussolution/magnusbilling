<?php

/** Parses an ngrep SIP capture without exposing authentication material. */
class SipRegisterCaptureService
{
    private $evidencePackets = [];

    public function analyze($path, $offset, $username, $timedOut = false)
    {
        $this->evidencePackets = [];
        $username = trim((string) $username);
        if (! preg_match('/^[A-Za-z0-9_.@+-]{1,50}$/D', $username)) {
            return $this->result(true, 'failed', 'REGISTER_CAPTURE_USERNAME_INVALID',
                'The SIP username is invalid for packet correlation.', []);
        }
        if (! is_file($path) || ! is_readable($path)) {
            return $timedOut
                ? $this->result(true, 'inconclusive', 'REGISTER_CAPTURE_FILE_UNAVAILABLE',
                    'The SIP capture file could not be read.', [])
                : $this->result(false, 'warning', 'REGISTER_CAPTURE_WAITING',
                    'Waiting for the SIP capture process to start.', []);
        }
        $handle = fopen($path, 'rb');
        if ($handle === false) return $this->result(false, 'warning', 'REGISTER_CAPTURE_WAITING',
            'Waiting for the SIP capture process to start.', []);
        $size = (int) filesize($path);
        $offset = max(0, (int) $offset);
        if ($size < $offset) $offset = 0;
        fseek($handle, $offset, SEEK_SET);
        $data = stream_get_contents($handle, 8388608);
        fclose($handle);

        $packets = $this->packets((string) $data);
        $callIds = [];
        $similar = null;
        foreach ($packets as $packet) {
            if ($packet['method'] === 'REGISTER' && $this->hasExactUsername($packet['payload'], $username)) {
                $callIds[$packet['callId']] = true;
            } elseif ($packet['method'] === 'REGISTER') {
                $observed = $this->sipUsername($packet['payload']);
                if ($observed !== '' && $this->similarUsername($username, $observed)) {
                    $similar = ['username' => $observed, 'ip' => $this->hostOnly($packet['source']), 'at' => $packet['timestamp']];
                }
            }
        }
        $related = array_values(array_filter($packets, function ($packet) use ($callIds) {
            return $packet['callId'] !== '' && isset($callIds[$packet['callId']]);
        }));
        if (! $related) {
            if ($similar !== null) {
                foreach ($packets as $packet) {
                    if ($packet['method'] === 'REGISTER'
                        && $this->sipUsername($packet['payload']) === $similar['username']) {
                        $this->evidencePackets = $this->safePackets([$packet]);
                        break;
                    }
                }
                return $this->result(true, 'failed', 'REGISTER_CAPTURE_USERNAME_MISMATCH',
                    'A REGISTER packet reached the server with a similar but different SIP username. It does not belong to the selected endpoint.', [
                        ['label' => Yii::t('zii', 'Expected SIP username'), 'value' => $username],
                        ['label' => Yii::t('zii', 'Username received by Asterisk'), 'value' => $similar['username']],
                        ['label' => Yii::t('zii', 'Source IP'), 'value' => $similar['ip']],
                        ['label' => Yii::t('zii', 'Last captured packet'), 'value' => $similar['at']],
                    ]);
            }
            return $timedOut
                ? $this->result(true, 'failed', 'REGISTER_CAPTURE_NO_PACKETS',
                    'The 120-second capture ended, and no SIP REGISTER packet from the selected SIP account was identified.', [
                        ['label' => Yii::t('zii', 'Expected SIP username'), 'value' => $username],
                        ['label' => Yii::t('zii', 'Capture duration'), 'value' => Yii::t('zii', '120 seconds')],
                    ])
                : $this->result(false, 'warning', 'REGISTER_CAPTURE_WAITING',
                    'Capture is active. Waiting for REGISTER from the exact SIP account.', []);
        }

        $this->evidencePackets = $this->safePackets($related);

        $requests = 0;
        $authenticatedRequests = 0;
        $statuses = [];
        $staleChallenge = false;
        $sourceIp = '';
        $lastAt = '';
        foreach ($related as $packet) {
            if ($packet['method'] === 'REGISTER') {
                $requests++;
                if (preg_match('/^(?:Proxy-)?Authorization:\s*Digest\b/mi', $packet['payload'])) $authenticatedRequests++;
                if ($sourceIp === '') $sourceIp = $this->hostOnly($packet['source']);
            }
            if ($packet['status'] !== null) $statuses[] = $packet['status'];
            if ($packet['status'] === 401 && preg_match('/^WWW-Authenticate:.*\bstale\s*=\s*true\b/mi', $packet['payload'])) {
                $staleChallenge = true;
            }
            if ($packet['timestamp'] !== '') $lastAt = $packet['timestamp'];
        }
        $details = [
            ['label' => Yii::t('zii', 'Exact REGISTER packets'), 'value' => (string) $requests],
            ['label' => Yii::t('zii', 'Authenticated REGISTER packets'), 'value' => (string) $authenticatedRequests],
            ['label' => Yii::t('zii', 'SIP responses'), 'value' => $statuses ? implode(', ', $statuses) : Yii::t('zii', 'None')],
            ['label' => Yii::t('zii', 'Source IP'), 'value' => $sourceIp],
            ['label' => Yii::t('zii', 'Last captured packet'), 'value' => $lastAt],
        ];
        if (in_array(200, $statuses, true)) return $this->result(true, 'passed', 'REGISTER_CAPTURE_SUCCESS',
            'Asterisk accepted the REGISTER with 200 OK. The SIP account registered successfully.', $details);
        if (in_array(423, $statuses, true)) return $this->result(true, 'failed', 'REGISTER_CAPTURE_INTERVAL_TOO_BRIEF',
            'Asterisk rejected the REGISTER because the expiration interval is too short (423 Interval Too Brief).', $details);
        if (in_array(403, $statuses, true)) return $this->result(true, 'failed', 'REGISTER_CAPTURE_FORBIDDEN',
            'Asterisk rejected the REGISTER with 403 Forbidden.', $details);
        if (in_array(404, $statuses, true)) return $this->result(true, 'failed', 'REGISTER_CAPTURE_NOT_FOUND',
            'Asterisk could not find the SIP endpoint and answered 404 Not Found.', $details);
        if (in_array(401, $statuses, true) && $authenticatedRequests > 0 && ! $staleChallenge) return $this->result(true, 'failed', 'REGISTER_CAPTURE_AUTH_FAILED',
            'The device answered the 401 challenge, but Asterisk rejected the authenticated REGISTER. The SIP password is incorrect.', $details);
        if ($timedOut && in_array(401, $statuses, true)) return $this->result(true, 'failed', 'REGISTER_CAPTURE_CHALLENGE_UNANSWERED',
            'Asterisk sent the normal 401 authentication challenge, but the device did not send an authenticated REGISTER response.', $details);
        if ($timedOut && ! $statuses) return $this->result(true, 'failed', 'REGISTER_CAPTURE_NO_RESPONSE',
            'REGISTER reached the server, but no SIP response was captured from Asterisk.', $details);
        if ($timedOut) return $this->result(true, 'inconclusive', 'REGISTER_CAPTURE_INCONCLUSIVE',
            'REGISTER packets were captured, but the SIP exchange did not reach a conclusive response.', $details);
        return $this->result(false, 'warning', 'REGISTER_CAPTURE_IN_PROGRESS',
            'REGISTER was captured. Waiting for the complete authentication exchange.', $details);
    }

    private function packets($data)
    {
        $packets = [];
        $blocks = preg_split('/(?=^[A-Z]\s+\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+\s+)/m', $data, -1, PREG_SPLIT_NO_EMPTY);
        foreach ($blocks as $block) {
            if (! preg_match('/^[A-Z]\s+(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+)\s+(\S+)\s+->\s+(\S+)/', $block, $head)) continue;
            preg_match('/^Call-ID:\s*([^\s]+).*$/mi', $block, $cid);
            $method = preg_match('/^REGISTER\s+\S+\s+SIP\/2\.0/im', $block) ? 'REGISTER' : null;
            $status = preg_match('/^SIP\/2\.0\s+(\d{3})\b/im', $block, $response) ? (int) $response[1] : null;
            $packets[] = [
                'timestamp' => $head[1], 'source' => $head[2], 'destination' => $head[3],
                'callId' => isset($cid[1]) ? trim($cid[1]) : '',
                'method' => $method, 'status' => $status, 'payload' => $block,
            ];
        }
        return $packets;
    }

    private function hasExactUsername($payload, $username)
    {
        $quoted = preg_quote($username, '/');
        return preg_match('/^(?:From|To):.*<sip:' . $quoted . '@/mi', $payload) === 1
            || preg_match('/^Authorization:\s*Digest\s+.*username="' . $quoted . '"/mi', $payload) === 1;
    }

    private function sipUsername($payload)
    {
        if (preg_match('/^(?:From|To):.*<sip:([^@;>]+)@/mi', $payload, $match)) return trim($match[1]);
        if (preg_match('/^(?:Proxy-)?Authorization:\s*Digest\s+.*username="([^"]+)"/mi', $payload, $match)) return trim($match[1]);
        return '';
    }

    private function similarUsername($expected, $observed)
    {
        $expected = strtolower((string) $expected);
        $observed = strtolower((string) $observed);
        return $expected !== $observed && (
            strpos($observed, $expected) === 0
            || strpos($expected, $observed) === 0
            || (max(strlen($expected), strlen($observed)) <= 32 && levenshtein($expected, $observed) <= 2)
        );
    }

    private function hostOnly($address)
    {
        return preg_replace('/:\d+$/', '', trim((string) $address, '[]'));
    }

    private function safePackets(array $packets)
    {
        $safe = [];
        foreach (array_slice($packets, -20) as $packet) {
            $lines = preg_split('/\r?\n/', (string) $packet['payload']);
            $kept = [];
            foreach ($lines as $index => $line) {
                if (preg_match('/^\s*(?:REGISTER\s+\S+\s+SIP\/2\.0|SIP\/2\.0\s+\d{3}\b)/i', $line)
                    || preg_match('/^\s*(?:From|To|Call-ID|CSeq|Contact|Expires|Min-Expires|User-Agent):/i', $line)) {
                    $kept[] = substr(trim($line), 0, 1000);
                } elseif (preg_match('/^\s*(?:Proxy-)?Authorization:/i', $line)) {
                    $kept[] = preg_replace('/:.*/', ': Digest [redacted]', $line);
                } elseif ($line === '') {
                    break;
                }
            }
            $safe[] = substr(
                $packet['timestamp'] . ' ' . $packet['source'] . ' -> ' . $packet['destination']
                    . "\n" . implode("\n", $kept),
                0,
                4096
            );
        }
        return $safe;
    }

    private function result($complete, $status, $code, $message, array $details)
    {
        return [
            'complete' => (bool) $complete, 'status' => $status, 'resultCode' => $code,
            'summary' => Yii::t('zii', $message),
            'steps' => [[
                'code' => strtolower($code), 'resultCode' => $code,
                'label' => Yii::t('zii', 'Live SIP REGISTER capture'), 'status' => $status,
                'message' => Yii::t('zii', $message), 'displayDetails' => $details,
                'resolution' => ['message' => Yii::t('zii', $this->action($code))],
            ]],
            'warnings' => $complete ? [] : [
                Yii::t('zii', 'Do not close this window while the capture is running, or the diagnostic will be interrupted.'),
            ],
            'technicalDetails' => ['sipPackets' => $this->evidencePackets],
        ];
    }

    private function action($code)
    {
        $actions = [
            'REGISTER_CAPTURE_NO_PACKETS' => 'Verify the server address, SIP port, transport and network route configured on the device.',
            'REGISTER_CAPTURE_AUTH_FAILED' => 'Configure the current SIP password on the device and try again.',
            'REGISTER_CAPTURE_USERNAME_MISMATCH' => 'Correct the SIP username on the device so it exactly matches the selected endpoint.',
            'REGISTER_CAPTURE_CHALLENGE_UNANSWERED' => 'Verify that the device supports digest authentication and is configured with a SIP password.',
            'REGISTER_CAPTURE_INTERVAL_TOO_BRIEF' => 'Increase the registration expiration interval on the device.',
            'REGISTER_CAPTURE_SUCCESS' => 'No REGISTER correction is required.',
        ];
        return isset($actions[$code]) ? $actions[$code] : 'Review the captured SIP result and the device configuration.';
    }
}
