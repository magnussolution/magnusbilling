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
class Process
{

    public static function isActive()
    {
        $pid = Process::getPID();
        if ( ! is_dir('/var/run/magnus/')) {

            if (mkdir('/var/run/magnus/', 0755, true)) {
                echo "Diretório criado com sucesso: /var/run/magnus/.";
            }
        }
        if ($pid == null) {
            $ret = false;
        } else {
            $ret = posix_kill($pid, 0);
        }

        if ($ret == false) {
            Process::activate();
        }

        return $ret;
    }

    public static function activate()
    {
        $pidfile = PID;
        $pid     = Process::getPID();

        if ($pid != null && $pid == getmypid()) {
            return "Already running!\n";
        } else {
            $fp = fopen($pidfile, "w+");
            if ($fp) {
                if ( ! fwrite($fp, "<" . "?php\n\$pid = " . getmypid() . ";\n?" . ">")) {
                    die("Can not create pid file!\n");
                }

                fclose($fp);
            } else {
                die("Can not create pid file!\n");
            }
        }
    }

    public static function getPID()
    {
        if (file_exists(PID)) {
            require PID;
            return $pid;
        } else {
            return null;
        }
    }
}
