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

/*
yum -y install mpg123 perl perl-libwww-perl sox cpan
yum -y install perl-LWP-Protocol-https
yum -y install perl-JSON flac
 */
class Tts
{
    public static function create($string)
    {
        $config = LoadConfig::getConfig();

        $name = urlencode($string);

        $file = 'tts_audio_' . MD5(escapeshellarg($string));

        if ( ! file_exists('/tmp/' . $file . '.wav')) {

            $tts_url = escapeshellarg(preg_replace('/\$name/', $name, $config['global']['tts_url']));

            if (preg_match("/ttsgo/", $tts_url)) {

                $ch = curl_init();
                //Caso tenha dificuldade com a requisição via HTTPS, descomente a linha abaixo
                //curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
                curl_setopt($ch, CURLOPT_URL, $tts_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $retorno = curl_exec($ch);

                $objJson = json_decode($retorno);

                $agi->verbose(print_r($objJson->url, true));
                $fp = fopen('/tmp/' . $file . '.wav', 'w');
                fwrite($fp, file_get_contents($objJson->url));
                fclose($fp);
                LinuxAccess::exec('sox /tmp/' . $file . '.wav -c 1 -r 8000 /tmp/' . $file . '.sln && rm -rf /tmp/' . $file . '.wav');

            } else {
                if (preg_match("/google/", $tts_url)) {
                    $token = Tts::make_token($name);

                    $tts_url = preg_replace('/\$token/', $token, $tts_url);
                }
                system("wget -q -U Mozilla -O \"/tmp/$file.mp3\" \"$tts_url\"");
                system("mpg123 -w /tmp/$file.wav /tmp/$file.mp3 && rm -rf /tmp/$file.mp3");
                system("sox -v 2.0 /tmp/$file.wav /tmp/$file2.wav && rm -rf /tmp/$file.wav");
                system("sox /tmp/$file2.wav -c 1 -r 8000 /tmp/$file.wav && rm -rf /tmp/$file2.wav ");
            }

        }
        return '/tmp/' . $file;
    }

    public static function make_token($line)
    {
        $text  = $line;
        $time  = round(time() / 3600);
        $chars = unpack('C*', $text);
        $stamp = $time;

        foreach ($chars as $key => $char) {
            $stamp = Tts::make_rl($stamp + $char, '+-a^+6');
        }

        $stamp = Tts::make_rl($stamp, '+-3^+b+-f');

        if ($stamp < 0) {
            $stamp = ($stamp & 2147483647) + 2147483648;
        }
        $stamp %= pow(10, 6);
        return ($stamp . '.' . ($stamp ^ $time));

    }

    public static function make_rl($num, $str)
    {
        for ($i = 0; $i < strlen($str) - 2; $i += 3) {
            $d = substr($str, $i + 2, 1);
            if (ord($d) >= ord('a')) {
                $d = ord($d) - 87;
            } else {
                $d = round($d);
            }
            if (substr($str, $i + 1, 1) == '+') {
                $d = $num >> $d;
            } else {
                $d = $num << $d;
            }
            if (substr($str, $i, 1) == '+') {
                $num = $num + $d & 4294967295;
            } else {
                $num = $num ^ $d;
            }
        }
        return $num;
    }
}
