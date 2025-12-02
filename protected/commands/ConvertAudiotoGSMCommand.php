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
 *
 * Add this command on /etc/crontab as root
 *
 * php /var/www/html/mbilling/cron.php ConvertAudiotoGSM
 *
 *
 */
class ConvertAudiotoGSMCommand extends ConsoleCommand
{
    private $diretory = "/usr/local/src/magnus/sounds/";

    public function run($args)
    {
        $audios = $this->scan_dir($this->diretory, 1);
        if (is_array($audios)) {

            foreach ($audios as $key => $audio) {

                echo 'Convert ' . $audio . " to GSM\n";
                LinuxAccess::exec('sox ' . $this->diretory . $audio . ' ' . $this->diretory . substr($audio, 0, -4) . '.gsm');
                unlink($this->diretory . $audio);
            }
        }

    }

    public function scan_dir($dir)
    {

        $files = [];
        foreach (scandir($dir) as $file) {
            if (substr($file, -4) != '.wav') {
                continue;
            }

            $files[$file] = filemtime($dir . '/' . $file);
        }

        arsort($files);
        $files = array_keys($files);

        return ($files) ? $files : false;
    }
}
