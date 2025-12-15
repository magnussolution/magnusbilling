<?php

/**
 * Classe de com funcionalidades globais
 *
 * MagnusBilling <info@magnusbilling.com>
 * 08/07/2017
 */

class LinuxAccess
{

    public static function exec($command)
    {
        if ($command != 'diff -u /var/log/asterisk/magnus_processed /var/log/asterisk/magnus_new') {
            file_put_contents(
                Yii::getPathOfAlias('application.runtime') . '/linux_exec.log',
                date('Y-m-d H:i:s') . ' - LinuxAccess::exec -> ' . $command . print_r($_REQUEST, true) .   "\n",
                FILE_APPEND
            );
        }
        exec($command, $output);
        return $output;
    }

    public static function getDirectoryDiskSpaceUsed($filter = '*', $directory = '/var/spool/asterisk/monitor/')
    {
        $command = 'ls -lR  ' . escapeshellarg($directory) . escapeshellarg($filter) . ' | grep -v \'^d\' | awk \'{total += $5} END {print total}\'';
        return @self::exec($command);
    }

    public static function getLastFileInDirectory($filter = '*', $directory = '/var/spool/asterisk/monitor/')
    {
        $command = 'ls -tr ' . escapeshellarg($directory) . escapeshellarg($filter) . ' | head -n 1';
        return @self::exec($command);
    }
}
