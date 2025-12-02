<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * *
 * $mail = new Mail(Mail::$TYPE_PAYMENT, 100);
 * $mail->replaceInEmail(Mail::$ITEM_ID_KEY, 1);
 * $mail->replaceInEmail(Mail::$ITEM_NAME_KEY, 'Credito');
 * $mail->replaceInEmail(Mail::$PAYMENT_METHOD_KEY, 'Recarga de credito');
 * $mail->send();
 * $mail->send($emailAdmin);
 */
class Mail
{

    private $id_user;
    private $message    = '';
    private $title      = '';
    private $from_email = '';
    private $from_name  = '';
    private $to_email   = '';
    private $to_email2  = '';
    private $language   = '';
    public $output;
    public $type;

    public static $DESCRIPTION = '$description$';

    //mail type
    public static $TYPE_PAYMENT                   = 'payment';
    public static $TYPE_REFILL                    = 'refill';
    public static $TYPE_REMINDER                  = 'reminder';
    public static $TYPE_CREDIT_DAILY              = 'credit';
    public static $TYPE_SIGNUP                    = 'signup';
    public static $TYPE_FORGETPASSWORD            = 'forgetpassword';
    public static $TYPE_SIGNUPCONFIRM             = 'signupconfirmed';
    public static $TYPE_EPAYMENTVERIFY            = 'epaymentverify';
    public static $TYPE_REMINDERCALL              = 'reminder';
    public static $TYPE_SUBSCRIPTION_PAID         = 'subscription_paid';
    public static $TYPE_SUBSCRIPTION_UNPAID       = 'subscription_unpaid';
    public static $TYPE_SUBSCRIPTION_DISABLE_CARD = 'subscription_disable_card';

    public static $TYPE_DID_PAID         = 'did_paid';
    public static $TYPE_DID_CONFIRMATION = 'did_confirmation';
    public static $TYPE_DID_UNPAID       = 'did_unpaid';
    public static $TYPE_DID_RELEASED     = 'did_released';

    public static $TYPE_PLAN_PAID     = 'plan_paid';
    public static $TYPE_PLAN_UNPAID   = 'plan_unpaid';
    public static $TYPE_PLAN_RELEASED = 'plan_released';

    public static $TYPE_SERVICES_ACTIVATION = 'services_activation';
    public static $TYPE_SERVICES_PENDING    = 'services_pending';
    public static $TYPE_SERVICES_PAID       = 'services_paid';
    public static $TYPE_SERVICES_UNPAID     = 'services_unpaid';
    public static $TYPE_SERVICES_RELEASED   = 'services_released';

    //Used by mail type = service
    public static $SERVICE_PENDING_URL            = '$service_pending_url$';
    public static $CANCEL_CREDIT_NOTIFICATION_URL = '$cancel_credit_notification_email$';
    public static $SERVICE_NAME                   = '$service_name$';
    public static $SERVICE_PRICE                  = '$service_price$';

    public static $TYPE_INVOICE_TO_PAY  = 'invoice_to_pay';
    public static $TYPE_USER_DISK_SPACE = 'user_disk_space';
    public static $TYPE_TEMPLATE1       = 'template1';
    public static $TYPE_TEMPLATE2       = 'template2';
    public static $TYPE_TEMPLATE3       = 'template3';
    public static $TYPE_TEMPLATE4       = 'template4';
    public static $TYPE_TEMPLATE5       = 'template5';
    public static $TYPE_TEMPLATE6       = 'template6';
    public static $TYPE_TEMPLATE7       = 'template7';
    public static $TYPE_TEMPLATE8       = 'template8';
    public static $TYPE_TEMPLATE9       = 'template9';

    public static $PLAN_LABEL = '$planname$';
    public static $PLAN_COST  = '$plancost$';

    public static $OBS = '$obs$';

    //Used by mail type = user_disk_space
    public static $TIME_DELETE       = '$time_deleted$';
    public static $ACTUAL_DISK_USAGE = '$actual_disk_usage$';
    public static $DISK_USADE_LIMIT  = '$disk_usage_limit$';

    //Used by mail type = invoice_to_pay
    public static $INVOICE_TITLE_KEY       = '$invoice_title$';
    public static $INVOICE_REFERENCE_KEY   = '$invoice_reference$';
    public static $INVOICE_DESCRIPTION_KEY = '$invoice_description$';
    public static $INVOICE_TOTAL_KEY       = '$invoice_total$';
    public static $INVOICE_TOTAL_VAT_KEY   = '$invoice_total_vat$';

    //Used by mail type = modify_ticket
    public static $TICKET_COMMENT_CREATOR_KEY     = '$comment_creator$';
    public static $TICKET_COMMENT_DESCRIPTION_KEY = '$comment_description$';

    //Used by mail type = did_paid
    public static $BALANCE_REMAINING_KEY = '$balance_remaining$';

    //Used by mail type = subscription_paid OR subscription_unpaid
    public static $SUBSCRIPTION_LABEL = '$subscription_label$';
    public static $SUBSCRIPTION_ID    = '$subscription_id$';
    public static $SUBSCRIPTION_FEE   = '$subscription_fee$';

    //Used by mail type = did_paid OR did_unpaid OR did_released
    public static $DID_NUMBER_KEY          = '$did$';
    public static $DID_COST_KEY            = '$did_cost$';
    public static $DID_NUMBER_CONFIRMATION = '$did_confirmation$';
    public static $INVOICE_ID              = '$invoice_id$';
    public static $DAYS_TO_PAY             = '$days_to_pay$';

    //Used by mail type = did_unpaid  & subscription_unpaid
    public static $DAY_REMAINING_KEY = '$days_remaining$';
    public static $INVOICE_REF_KEY   = '$invoice_ref$';
    public static $NEXT_DUE_DATE     = '$next_due_date$';
    //Used by mail type = epaymentverify
    public static $TIME_KEY           = '$time$';
    public static $PAYMENTGATEWAY_KEY = '$paymentgateway$';

    //Used by mail type = payment
    public static $ITEM_NAME_KEY      = '$itemName$';
    public static $ITEM_ID_KEY        = '$itemID$';
    public static $PAYMENT_METHOD_KEY = '$paymentMethod$';
    public static $PAYMENT_STATUS_KEY = '$paymentStatus$';

    //used by type = payment and type = epaymentverify
    public static $ITEM_AMOUNT_KEY = '$itemAmount$';

    //used in all mail
    public static $CUSTOMER_ID                         = '$idcard$';
    public static $USER_ID                             = '$iduser$';
    public static $CUSTOMER_EMAIL_KEY                  = '$email$';
    public static $CUSTOMER_FIRSTNAME_KEY              = '$firstname$';
    public static $CUSTOMER_LASTNAME_KEY               = '$lastname$';
    public static $CUSTOMER_CREDIT_BASE_CURRENCY_KEY   = '$credit$';
    public static $CUSTOMER_ACCOUNT_CREDIT             = '$account_credit$';
    public static $CUSTOMER_CREDIT_LIMIT               = '$credit_limit$';
    public static $CUSTOMER_CREDIT_IN_OWN_CURRENCY_KEY = '$creditcurrency$';
    public static $CUSTOMER_CURRENCY                   = '$currency$';
    public static $CUSTOMER_CARDNUMBER_KEY             = '$cardnumber$';
    public static $CUSTOMER_PASSWORD_KEY               = '$password$';
    public static $CUSTOMER_LOGIN                      = '$login$';
    public static $CUSTOMER_LOGINKEY                   = '$loginkey$';
    public static $CUSTOMER_CREDIT_NOTIFICATION        = '$credit_notification$';

    //used in all mail
    public static $SYSTEM_CURRENCY = '$base_currency$';

    public function __construct($type, $id_user = null, $id_agent = null, $msg = null, $title = null)
    {

        if ( ! empty($type)) {
            $this->type  = $type;
            $modelUser   = User::model()->findByPk((int) $id_user);
            $modelConfig = Configuration::model()->find('config_key = "ip_servers"');

            $modelTemplate = TemplateMail::model()->find('mailtype = :key AND language = :key1 AND id_user = :key2',
                [
                    ':key'  => $type,
                    ':key1' => $modelUser->language,
                    ':key2' => $modelUser->id_user,
                ]);

            if ( ! isset($modelTemplate->id)) {
                return;
            }

            $account_credit = number_format($modelUser->credit, 2);
            $credit_limit   = $modelUser->creditlimit;
            $real_credit    = $modelUser->typepaid == 1
            ? $modelUser->credit + $modelUser->creditlimit
            : $modelUser->credit;

            $order       = null;
            $order_field = null;

            $this->id_agent = isset($modelUser->id) ? $modelUser->id_user : null;
            $this->id_user  = isset($modelUser->id) ? $modelUser->id : null;

            if ($modelTemplate->id && $modelTemplate->status == 1) {
                $mail_tmpl        = isset($modelTemplate->id) ? $modelTemplate->id : null;
                $this->message    = $modelTemplate->messagehtml;
                $this->title      = isset($modelTemplate->subject) ? $modelTemplate->subject : null;
                $this->from_email = isset($modelTemplate->fromemail) ? $modelTemplate->fromemail : null;
                $this->from_name  = isset($modelTemplate->fromname) ? $modelTemplate->fromname : null;
                $this->language   = isset($modelTemplate->language) ? $modelTemplate->language : null;
            } else {
                Yii::log("Template Type '$type' cannot be found into the database! or not active", 'error');
                return true;
            }

        } elseif ( ! empty($msg) || ! empty($title)) {
            $this->message = $msg;
            $this->title   = $title;
        } else {
            Yii::log("Error : no Type defined and neither message or subject is provided!", 'info');
            return true;
        }

        if ($id_agent > 1) {
            $modelAgent                     = User::model()->findByPk((int) $id_agent);
            $modelUser->id                  = $modelAgent->id;
            $modelUser->username            = $modelAgent->username;
            $modelUser->username            = $modelAgent->email;
            $modelUser->firstname           = $modelAgent->firstname;
            $modelUser->lastname            = '';
            $modelUser->loginkey            = '';
            $real_credit                    = $modelAgent->credit;
            $modelUser->credit_notification = '';
            $modelUser->language            = $modelAgent->language;
        }
        if ( ! empty($this->message) || ! empty($this->title)) {
            $credit   = round($real_credit, 3);
            $currency = isset($modelUser->currency) ? $modelUser->currency : null;

            $modelUser->id                  = isset($modelUser->id) ? $modelUser->id : null;
            $modelUser->username            = isset($modelUser->username) ? $modelUser->username : null;
            $modelUser->email               = isset($modelUser->email) ? $modelUser->email : null;
            $modelUser->firstname           = isset($modelUser->firstname) ? $modelUser->firstname : null;
            $modelUser->lastname            = isset($modelUser->lastname) ? $modelUser->lastname : null;
            $modelUser->loginkey            = isset($modelUser->loginkey) ? $modelUser->loginkey : null;
            $modelUser->password            = isset($modelUser->password) ? $modelUser->password : null;
            $modelUser->credit_notification = isset($modelUser->credit_notification) ? $modelUser->credit_notification : null;

            $this->to_email  = isset($modelUser->email) ? $modelUser->email : null;
            $this->to_email2 = isset($modelUser->email2) ? $modelUser->email2 : null;
            $this->replaceInEmail(self::$CUSTOMER_ID, $modelUser->id);
            $this->replaceInEmail(self::$USER_ID, $modelUser->id);
            $this->replaceInEmail(self::$CUSTOMER_CARDNUMBER_KEY, $modelUser->username);
            $this->replaceInEmail(self::$CUSTOMER_EMAIL_KEY, $modelUser->email);
            $this->replaceInEmail(self::$CUSTOMER_FIRSTNAME_KEY, $modelUser->firstname);
            $this->replaceInEmail(self::$CUSTOMER_LASTNAME_KEY, $modelUser->lastname);
            $this->replaceInEmail(self::$CUSTOMER_LOGIN, $modelUser->username);
            $this->replaceInEmail(self::$CUSTOMER_LOGINKEY, $modelUser->loginkey);
            $this->replaceInEmail(self::$CUSTOMER_PASSWORD_KEY, $modelUser->password);
            $this->replaceInEmail(self::$CUSTOMER_CREDIT_IN_OWN_CURRENCY_KEY, $credit);
            $this->replaceInEmail(self::$CUSTOMER_CREDIT_BASE_CURRENCY_KEY, $credit);
            $this->replaceInEmail(self::$CUSTOMER_ACCOUNT_CREDIT, $account_credit);
            $this->replaceInEmail(self::$CUSTOMER_CREDIT_LIMIT, $credit_limit);
            $this->replaceInEmail(self::$CUSTOMER_CURRENCY, $currency);
            $this->replaceInEmail(self::$CUSTOMER_CREDIT_NOTIFICATION, $modelUser->credit_notification);
            $this->replaceInEmail(self::$CANCEL_CREDIT_NOTIFICATION_URL, 'http://' . $modelConfig->config_value . '/mbilling/index.php/authentication/cancelCreditNotification?id=' . $modelUser->id . '&key=' . sha1($modelUser->id . $modelUser->username . $modelUser->password));
            $this->replaceInEmail(self::$TIME_KEY, date('Y-m-d H:i:s'));
            $OBS =  ! isset($OBS) ? $this->replaceInEmail(self::$OBS, '') : $OBS;

            $this->replaceInEmail(self::$SYSTEM_CURRENCY, $currency);
        }
    }

    public function replaceInEmail($key, $val)
    {
        $this->message = str_replace($key, $val, $this->message);
        $this->title   = str_replace($key, $val, $this->title);
    }

    public function getIdCard()
    {
        return $this->id_user;
    }

    public function getFromEmail()
    {
        return $this->from_email;
    }

    public function getToEmail()
    {
        return $this->to_email;
    }

    public function getMessage()
    {
        return $this->message;
    }

    public function AddToMessage($msg)
    {
        $this->message = $this->message . $msg;
    }

    public function getTitle()
    {
        return $this->title;
    }

    public function getFromName()
    {
        return $this->from_name;
    }

    public function setFromEmail($from_email)
    {
        $this->from_email = $from_email;
    }

    public function setTitle($title)
    {
        $this->title = $title;
    }

    public function setMessage($message)
    {
        $this->message = $message;
    }

    public function setToEmail($to_email)
    {
        $this->to_email = $to_email;
    }

    public function setFromName($from_name)
    {
        $this->from_name = $from_name;
    }

    public function send($to_email = null)
    {

        $this->from_email =  ! empty($this->from_email) ? $this->from_email : $to_email;
        $this->to_email   =  ! empty($to_email) ? $to_email : $this->to_email;

        if (strlen($this->to_email) < 5) {
            return;
        }

        $result = json_decode($this->message);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (isset($result->url)) {
                $this->message = preg_replace('/\$to_email\$/', $this->to_email, $this->message);
                $this->message = preg_replace('/\$subject\$/', $this->title, $this->message);

                $curl = curl_init();
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_HTTPHEADER, [
                    "Content-Type: application/json",
                ]);
                curl_setopt($curl, CURLOPT_URL,
                    "$result->url"
                );
                curl_setopt($curl, CURLOPT_POSTFIELDS, $this->message);
                $result = curl_exec($curl);
                return true;
            }
        }

        $modelSmtps = Smtps::model()->find('id_user = :key', [':key' => $this->id_agent]);

        if ( ! isset($modelSmtps->id)) {
            return;
        }
        $smtp_host       = $modelSmtps->host;
        $smtp_encryption = $modelSmtps->encryption;
        $smtp_username   = $modelSmtps->username;
        $smtp_password   = $modelSmtps->password;
        $smtp_port       = $modelSmtps->port;

        if ($smtp_encryption == 'null') {
            $smtp_encryption = '';
        }

        if ($smtp_host == 'mail.magnusbilling.com' || $smtp_host == '' || $smtp_username == '' || $smtp_password == '' || $smtp_port == '') {
            return;
        }

        Yii::import('application.extensions.phpmailer.JPhpMailer');
        $mail = new JPhpMailer;
        //$mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->IsSMTP();
        $mail->SMTPAuth = true;
        $mail->Host     = $smtp_host;

        if ($smtp_port == 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; //Enable implicit TLS encryption
        } else if ($smtp_port == 587) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; //Enable implicit TLS encryption
        } else {
            $mail->SMTPSecure = $smtp_encryption;
        }

        $mail->Username = $smtp_username;
        $mail->Password = $smtp_password;
        $mail->Port     = $smtp_port;

        if ($smtp_host == 'smtp.office365.com' || $this->from_email == 'noreply@site.com') {
            $mail->SetFrom($smtp_username, $this->from_name);
        } else {
            $mail->SetFrom($this->from_email, $this->from_name);
        }

        $mail->SetLanguage($this->language == 'pt_BR' ? 'br' : $this->language);
        $mail->Subject = mb_encode_mimeheader($this->title);
        $mail->AltBody = 'To view the message, please use an HTML compatible email viewer!';
        $mail->MsgHTML($this->message);
        $mail->AddAddress($this->to_email);
        if (strlen($this->to_email2)) {
            $mail->AddAddress($this->to_email2);
        }
        $mail->CharSet = 'utf-8';
        ob_start();
        @$mail->Send();

        Yii::log('Email sent to ' . $this->to_email . ' ' . $this->to_email2 . '. Subject -> ' . $mail->Subject . '. Email type: ' . $this->type, 'error');
        $this->output = ob_get_contents();
        ob_end_clean();
        return true;
    }

}
