<?php

/**
 * Acoes do modulo "Call".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class ServersController extends Controller
{
    public $attributeOrder = 't.id';

    public $nameModelRelated   = 'ServersServers';
    public $nameFkRelated      = 'id_proxy';
    public $nameOtherFkRelated = 'id_server';

    public function init()
    {
        $this->instanceModel        = new Servers;
        $this->abstractModel        = Servers::model();
        $this->titleReport          = Yii::t('zii', 'CallerID');
        $this->abstractModelRelated = ServersServers::model();
        parent::init();
    }

    public function setAttributesModels($attributes, $models)
    {
        $modelServer = Servers::model()->find([
            'condition' => 'type = "asterisk" AND status = 1 AND weight > 0',
            'order'     => 'last_call DESC',
        ]);
        if (isset($modelServer->id)) {
            $last_call = date("Y-m-d H:i:s", strtotime("-5 minutes", strtotime($modelServer->last_call)));

            $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
            for ($i = 0; $i < count($pkCount); $i++) {

                if ($attributes[$i]['status'] == 4) {
                    Servers::model()->updateByPk($attributes[$i]['id'], ['status' => 1]);
                }
                if ($attributes[$i]['type'] == 'asterisk' && $attributes[$i]['status'] > 0 && $attributes[$i]['weight'] > '0' && $attributes[$i]['last_call'] < $last_call) {
                    Servers::model()->updateByPk($attributes[$i]['id'], ['status' => 4]);
                }
            }
        }
        return $attributes;
    }

    public function afterSave($model, $values)
    {

        $modelServer = Servers::model()->findAll("type = 'sipproxy' AND status = 1");
        foreach ($modelServer as $key => $proxy) {

            $hostname = $proxy->host;
            $dbname   = 'opensips';
            $table    = 'dispatcher';
            $user     = $proxy->username;
            $password = $proxy->password;
            $port     = $proxy->port;

            $dsn = 'mysql:host=' . $hostname . ';dbname=' . $dbname;

            try {
                $con = new CDbConnection($dsn, $user, $password);
            } catch (Exception $e) {
                return;
            }

            $con->active = true;

            $sql = "TRUNCATE $dbname.$table";
            try {
                $con->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'errors'  => Yii::t('zii', 'The SIPPROXY have a error') . ' -> ' . $proxy->host . "</br>" . print_r($e)
                ]);
            }

            $modelServerAS = ServersServers::model()->findAll("id_proxy = :key", [':key' => $proxy->id]);

            if (isset($modelServerAS[0]->id_server)) {
                foreach ($modelServerAS as $key => $server) {

                    $modelServer = Servers::model()->find("id = :key AND (type = 'asterisk' OR type = 'mbilling')
                        AND status IN( 1,4) AND weight > 0", [':key' => $server->id_server]);

                    if (isset($modelServer->id)) {
                        if ($this->ip_is_private($hostname)) {
                            $sql = "INSERT INTO $dbname.$table (setid,destination,weight,description) VALUES ('1','sip:" . $modelServer->host . ":" . $modelServer->sip_port . "','" . $modelServer->weight . "','" . $modelServer->description . "')";
                        } else {
                            $sql = "INSERT INTO $dbname.$table (setid,destination,weight,description) VALUES ('1','sip:" . $modelServer->public_ip . ":" . $modelServer->sip_port . "','" . $modelServer->weight . "','" . $modelServer->description . "')";
                        }

                        try {
                            $con->createCommand($sql)->execute();
                        } catch (Exception $e) {
                            return;
                        }
                    }
                }
            } else {

                $modelServerAS = Servers::model()->findAll("(type = 'asterisk' OR type = 'mbilling')
                        AND status IN( 1,4) AND weight > 0");
                foreach ($modelServerAS as $key => $server) {

                    if ($this->ip_is_private($hostname)) {
                        $sql = "INSERT INTO $dbname.$table (setid,destination,weight,description) VALUES ('1','sip:" . $server->host . ":" . $server->sip_port . "','" . $server->weight . "','" . $server->description . "')";
                    } else {
                        $sql = "INSERT INTO $dbname.$table (setid,destination,weight,description) VALUES ('1','sip:" . $server->public_ip . ":" . $server->sip_port . "','" . $server->weight . "','" . $server->description . "')";
                    }

                    try {
                        $con->createCommand($sql)->execute();
                    } catch (Exception $e) {
                        return;
                    }
                }
            }
        }

        $this->generateSipFile();
    }

    public function generateSipFile()
    {

        if ($_SERVER['HTTP_HOST'] == 'localhost') {
            return;
        }
        $select = 'trunkcode, user, secret, disallow, allow, directmedia, context, dtmfmode, insecure, nat, qualify, type, host, fromdomain,fromuser, register_string,port,transport,encryption,sendrpid,maxuse,sip_config';
        $model  = Trunk::model()->findAll(
            [
                'select'    => $select,
                'condition' => 'providertech = :key AND status = 1',
                'params'    => [':key' => 'pjsip'],
            ]
        );

        if (count($model)) {
            AsteriskAccess::instance()->writeAsteriskFile($model, '/etc/asterisk/pjsip_magnus.conf', 'trunkcode');
        }
    }

    public function afterUpdateAll($strIds)
    {
        $this->generateSipFile();
        return;
    }

    public function afterDestroy($values)
    {
        $this->generateSipFile();
    }

    public function ip_is_private($ip)
    {
        $pri_addrs = [
            '10.0.0.0|10.255.255.255', // single class A network
            '172.16.0.0|172.31.255.255', // 16 contiguous class B network
            '192.168.0.0|192.168.255.255', // 256 contiguous class C network
            '169.254.0.0|169.254.255.255', // Link-local address also refered to as Automatic Private IP Addressing
            '127.0.0.0|127.255.255.255', // localhost
        ];

        $long_ip = ip2long($ip);
        if ($long_ip != -1) {

            foreach ($pri_addrs as $pri_addr) {
                list($start, $end) = explode('|', $pri_addr);

                // IF IS PRIVATE
                if ($long_ip >= ip2long($start) && $long_ip <= ip2long($end)) {
                    return true;
                }
            }
        }

        return false;
    }
}
