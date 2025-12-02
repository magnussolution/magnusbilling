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

class UserCreditManager
{

    public static function checkGlobalCredit($id_user)
    {
        $modelUser = User::model()->findByPk((int) $id_user);

        $userCredit          = $modelUser->typepaid == 1
        ? $modelUser->credit = $modelUser->credit + $modelUser->creditlimit
        : $modelUser->credit;

        if ($modelUser->id_user > 1) {
            $modelAgent           = User::model()->findByPk((int) $modelUser->id_user);
            $agentCredit          = $modelAgent->typepaid == 1
            ? $modelAgent->credit = $modelAgent->credit + $modelAgent->creditlimit
            : $modelAgent->credit;
        }
        if ($userCredit <= 0 || (isset($agentCredit) && $agentCredit <= 0)) {
            return false;
        } else {
            return true;
        }

    }

    public static function releaseUserCredit($id_user, $credit, $description, $paymount_type = 1, $code = 0)
    {

        /*
        paymount_type
        0 - remove credit and try add in refill
        1 - add credit and try add in refill
        2 - add credit but NOT add in refill
         */
        $modelUser = User::model()->findByPk((int) $id_user);

        $signal = $paymount_type == 1 ? '+' : '-';

        $actualCredit = $modelUser->credit;
        //release the credit
        if ($credit < 0) {
            $modelUser->credit += $credit;
        } elseif ($paymount_type == 0) {
            $modelUser->credit -= $credit;
        } else {
            $modelUser->credit += $credit;
        }

        //add the refill
        if ($paymount_type != 2) {
            $res = UserCreditManager::insertRefill($id_user, $credit, $description, $code, $actualCredit, $signal);
            if ($res == true) {
                $modelUser->save();
            }
        } else {
            $modelUser->save();
            $mail = new Mail(Mail::$TYPE_REFILL, $id_user);
            $mail->replaceInEmail(Mail::$ITEM_ID_KEY, $id_user);
            $mail->replaceInEmail(Mail::$ITEM_AMOUNT_KEY, $credit);
            $mail->replaceInEmail(Mail::$DESCRIPTION, $description);
            $mail->send();
        }

        ServicesProcess::checkIfServiceToPayAfterRefill($id_user);
    }

    public static function insertRefill($id_user, $credit, $description, $code, $actualCredit, $signal)
    {

        //check if already exists refill with code
        if (strlen($code) > 0 && $code > 0) {
            $modelRefill = Refill::model()->find("description LIKE '%$code%' AND id_user = $id_user");

            if (isset($modelRefill->id)) {
                if ($modelRefill->payment == 0) {
                    //marca recarga como pago
                    $modelRefill->payment = 1;
                    $modelRefill->save();

                }
                return false;
            }
        }

        //add new refill
        $modelRefill              = new Refill;
        $modelRefill->id_user     = $id_user;
        $modelRefill->credit      = $signal == '-' ? $credit * -1 : $credit;
        $modelRefill->description = $description;
        $modelRefill->payment     = 1;
        $modelRefill->save();

        $mail = new Mail(Mail::$TYPE_REFILL, $id_user);
        $mail->replaceInEmail(Mail::$ITEM_ID_KEY, $modelRefill->id);
        $mail->replaceInEmail(Mail::$ITEM_AMOUNT_KEY, $credit);
        $mail->replaceInEmail(Mail::$DESCRIPTION, $description);
        $mail->send();

        return true;
    }
}
