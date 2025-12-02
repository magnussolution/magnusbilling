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
class FailtwobanipCommand extends ConsoleCommand
{
    protected $resultBanIps = [];
    protected $resultUnBanIps = [];
    protected $ignogeips = 'ignoreip = 127.0.0.1 ';
    protected $ssh_port = 22;
    public function run($args)
    {

        /*
        sed -i 's/ssh-iptables/sshd/g' /etc/fail2ban/jail.local 


        echo "[ip-blacklist]
enabled   = true
maxretry  = 0
findtime  = 15552000
bantime   = -1" >> /etc/fail2ban/jail.local

echo "[Definition]
failregex = ^<HOST> \[.*\]$
ignoreregex =
" > /etc/fail2ban/filter.d/ip-blacklist.conf 

        systemctl restart fail2ban
        fail2ban-client status
        

        cd /root/.ssh
        ssh-keygen -t rsa -N "" -f id_rsa
        cat ~/.ssh/id_rsa.pub

        add the ~/.ssh/id_rsa.pub on /root/.ssh/authorized_keys of the proxy and slaves.
        */

        $action = [
            ['0', 'Temp ban'],
            ['1', 'Permanent ban'],
            ['3', 'Unban'],
            ['5', 'Add to IgnoreIP']
        ];


        if (isset($args[0])) {
            $this->ssh_port = $args[0];
        }

        //only execute this script if the admin is logged on magnusbilling
        $sql = "SELECT count(id) as logged FROM pkg_log where id_log_actions = 1 AND date >= NOW() - INTERVAL (SELECT config_value FROM pkg_configuration WHERE config_key = 'session_timeout') SECOND AND id_user IN (SELECT id FROM pkg_user WHERE id_group IN (SELECT id FROM pkg_group_user WHERE id_user_type = 1))";
        $command = Yii::app()->db->createCommand($sql);
        $resultAdmins = $command->queryAll();
        if ($resultAdmins[0]['logged']  == 0) {
            echo "Admin not logged\n";
            return;
        }

        //get all ips that action is 3 (to unban)
        $sql     = 'SELECT ip FROM pkg_firewall WHERE action = 3';
        $command = Yii::app()->db->createCommand($sql);
        $this->resultUnBanIps = $command->queryAll();


        //delete all that already added on $this->resultUnBanIps
        foreach ($this->resultUnBanIps as  $unbanIP) {
            $sql     = 'DELETE FROM pkg_firewall WHERE ip = "' . $unbanIP['ip'] . '"';
            Yii::app()->db->createCommand($sql)->execute();
        }

        //get all ips that action is 1  (Permanent ban)
        $sql     = 'SELECT ip FROM pkg_firewall WHERE action = 1';
        $command = Yii::app()->db->createCommand($sql);
        $this->resultBanIps = $command->queryAll();

        //get all ips that action is 5  (Add to IgnoreIP) and add it to $this->ignogeips
        $sql     = 'SELECT ip FROM pkg_firewall WHERE action = 5';
        $command = Yii::app()->db->createCommand($sql);
        $modelServersIgnoreIPs = $command->queryAll();

        foreach ($modelServersIgnoreIPs as $key => $server) {
            $ip = trim($server['ip']);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                $this->ignogeips .= $ip . ' ';
            }
        }

        //get all ips of the clients and add it to $this->ignogeips
        $sql     = 'SELECT host FROM pkg_sip JOIN pkg_user ON pkg_sip.id_user = pkg_user.id  WHERE pkg_user.active = 1 AND host !=  "dynamic"';
        $command = Yii::app()->db->createCommand($sql);
        $modelServersIgnoreIPsSips = $command->queryAll();

        foreach ($modelServersIgnoreIPsSips as $key => $server) {
            $ip = trim($server['host']);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                $this->ignogeips .= $ip . ' ';
            }
        }

        //get all ips of the trunks and add it to $this->ignogeips
        $sql     = 'SELECT host FROM pkg_trunk WHERE status = 1 AND host !=  "dynamic"';
        $command = Yii::app()->db->createCommand($sql);
        $modelServersIgnoreIPstrunks = $command->queryAll();

        foreach ($modelServersIgnoreIPs as $key => $server) {
            $ip = trim($server['host']);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                $this->ignogeips .= $ip . ' ';
            }
        }


        echo "\n\nresultUnBanIps";
        print_r($this->resultUnBanIps);

        echo "\nresultBanIps";
        print_r($this->resultBanIps);

        //truncate the table
        $sql = 'TRUNCATE TABLE pkg_firewall';
        Yii::app()->db->createCommand($sql)->execute();


        //insert all the ips with status 5 (IgnoreIP) again to the table
        foreach ($modelServersIgnoreIPs as $key => $server) {

            if (strlen($server['ip']) > 5) {
                $sql = "INSERT INTO pkg_firewall (ip,action, date, description, jail, id_server) VALUES ('" . $server['ip'] . "',5, NOW(), '','IgnoreIP','1')";
                echo $sql . "\n";
                try {
                    Yii::app()->db->createCommand($sql)->execute();
                } catch (Exception $e) {
                }
            }
        }


        $modelServers = Servers::model()->findAll('status IN (1,3,4)');

        //if there no server, add the localhost
        if (! isset($modelServers[0])) {

            $modelServers = new Servers;


            $modelServers->name     = 'Master';
            $modelServers->host     = 'localhost';
            $modelServers->type     = 'mbilling';
            $modelServers->port = '5038';
            $modelServers->username = 'magnus';
            $modelServers->password = 'magnussolution';
            $modelServers->status = '1';
            $modelServers->description = '1';
            $modelServers->save();
            $modelServers = Servers::model()->findAll('status IN (1,3,4)');
        }
        //include all the servers on $this->ignogeips
        foreach ($modelServers as $key => $server) {
            if ($server['host'] != 'localhost') {
                $ip = trim($server['host']);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    $this->ignogeips .= $ip . ' ';
                }
            }
        }

        //loop for all the servers to process the data
        foreach ($modelServers as $key => $server) {

            if ($server['type'] == 'sipproxy') {

                $this->getLinesCommand('ip-blacklist', 1, $server);
                $this->getLinesCommand('opensips-iptables', 0, $server);
            } else {

                $this->getLinesCommand('ip-blacklist', 1, $server);
                $this->getLinesCommand('asterisk-iptables', 0, $server);
                $this->getLinesCommand('sshd', 0, $server);
            }
        }
    }

    public function getLinesCommand($command, $action = 0, $server)
    {


        //if is master server
        if ($server['type'] == 'mbilling') {

            echo   "master\n\n\n";

            //add the ignore ips to jail.local and reload fail2ban
            shell_exec("sed -i 's/^ignoreip = .*/" . $this->ignogeips . "/' /etc/fail2ban/jail.local");
            shell_exec("systemctl reload fail2ban");

            //unban all the ips of $this->resultUnBanIps
            foreach ($this->resultUnBanIps as  $unbanIP) {

                $ip = trim($unbanIP['ip']);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {

                    echo "unbanip IP " .  $ip . " on MASTER\n";
                    @shell_exec("sudo fail2ban-client unban " .  $ip);
                }
            }

            //if command is ip-blacklist 
            if ($command == 'ip-blacklist') {

                foreach ($this->resultBanIps as  $blokedIP) {

                    $ip = trim($blokedIP['ip']);
                    if (!filter_var($ip, FILTER_VALIDATE_IP)) {

                        continue;
                    }

                    //ban the ip on ip-blacklist jail
                    $status = shell_exec("fail2ban-client set ip-blacklist banip " . $ip);


                    //check if exist on the table pkg_firewall
                    $sqlCheck = "SELECT COUNT(*) FROM pkg_firewall WHERE ip = '" . $ip . "' AND id_server = '" . $server['id'] . "'";
                    $exists = Yii::app()->db->createCommand($sqlCheck)->queryScalar();
                    if ($exists > 0) {
                        continue;
                    }

                    //if not exist, add it
                    $sql = "INSERT INTO pkg_firewall (ip,action, date, description, jail, id_server) VALUES ('" . $ip . "',1, NOW(), '" . $server['name'] . "','$command','" . $server['id'] . "')";
                    echo $sql . "\n";
                    try {
                        Yii::app()->db->createCommand($sql)->execute();
                    } catch (Exception $e) {
                    }
                }
            }
            //get all ips banned on the jail
            $status = shell_exec("fail2ban-client status " . $command);
        } else {



            $host = trim($server['host']);


            echo $host . "\n\n\n";
            $this->ssh_port = strlen($server['description']) ? intval($server['description']) : $this->ssh_port;
            if (filter_var($host, FILTER_VALIDATE_IP)) {




                //if is a Slave or proxy execute the commands via SSH


                //add the ignore ips to jail.local and reload fail2ban
                @shell_exec('ssh -o StrictHostKeyChecking=no root@' . $host . ' -p ' . (int) $this->ssh_port . ' "sed -i \'s/^ignoreip = .*/' . $this->ignogeips . '/\' /etc/fail2ban/jail.local" ');
                @shell_exec('ssh -o StrictHostKeyChecking=no root@' . $host . ' -p ' . (int) $this->ssh_port . ' "systemctl reload fail2ban"');
            }
            foreach ($this->resultUnBanIps as  $unbanIP) {

                $ip = trim($unbanIP['ip']);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {

                    //unban all the ips of $this->resultUnBanIps
                    echo "unbanip IP " .  $ip . " on " . $host . "\n";
                    @shell_exec('ssh -o StrictHostKeyChecking=no root@' . $host . ' -p ' . (int)$this->ssh_port . ' "fail2ban-client unban ' . $ip . '" ');
                }
            }


            //if command is ip-blacklist 

            if ($command == 'ip-blacklist') {


                foreach ($this->resultBanIps as  $blokedIP) {

                    $ip = trim($blokedIP['ip']);
                    if (filter_var($ip, FILTER_VALIDATE_IP)) {
                        continue;
                    }

                    //ban the ip on ip-blacklist jail
                    $status =  shell_exec('ssh -o StrictHostKeyChecking=no root@' . $host . ' -p ' . (int) $this->ssh_port . ' "fail2ban-client set ip-blacklist banip ' . $ip . '" ');

                    //check if exist on the table pkg_firewall
                    $sqlCheck = "SELECT COUNT(*) FROM pkg_firewall WHERE ip = '" . $ip . "' AND id_server = '" . $server['id'] . "'";
                    $exists = Yii::app()->db->createCommand($sqlCheck)->queryScalar();
                    if ($exists > 0) {
                        continue;
                    }
                    //if not exist, add it
                    $sql = "INSERT INTO pkg_firewall (ip,action, date, description, jail, id_server) VALUES ('" . $blokedIP['ip'] . "',1, NOW(), '" . $server['name'] . "','$command','" . $server['id'] . "')";
                    echo $sql . "\n";
                    try {
                        Yii::app()->db->createCommand($sql)->execute();
                    } catch (Exception $e) {
                    }
                }
            }
            //get all ips banned on the jail
            $status =  shell_exec('ssh -o StrictHostKeyChecking=no root@' . $host . ' -p ' . (int)$this->ssh_port . ' "fail2ban-client status ' . $command . '" ');
        }

        //get all the ips banned
        preg_match('/Banned IP list:\s*(.*)/', $status, $ipMatches);

        //if there no ips, return
        if (!isset($ipMatches[1]) || empty($ipMatches[1])) {
            return;
        }

        $ips = array_filter(array_map('trim', explode(' ', $ipMatches[1])));


        foreach ($ips as $ip) {
            //insert the ips on the table.
            $sql = "INSERT INTO pkg_firewall (ip,action, date, description, jail, id_server) VALUES ('$ip',$action, NOW(), '" . $server['name'] . "','$command','" . $server['id'] . "')";

            echo $sql . "\n";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
            }
        }
    }
}
