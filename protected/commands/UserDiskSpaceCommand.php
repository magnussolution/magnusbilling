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

//5 5 * * php /var/www/html/mbilling/cron.php UserDiskSpace
class UserDiskSpaceCommand extends ConsoleCommand
{

    public $titleReport;
    public $subTitleReport;
    public $fieldsCurrencyReport;
    public $fieldsPercentReport;
    public $rendererReport;
    public $fieldsFkReport;

    public function run($args)
    {
        ini_set("memory_limit", "-1");
        $modelUser = User::model()->findAll('disk_space > 0');

        foreach ($modelUser as $user) {
            $userDiskSpace = $user->disk_space;

            $directory = '/var/spool/asterisk/monitor/' . escapeshellarg($user->username) . '/';
            //delete record less than 10k. About 5 seconds.
            LinuxAccess::exec('find ' . escapeshellarg($directory) . ' -size -10k -delete');

            $totalDiskSpave = LinuxAccess::getDirectoryDiskSpaceUsed('*', escapeshellarg($directory));
            $totalMonitorGB = is_numeric($totalDiskSpave) ? $totalDiskSpave / 1000000000 : 0;

            if ($totalMonitorGB > $userDiskSpace) {
                echo 'Superou ' . $userDiskSpace . ' ' . $totalMonitorGB . "\n";
            } else {
                echo "User have disk space\n";
                continue;
            }

            $lastFile = LinuxAccess::getLastFileInDirectory('*', $directory);

            if (file_exists($lastFile)) {
                $lastFileTime = filemtime($lastFile);

                echo "Older file found=" . date('Y-m-d', $lastFileTime) . "\n";
                $lastFileTime += 604800;
                echo "DELETE files from 7 days after " . date('Y-m-d', $lastFileTime) . "\n";
                LinuxAccess::exec('find ' . escapeshellarg($directory) . ' -not -newermt "' . date('Y-m-d', escapeshellarg($lastFileTime)) . '" -delete');
            } else {
                continue;
            }

            $mail = new Mail(Mail::$TYPE_USER_DISK_SPACE, $user->id);
            $mail->replaceInEmail(Mail::$TIME_DELETE, date('Y-m-d', $lastFileTime));
            $mail->replaceInEmail(Mail::$ACTUAL_DISK_USAGE, $totalMonitorGB);
            $mail->replaceInEmail(Mail::$DISK_USADE_LIMIT, $userDiskSpace);
            try {
                $mail->send();
            } catch (Exception $e) {
                //error SMTP
            }

            if ($this->config['global']['admin_received_email'] == 1 && strlen($this->config['global']['admin_email'])) {
                try {
                    $mail->send($this->config['global']['admin_email']);
                } catch (Exception $e) {

                }
            }
        }
    }
}
