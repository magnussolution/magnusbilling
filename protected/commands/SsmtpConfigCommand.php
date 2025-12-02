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
class SsmtpConfigCommand extends ConsoleCommand
{
    public function run($args)
    {
        if (file_exists('/etc/ssmtp/ssmtp.conf')) {
            $modelSmtp = Smtps::model()->find('id_user = 1');

            if (isset($modelSmtp->id)) {

                $data = '
TLS_CA_FILE=/etc/pki/tls/certs/ca-bundle.crt

root=' . $modelSmtp->username . '
mailhub=' . $modelSmtp->host . ':' . $modelSmtp->port . '
hostname=' . gethostname() . '
AuthUser=' . $modelSmtp->username . '
AuthPass=' . $modelSmtp->password . '
UseSTARTTLS=yes
UseTLS=yes
FromLineOverride=yes
AuthMethod=LOGIN';

                $file = '/etc/ssmtp/ssmtp.conf';

                $fd = fopen($file, "w");

                if (fwrite($fd, $data) === false) {
                    echo "Impossible to write to the file";
                    exit;
                }
                fclose($fd);

                $data = 'root:' . $modelSmtp->username . ':' . $modelSmtp->host . ':' . $modelSmtp->port . '';

                $file = '/etc/ssmtp/revaliases';

                $fd = fopen($file, "w");

                if (fwrite($fd, $data) === false) {
                    echo "Impossible to write to the file";
                    exit;
                }
                fclose($fd);

                //set the revaliases file
                $data = 'root:' . $modelSmtp->username . ':' . $modelSmtp->host . ':' . $modelSmtp->port;

                $file = '/etc/ssmtp/revaliases';

                $fd = fopen($file, "w");

                if (fwrite($fd, $data) === false) {
                    echo "Impossible to write to the file";
                    exit;
                }
                fclose($fd);

                exec(" sed -i 's/serveremail.*/serveremail=" . $modelSmtp->username . "/' /etc/asterisk/voicemail.conf");
                exec(" sed -i 's/mailcmd.*/mailcmd=\/usr\/sbin\/ssmtp \-t/' /etc/asterisk/voicemail.conf");

                AsteriskAccess::instance()->reload();
                echo "\n";
                echo 'echo -e "From: ' . $modelSmtp->username . '\nTo: info@magnussolution.com\nSubject: this is the subject\n\nThis is the body,\nwith multiple lines." | ssmtp -t';
                echo "\n";
            }
        }

    }
}
