<?php

/**
 * Parallel implementation of CallChartCommand using the structured AMI Status
 * action. The original command is intentionally kept unchanged so this command
 * can be production-tested independently.
 */
class CallChartStatusCommand extends ConsoleCommand
{
    public $debug = 0;
    private $totalCalls = 0;
    private $totalUpCalls = 0;
    private $didsByNumber = [];
    private $sipsByName = [];
    private $sipsByAccountcode = [];
    private $sipsByHost = [];
    private $iaxsByName = [];
    private $callShopIds = [];

    public function run($args)
    {
        $once = in_array('--once', $args, true);
        $dryRun = in_array('--dry-run', $args, true);
        $this->debug = in_array('--debug', $args, true) ? 1 : 0;
        $this->loadReferences();

        do {
            try {
                if (! $dryRun) {
                    Servers::model()->updateAll(['status' => 1], 'status = 2');
                }
                $channels = AsteriskAccess::getStatusChannels(! $dryRun);
                if ($channels === null) {
                    echo "AMI Status incomplete; keeping the previous call-online snapshot\n";
                    if (! $once) {
                        sleep(4);
                        continue;
                    }
                    return 1;
                }
                $rows = $this->buildRows($channels, $dryRun);
                $this->saveSnapshot($rows, $dryRun);
            } catch (Exception $e) {
                echo 'CallChartStatus error: ' . $e->getMessage() . "\n";
                if (! $once) {
                    sleep(4);
                    continue;
                }
                return 1;
            }

            if (! $once) {
                sleep(4);
            }
        } while (! $once && date('i') !== '59');

        return 0;
    }

    private function loadReferences()
    {
        $dids = Yii::app()->db->createCommand(
            'SELECT d.did, d.id, d.id_user, COALESCE((' .
            'SELECT dd.voip_call FROM pkg_did_destination dd ' .
            'WHERE dd.id_did = d.id AND dd.activated = 1 ' .
            'ORDER BY dd.priority, dd.id LIMIT 1), 0) AS voip_call ' .
            'FROM pkg_did d WHERE d.reserved = 1'
        )->queryAll();
        foreach ($dids as $did) {
            $this->didsByNumber[trim($did['did'])] = $did;
        }

        $sips = Yii::app()->db->createCommand(
            'SELECT name, id_user, accountcode, host, techprefix FROM pkg_sip'
        )->queryAll();
        foreach ($sips as $sip) {
            $sip['_technology'] = 'SIP';
            $name = trim($sip['name']);
            $this->sipsByName[$name] = $sip;
            if (strlen(trim($sip['accountcode']))) {
                $this->sipsByAccountcode[trim($sip['accountcode'])] = $sip;
            }
            $host = $this->normalizeHost($sip['host']);
            if ($host !== '' && strtolower($host) !== 'dynamic') {
                $this->sipsByHost[$host] = $sip;
            }
        }

        $iaxs = Yii::app()->db->createCommand(
            'SELECT name, id_user, accountcode FROM pkg_iax'
        )->queryAll();
        foreach ($iaxs as $iax) {
            $iax['_technology'] = 'IAX';
            $this->iaxsByName[trim($iax['name'])] = $iax;
        }

        $callShopUsers = User::model()->findAll('callshop = 1');
        foreach ($callShopUsers as $user) {
            $this->callShopIds[(int) $user->id] = true;
        }
    }

    private function buildRows(array $channels, $dryRun = false)
    {
        $channels = $this->indexPeers($channels);
        $rows = [];
        $totalCalls = 0;
        $totalUp = 0;

        foreach ($channels as $call) {
            $channel = $this->field($call, 'Channel');
            $technology = strtoupper(strtok($channel, '/'));
            if (! in_array($technology, ['PJSIP', 'SIP', 'IAX', 'IAX2'], true)) {
                continue;
            }

            $status = $this->field($call, 'ChannelStateDesc');
            $duration = (int) $this->field($call, 'Seconds', 0);
            $lastApp = $this->field($call, 'Application');
            if ($status === 'Down') {
                continue;
            }
            if ((preg_match('/Congestion|Busy/i', $status)) || (preg_match('/Ring/i', $status) && $duration > 60)) {
                if (! $dryRun) {
                    AsteriskAccess::instance()->hangupRequest($channel, $call['server']);
                }
                continue;
            }
            if (! in_array($lastApp, ['Dial', 'Mbilling', 'AGI', 'AppDial', 'AppDial2', 'Queue'], true)) {
                continue;
            }
            if (($lastApp === 'Dial' || $lastApp === 'Mbilling') && $status === 'Ringing') {
                continue;
            }

            $endpoint = $this->endpoint($call);
            $peer = isset($call['_peer']) ? $call['_peer'] : [];
            $peerEndpoint = $peer ? $this->endpoint($peer) : '';
            $dialed = $this->dialedNumber($call);
            $codec = $this->codec($call);
            $uniqueid = $this->field($call, 'Uniqueid') ?: null;
            $trunk = $peerEndpoint;
            $sipAccount = $endpoint;
            $idUser = null;
            $modelSip = $this->findSipForCall($call, $endpoint, $dialed);

            if ($lastApp === 'Dial' || $lastApp === 'Mbilling') {
                if ($this->isCampaign($endpoint)) {
                    list($idUser, $trunk) = $this->campaignOwner($endpoint);
                } elseif (isset($this->didsByNumber[$dialed])) {
                    $did = $this->didsByNumber[$dialed];
                    $idUser = $did['id_user'];
                    $trunk = $peerEndpoint !== '' ? $peerEndpoint : 'DID Call ' . $did['did'];
                    if ($peerEndpoint !== '') {
                        $sipAccount = $peerEndpoint;
                    }
                } elseif (isset($this->sipsByName[$dialed])) {
                    $modelSip = $this->sipsByName[$dialed];
                    $idUser = $modelSip['id_user'];
                    $trunk = Yii::t('zii', 'SIP Call');
                } elseif ($modelSip) {
                    $idUser = $modelSip['id_user'];
                    $sipAccount = $modelSip['name'];
                    if ($trunk === '') {
                        $trunk = $this->dialTarget($call);
                    }
                }
            } elseif ($lastApp === 'AGI' || $lastApp === 'AppDial' || $lastApp === 'AppDial2') {
                $campaignSource = $this->campaignSource($call, $endpoint);
                if ($campaignSource !== '') {
                    list($idUser, $trunk) = $this->campaignOwner($campaignSource);
                } elseif (isset($this->didsByNumber[$dialed])) {
                    $did = $this->didsByNumber[$dialed];
                    $idUser = $did['id_user'];
                    $trunk = $this->didApplicationLabel($endpoint, $did);
                }
            } elseif ($lastApp === 'Queue') {
                $campaignSource = $this->campaignSource($call, $endpoint);
                if ($campaignSource !== '') {
                    list($idUser, $trunk, $uniqueid) = $this->campaignOwner($campaignSource, true);
                } elseif (isset($this->didsByNumber[$dialed])) {
                    $did = $this->didsByNumber[$dialed];
                    $idUser = $did['id_user'];
                    $trunk = $dialed . ' Queue ';
                    if ($status === 'Up' && $peerEndpoint !== '') {
                        $sipAccount = $peerEndpoint;
                    }
                }
            }

            if (! is_numeric($idUser)) {
                if ($this->debug) {
                    echo "Ignored channel without user: {$channel}\n";
                }
                continue;
            }

            if ($status === 'Up') {
                $totalUp++;
            }
            $totalCalls++;
            $rows[] = [
                'uniqueid'   => $uniqueid,
                'sip_account'=> $sipAccount,
                'id_user'    => (int) $idUser,
                'canal'      => $channel,
                'tronco'     => $trunk,
                'ndiscado'   => $dialed,
                'codec'      => $codec,
                'status'     => $status,
                'duration'   => $duration,
                'reinvite'   => 'no',
                'from_ip'    => 'no',
                'server'     => $call['server'],
            ];

            if (! $dryRun) {
                $this->updateCallShop($modelSip, (int) $idUser, $dialed, $duration);
            }
        }

        if (! $dryRun) {
            $this->recordChartTotals($totalCalls, $totalUp);
        }
        return $rows;
    }

    private function indexPeers(array $channels)
    {
        $bridges = [];
        $linkedCalls = [];
        foreach ($channels as $index => $call) {
            $server = isset($call['server']) ? $call['server'] : 'localhost';
            $bridgeId = $this->field($call, 'BridgeID');
            if ($bridgeId !== '') {
                $bridges[$server . '|' . $bridgeId][] = $index;
            }
            $linkedid = $this->field($call, 'Linkedid');
            if ($linkedid !== '') {
                $linkedCalls[$server . '|' . $linkedid][] = $index;
            }
        }
        $channels = $this->applyPeerGroups($channels, $bridges, false);
        return $this->applyPeerGroups($channels, $linkedCalls, true);
    }

    private function applyPeerGroups(array $channels, array $groups, $onlyMissing)
    {
        foreach ($groups as $indexes) {
            foreach ($indexes as $index) {
                if ($onlyMissing && isset($channels[$index]['_peer'])) {
                    continue;
                }
                foreach ($indexes as $peerIndex) {
                    if ($peerIndex === $index) {
                        continue;
                    }
                    $technology = strtoupper(strtok($this->field($channels[$peerIndex], 'Channel'), '/'));
                    if (! in_array($technology, ['PJSIP', 'SIP', 'IAX', 'IAX2'], true)) {
                        continue;
                    }
                    $channels[$index]['_peer'] = $channels[$peerIndex];
                    if ($this->endpoint($channels[$peerIndex]) !== '') {
                        break;
                    }
                }
            }
        }
        return $channels;
    }

    private function endpoint(array $call)
    {
        $variable = $this->field($call, 'Variable');
        if (preg_match('/^CHANNEL\(endpoint\)=(.*)$/', $variable, $match)) {
            $endpoint = trim($match[1]);
            if ($endpoint !== '' && strtolower($endpoint) !== '(null)') {
                return $endpoint;
            }
        }
        $channel = $this->field($call, 'Channel');
        return preg_match('#^(?:PJSIP|SIP|IAX2?)/(.+)-[0-9a-f]+(?:;[12])?$#i', $channel, $match)
            ? $match[1]
            : '';
    }

    private function dialedNumber(array $call)
    {
        foreach (['Exten', 'DNID'] as $field) {
            $value = $this->field($call, $field);
            if ($value !== '' && $value !== 's') {
                return $value;
            }
        }
        return $this->dialTarget($call);
    }

    private function dialTarget(array $call)
    {
        $data = $this->field($call, 'Data');
        $target = preg_split('/[,&]/', $data)[0];
        if (preg_match('#^(?:PJSIP|SIP|IAX2?)/([^@/]+)#i', $target, $match)) {
            return $match[1];
        }
        return trim($target);
    }

    private function codec(array $call)
    {
        $format = $this->field($call, 'Readformat', $this->field($call, 'Writeformat'));
        $format = trim($format, "() \t\n\r\0\x0B");
        $format = preg_split('/[|, ]+/', $format)[0];
        return substr($format, 0, 5);
    }

    private function findSipForCall(array $call, $endpoint, $dialed)
    {
        $candidates = [
            $endpoint,
            $this->field($call, 'CallerIDNum'),
            $this->field($call, 'ConnectedLineNum'),
            $this->field($call, 'EffectiveConnectedLineNum'),
        ];
        foreach ($candidates as $candidate) {
            if (isset($this->sipsByName[$candidate])) {
                return $this->sipsByName[$candidate];
            }
            if (isset($this->iaxsByName[$candidate])) {
                return $this->iaxsByName[$candidate];
            }
        }
        $accountcode = $this->field($call, 'AccountCode');
        if (isset($this->sipsByAccountcode[$accountcode])) {
            return $this->sipsByAccountcode[$accountcode];
        }

        $config = LoadConfig::getConfig();
        $length = isset($config['global']['ip_tech_length']) ? (int) $config['global']['ip_tech_length'] : 0;
        if ($length > 0 && strlen($dialed) > 15) {
            $techprefix = substr($dialed, 0, $length);
            foreach ($this->sipsByName as $sip) {
                if ($sip['techprefix'] === $techprefix && strtolower($sip['host']) !== 'dynamic') {
                    return $sip;
                }
            }
        }
        return null;
    }

    private function campaignSource(array $call, $endpoint)
    {
        if ($this->isCampaign($endpoint)) {
            return $endpoint;
        }
        foreach (['CallerIDNum', 'ConnectedLineNum'] as $field) {
            $value = $this->field($call, $field);
            if ($this->isCampaign($value)) {
                return $value;
            }
        }
        return '';
    }

    private function isCampaign($value)
    {
        return preg_match('/^MC!/', $value) === 1;
    }

    private function campaignOwner($source, $includeUniqueid = false)
    {
        $parts = explode('!', $source);
        $name = isset($parts[1]) ? $parts[1] : '';
        $campaign = Campaign::model()->find('name = :name', [':name' => $name]);
        $idUser = isset($campaign->id_user) ? $campaign->id_user : null;
        $result = [$idUser, 'Campaign ' . $name];
        if ($includeUniqueid) {
            $result[] = isset($parts[2]) ? $parts[2] : null;
        }
        return $result;
    }

    private function didApplicationLabel($endpoint, array $did)
    {
        switch ((int) $did['voip_call']) {
            case 2: return $endpoint . ' IVR';
            case 3: return $endpoint . ' CallingCard';
            case 4: return $endpoint . ' portalDeVoz';
            case 5: return $endpoint . ' CID Callback';
            case 6: return $endpoint . ' 0800 Callback';
            default: return $endpoint . ' DID Call';
        }
    }

    private function updateCallShop($sip, $idUser, $dialed, $duration)
    {
        if (! isset($this->callShopIds[$idUser]) || ! $sip || ! isset($sip['name'])
            || ! isset($sip['_technology']) || $sip['_technology'] !== 'SIP') {
            return;
        }
        $model = Sip::model()->find('name = :name', [':name' => $sip['name']]);
        if (! isset($model->id)) {
            return;
        }
        $model->status = 3;
        $model->callshopnumber = $dialed;
        $model->callshoptime = $duration;
        $model->save();
    }

    private function recordChartTotals($totalCalls, $totalUp)
    {
        $date = date('Y-m-d H:i:') . '00';
        $chart = CallOnlineChart::model()->find('date = :date', [':date' => $date]);
        if (! $chart) {
            $chart = new CallOnlineChart();
            $chart->date = $date;
            $chart->answer = 0;
            $chart->total = 0;
        }
        $this->totalUpCalls = max($this->totalUpCalls, $totalUp);
        $this->totalCalls = max($this->totalCalls, $totalCalls);
        $chart->answer = $this->totalUpCalls;
        $chart->total = $this->totalCalls;
        $chart->save();
    }

    private function saveSnapshot(array $rows, $dryRun)
    {
        echo 'AMI Status: ' . count($rows) . ' calls' . ($dryRun ? ' (dry-run)' : '') . "\n";
        if ($dryRun) {
            if ($this->debug) {
                print_r($rows);
            }
            return;
        }

        CallOnLine::model()->deleteAll();
        if (! $rows) {
            return;
        }
        $sql = [];
        foreach ($rows as $row) {
            $values = [
                'NULL',
                $this->quote($row['uniqueid']),
                $this->quote($row['sip_account']),
                (int) $row['id_user'],
                $this->quote($row['canal']),
                $this->quote($row['tronco']),
                $this->quote($row['ndiscado']),
                $this->quote($row['codec']),
                $this->quote($row['status']),
                (int) $row['duration'],
                $this->quote($row['reinvite']),
                $this->quote($row['from_ip']),
                $this->quote($row['server']),
            ];
            $sql[] = '(' . implode(',', $values) . ')';
        }
        CallOnLine::model()->insertCalls($sql);
    }

    private function quote($value)
    {
        return $value === null ? 'NULL' : Yii::app()->db->quoteValue((string) $value);
    }

    private function normalizeHost($host)
    {
        $host = trim((string) $host);
        if (preg_match('/^\[([^]]+)\](?::\d+)?$/', $host, $match)) {
            return $match[1];
        }
        return preg_replace('/:\d+$/', '', $host);
    }

    private function field(array $call, $name, $default = '')
    {
        return isset($call[$name]) ? trim((string) $call[$name]) : $default;
    }
}
