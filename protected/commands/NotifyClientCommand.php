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
class NotifyClientCommand extends ConsoleCommand
{
    public function run($args)
    {
        $delayNotifications = $this->config['global']['delay_notifications'];

        $delayClause = "( ";

        if ($delayNotifications <= 0) {
            $delayClause .= "last_notification < CURDATE() + 1 OR ";
        } else {
            $delayClause .= "last_notification < CURDATE() - " . $delayNotifications . " OR ";
        }

        $delayClause .= "last_notification IS NULL )";

        $filter = 'credit_notification > 0  AND active = 1 AND credit + creditlimit < credit_notification AND ' . $delayClause;

        $modelUser = User::model()->findAll([
            'condition' => $filter,
            'order'     => 'id',
        ]);

        foreach ($modelUser as $user) {
            if ($user->id_user == null || $user->id_user == '') {
                $user->id_user = 1;
                $user->save();
            }

            $idUserType = $user->idGroup->idUserType->id;
            if ($idUserType != 3) {
                continue;
            }

            $modelSmtp = Smtps::model()->find('id_user = :key', [':key' => $user->id_user]);

            if (! isset($modelSmtp->id)) {
                continue;
            }

            if (strlen($user->email) > 0) {
                $mail = new Mail(Mail::$TYPE_REMINDER, $user->id);
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

                if ($this->debug >= 1) {
                    echo ("Notifique email" . $user->email . "\n");
                }
            }

            $user->last_notification = date('Y-m-d H:i:s');
            $user->save();
        }
        sleep(1);
    }
}
