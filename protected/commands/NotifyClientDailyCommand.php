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
class NotifyClientDailyCommand extends ConsoleCommand
{
    public function run($args)
    {

        $modelUser = User::model()->findAll([
            'condition' => 'credit_notification_daily = 1',
        ]);

        foreach ($modelUser as $user) {

            $modelSmtp = Smtps::model()->find('id_user = :key', [':key' => $user->id_user]);

            if ( ! isset($modelSmtp->id)) {
                continue;
            }

            if (strlen($user->email) > 0) {
                $mail = new Mail(Mail::$TYPE_CREDIT_DAILY, $user->id);
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

                echo ("Notifique email " . $user->email . "\n");
            }

        }
        sleep(1);
    }
}
