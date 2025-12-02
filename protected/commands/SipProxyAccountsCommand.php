<?php
/**
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
 *
 */
//not check credit and send call to any number, active or inactive
class SipProxyAccountsCommand extends ConsoleCommand
{
    public function run($args)
    {

        $modelServers = Servers::model()->findAll('type = "asterisk" AND status IN (1,3,4) AND weight > 0');
        foreach ($modelServers as $key => $server) {
            if ($server->last_call_id > 0) {
                $modelCall = Call::model()->findBySql('SELECT id,starttime FROM pkg_cdr WHERE id > :key1 AND id_server = :key ORDER BY id DESC LIMIT 1', [
                    'key'   => $server->id,
                    ':key1' => $server->last_call_id,
                ]);
            } else {
                $modelCall = Call::model()->findBySql('SELECT id,starttime  FROM pkg_cdr WHERE starttime > :key1 AND id_server = :key LIMIT 1', [
                    'key'   => $server->id,
                    ':key1' => date('Y-m-d'),
                ]);
            }
            if (isset($modelCall->id)) {
                $server->last_call    = $modelCall->starttime;
                $server->last_call_id = $modelCall->id;
                $server->save();
            }
        }

        $modelSip     = Sip::model()->findAll();
        $modelTrunk   = Trunk::model()->findAll();
        $modelDid     = Did::model()->findAll('activated = 1 AND reserved > 0 AND id_server > 0');
        $modelServers = Servers::model()->findAll('type = "sipproxy" AND status = 1');

        foreach ($modelServers as $key => $server) {

            $hostname = $server->host;
            $dbname   = 'opensips';
            $table    = 'subscriber';
            $user     = $server->username;
            $password = $server->password;
            $port     = $server->port;

            if (filter_var($server->public_ip, FILTER_VALIDATE_IP)) {
                $remoteProxyIP = $server->public_ip;

            } else if (preg_match("/\|/", $server->description)) {
                $remoteProxyIP = explode("|", $server->description);
                $remoteProxyIP = end($remoteProxyIP);
                if ( ! filter_var($remoteProxyIP, FILTER_VALIDATE_IP)) {
                    $remoteProxyIP = $hostname;
                }
            } else {
                $remoteProxyIP = $server->host;
            }

            $sqlproxy = 'TRUNCATE subscriber;';
            $sqlproxy .= "TRUNCATE domain;";
            $sqlproxy .= "INSERT INTO $dbname.domain (domain) VALUES ('" . $remoteProxyIP . "');";
            $sqlproxy .= "INSERT INTO $dbname.$table (username,domain,password,ha1,accountcode,trace,cpslimit) VALUES ";
            $sqlproxyadd = 'TRUNCATE address;';
            $sqlproxyadd .= "INSERT INTO $dbname.address (grp,ip,port,context_info) VALUES ";
            $sqlDid = 'TRUNCATE did;';
            $sqlDid .= "INSERT INTO $dbname.did (did,server,destination) VALUES ";

            $dsn = 'mysql:host=' . $hostname . ';dbname=' . $dbname;

            $con               = new CDbConnection($dsn, $user, $password);
            $con->active       = true;
            $techprefix_length = $this->config['global']['ip_tech_length'];

            $sql = "CREATE TABLE IF NOT EXISTS `did` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `did` varchar(20) DEFAULT NULL,
                `server` varchar(20) DEFAULT NULL,
                `destination` varchar(200) DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `did` (`did`),
                KEY `server` (`server`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            ";
            try {
                $con->createCommand($sql)->execute();
            } catch (Exception $e) {
                //
            }

            foreach ($modelTrunk as $key => $trunk) {
                $sqlproxyadd .= "('0', '$trunk->host','0', '" . $trunk->trunkcode . '|' . $trunk->trunkcode . '|500|0|' . $techprefix_length . "'),";
            }
            foreach ($modelSip as $key => $sip) {

                if ($sip->host == 'dynamic') {
                    $sqlproxy .= " ('" . $sip->defaultuser . "', '$remoteProxyIP','" . $sip->secret . "','" . md5($sip->defaultuser . ':' . $remoteProxyIP . ':' . $sip->secret) . "', '" . $sip->idUser->username . "', '" . $sip->trace . "','" . $sip->idUser->cpslimit . "'),";
                } else {
                    $sqlproxyadd .= "('0', '$sip->host','0', '" . $sip->idUser->username . '|' . $sip->name . '|' . $sip->idUser->cpslimit . '|' . $sip->techprefix . '|' . $techprefix_length . "'),";
                }
            }

            foreach ($modelDid as $key => $did) {

                if (isset($did->idServer->name)) {

                    $modelDidDestination = Diddestination::model()->find('id_did = :key', [':key' => $did->id]);

                    $destination = isset($modelDidDestination->idSip->name) ? $modelDidDestination->idSip->name : '';
                    $sqlDid .= "('$did->did','" . $did->idServer->host . ":" . $did->idServer->sip_port . "', '" . $destination . "' ),";
                }
            }

            $sql = "ALTER TABLE subscriber ADD  cpslimit INT( 11 ) NOT NULL DEFAULT  '-1'";
            try {
                $con->createCommand($sql)->execute();
            } catch (Exception $e) {
                //
            }

            $sqlproxy = substr($sqlproxy, 0, -1) . ';';
            try {
                $con->createCommand($sqlproxy)->execute();
            } catch (Exception $e) {
                print_r($e);
            }

            $sqlproxyadd = substr($sqlproxyadd, 0, -1) . ';';
            try {
                $con->createCommand($sqlproxyadd)->execute();
            } catch (Exception $e) {
                print_r($e);
            }

            $sqlDid = substr($sqlDid, 0, -1) . ';';

            echo $sqlDid . "\n";
            try {
                $con->createCommand($sqlDid)->execute();
            } catch (Exception $e) {
                print_r($e);
            }

        }

    }
}
