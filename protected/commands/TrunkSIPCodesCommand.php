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
class TrunkSIPCodesCommand extends ConsoleCommand
{
    public function run($args)
    {

        $time = time();

        $cache_path = '/tmp/cache_mbilling_codes.sqlite';
        unlink($cache_path);
        $fields = "data,ip,code,msg";
        try {
            $db = new SQLite3($cache_path);
            $db->exec('CREATE TABLE IF NOT EXISTS sipcodes (' . $fields . ');');
        } catch (Exception $e) {
        }

        if (! file_exists('/var/log/asterisk/magnus_processed ')) {

            file_put_contents('/var/log/asterisk/magnus_processed', '');
        }

        copy('/var/log/asterisk/magnus', '/var/log/asterisk/magnus_new');

        $lines = LinuxAccess::exec('diff -u /var/log/asterisk/magnus_processed /var/log/asterisk/magnus_new');

        unlink('/var/log/asterisk/magnus_processed');
        rename('/var/log/asterisk/magnus_new', '/var/log/asterisk/magnus_processed');

        $values = '';

        $i = 0;
        foreach ($lines as $key => $line) {

            preg_match_all('/\[(.*)\] DEBUG.*\<sip\:.*@(.*)\>.*\|(.*)\|(.*)/', $line, $output_array);

            if (count($output_array) < 4 || ! isset($output_array[1][0])) {

                continue;
            }

            $output_array[4][0] = preg_replace("/'/", '', $output_array[4][0]);

            $values .= "('" . $output_array[1][0] . "','" . $output_array[2][0] . "','" . $output_array[3][0] . "','" . $output_array[4][0] . "'),";

            if ($i == 200) {

                $sql = "INSERT INTO sipcodes ($fields) VALUES " . substr($values, 0, -1);
                try {
                    $db->exec($sql);
                } catch (Exception $e) {
                    //
                }
                $values = '';
                $i      = 0;
            } else {
                $i++;
            }
        }

        if ($i < 200 && $i > 0) {

            $sql = "INSERT INTO sipcodes ($fields) VALUES " . substr($values, 0, -1);
            try {
                $db->exec($sql);
            } catch (Exception $e) {
                //
            }
            $values = '';
            $i      = 0;
        }

        $sql    = "SELECT ip FROM sipcodes GROUP BY ip";
        $result = $db->query($sql);
        while ($ip = $result->fetchArray(SQLITE3_ASSOC)) {

            $sql         = "SELECT count(code) as total, code FROM sipcodes WHERE ip = '" . $ip['ip'] . "' GROUP BY code";
            $resultCodes = $db->query($sql);
            while ($code = $resultCodes->fetchArray(SQLITE3_ASSOC)) {

                $sql        = "SELECT id FROM pkg_trunk WHERE host = '" . $ip['ip'] . "' ";
                $modelTrunk = Yii::app()->db->createCommand($sql)->queryAll();
                if (isset($modelTrunk[0]['id'])) {
                    $sql = "INSERT INTO pkg_trunk_error (ip, code,total) VALUES ( '" . $ip['ip'] . "', '" . $code['code'] . "', '" . $code['total'] . "')";
                    try {
                        Yii::app()->db->createCommand($sql)->execute();
                    } catch (Exception $e) {

                        $sql = "UPDATE pkg_trunk_error SET total = total + " . $code['total'] . " WHERE ip = '" . $ip['ip'] . "' AND code = '" . $code['code'] . "'";
                        try {
                            Yii::app()->db->createCommand($sql)->execute();
                        } catch (Exception $e) {
                            print_r($e);
                        }
                    }
                }
            }
        }
    }
}
