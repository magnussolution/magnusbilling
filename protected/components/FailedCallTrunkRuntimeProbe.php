<?php

/**
 * Performs bounded, read-only operational checks for trunks observed in one
 * failed call. Asterisk is queried through AMI; slaves are never contacted by
 * HTTP or SSH.
 */
class FailedCallTrunkRuntimeProbe
{
    const MAX_TRUNKS = 3;
    const FIREWALL_CIDR_LIMIT = 100;

    private $db;
    private $commandRunner;
    private $clock;

    public function __construct($db, $commandRunner = null, $clock = null)
    {
        $this->db = $db;
        $this->commandRunner = $commandRunner;
        $this->clock = $clock;
    }

    public function probe(array $targets)
    {
        $results = [];
        $seen = [];
        $checked = 0;
        foreach ($targets as $target) {
            $idTrunk = isset($target['idTrunk'])
                ? (int) $target['idTrunk']
                : 0;
            $idServer = isset($target['idServer'])
                && $target['idServer'] !== null
                ? (int) $target['idServer']
                : null;
            if ($idTrunk < 1) {
                continue;
            }
            $key = self::key($idServer, $idTrunk);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            if ($checked >= self::MAX_TRUNKS) {
                $results[$key] = $this->notChecked(
                    'runtime_trunk_limit',
                    'The current trunk status was not checked because the diagnostic limit was reached.'
                );
                continue;
            }
            $checked++;
            $results[$key] = $this->probeOne($idTrunk, $idServer);
        }
        return $results;
    }

    public static function key($idServer, $idTrunk)
    {
        return ($idServer === null ? 'master' : (string) (int) $idServer)
            . ':' . (int) $idTrunk;
    }

    public static function parsePjsipEndpoint($output)
    {
        $text = self::outputText($output);
        $ips = self::extractIps($text);
        if ($text === '') {
            return self::parsed(
                'unknown',
                'Asterisk returned no endpoint status.',
                null,
                $ips
            );
        }
        if (preg_match(
            '/Unable to find object|Could not find endpoint|No such endpoint/i',
            $text
        )) {
            return self::parsed(
                'not_found',
                'The PJSIP endpoint is not loaded in Asterisk.',
                null,
                $ips
            );
        }
        if (preg_match('/^\\s*Contact:.*\\bUnavail(?:able)?\\b/im', $text)) {
            return self::parsed(
                'unavailable',
                'Asterisk currently reports the trunk contact as unavailable.',
                self::pjsipLatency($text),
                $ips
            );
        }
        if (preg_match('/^\\s*Contact:.*\\bAvail\\b/im', $text)) {
            return self::parsed(
                'available',
                'Asterisk currently reports the trunk contact as available.',
                self::pjsipLatency($text),
                $ips
            );
        }
        if (preg_match('/^\\s*Contact:.*\\bNonQual\\b/im', $text)) {
            return self::parsed(
                'not_monitored',
                'The PJSIP contact exists, but Asterisk is not qualifying its reachability.',
                null,
                $ips
            );
        }
        if (preg_match('/^\\s*Endpoint:/im', $text)
            && ! preg_match('/^\\s*Contact:\\s+\\S+\\/sips?:/im', $text)
        ) {
            return self::parsed(
                'no_contact',
                'The PJSIP endpoint is loaded, but no contact is currently shown.',
                null,
                $ips
            );
        }
        return self::parsed(
            'unknown',
            'The PJSIP endpoint was found, but its reachability could not be classified safely.',
            null,
            $ips
        );
    }

    public static function parseSipPeer($output)
    {
        $text = self::outputText($output);
        $ips = self::extractIps($text);
        if ($text === '') {
            return self::parsed(
                'unknown',
                'Asterisk returned no peer status.',
                null,
                $ips
            );
        }
        if (preg_match('/Peer .* not found|Unable to find/i', $text)) {
            return self::parsed(
                'not_found',
                'The SIP peer is not loaded in Asterisk.',
                null,
                $ips
            );
        }
        if (preg_match('/Status\\s*:\\s*(?:UNREACHABLE|UNKNOWN)/i', $text)) {
            return self::parsed(
                'unavailable',
                'Asterisk currently reports the SIP peer as unavailable.',
                self::latency($text),
                $ips
            );
        }
        if (preg_match('/Status\\s*:\\s*OK(?:\\s*\\(([0-9.]+)\\s*ms\\))?/i', $text, $match)) {
            return self::parsed(
                'available',
                'Asterisk currently reports the SIP peer as available.',
                isset($match[1]) ? (float) $match[1] : null,
                $ips
            );
        }
        if (preg_match('/Status\\s*:\\s*Unmonitored/i', $text)) {
            return self::parsed(
                'not_monitored',
                'The SIP peer exists, but Asterisk is not monitoring its reachability.',
                null,
                $ips
            );
        }
        return self::parsed(
            'unknown',
            'The SIP peer was found, but its reachability could not be classified safely.',
            null,
            $ips
        );
    }

    private function probeOne($idTrunk, $idServer)
    {
        $metadata = $this->queryRow(
            "
            SELECT t.id,t.trunkcode,t.providertech,t.host,t.providerip,
                   t.status configured_status,
                   s.id server_id,s.name server_name,s.type server_type,
                   s.host server_host,s.port server_port,
                   s.username server_username,s.password server_password
            FROM pkg_trunk t
            LEFT JOIN pkg_servers s ON s.id=:id_server
            WHERE t.id=:id_trunk
            LIMIT 1
            ",
            [
                ':id_trunk' => $idTrunk,
                ':id_server' => $idServer,
            ]
        );
        if (! $metadata) {
            return $this->notChecked(
                'trunk_not_found',
                'The trunk configuration was not found.'
            );
        }

        $checkedAt = $this->now();
        $technology = strtolower(trim((string) $metadata['providertech']));
        $endpoint = trim((string) $metadata['trunkcode']);
        $base = [
            'checked' => false,
            'checkedAt' => $checkedAt,
            'status' => 'unknown',
            'summary' => null,
            'source' => null,
            'technology' => $technology,
            'endpoint' => $endpoint,
            'latencyMs' => null,
            'contactIps' => [],
            'firewall' => null,
        ];

        if ((int) $metadata['configured_status'] !== 1) {
            $base['checked'] = true;
            $base['status'] = 'configured_inactive';
            $base['summary'] = 'The trunk is currently disabled in MagnusBilling.';
            $base['source'] = 'pkg_trunk.status';
            $base['contactIps'] = $this->configuredIps($metadata);
            $base['firewall'] = $this->firewallStatus(
                $base['contactIps'],
                $idServer
            );
            return $base;
        }

        if (! preg_match('/^[A-Za-z0-9_.:@-]{1,80}$/', $endpoint)) {
            $base['summary'] = 'The trunk endpoint name is not safe for an operational check.';
            $base['source'] = 'validation';
            $base['firewall'] = $this->firewallStatus(
                $this->configuredIps($metadata),
                $idServer
            );
            return $base;
        }

        if ($technology === 'pjsip') {
            $command = 'pjsip show endpoint ' . $endpoint;
            $source = 'asterisk_ami_pjsip_show_endpoint';
        } elseif ($technology === 'sip') {
            $command = 'sip show peer ' . $endpoint;
            $source = 'asterisk_ami_sip_show_peer';
        } else {
            $base['status'] = 'unsupported';
            $base['summary'] = 'Live reachability is not supported for this trunk technology.';
            $base['source'] = 'technology';
            $base['firewall'] = $this->firewallStatus(
                $this->configuredIps($metadata),
                $idServer
            );
            return $base;
        }

        $output = $this->runCommand($metadata, $command);
        if ($output === false || $output === null) {
            $base['status'] = 'connection_failed';
            $base['summary'] = 'The current Asterisk status could not be obtained safely.';
            $base['source'] = $source;
            $base['firewall'] = $this->firewallStatus(
                $this->configuredIps($metadata),
                $idServer
            );
            return $base;
        }
        $parsed = $technology === 'pjsip'
            ? self::parsePjsipEndpoint($output)
            : self::parseSipPeer($output);
        $base['checked'] = true;
        $base['status'] = $parsed['status'];
        $base['summary'] = $parsed['summary'];
        $base['source'] = $source;
        $base['latencyMs'] = $parsed['latencyMs'];
        $base['contactIps'] = array_slice(array_values(array_unique(array_merge(
            $parsed['contactIps'],
            $this->configuredIps($metadata)
        ))), 0, 10);
        $base['firewall'] = $this->firewallStatus(
            $base['contactIps'],
            $idServer
        );
        return $base;
    }

    private function runCommand(array $metadata, $command)
    {
        if (is_callable($this->commandRunner)) {
            return call_user_func($this->commandRunner, $metadata, $command);
        }
        $host = trim((string) $metadata['server_host']);
        $port = (int) $metadata['server_port'];
        $username = trim((string) $metadata['server_username']);
        $password = (string) $metadata['server_password'];
        if ($host === '' || strtolower((string) $metadata['server_type']) === 'mbilling') {
            $host = 'localhost';
        }
        if ($port < 1 || $port > 65535) {
            $port = 5038;
        }
        if ($username === '') {
            $username = 'magnus';
        }
        if ($password === '') {
            $password = 'magnussolution';
        }

        $manager = new AGI_AsteriskManager;
        try {
            if (! $manager->connect(
                $host . ':' . $port,
                $username,
                $password,
                'off'
            )) {
                return false;
            }
            $result = $manager->Command($command);
            $manager->disconnect();
            return $result;
        } catch (Exception $exception) {
            if ($manager->connected()) {
                $manager->disconnect();
            }
            return false;
        }
    }

    private function configuredIps(array $metadata)
    {
        $ips = [];
        foreach (['host', 'providerip'] as $field) {
            $value = trim((string) $metadata[$field]);
            if (filter_var($value, FILTER_VALIDATE_IP)) {
                $ips[] = $value;
                continue;
            }
            if (preg_match('/^([0-9.]+):[0-9]+$/', $value, $match)
                && filter_var($match[1], FILTER_VALIDATE_IP)
            ) {
                $ips[] = $match[1];
            }
        }
        return array_slice(array_values(array_unique($ips)), 0, 10);
    }

    private function firewallStatus(array $ips, $idServer)
    {
        $result = [
            'checked' => false,
            'blocked' => null,
            'checkedIps' => array_values($ips),
            'matches' => [],
            'source' => 'pkg_firewall',
        ];
        if (! $ips) {
            return $result;
        }
        $params = [
            ':id_server' => $idServer !== null ? (int) $idServer : 1,
        ];
        $placeholders = [];
        foreach ($ips as $index => $ip) {
            $placeholder = ':ip' . $index;
            $params[$placeholder] = $ip;
            $placeholders[] = $placeholder;
        }
        try {
            $rows = $this->queryAll(
                "
                SELECT id,ip,action,date,jail,id_server
                FROM pkg_firewall
                WHERE id_server=:id_server
                  AND action IN (0,1)
                  AND ip IN (" . implode(',', $placeholders) . ")
                ORDER BY date DESC,id DESC
                LIMIT 21
                ",
                $params
            );
            $cidrRows = $this->queryAll(
                "
                SELECT id,ip,action,date,jail,id_server
                FROM pkg_firewall
                WHERE id_server=:id_server
                  AND action IN (0,1)
                  AND ip LIKE '%/%'
                ORDER BY date DESC,id DESC
                LIMIT " . (self::FIREWALL_CIDR_LIMIT + 1) . "
                ",
                [':id_server' => $params[':id_server']]
            );
            foreach ($cidrRows as $row) {
                foreach ($ips as $ip) {
                    if (self::ipInCidr($ip, (string) $row['ip'])) {
                        $rows[] = $row;
                        break;
                    }
                }
            }
            $matches = [];
            foreach ($rows as $row) {
                $matches[(string) $row['id']] = [
                    'id' => (int) $row['id'],
                    'ip' => (string) $row['ip'],
                    'action' => (int) $row['action'],
                    'date' => (string) $row['date'],
                    'jail' => (string) $row['jail'],
                    'serverId' => (int) $row['id_server'],
                ];
            }
            $result['matches'] = array_values($matches);
            $result['blocked'] = count($result['matches']) > 0;
            $result['checked'] = count($cidrRows)
                <= self::FIREWALL_CIDR_LIMIT;
        } catch (Exception $exception) {
            return $result;
        }
        return $result;
    }

    private static function ipInCidr($ip, $cidr)
    {
        $parts = explode('/', $cidr, 2);
        if (count($parts) !== 2
            || ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)
            || ! filter_var($parts[0], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)
            || ! ctype_digit($parts[1])
        ) {
            return false;
        }
        $mask = (int) $parts[1];
        if ($mask < 0 || $mask > 32) {
            return false;
        }
        $ipLong = ip2long($ip);
        $networkLong = ip2long($parts[0]);
        $maskLong = $mask === 0 ? 0 : (-1 << (32 - $mask));
        return ($ipLong & $maskLong) === ($networkLong & $maskLong);
    }

    private static function outputText($output)
    {
        if (is_array($output)) {
            if (isset($output['data'])) {
                $output = $output['data'];
            } elseif (isset($output['Output'])) {
                $output = $output['Output'];
            } else {
                $output = '';
            }
        }
        if (is_array($output)) {
            $output = implode("\n", $output);
        }
        return trim((string) $output);
    }

    private static function extractIps($text)
    {
        preg_match_all(
            '/(?<![0-9])(?:[0-9]{1,3}\\.){3}[0-9]{1,3}(?![0-9])/',
            (string) $text,
            $matches
        );
        $ips = [];
        foreach ($matches[0] as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                $ips[] = $ip;
            }
        }
        return array_slice(array_values(array_unique($ips)), 0, 10);
    }

    private static function latency($text)
    {
        if (preg_match('/\\b([0-9]+(?:\\.[0-9]+)?)\\s*ms\\b/i', $text, $match)) {
            return (float) $match[1];
        }
        return null;
    }

    private static function pjsipLatency($text)
    {
        $latency = self::latency($text);
        if ($latency !== null) {
            return $latency;
        }
        if (preg_match(
            '/^\\s*Contact:.*\\bAvail\\b\\s+([0-9]+(?:\\.[0-9]+)?)\\s*$/im',
            $text,
            $match
        )) {
            return (float) $match[1];
        }
        return null;
    }

    private static function parsed($status, $summary, $latency, array $ips)
    {
        return [
            'status' => $status,
            'summary' => $summary,
            'latencyMs' => $latency,
            'contactIps' => $ips,
        ];
    }

    private function notChecked($status, $summary)
    {
        return [
            'checked' => false,
            'checkedAt' => $this->now(),
            'status' => $status,
            'summary' => $summary,
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
                'source' => 'pkg_firewall',
            ],
        ];
    }

    private function now()
    {
        if (is_callable($this->clock)) {
            return (string) call_user_func($this->clock);
        }
        return gmdate('Y-m-d H:i:s');
    }

    private function queryRow($sql, array $params)
    {
        $command = $this->db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryRow();
    }

    private function queryAll($sql, array $params)
    {
        $command = $this->db->createCommand($sql);
        $command->bindValues($params);
        return $command->queryAll();
    }
}
