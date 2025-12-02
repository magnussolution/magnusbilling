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
class ImportCdrCSV_CCommand extends CConsoleCommand
{
    public function run($args)
    {

        if (isset($args[0])) {
            $modelServers = Servers::model()->find('host = :key', [':key' => $args[0]]);
            if (isset($modelServers->id)) {
                $server_set = ' SET id_server = ' . $modelServers->id;
            }
        } else {
            $server_set = '';
        }


        exec('mkdir -p /var/log/asterisk/cdr-csv/');
        $archive = false;

        $configFile = '/etc/odbc.ini';
        $array      = parse_ini_file($configFile);
        $server     = $array['Server'];
        $database   = $array['Database'];

        $configFile = '/etc/asterisk/res_odbc.conf';
        $array      = parse_ini_file($configFile);

        $user = $array['username'];
        $pass = $array['password'];

        $dsn = 'mysql:host=' . $server . ';dbname=' . $database;

        $con         = new CDbConnection($dsn, $user, $pass);
        $con->active = true;
        $time        = time();

        $sql = "SHOW VARIABLES LIKE 'secure_file_priv'";
        $result2 = Yii::app()->db->createCommand($sql)->queryAll();

        if (isset($result2[0]['Value']) && $result2[0]['Value'] != '' || (isset($args[1]) && $args[1] == 'LOCAL')) {
            $local_command = 'LOCAL';
        } else {
            $local_command = '';
        }

        if (file_exists('/var/log/asterisk/cdr-csv/MBilling_Offer.csv')) {
            exec('mv /var/log/asterisk/cdr-csv/MBilling_Offer.csv /var/log/asterisk/cdr-csv/MBilling_Offer_' . $time . '.csv');
            $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/MBilling_Offer_" . $time . ".csv' INTO TABLE pkg_offer_cdr FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (id_user, id_offer, used_secondes)";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                print_r($e);
            }

            exec("rm -rf /var/log/asterisk/cdr-csv/MBilling_Offer_" . $time . ".csv");
        }

        if (file_exists('/var/log/asterisk/cdr-csv/MBilling_CallShop.csv')) {
            exec('mv /var/log/asterisk/cdr-csv/MBilling_CallShop.csv /var/log/asterisk/cdr-csv/MBilling_Success_CallShop_' . $time . '.csv');
            $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/MBilling_Success_CallShop_" . $time . ".csv' INTO TABLE pkg_callshop FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (sessionid, id_user, status, price, buycost, calledstation, destination,price_min, cabina, sessiontime)";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                print_r($e);
            }

            exec("rm -rf /var/log/asterisk/cdr-csv/MBilling_Success_CallShop_" . $time . ".csv");
        }

        if ($result = $this->scan_dir('/var/log/asterisk/cdr-csv/', 1)) {

            foreach ($result as $file) {
                if (preg_match('/^MBilling_/', $file) && file_exists('/var/log/asterisk/cdr-csv/' . $file)) {

                    if (preg_match('/^MBilling_Success/', $file)) {
                        $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/" . $file . "' IGNORE INTO TABLE pkg_cdr FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (uniqueid,callerid,starttime,id_user,id_plan,src,id_prefix,id_trunk,calledstation,buycost,sessionbill,sessiontime,real_sessiontime,agent_bill,sipiax,id_campaign,terminatecauseid)  $server_set ";
                    } else if (preg_match('/^MBilling_Failed/', $file)) {
                        $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/" . $file . "' IGNORE INTO TABLE pkg_cdr_failed FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (uniqueid,callerid,starttime,id_user,id_plan,src,id_prefix,id_trunk,calledstation,terminatecauseid,hangupcause)  $server_set ";
                    }

                    try {
                        Yii::app()->db->createCommand($sql)->execute();
                        exec("rm -rf /var/log/asterisk/cdr-csv/" . $file);
                    } catch (Exception $e) {
                        print_r($e);
                    }
                }
            }
        }

        if (file_exists('/var/log/asterisk/cdr-csv/MBilling_Success.csv')) {

            exec('mv /var/log/asterisk/cdr-csv/MBilling_Success.csv /var/log/asterisk/cdr-csv/MBilling_Success_' . $time . '.csv');
            $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/MBilling_Success_" . $time . ".csv' IGNORE INTO TABLE pkg_cdr FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (uniqueid,callerid,starttime,id_user,id_plan,src,id_prefix,id_trunk,calledstation,buycost,sessionbill,sessiontime,real_sessiontime,agent_bill,sipiax,id_campaign,terminatecauseid)  $server_set ";
            try {
                Yii::app()->db->createCommand($sql)->execute();

                if ($archive == true) {
                    exec("mv /var/log/asterisk/cdr-csv/MBilling_Success_" . $time . ".csv /tmp/");
                } else {
                    exec("rm -rf /var/log/asterisk/cdr-csv/MBilling_Success_" . $time . ".csv");
                }
            } catch (Exception $e) {
                print_r($e);
            }
        }

        if (file_exists('/var/log/asterisk/cdr-csv/MBilling_Failed.csv')) {

            exec("mv /var/log/asterisk/cdr-csv/MBilling_Failed.csv /var/log/asterisk/cdr-csv/MBilling_Failed_" . $time . ".csv");
            $sql = "LOAD DATA " . $local_command . " INFILE '/var/log/asterisk/cdr-csv/MBilling_Failed_" . $time . ".csv' IGNORE INTO TABLE pkg_cdr_failed FIELDS TERMINATED BY ','  LINES TERMINATED BY '\n'  (uniqueid,callerid,starttime,id_user,id_plan,src,id_prefix,id_trunk,calledstation,terminatecauseid,hangupcause)  $server_set ";
            try {
                Yii::app()->db->createCommand($sql)->execute();
                if ($archive == true) {
                    exec("mv /var/log/asterisk/cdr-csv/MBilling_Failed_" . $time . ".csv /tmp/");
                } else {
                    exec("rm -rf /var/log/asterisk/cdr-csv/MBilling_Failed_" . $time . ".csv");
                }
            } catch (Exception $e) {
                print_r($e);
            }
        }

        $con = null;
    }

    public function scan_dir($dir)
    {

        $ignored = ['.', '..', '.svn', '.htaccess', 'MBilling_Failed.csv', 'MBilling_Success.csv'];

        $files = [];
        foreach (scandir($dir) as $file) {
            if (in_array($file, $ignored)) {
                continue;
            }
            if (! preg_match('/^MBilling_/', $file)) {
                if ($file != 'Master.csv' && $file != 'error.csv') {
                    exec('rm -rf /var/log/asterisk/cdr-csv/' . $file);
                }
                continue;
            }
            $files[$file] = filemtime($dir . '/' . $file);
        }

        arsort($files);
        $files = array_keys($files);

        return ($files) ? $files : false;
    }
}
