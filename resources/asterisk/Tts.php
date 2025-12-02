<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusSolution. All rights reserved.
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
    public static function create(&$MAGNUS, $agi, $string)
    {

        if (preg_match('/\|/', $string)) {
            $data       = explode('|', $string);
            $LID_CUSTOM = $data[0];
            $VID_CUSTOM = $data[1];
            $string     = $data[2];
        }

        $name = urlencode($string);

        $file = 'tts_audio_' . MD5($string);

        if ( ! file_exists('/tmp/' . $file . '.wav')) {

            $tts_url = preg_replace('/\$name/', $name, $MAGNUS->config['global']['tts_url']);

            if (preg_match("/vocalware/", $tts_url)) {
                //https://www.vocalware.com/tts/gen.php?EID=3&LID=2&VID=1&TXT=$name&EXT=mp3&FX_TYPE=&FX_LEVEL=&ACC=YOUR_ACC&API=YPUR_API&SESSION=&HTTP_ERR=&CS=&SECRET=YOUR_SECRET
                $variables = explode("?", $tts_url);

                $url = $variables[0];

                $variables = explode("&", $variables[1]);

                foreach ($variables as $key => $value) {
                    $val = explode("=", $value);
                    switch ($val[0]) {
                        case 'LID':
                            $LID = $val[1];
                            break;
                        case 'EID':
                            $EID = $val[1];
                            break;
                        case 'VID':
                            $VID = $val[1];
                            break;
                        case 'EXT':
                            $EXT = $val[1];
                            break;
                        case 'ACC':
                            $ACC = $val[1];
                            break;
                        case 'API':
                            $API = $val[1];
                            break;
                        case 'SECRET':
                            $SECRET = $val[1];
                            break;
                    }
                }

                $LID = isset($LID_CUSTOM) ? $LID_CUSTOM : $LID; //language
                $VID = isset($VID_CUSTOM) ? $VID_CUSTOM : $VID; //voice
                $get = 'EID=' . $EID
                    . '&LID=' . $LID
                    . '&VID=' . $VID
                    . '&TXT=' . $name
                    . '&EXT=' . $EXT
                    . '&FX_TYPE='
                    . '&FX_LEVEL='
                    . '&ACC=' . $ACC
                    . '&API=' . $API
                    . '&SESSION='
                    . '&HTTP_ERR=';

                $CS = md5($EID . $LID . $VID . $string .
                    $EXT . $fxType . $fxLevel . $ACC . $API . $session . $httpErr . $SECRET);

                $tts_url = 'https://www.vocalware.com/tts/gen.php?' . $get . '&CS=' . $CS;
                $agi->verbose($tts_url, 25);
                exec("curl --insecure \"$tts_url\" --output \"/tmp/$file.mp3\" ");

            } else if (preg_match("/ttsgo/", $tts_url)) {

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
                exec('sox /tmp/' . $file . '.wav -c 1 -r 8000 /tmp/' . $file . '.sln && rm -rf /tmp/' . $file . '.wav');

            } else {
                if (preg_match("/google/", $tts_url)) {
                    $token = Tts::make_token($name);

                    $tts_url = preg_replace('/\$token/', $token, $tts_url);
                }
                if (preg_match("/voicerss\.org/", $tts_url)) {
                    //"http://api.voicerss.org/?key=YOUR API&hl=pt-br&src=adilson&f=8khz_16bit_mono
                    system("wget -q -U Mozilla -O \"/tmp/$file.wav\" \"$tts_url\"");
                } else {
                    system("wget -q -U Mozilla -O \"/tmp/$file.mp3\" \"$tts_url\"");
                    system("mpg123 -w /tmp/$file.wav /tmp/$file.mp3 && rm -rf /tmp/$file.mp3");
                    system("sox -v 2.0 /tmp/$file.wav /tmp/$file2.wav && rm -rf /tmp/$file.wav");
                    system("sox /tmp/$file2.wav -c 1 -r 8000 /tmp/$file.wav && rm -rf /tmp/$file2.wav ");
                }
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
