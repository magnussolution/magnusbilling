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
class FirewalldCommand extends ConsoleCommand
{
    public function run($args)
    {

        for (;;) {
            if (date('i') == 59) {
                break;
            }
            $sql    = "SELECT * FROM pkg_ip_list_entries WHERE status = 1";
            $result = Yii::app()->db->createCommand($sql)->queryAll();

            if (isset($result[0]['id'])) {

                foreach ($result as $key => $ip) {


                    $sql = "UPDATE pkg_ip_list_entries SET status = 0 WHERE id = :key";
                    $command = Yii::app()->db->createCommand($sql);
                    $command->bindValue(':key', $ip['id'], PDO::PARAM_INT);
                    $command->execute();

                    if (filter_var($ip['ip_address'], FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                        $addr = escapeshellarg($ip['ip_address']);
                        if ($ip['ip_list_id'] == 'Whitelist') {
                            shell_exec('sudo firewall-cmd --zone=public --add-rich-rule=" rule family=\"ipv4\" source address=\"' . $addr . '\" port protocol=\"tcp\" port=\"443\" accept" --permanent');
                            shell_exec('sudo firewall-cmd --zone=public --add-rich-rule=" rule family=\"ipv4\" source address=\"' . $addr . '\" port protocol=\"tcp\" port=\"80\" accept" --permanent');
                        } else if ($ip['ip_list_id'] == 'Blacklist') {
                            shell_exec('sudo firewall-cmd --zone=public --remove-rich-rule=" rule family=\"ipv4\" source address=\"' . $addr . '\" port protocol=\"tcp\" port=\"443\" accept" --permanent');
                            shell_exec('sudo firewall-cmd --zone=public --remove-rich-rule=" rule family=\"ipv4\" source address=\"' . $addr . '\" port protocol=\"tcp\" port=\"80\" accept" --permanent');
                        }

                        shell_exec('firewall-cmd --reload');
                    }
                }
            } else {
                sleep(1);
            }
        }
    }
}
