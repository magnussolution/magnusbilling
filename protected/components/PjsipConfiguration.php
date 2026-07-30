<?php

/**
 * Generates the Asterisk 20/PJSIP files alongside the legacy chan_sip files.
 *
 * MagnusBilling 7 masters keep using chan_sip. These files are consumed only
 * by slaves that have already been migrated to MagnusBilling 8/Asterisk 20,
 * so this class deliberately never asks the local Asterisk to reload PJSIP.
 */
class PjsipConfiguration
{
    const TRUNK_FILE = '/etc/asterisk/pjsip_magnus.conf';
    const USER_FILE  = '/etc/asterisk/pjsip_magnus_user.conf';

    public static function writeTrunks($model)
    {
        $rows = Util::getColumnsFromModel($model);
        $servers = Yii::app()->db->createCommand(
            "SELECT * FROM pkg_servers
             WHERE type != 'mbilling'
               AND status IN (1,4)
               AND host != 'localhost'"
        )->queryAll();

        self::writeFile(self::TRUNK_FILE, self::renderTrunks($rows, $servers));
    }

    public static function writeUsers($modelSip)
    {
        self::writeFile(self::USER_FILE, self::renderUsers($modelSip));
    }

    public static function renderTrunks($rows, $servers)
    {
        $output = '';

        foreach ($rows as $data) {
            $name = $data['trunkcode'];
            $host = trim($data['host']);
            $authName = self::sectionName(
                'auth_reg_' . $name . '_' . $data['user'] . '_' . $host
            );

            if (preg_match('/^[^:]+:[^@]+@[^\/]+\/?.*$/', $data['register_string'])) {
                $output .= "\n\n[reg_" . $authName . "]\n";
                $output .= "type=registration\n";
                $output .= "retry_interval=20\n";
                $output .= "max_retries=10\n";
                $output .= "expiration=120\n";
                $output .= "transport=transport-udp\n";
                $output .= "outbound_auth=" . $authName . "\n";
                $output .= "client_uri=sip:" . $data['user'] . '@' . $host . "\n";
                $output .= "server_uri=sip:" . $host . "\n";
                $output .= "contact_user=" . $data['user'] . "\n";
            }

            if (strlen($data['user']) && strlen($data['secret'])) {
                $output .= "\n[" . $authName . "]\n";
                $output .= "type=auth\n";
                $output .= "auth_type=userpass\n";
                $output .= "username=" . $data['user'] . "\n";
                $output .= "password=" . $data['secret'] . "\n";
            }

            $output .= self::renderTrunkEndpoint($name, $data);
        }

        foreach ($servers as $data) {
            if ($data['type'] == 'asterisk') {
                $name = preg_replace('/ /', '', strtolower($data['name'])) . '-' . $data['id'];
                $context = 'slave';
                $accountcode = '';
            } elseif ($data['type'] == 'sipproxy') {
                $name = 'sipproxy-' . preg_replace('/ /', '', strtolower($data['name'])) . '-' . $data['id'];
                $context = 'proxy';
                $accountcode = 'sipproxy';
            } else {
                continue;
            }

            $server = [
                'host'        => $data['host'],
                'user'        => $data['name'],
                'secret'      => '',
                'qualify'     => 'yes',
                'context'     => $context,
                'allow'       => 'g729,alaw,ulaw',
                'directmedia' => 'no',
                'fromuser'    => '',
                'fromdomain'  => '',
                'language'    => isset($data['language']) ? $data['language'] : 'en',
            ];
            $output .= self::renderTrunkEndpoint($name, $server, $accountcode);
        }

        return $output;
    }

    private static function renderTrunkEndpoint($name, $data, $accountcode = '')
    {
        $host = trim($data['host']);
        $hostWithoutPort = strtok($host, ':');
        $line  = "\n\n[" . $name . "]\n";
        $line .= "type=aor\n";
        $line .= "contact=sip:";
        $line .= strlen($data['user']) ? $data['user'] . '@' . $host : $host;
        $line .= "\n";
        $line .= "qualify_frequency=" . ($data['qualify'] == 'yes' ? '60' : $data['qualify']) . "\n";
        $line .= "max_contacts=1\n";

        if ($hostWithoutPort != 'dynamic') {
            $line .= "\n[" . $name . "_identify]\n";
            $line .= "type=identify\n";
            $line .= "endpoint=" . $name . "\n";
            $line .= "match=" . $hostWithoutPort . "\n";
        }

        $line .= "\n[" . $name . "]\n";
        $line .= "type=endpoint\n";
        $line .= "transport=transport-udp\n";
        $line .= "context=" . $data['context'] . "\n";
        $line .= "dtmf_mode=rfc4733\n";
        $line .= "disallow=all\n";
        $line .= "allow=" . $data['allow'] . "\n";
        $line .= "rtp_symmetric=yes\n";
        $line .= "force_rport=yes\n";
        $line .= "rewrite_contact=yes\n";
        $line .= "direct_media=" . $data['directmedia'] . "\n";
        $language = isset($data['language']) && strlen($data['language'])
            ? $data['language']
            : 'en';
        $line .= "language=" . $language . "\n";
        $line .= "allow_subscribe=yes\n";
        $line .= "aors=" . $name . "\n";

        if (strlen($data['fromuser'])) {
            $line .= "from_user=" . $data['fromuser'] . "\n";
        }
        if (strlen($data['fromdomain'])) {
            $line .= "from_domain=" . $data['fromdomain'] . "\n";
        }
        if (strlen($data['user']) && strlen($data['secret'])) {
            $authName = self::sectionName(
                'auth_reg_' . $name . '_' . $data['user'] . '_' . $host
            );
            $line .= "auth=" . $authName . "\n";
            $line .= "outbound_auth=" . $authName . "\n";
        }
        if (strlen($accountcode)) {
            $line .= "set_var=MB_ACC=" . $accountcode . "\n";
        }

        return $line;
    }

    public static function renderUsers($modelSip)
    {
        $output  = "[global]\n";
        $output .= "type=global\n";
        $output .= "endpoint_identifier_order=ip,username,auth_username,anonymous\n";

        foreach ($modelSip as $sip) {
            if ($sip->idUser->active == 0) {
                continue;
            }

            list($host, $port) = self::splitHostPort($sip->host);
            $endpointName = strlen(trim($sip->name)) ? trim($sip->name) : $host;
            $authName = $endpointName . '_auth';
            $authUsername = strlen(trim($sip->defaultuser))
                ? trim($sip->defaultuser)
                : trim($sip->name);
            $ipOnly = self::isIpOnly($sip);

            if (! $ipOnly) {
                $output .= "\n\n[" . $authName . "]\n";
                $output .= "type=auth\n";
                $output .= "auth_type=userpass\n";
                $output .= "username=" . $authUsername . "\n";
                if (strlen($sip->secret)) {
                    $output .= "password=" . $sip->secret . "\n";
                }
            }

            $output .= "\n[" . $endpointName . "]\n";
            $output .= "type=aor\n";
            if (isset($sip->max_contacts) && strlen($sip->max_contacts)) {
                $output .= "max_contacts=" . trim($sip->max_contacts) . "\n";
            } elseif ($host == 'dynamic') {
                $output .= "max_contacts=1\n";
            }
            if ($host != 'dynamic') {
                $output .= "contact=sip:" . $host;
                $output .= $port != 5060 ? ':' . $port : '';
                $output .= "\n";
            }
            if (strlen($sip->qualify) && $sip->qualify != 'no') {
                $output .= "qualify_frequency=60\n";
            }

            $output .= "\n[" . $endpointName . "]\n";
            $output .= "type=endpoint\n";
            $output .= "transport=transport-udp\n";
            $output .= "identify_by=" . ($ipOnly ? 'ip' : 'username,auth_username,ip') . "\n";
            $output .= "set_var=MB_ACC=" . $sip->idUser->username . "\n";
            $output .= "context=" . (strlen($sip->context) ? $sip->context : 'billing') . "\n";

            if (strlen($sip->dtmfmode)) {
                $dtmf = strtolower($sip->dtmfmode);
                $output .= "dtmf_mode=" . ($dtmf == 'rfc2833' ? 'rfc4733' : $dtmf) . "\n";
            }

            $output .= "disallow=all\n";
            foreach (explode(',', $sip->allow) as $codec) {
                $codec = trim($codec);
                if (strlen($codec)) {
                    $output .= "allow=" . $codec . "\n";
                }
            }
            $output .= "rtp_symmetric=yes\n";
            $output .= "force_rport=yes\n";
            $output .= "rewrite_contact=yes\n";
            $output .= "direct_media=" . ($sip->directmedia == 'yes' ? 'yes' : 'no') . "\n";

            if (strlen(trim($sip->fromuser))) {
                $output .= "from_user=" . trim($sip->fromuser) . "\n";
            }
            if ($host != 'dynamic') {
                $output .= "from_domain=" . $host . "\n";
            }
            if (strlen($sip->language)) {
                $output .= "language=" . $sip->language . "\n";
            }

            $output .= "allow_transfer=" . ($sip->allowtransfer == 'no' ? 'no' : 'yes') . "\n";
            $output .= "callerid=" . $sip->callerid . "\n";
            if (! $ipOnly) {
                $output .= "auth=" . $authName . "\n";
            }
            $output .= "aors=" . $endpointName . "\n";

            if ($host != 'dynamic') {
                $output .= "\n[" . $endpointName . "_identify]\n";
                $output .= "type=identify\n";
                $output .= "endpoint=" . $endpointName . "\n";
                $output .= "match=" . $host . "\n";
            }
        }

        return $output;
    }

    private static function splitHostPort($value)
    {
        $parts = explode(':', trim($value), 2);
        return [
            trim($parts[0]),
            isset($parts[1]) && ctype_digit($parts[1]) ? (int) $parts[1] : 5060,
        ];
    }

    private static function isIpOnly($sip)
    {
        $host = strtolower(trim($sip->host));
        if ($host === '' || $host === 'dynamic') {
            return false;
        }

        return trim($sip->secret) === ''
            || preg_match('/(?:^|,)\s*invite\s*(?:,|$)/i', $sip->insecure) === 1;
    }

    private static function sectionName($value)
    {
        return preg_replace('/[^A-Za-z0-9_.-]/', '_', $value);
    }

    private static function writeFile($file, $content)
    {
        if (file_put_contents($file, $content, LOCK_EX) === false) {
            echo gettext("Impossible to write to the file") . " ($file)";
            return false;
        }
        return true;
    }
}
