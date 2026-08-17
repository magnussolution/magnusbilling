<?php

/**
 * Classe de com funcionalidades globais
 *
 * MagnusBilling <info@magnusbilling.com>
 * 08/06/2013
 */

class AsteriskAccess
{

    private $asmanager;
    private static $instance;
    private static $config;

    public static function instance($host = 'localhost', $user = 'magnus', $pass = 'magnussolution')
    {
        if (is_null(self::$instance)) {
            self::$instance = new AsteriskAccess();
        }
        self::$instance->connectAsterisk($host, $user, $pass);
        return self::$instance;
    }

    private function __construct()
    {
        $this->asmanager = new AGI_AsteriskManager;
        $this->config    = LoadConfig::getConfig();
    }

    private function connectAsterisk($host, $user, $pass)
    {
        if ($host == 'localhost' && file_exists('/etc/asterisk/asterisk2.conf')) {
            $configFile = '/etc/asterisk/asterisk2.conf';
            $array      = parse_ini_file($configFile);
            $host       = $array['host'];
        }
        $this->asmanager->connect($host, $user, $pass);
    }

    public function queueAddMember($member, $queue)
    {
        $this->asmanager->Command("queue add member PJSIP/" . $member . " to " . preg_replace("/ /", "\ ", $queue));
    }

    public function queueRemoveMember($member, $queue)
    {
        $this->asmanager->Command("queue remove member PJSIP/" . $member . " from " . preg_replace("/ /", "\ ", $queue));
    }

    public function queuePauseMember($member, $queue, $reason = 'normal')
    {
        $this->asmanager->Command("queue pause member PJSIP/" . $member . " queue " . preg_replace("/ /", "\ ", $queue) . " reason " . $reason);
    }

    public function queueUnPauseMember($member, $queue, $reason = 'normal')
    {
        $this->asmanager->Command("queue unpause member PJSIP/" . $member . " queue " . preg_replace("/ /", "\ ", $queue) . " reason " . $reason);
    }

    public function queueShow($queue)
    {
        return $this->asmanager->Command("queue show " . $queue);
    }

    public function reload()
    {
        return $this->asmanager->Command("reload");
    }

    public function queueReload()
    {
        return $this->asmanager->Command("queue reload all");
    }

    public function queueReseteStats($queue)
    {
        return $this->asmanager->Command("queue reset stats " . $queue);
    }

    public function generateQueueFile()
    {

        $select = '`name`, `language`, `musiconhold`, `announce`, `context`, `timeout`, `announce-frequency`, `announce-round-seconds`, `announce-holdtime`, `announce-position`, `retry`, `wrapuptime`, `maxlen`, `servicelevel`, `strategy`, `joinempty`, `leavewhenempty`, `eventmemberstatus`, `eventwhencalled`, `reportholdtime`, `memberdelay`, `weight`, `timeoutrestart`, `periodic-announce`, `periodic-announce-frequency`, `ringinuse`, `setinterfacevar`, `setqueuevar`, `setqueueentryvar`';
        $model  = Queue::model()->findAll(
            [
                'select' => $select,
            ]
        );

        $file =  '/etc/asterisk/queues_magnus.conf';

        $rows = Util::getColumnsFromModel($model);

        $fd = fopen($file, "w");
        file_put_contents($file, '');

        if (! $fd) {
            echo "</br><center><b><font color=red>" . gettext("Could not open buddy file") . $file . "</font></b></center>";
        } else {
            foreach ($rows as $key => $data) {
                $line         = "\n\n[" . $data['name'] . "]\n";
                $registerLine = '';
                foreach ($data as $key => $option) {
                    if ($key == 'name') {
                        continue;
                    } else {
                        $line .= $key . '=' . $option . "\n";
                    }

                    //to queues member
                    if ($key == 'setqueueentryvar') {
                        $line .= "\n";
                        $modelMember = QueueMember::model()->findAll([
                            'condition' => 'queue_name = :key AND paused = 0',
                            'params'    => [':key' => $data['name']],
                            'order'     => 'id ASC',
                        ]);
                        foreach ($modelMember as $member) {
                            $line .= 'member=' . $member['interface'] . "\n";
                        }
                    }
                }

                if (fwrite($fd, $line) === false) {
                    echo "Impossible to write to the file ($buddyfile)";
                    break;
                }
            }
        }
        AsteriskAccess::instance()->mohReload();
        AsteriskAccess::instance()->queueReload();
    }

    public function mohReload()
    {
        return $this->asmanager->Command("moh reload");
    }

    public function hangupRequest($channel, $server = 'localhost')
    {

        AsteriskAccess::instance($server, 'magnus', 'magnussolution');
        $this->asmanager->Command("hangup request " . $channel);
    }

    public function dialPlanReload()
    {
        return $this->asmanager->Command("dialplan reload");
    }

    public function pjsipReload()
    {
        return $this->asmanager->Command("pjsip reload");
    }

    public function VoiceMailReload()
    {
        return $this->asmanager->Command("voicemail reload");
    }

    public function sipShowPeer($peer)
    {
        return $this->asmanager->Command("sip show peer " . $peer);
    }

    public function pjsipShowEndpoint($endpoint)
    {
        return $this->asmanager->Command("pjsip show endpoint " . $endpoint);
    }

    public function pjsipShowAor($aor)
    {
        return $this->asmanager->Command("pjsip show aor " . $aor);
    }

    public function pjsipShowContacts()
    {
        return $this->asmanager->Command('pjsip show contacts');
    }


    public function sipShowPeers()
    {
        return $this->asmanager->Command("sip show peers");
    }

    public function pjsipShowRegistry()
    {
        return $this->asmanager->Command("pjsip show registrations");
    }

    public function sipShowRegistry()
    {
        return $this->asmanager->Command("sip show registry");
    }

    public function iaxReload()
    {
        return @$this->asmanager->Command("iax2 reload");
    }

    public function coreShowChannelsConcise()
    {
        return @$this->asmanager->Command("core show channels concise");
    }

    public function cdrShowActive()
    {
        return @$this->asmanager->Command("cdr show active");
    }

    public function statusShowAll($variables = 'CHANNEL(endpoint)')
    {
        return $this->asmanager->StatusList($variables, 'mbilling-callchart-status');
    }

    public function coreShowChannelsVerbose()
    {
        return @$this->asmanager->Command("core show channels verbose");
    }

    public function groupShowChannels()
    {
        return $this->asmanager->Command("group show channels");
    }

    public function coreShowChannel($channel)
    {
        return @$this->asmanager->Command("core show channel " . $channel);
    }
    public function sipShowChannel($channel)
    {
        return @$this->asmanager->Command("sip show channel " . $channel);
    }

    public function queueGetMemberStatus($member, $campaign_name)
    {
        $queueData = AsteriskAccess::instance()->queueShow($campaign_name);
        $queueData = explode("\n", $queueData["data"]);
        $status    = "error";
        foreach ($queueData as $key => $data) {

            $data = trim($data);

            if (preg_match("/PJSIP\/" . Yii::app()->session['username'] . "/", $data)) {
                $line   = explode('(', $data);
                $status = trim($line[3]);
                $status = explode(")", $status);

                $status = $status[0];
                break;
            }
        }
        return $status;
    }
    //model , file, e o nome para o contexto
    public function writeAsteriskFile($model, $file, $head_field = 'name')
    {
        $rows = Util::getColumnsFromModel($model);

        foreach ($rows as $key => $data) {
            AsteriskConfigValue::assertRecord($data, 'asteriskRecord.' . $key);
        }

        $fd = fopen($file, "w");
        file_put_contents($file, '');


        if (! $fd) {
            echo "</br><center><b><font color=red>" . gettext("Could not open buddy file") . $file . "</font></b></center>";
        } else {
            foreach ($rows as $key => $data) {
                $line         = "\n";

                $port = isset($data['port']) && is_numeric($data['port']) ? $data['port'] : '5060';

                //registrar tronco
                if (preg_match("/^[^:]+:[^@]+@[^\/]+\/?.*$/", $data['register_string'])) {

                    $line .= "\n\n[reg_" . $data[$head_field] . '_' . $data['user'] . '_' . $data['host'] . "]\n";
                    $line .= "type = registration\n";
                    $line .= "retry_interval = 20\n";
                    $line .= "max_retries = 10\n";
                    $line .= "expiration = 120\n";
                    $line .= "transport = transport-udp\n";
                    $line .= "outbound_auth = auth_reg_" . $data[$head_field] . '_' . $data['user'] . '_' . $data['host'] . "\n";
                    $line .= "client_uri = sip:" . $data['user'] . '@' . $data['host'] . "\n";
                    $line .= "server_uri = sip:" . $data['host'] . "\n";
                    $line .= "contact_user = " . $data['user'] . "\n";
                }


                if (strlen($data['user']) && strlen($data['secret'])) {
                    $line .= "\n[auth_reg_" . $data[$head_field] . '_' . $data['user'] . '_' . $data['host'] . "]\n";
                    $line .= "type = auth\n";
                    $line .= "username = " . $data['user'] . "\n";
                    $line .= "password = " . $data['secret'] . "\n";
                }

                $line .= "\n[" . $data[$head_field] . "]\n";
                $line .= "type = aor\n";
                if (strlen($data['user'])) {
                    $line .= "contact = sip:" . $data['user'] . "@" . $data['host'] . ":" . $port . "\n";
                } else {
                    $line .= "contact = sip:" . $data['host'] . "\n";
                }
                if ($data['qualify'] == 'yes') {
                    $line .= "qualify_frequency = 60\n";
                } else {
                    $line .= "qualify_frequency = " . $data['qualify'] . "\n";
                }

                if (isset($data->max_contacts)) {
                    $line .= "max_contacts=" . trim($data->max_contacts) . "\n";
                }

                if (strtok($data['host'], ':') != 'dynamic') {

                    $line .= "\n[" . $data[$head_field] . "]\n";
                    $line .= "type = identify\n";
                    $line .= "endpoint = " . $data[$head_field] . "\n";
                    $line .= "match = " . strtok($data['host'], ':') . "\n";
                }
                $line .= "\n[" . $data[$head_field] . "]\n";
                $line .= "type = endpoint\n";
                $line .= "context = " . $data['context'] . "\n";
                $line .= "dtmf_mode = rfc4733\n";
                $line .= "disallow = all\n";
                $line .= "allow = " . $data['allow'] . "\n";
                $line .= "rtp_symmetric = yes\n";
                $line .= "force_rport = yes\n";
                $line .= "rewrite_contact = yes\n";
                $line .= "direct_media = " . $data['directmedia'] . "\n";
                $line .= "language = " . strlen($data['language']) ? $data['language'] : 'en' . "\n";
                $line .= "allow_subscribe = yes\n";

                $line .= "aors = " . $data[$head_field] . "\n";
                if (strlen($data['fromuser'])) {
                    $line .= "from_user = " . $data['fromuser'] . "\n";
                }
                if (strlen($data['fromdomain'])) {
                    $line .= "from_domain = " . $data['fromdomain'] . "\n";
                }
                if (strlen($data['user']) && strlen($data['secret'])) {
                    $line .= "auth = auth_reg_" . $data[$head_field] . '_' . $data['user'] . '_' . $data['host'] . "\n";
                    $line .= "outbound_auth = auth_reg_" . $data[$head_field] . '_' . $data['user'] . '_' . $data['host'] . "\n";
                }


                if (fwrite($fd, $line) === false) {
                    echo "Impossible to write to the file";
                    break;
                }
            }

            if ($head_field == 'trunkcode') {
                $sql          = "SELECT * FROM pkg_servers WHERE type != 'mbilling' AND status IN (1,4) AND host != 'localhost'";
                $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

                $line = "";

                foreach ($modelServers as $key => $data) {


                    if ($data['type'] == 'asterisk') {
                        $trunkName =  preg_replace('/ /', '', strtolower($data['name'])) . "-" . $data['id'];
                        $context = 'slave';
                    } else if ($data['type'] == 'sipproxy') {
                        $trunkName = "sipproxy-" . preg_replace('/ /', '', strtolower($data['name'])) . "-" . $data['id'];
                        $accountcode = 'sipproxy';
                        $context = 'proxy' . "\n";
                    } else if ($data['type'] == 'mbilling') {
                        $trunkName = "\n\n[mbilling]\n";
                        $context = 'slave';
                    }

                    $line .=  "\n\n[" . $trunkName . "]\n";
                    $line .= "type = aor\n";

                    $line .= "contact = sip:" . $data['name'] . "@" . $data['host'] . ":" . $port . "\n";
                    $line .= "qualify_frequency = 60\n";
                    $line .= "max_contacts = 1\n";


                    if (strtok($data['host'], ':') != 'dynamic') {

                        $line .= "\n\n[" . $trunkName . "]\n";
                        $line .= "type = identify\n";
                        $line .= "endpoint = " . $trunkName . "\n";
                        $line .= "match = " . strtok($data['host'], ':') . "\n";
                    }

                    $line .= "\n\n[" . $trunkName . "]\n";
                    $line .= "type = endpoint\n";
                    $line .= "context = " . $context . "\n";
                    $line .= "dtmf_mode = rfc4733\n";
                    $line .= "disallow = all\n";
                    $line .= "allow = g729,alaw,ulaw\n";
                    $line .= "rtp_symmetric = yes\n";
                    $line .= "force_rport = yes\n";
                    $line .= "rewrite_contact = yes\n";

                    $line .= "language = " . strlen($data['language']) ? $data['language'] : 'en' . "\n";
                    $line .= "allow_subscribe = yes\n";

                    $line .= "aors = " . $trunkName . "\n";
                    if (isset($accountcode) && strlen($accountcode)) {
                        $line .= "set_var = MB_ACC=" . $accountcode . "\n";
                    }
                }


                if (fwrite($fd, $line) === false) {
                    echo "Impossible to write to the file (" . $file . ")";
                    exit;
                }
            }



            fclose($fd);

            if (preg_match("/pjsip/", $file)) {
                AsteriskAccess::instance()->pjsipReload();
            } elseif (preg_match("/iax/", $file)) {
                AsteriskAccess::instance()->iaxReload();
            }
        }
    }
    /**
     * Build a call file without allowing a value to create another directive.
     *
     * @param array $directives One value per Asterisk call-file directive.
     * @param array $variables  Channel variables written as Set:NAME=value.
     * @return string
     */
    public static function buildCallFile($directives, $variables = [])
    {
        $allowedDirectives = [
            'Channel',
            'Callerid',
            'Account',
            'MaxRetries',
            'RetryTime',
            'WaitTime',
            'Context',
            'Extension',
            'Priority',
            'Archive',
        ];
        $callFile = '';

        foreach ($directives as $name => $value) {
            if (! in_array($name, $allowedDirectives, true)) {
                throw new InvalidArgumentException('Invalid Asterisk call-file directive');
            }

            $callFile .= $name . ': ' . self::callFileValue($value) . "\n";
        }

        foreach ($variables as $name => $value) {
            if (! is_string($name) || ! preg_match('/\A[A-Z][A-Z0-9_]*(?:\([A-Za-z0-9_]+\))?\z/', $name)) {
                throw new InvalidArgumentException('Invalid Asterisk call-file variable');
            }

            $callFile .= 'Set:' . $name . '=' . self::callFileValue($value) . "\n";
        }

        self::validateCallFile($callFile);
        return $callFile;
    }

    public static function callFileValue($value)
    {
        if (!strlen($value)) {
            return $value;
        }
        if (! is_scalar($value)) {
            throw new InvalidArgumentException('Invalid Asterisk call-file value');
        }

        $value = (string) $value;
        if (preg_match('/[\x00-\x1F\x7F]/', $value)) {
            throw new InvalidArgumentException('Invalid Asterisk call-file value');
        }

        return $value;
    }

    public static function callFileInteger($value, $minimum = 0, $maximum = 2147483647)
    {
        $value = self::callFileValue($value);
        if ($value === '' || ! ctype_digit($value)) {
            throw new InvalidArgumentException('Invalid Asterisk call-file integer');
        }

        $number = (float) $value;
        if ($number < $minimum || $number > $maximum) {
            throw new InvalidArgumentException('Invalid Asterisk call-file integer');
        }

        return $value;
    }

    private static function validateCallFile($callFile)
    {
        if (! is_string($callFile) || $callFile === '' || substr($callFile, -1) !== "\n") {
            throw new InvalidArgumentException('Invalid Asterisk call file');
        }

        if (preg_match('/[\x00-\x09\x0B-\x1F\x7F]/', $callFile)) {
            throw new InvalidArgumentException('Invalid Asterisk call file');
        }

        $singleDirectives = [];
        $allowedDirectives = [
            'Channel',
            'Callerid',
            'Account',
            'MaxRetries',
            'RetryTime',
            'WaitTime',
            'Context',
            'Extension',
            'Priority',
            'Archive',
        ];

        foreach (explode("\n", rtrim($callFile, "\n")) as $line) {
            if (strpos($line, 'Set:') === 0) {
                if (! preg_match('/\ASet:[A-Z][A-Z0-9_]*(?:\([A-Za-z0-9_]+\))?=[^\r\n]*\z/', $line)) {
                    throw new InvalidArgumentException('Invalid Asterisk call-file variable');
                }
                continue;
            }

            $separator = strpos($line, ':');
            $name      = $separator === false ? '' : substr($line, 0, $separator);
            if (! in_array($name, $allowedDirectives, true) || isset($singleDirectives[$name])) {
                throw new InvalidArgumentException('Invalid Asterisk call-file directive');
            }
            $singleDirectives[$name] = true;
        }

        if (! isset($singleDirectives['Channel'])) {
            throw new InvalidArgumentException('Asterisk call file requires a Channel directive');
        }
    }

    //call file , time in seconds to create the file
    public static function generateCallFile($callFile, $time = 0)
    {
        self::validateCallFile($callFile);

        $outgoingDirectory = '/var/spool/asterisk/outgoing';
        $stagingDirectory  = $outgoingDirectory . '/.magnusbilling-tmp';

        if (! is_dir($stagingDirectory) && ! mkdir($stagingDirectory, 0770, true) && ! is_dir($stagingDirectory)) {
            throw new RuntimeException('Unable to create Asterisk call-file staging directory');
        }

        $temporaryFile = tempnam($stagingDirectory, 'call-');
        if ($temporaryFile === false) {
            throw new RuntimeException('Unable to create temporary Asterisk call file');
        }

        $finalFile = $outgoingDirectory . '/' . basename($temporaryFile) . '.call';
        $fp        = fopen($temporaryFile, 'wb');

        try {
            if ($fp === false) {
                throw new RuntimeException('Unable to open temporary Asterisk call file');
            }

            $length  = strlen($callFile);
            $written = 0;
            while ($written < $length) {
                $result = fwrite($fp, substr($callFile, $written));
                if ($result === false || $result === 0) {
                    throw new RuntimeException('Unable to write temporary Asterisk call file');
                }
                $written += $result;
            }

            if (! fflush($fp)) {
                throw new RuntimeException('Unable to flush temporary Asterisk call file');
            }
            fclose($fp);
            $fp = null;

            $scheduledTime = time() + max(0, (int) $time);
            if (! touch($temporaryFile, $scheduledTime)) {
                throw new RuntimeException('Unable to schedule Asterisk call file');
            }

            @chown($temporaryFile, 'asterisk');
            @chgrp($temporaryFile, 'asterisk');
            if (! chmod($temporaryFile, 0640)) {
                throw new RuntimeException('Unable to set Asterisk call-file permissions');
            }

            if (! rename($temporaryFile, $finalFile)) {
                throw new RuntimeException('Unable to publish Asterisk call file');
            }
        } catch (Exception $exception) {
            if (is_resource($fp)) {
                fclose($fp);
            }
            if (file_exists($temporaryFile)) {
                @unlink($temporaryFile);
            }
            throw $exception;
        }
    }

    public function getCallsPerDid($did, $agi = null)
    {
        $channelsData = AsteriskAccess::instance()->coreShowChannelsConcise();
        $channelsData = explode("\n", $channelsData["data"]);

        $calls = 0;
        foreach ($channelsData as $key => $line) {
            if (preg_match("/$did\!.*\!Dial\!/", $line)) {
                $calls++;
            }
        }

        return $calls;
    }

    public function getCallsPerUser($accountcode)
    {
        $channelsData = AsteriskAccess::instance()->coreShowChannelsConcise();
        $channelsData = explode("\n", $channelsData["data"]);
        $modelSip     = Sip::model()->findAll('id_user = ( SELECT id FROM pkg_user WHERE username = :key)', [':key' => $accountcode]);
        $sipAccounts  = '';
        foreach ($modelSip as $key => $sip) {
            $sipAccounts .= $sip->name . '|';
        }

        $sipAccounts = substr($sipAccounts, 0, -1);
        $calls       = 0;
        foreach ($channelsData as $key => $line) {
            if (preg_match("/^SIP\/($sipAccounts)-/", $line)) {
                $calls++;
            }
        }

        return $calls;
    }

    public function groupTrunk($agi, $ipaddress, $maxuse)
    {
        if ($maxuse > 0) {

            $agi->verbose('Trunk have channels limit', 15);
            //Set group to count the trunk call use
            $agi->set_variable("GROUP()", $ipaddress);

            $groupData = AsteriskAccess::instance()->groupShowChannels();

            $arr   = explode("\n", $groupData["data"]);
            $count = 0;
            if ($arr[0] != "") {

                foreach ($arr as $temp) {
                    $linha = explode("  ", $temp);

                    if (trim($linha[4]) == $ipaddress) {
                        $channel = AsteriskAccess::getCoreShowChannel($linha[0], $agi);
                        $agi->verbose(print_r($channel['State'], true), 15);

                        if (preg_match("/Up |Ring /", $channel['State'])) {
                            $count++;
                        }
                    }
                }
            }
            if ($count > $maxuse) {
                $agi->verbose('Trunk ' . $ipaddress . ' have  ' . $count . ' calls, and the maximun call is ' . $maxuse, 1);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    public static function getSipShowPeers()
    {
        $sql          = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND status IN (1,4) AND host != 'localhost'";
        $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

        // adiciona localhost
        array_push($modelServers, [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ]);

        $result = [];

        foreach ($modelServers as $server) {

            // precisa criar esse método no AsteriskAccess chamando "pjsip show contacts"
            $data = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->pjsipShowContacts();

            if (!isset($data['data']) || strlen($data['data']) < 10) {
                continue;
            }

            $lines = explode("\n", $data['data']);

            /*
         * Formato típico de linha:
         *
         * Contact:  36533/sip:36533@190.183.192.252:49286  f3a6a976231beb3a  Avail         33.456
         *
         * Vamos extrair:
         *   - Aor        => 36533
         *   - Uri        => sip:36533@190.183.192.252:49286
         *   - Hash       => f3a6a976231beb3a
         *   - Status     => Avail / Unavail / Unknown...
         *   - RTT        => 33.456 / 0.000 / <qualquer coisa>
         */

            foreach ($lines as $line) {

                $line = trim($line);
                if ($line == '' || strpos($line, 'Contact:') !== 0) {
                    continue;
                }

                // remove o prefixo "Contact:"
                $clean = preg_replace('/^Contact:\s*/', '', $line);

                // quebra em partes por espaços múltiplos
                // Aor/URI, Hash, Status, RTT
                $parts = preg_split('/\s+/', $clean);

                if (count($parts) < 4) {
                    continue;
                }

                // primeiro campo vem como "AOR/URI"
                // ex: "36533/sip:36533@190.183.192.252:49286"
                $aor      = null;
                $uri      = null;
                $aorUri   = $parts[0];
                $hash     = $parts[1];
                $status   = $parts[2];
                $rtt      = isset($parts[3]) ? $parts[3] : '';

                if (strpos($aorUri, '/') !== false) {
                    list($aor, $uri) = explode('/', $aorUri, 2);
                } else {
                    $aor = $aorUri;
                    $uri = '';
                }

                $element = [
                    'Aor'    => $aor,
                    'Uri'    => $uri,
                    'Hash'   => $hash,
                    'Status' => $status,
                    'RTT'    => $rtt,
                    'server' => $server['host'],
                ];

                $result[] = $element;
            }
        }

        return $result;
    }




    public static function getCoreShowCdrChannels()
    {

        $sql          = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND status IN (1,4) AND host != 'localhost'";
        $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

        array_push($modelServers, [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ]);

        $channels = [];
        foreach ($modelServers as $key => $server) {

            $data = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->cdrShowActive();

            if (! isset($data) || ! isset($data['data'])) {
                Servers::model()->updateByPk($server['id'], ['status' => 2]);
                continue;
            }

            if (! isset($data) || ! isset($data['data'])) {
                continue;
            }

            $linesCallsResult = explode("\n", $data['data']);

            for ($i = 0; $i < count($linesCallsResult) - 1; $i++) {
                $call = explode("|", $linesCallsResult[$i]);

                if (!preg_match('/^SIP|^IAX|^PJSIP/', $call[0])) {
                    continue;
                }

                if ($call[4] == 'Down') {
                    continue;
                }
                if ($call[6] == '<none>' && $call[7] != 'AGI' && substr($call[1], 0, 2) != 'MC') {
                    continue;
                }
                $call['server'] = $server['host'];
                $channels[]     = $call;
            }
        }

        return $channels;
    }

    /**
     * Return all active channels from every enabled Asterisk server using one
     * AMI Status action per server.
     */
    public static function getStatusChannels($updateServerStatus = true)
    {
        $sql = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND status IN (1,4) AND host != 'localhost'";
        $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

        $modelServers[] = [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ];

        $channels = [];
        foreach ($modelServers as $server) {
            $data = AsteriskAccess::instance(
                $server['host'],
                $server['username'],
                $server['password']
            )->statusShowAll();

            if (! is_array($data)) {
                if ($updateServerStatus && isset($server['id'])) {
                    Servers::model()->updateByPk($server['id'], ['status' => 2]);
                }
                continue;
            }

            foreach ($data as $channel) {
                if (! isset($channel['Channel'])) {
                    continue;
                }
                $channel['server'] = $server['host'];
                $channels[] = $channel;
            }
        }

        return $channels;
    }

    public static function getCoreShowChannels()
    {

        $sql          = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND status IN (1,4) AND host != 'localhost'";
        $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

        array_push($modelServers, [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ]);

        $channels = [];
        foreach ($modelServers as $key => $server) {

            $columns = ['Channel', 'Context', 'Exten', 'Priority', 'Stats', 'Application', 'Data', 'CallerID', 'Accountcode', 'Amaflags', 'Duration', 'Bridged'];
            $data    = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->coreShowChannelsConcise();

            if (! isset($data) || ! isset($data['data'])) {
                return;
            }

            $linesCallsResult = explode("\n", $data['data']);

            if (count($linesCallsResult) < 1) {
                return;
            }

            for ($i = 0; $i < count($linesCallsResult); $i++) {
                $call = explode("!", $linesCallsResult[$i]);
                if (! preg_match("/\//", $call[0])) {
                    continue;
                }
                $call['server'] = $server['host'];
                $channels[]     = $call;
            }
        }
        return $channels;
    }

    public static function getCoreShowChannelsVerbose()
    {

        $sql          = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND status IN (1,4) AND host != 'localhost'";
        $modelServers = Yii::app()->db->createCommand($sql)->queryAll();

        array_push($modelServers, [
            'host'     => 'localhost',
            'username' => 'magnus',
            'password' => 'magnussolution',
        ]);

        $channels = [];
        foreach ($modelServers as $key => $server) {
            $columns = ['Channel', 'Context', 'Extension', 'Prio', 'State', 'Application', 'Data', 'CallerID', 'Duration', 'Accountcode', 'PeerAccount', 'BridgedTo'];
            $data    = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->coreShowChannelsVerbose();

            if (! isset($data) || ! isset($data['data'])) {
                return;
            }

            $linesCallsResult = explode("\n", $data['data']);

            if (count($linesCallsResult) < 1) {
                return;
            }

            for ($i = 0; $i < count($linesCallsResult); $i++) {

                if (preg_match("/\(Outgoing Line\)/", $linesCallsResult[$i])) {
                    continue;
                }
                $call = preg_split("/\s+/", $linesCallsResult[$i]);
                if (! preg_match("/\//", $call[0])) {
                    continue;
                }
                $call['server'] = $server['host'];
                $channels[]     = $call;
            }
        }
        return $channels;
    }

    public static function getCoreShowChannel($channel, $agi = null, $server = null)
    {

        if ($server == null) {
            $sql = "SELECT * FROM pkg_servers WHERE type = 'asterisk' AND  status IN (1,4) AND host != 'localhost'";
            if (isset($agi->engine)) {
                $modelServers = $agi->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $modelServers = Yii::app()->db->createCommand($sql)->queryAll();
            }

            array_push($modelServers, [
                'host'     => 'localhost',
                'username' => 'magnus',
                'password' => 'magnussolution',
            ]);
        } else {
            $modelServers = [];
            array_push($modelServers, [
                'host'     => $server,
                'username' => 'magnus',
                'password' => 'magnussolution',
            ]);
        }

        $channels = [];
        foreach ($modelServers as $key => $server) {
            $data = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->coreShowChannel($channel);
            if (! isset($data['data']) || strlen($data['data']) < 10 || preg_match("/is not a known channe/", $data['data'])) {
                continue;
            }
            $linesCallResult = explode("\n", $data['data']);
            if (count($linesCallResult) < 1) {
                continue;
            }
            $result = [];
            for ($i = 2; $i < count($linesCallResult); $i++) {
                if (preg_match("/level 1: /", $linesCallResult[$i])) {
                    $data = explode("=", substr($linesCallResult[$i], 9));
                } elseif (preg_match("/: /", $linesCallResult[$i])) {
                    $data = explode(":", $linesCallResult[$i]);
                } elseif (preg_match("/=/", $linesCallResult[$i])) {
                    $data = explode("=", $linesCallResult[$i]);
                }
                // echo '<pre>';
                //print_r($data);
                $key   = isset($data[0]) ? $data[0] : '';
                $value = isset($data[1]) ? $data[1] : '';

                if ($key == 'SIPCALLID') {
                    $result[trim($key)] = AsteriskAccess::instance($server['host'], $server['username'], $server['password'])->sipShowChannel(trim($value));
                } else {
                    $result[trim($key)] = trim($value);
                }
            }
            break;
        }

        return $result;
    }

    private static function getPjsipIdentifyMatchFromPermit($permit)
    {
        if (! is_string($permit)) {
            return null;
        }

        $permit = trim($permit);
        if ($permit === '' || preg_match('/[\s,;|&]/', $permit)) {
            return null;
        }

        $address = $permit;
        $mask    = null;

        if (strpos($permit, '/') !== false) {
            $parts = explode('/', $permit);
            if (count($parts) !== 2) {
                return null;
            }
            $address = trim($parts[0]);
            $mask    = trim($parts[1]);
        }

        if (filter_var($address, FILTER_VALIDATE_IP) === false || $address === '0.0.0.0' || $address === '::') {
            return null;
        }

        if ($mask === null || $mask === '') {
            return $address;
        }

        if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
            return $mask === '32' || $mask === '255.255.255.255' ? $address : null;
        }

        return $mask === '128' ? $address : null;
    }

    public function generateSipPeers()
    {
        ini_set('memory_limit', '-1');
        $modelSip = Sip::model()->findAll();

        foreach ($modelSip as $sip) {
            AsteriskConfigValue::assertRecord(
                $sip->attributes,
                'sip.' . (isset($sip->id) ? $sip->id : 'new')
            );
        }

        $pjsipFile     = '/etc/asterisk/pjsip_magnus_user.conf';
        $voicemailFile = '/etc/asterisk/voicemail_magnus.conf';

        // reset files
        file_put_contents($pjsipFile, '');
        file_put_contents($voicemailFile, '');

        $fr_voicemail = fopen($voicemailFile, "w");
        $voicemail    = "[billing]\n";

        if (count($modelSip)) {
            $dynamicIdentifyMatches = [];

            foreach ($modelSip as $sipCandidate) {
                if ($sipCandidate->idUser->active == 0 || strtolower(trim($sipCandidate->host)) !== 'dynamic') {
                    continue;
                }

                $permitMatch = self::getPjsipIdentifyMatchFromPermit($sipCandidate->permit);
                if ($permitMatch !== null) {
                    $dynamicIdentifyMatches[$permitMatch] = isset($dynamicIdentifyMatches[$permitMatch])
                        ? $dynamicIdentifyMatches[$permitMatch] + 1
                        : 1;
                }
            }

            $fd = fopen($pjsipFile, "w");

            if ($fd) {
                $globalConfig  = "[global]\n";
                $globalConfig .= "type=global\n";
                $globalConfig .= "endpoint_identifier_order=ip,username,auth_username\n";

                if (fwrite($fd, $globalConfig) === false) {
                    echo gettext("Impossible to write to the file") . " ($pjsipFile)";
                }

                foreach ($modelSip as $key => $sip) {

                    // voicemail (igual ao código antigo)
                    if (isset($sip->voicemail) && $sip->voicemail == 1) {
                        $voicemail .= $sip->name . " => " . $sip->voicemail_password . "," .
                            $sip->idUser->lastname . ' ' . $sip->idUser->firstname . "," .
                            $sip->voicemail_email . "\n";
                    }

                    // usuário inativo não gera peer
                    if ($sip->idUser->active == 0) {
                        continue;
                    }

                    // host:port
                    if (preg_match('/\:/', $sip->host)) {
                        $hostParts  = explode(':', $sip->host);
                        $host       = trim($hostParts[0]);
                        $port       = (int)$hostParts[1];
                    } else {
                        $host = trim($sip->host);
                        $port = 5060;
                    }

                    $sip->name        = trim($sip->name);
                    $sip->defaultuser = trim($sip->defaultuser);
                    $sip->fromuser    = trim($sip->fromuser);

                    // names for sections
                    $endpointName = strlen($sip->name) ? $sip->name : $host;
                    $authName     = $endpointName . "_auth";
                    $aorName      = $endpointName;
                    $identifyName = $endpointName . "_identify";

                    // username for auth (mantém lógica defaultuser/name)
                    $authUsername = strlen($sip->defaultuser) > 0 ? $sip->defaultuser : $sip->name;

                    // -------- AUTH --------
                    // Fixed-IP accounts configured for IP-only authentication
                    // are identified by identify/match and must not have auth=.
                    $line = PjsipAuthenticationMode::authSection(
                        $sip,
                        $authName,
                        $authUsername
                    );

                    // -------- AOR --------
                    $line .= "\n[" . $aorName . "]\n";
                    $line .= "type=aor\n";
                    if (isset($sip->max_contacts) && strlen($sip->max_contacts) > 0) {
                        $line .= "max_contacts=" . trim($sip->max_contacts) . "\n";
                    }
                    if ($host != 'dynamic') {

                        // peer por IP
                        $line .= "contact=sip:" . $host;
                        if ($port != 5060) {
                            $line .= ":" . $port;
                        }
                        $line .= "\n";
                    }

                    if (strlen($sip->qualify) > 0 && $sip->qualify != 'no') {
                        $line .= "qualify_frequency=60\n";
                    }

                    // -------- ENDPOINT --------
                    $line .= "\n[" . $endpointName . "]\n";
                    $line .= "type=endpoint\n";
                    $line .= "transport=transport-udp\n";
                    $line .= "identify_by="
                        . PjsipAuthenticationMode::endpointIdentifyBy($sip)
                        . "\n";

                    // accountcode -> set_var
                    $line .= "set_var=MB_ACC=" . $sip->idUser->username . "\n";

                    // context
                    if (strlen($sip->context) > 0) {
                        $line .= "context=" . $sip->context . "\n";
                    } else {
                        $line .= "context=billing\n";
                    }

                    // dtmfmode (RFC2833 -> rfc4733 no pjsip)
                    if (strlen($sip->dtmfmode) > 0) {
                        $dtmf = strtolower($sip->dtmfmode);
                        if ($dtmf == 'rfc2833') {
                            $dtmf = 'rfc4733';
                        }
                        $line .= "dtmf_mode=" . $dtmf . "\n";
                    }

                    // codecs
                    $line .= "disallow=all\n";
                    if (strlen($sip->allow) > 0) {
                        $codecs = explode(",", $sip->allow);
                        foreach ($codecs as $codec) {
                            $codec = trim($codec);
                            if ($codec == '') {
                                continue;
                            }
                            $line .= "allow=" . $codec . "\n";
                        }
                    }

                    // NAT equivalentes
                    $line .= "rtp_symmetric=yes\n";
                    $line .= "force_rport=yes\n";
                    $line .= "rewrite_contact=yes\n";

                    // direct media
                    if (strlen($sip->directmedia) > 0) {
                        $line .= "direct_media=" . ($sip->directmedia == 'yes' ? 'yes' : 'no') . "\n";
                    } else {
                        $line .= "direct_media=no\n";
                    }

                    // from_user / from_domain
                    if (strlen($sip->fromuser) > 0) {
                        $line .= "from_user=" . $sip->fromuser . "\n";
                    }
                    if ($host != 'dynamic') {
                        $line .= "from_domain=" . $host . "\n";
                    }

                    // language
                    if (strlen($sip->language) > 0) {
                        $line .= "language=" . $sip->language . "\n";
                    }

                    // allowtransfer (aproximação)
                    if ($sip->allowtransfer == 'no') {
                        $line .= "allow_transfer=no\n";
                    } else {
                        $line .= "allow_transfer=yes\n";
                    }

                    // callerid
                    $line .= "callerid=" . $sip->callerid  . "\n";

                    // amarra auth/aor
                    $line .= PjsipAuthenticationMode::endpointAuthLine($sip, $authName);
                    $line .= "aors=" . $aorName . "\n";

                    // -------- IDENTIFY (host fixo ou permit de host único) --------
                    $identifyMatch = null;
                    if ($host != 'dynamic') {
                        $identifyMatch = $host;
                    } else {
                        $permitMatch = self::getPjsipIdentifyMatchFromPermit($sip->permit);
                        if ($permitMatch !== null && $dynamicIdentifyMatches[$permitMatch] === 1) {
                            $identifyMatch = $permitMatch;
                        }
                    }

                    if ($identifyMatch !== null) {
                        $line .= "\n[" . $identifyName . "]\n";
                        $line .= "type=identify\n";
                        $line .= "endpoint=" . $endpointName . "\n";
                        $line .= "match=" . $identifyMatch . "\n";
                    }

                    if (fwrite($fd, $line) === false) {
                        echo gettext("Impossible to write to the file") . " ($pjsipFile)";
                        break;
                    }
                }

                fclose($fd);
            }
        }

        if (fwrite($fr_voicemail, $voicemail) === false) {
            echo "Impossible to write to the file ($voicemailFile)";
        }
        fclose($fr_voicemail);

        AsteriskAccess::instance()->VoiceMailReload();
        AsteriskAccess::instance()->pjsipReload();
    }



    public function generateSipPeersOLD()
    {
        ini_set('memory_limit', '-1');

        $modelSip = Sip::model()->findAll();

        foreach ($modelSip as $sip) {
            AsteriskConfigValue::assertRecord(
                $sip->attributes,
                'sip.' . (isset($sip->id) ? $sip->id : 'new')
            );
        }

        $buddyfile = '/etc/asterisk/pjsip_magnus_user.conf';

        $voicemailFile = '/etc/asterisk/voicemail_magnus.conf';
        file_put_contents($voicemailFile, '');
        $fr_voicemail = fopen($voicemailFile, "w");
        $voicemail    = "[billing]\n";

        if (count($modelSip)) {

            $fd = fopen($buddyfile, "w");

            if ($fd) {
                foreach ($modelSip as $key => $sip) {

                    if (isset($sip->voicemail) && $sip->voicemail == 1) {
                        $voicemail .= $sip->name . " => " . $sip->voicemail_password . "," . $sip->idUser->lastname . ' ' . $sip->idUser->firstname . "," . $sip->voicemail_email . "\n";
                    }

                    if ($sip->idUser->active == 0) {
                        continue;
                    }

                    if (preg_match('/\:/', $sip->host)) {
                        $host      = explode(':', $sip->host);
                        $sip->host = $host[0];
                        $port      = $host[1];
                    } else {
                        $port = 5060;
                    }

                    $sip->name        = trim($sip->name);
                    $sip->defaultuser = trim($sip->defaultuser);
                    $sip->fromuser    = trim($sip->fromuser);

                    if ($sip->techprefix > 1) {
                        $line = "\n\n[" . $sip->host . "]\n";
                    } else {
                        $line = "\n\n[" . $sip->name . "]\n";
                        $line .= 'accountcode=' . $sip->idUser->username . "\n";
                        if (strlen($sip->defaultuser) > 1) {
                            $line .= 'defaultuser=' . $sip->defaultuser . "\n";
                        }
                        if (strlen($sip->fromuser) > 1) {
                            $line .= 'fromuser=' . $sip->fromuser . "\n";
                        }

                        if (strlen($sip->secret) > 1) {
                            $line .= 'secret=' . $sip->secret . "\n";
                        }
                    }

                    if ($sip->host != 'dynamic') {
                        $line .= 'deny=0.0.0.0/0.0.0.0' . "\n";
                        $line .= 'permit=' . $sip->host . "/255.255.255.0\n";
                    } else {
                        if (strlen($sip->deny) > 1) {
                            $line .= 'deny=' . $sip->deny . "\n";
                        }
                        if (strlen($sip->permit) > 1) {
                            $line .= 'permit=' . $sip->permit . "\n";
                        }
                    }

                    if (isset($port) && $port != 5060) {
                        $line .= 'post=' . $port . "\n";
                    }

                    $line .= 'host=' . $sip->host . "\n";
                    $line .= 'fromdomain=' . $sip->host . "\n";
                    $line .= 'disallow=' . $sip->disallow . "\n";

                    $codecs = explode(",", $sip->allow);
                    foreach ($codecs as $codec) {
                        $line .= 'allow=' . $codec . "\n";
                    }

                    if (strlen($sip->directmedia) > 1) {
                        $line .= 'directmedia=' . $sip->directmedia . "\n";
                    }

                    if (strlen($sip->context) > 1) {
                        $line .= 'context=' . $sip->context . "\n";
                    }

                    if (strlen($sip->dtmfmode) > 1) {
                        $line .= 'dtmfmode=' . $sip->dtmfmode . "\n";
                    }

                    if (strlen($sip->insecure) > 1) {
                        $line .= 'insecure=' . $sip->insecure . "\n";
                    }

                    if (strlen($sip->nat) > 1) {
                        $line .= 'nat=' . $sip->nat . "\n";
                    }

                    if (strlen($sip->qualify) > 1) {
                        $line .= 'qualify=' . $sip->qualify . "\n";
                    }

                    if (strlen($sip->type) > 1) {
                        $line .= 'type=' . $sip->type . "\n";
                    }

                    if (strlen($sip->regexten) > 1) {
                        $line .= 'regexten=' . $sip->regexten . "\n";
                    }

                    if (strlen($sip->amaflags) > 1) {
                        $line .= 'amaflags=' . $sip->amaflags . "\n";
                    }

                    if (strlen($sip->callerid) > 1) {

                        if (preg_match('/\<.*\>/', $sip->callerid)) {
                            $line .= 'callerid=' . $sip->callerid . "\n";
                        } else {
                            $line .= 'callerid=<' . $sip->callerid . ">\n";
                        }
                    }

                    if (strlen($sip->language) > 1) {
                        $line .= 'language=' . $sip->language . "\n";
                    }

                    if ($sip->calllimit > 0) {
                        $line .= 'call-limit=' . $sip->calllimit . "\n";
                    }

                    if (strlen($sip->mohsuggest) > 1) {
                        $line .= 'mohsuggest=' . $sip->mohsuggest . "\n";
                    }


                    $line .= 'allowtransfer=' . $sip->allowtransfer . "\n";

                    if ($sip->context == 'encryption') {
                        $line .= "encryption=yes\n";
                        $line .= "avpf=yes\n";
                        $line .= "force_avp=yes\n";
                        $line .= "icesupport=yes\n";
                        $line .= "dtlsenable=yes\n";
                        $line .= "dtlsverify=fingerprint\n";
                        $line .= "dtlscertfile=/etc/asterisk/certificate/asterisk.pem\n";
                        $line .= "dtlscafile=/etc/asterisk/certificate/ca.crt\n";
                        $line .= "dtlssetup=actpass\n";
                        $line .= "rtcp_mux=yes\n";
                    }

                    if (isset($sip->sip_config) && $sip->sip_config != '') {
                        $line .= $sip->sip_config . "\n";
                    }

                    if (strlen($sip->sip_group) > 0) {
                        $line .= 'namedcallgroup=' . $sip->sip_group . "\n";
                        $line .= 'namedpickupgroup=' . $sip->sip_group . "\n";
                    }

                    if (fwrite($fd, $line) === false) {
                        echo gettext("Impossible to write to the file") . " ($buddyfile)";
                        break;
                    }
                }

                fclose($fd);
            }
        }
        if (fwrite($fr_voicemail, $voicemail) === false) {
            echo "Impossible to write to the file ($fr_voicemail)";
        }
        AsteriskAccess::instance()->VoiceMailReload();

        AsteriskAccess::instance()->pjsipReload();
    }
    public function generateIaxPeers()
    {

        $modelIax = Iax::model()->findAll();

        $buddyfile = '/etc/asterisk/iax_magnus_user.conf';

        if (count($modelIax)) {

            $fd = fopen($buddyfile, "w");

            if ($fd) {
                foreach ($modelIax as $key => $iax) {

                    if ($iax->idUser->active == 0) {
                        continue;
                    }

                    $line = "\n\n[" . $iax->name . "]\n";
                    if (fwrite($fd, $line) === false) {
                        echo "Impossible to write to the file ($buddyfile)";
                        break;
                    } else {
                        $line = '';

                        $line .= 'host=' . $iax->host . "\n";

                        $line .= 'fromdomain=' . $iax->host . "\n";
                        $line .= 'accountcode=' . $iax->idUser->username . "\n";
                        $line .= 'disallow=' . $iax->disallow . "\n";

                        $codecs = explode(",", $iax->allow);
                        foreach ($codecs as $codec) {
                            $line .= 'allow=' . $codec . "\n";
                        }

                        if (strlen($iax->context) > 1) {
                            $line .= 'context=' . $iax->context . "\n";
                        }

                        if (strlen($iax->dtmfmode) > 1) {
                            $line .= 'dtmfmode=' . $iax->dtmfmode . "\n";
                        }

                        if (strlen($iax->insecure) > 1) {
                            $line .= 'insecure=' . $iax->insecure . "\n";
                        }

                        if (strlen($iax->nat) > 1) {
                            $line .= 'nat=' . $iax->nat . "\n";
                        }

                        if (strlen($iax->qualify) > 1) {
                            $line .= 'qualify=' . $iax->qualify . "\n";
                        }

                        if (strlen($iax->type) > 1) {
                            $line .= 'type=' . $iax->type . "\n";
                        }

                        if (strlen($iax->regexten) > 1) {
                            $line .= 'regexten=' . $iax->regexten . "\n";
                        }

                        if (strlen($iax->amaflags) > 1) {
                            $line .= 'amaflags=' . $iax->amaflags . "\n";
                        }

                        if (strlen($iax->language) > 1) {
                            $line .= 'language=' . $iax->language . "\n";
                        }

                        if (strlen($iax->username) > 1) {
                            $line .= 'username=' . $iax->username . "\n";
                        }

                        if (strlen($iax->fromuser) > 1) {
                            $line .= 'fromuser=' . $iax->fromuser . "\n";
                        }

                        if (strlen($iax->callerid) > 1) {
                            $line .= 'cid_number=' . $iax->callerid . "\n";
                        }

                        if (strlen($iax->callerid) > 1) {
                            $line .= 'callerid=' . $iax->callerid . "\n";
                        }

                        if (strlen($iax->secret) > 1) {
                            $line .= 'secret=' . $iax->secret . "\n";
                        }

                        if ($iax->calllimit > 0) {
                            $line .= 'call-limit=' . $iax->calllimit . "\n";
                        }

                        if (fwrite($fd, $line) === false) {
                            echo gettext("Impossible to write to the file") . " ($buddyfile)";
                            break;
                        }
                    }
                }
                fclose($fd);
            }
        }

        AsteriskAccess::instance()->iaxReload();
    }

    public function writeDidContext()
    {
        $modeDidDestination = Diddestination::model()->findAll('voip_call = 10 AND context != ""');
        $context_file       = '';
        foreach ($modeDidDestination as $key => $destination) {
            $context_file .= "[did-" . $destination->idDid->did . "]\n";
            $context_file .= $destination->context . "\n\n";
        }

        $buddyfile = '/etc/asterisk/extensions_magnus_did.conf';
        $fd        = fopen($buddyfile, "w");
        if ($fd) {
            fwrite($fd, $context_file);
            fclose($fd);
        }

        AsteriskAccess::instance()->dialPlanReload();
    }
}
