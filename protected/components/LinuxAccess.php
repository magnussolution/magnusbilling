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

        Yii::log('LinuxAccess::exec -> ' . $command, 'error');
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
