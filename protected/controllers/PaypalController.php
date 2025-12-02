<?php

/**
 * Url for paypal ruturn http://ip/billing/index.php/paypal .
 */
class PaypalController extends Controller
{

    public function actionIndex()
    {

        /*$_POST = array(
        'mc_gross' => '50.00',
        'protection_eligibility' => 'Ineligible',
        'payer_id' => 'WVJ3YK6545HDVC',
        'tax' => '0.00',
        'payment_date' => '15:01:54 Jan 18, 2013 PST',
        'payment_status' => 'Completed',
        'charset' => 'windows-1252',
        'first_name' => 'Anibal',
        'mc_fee' => '4.00',
        'notify_version' => '3.7',
        'custom' => '',
        'payer_status' => 'verified',
        'business' => 'financiero@magnussolution.com.com',
        'quantity' => '1',
        'verify_sign' => 'A9LC3Qajo-H2V8mPq4eIktRPDNMDNt.Rmhgxk0LTN6wGo2lI1cLs',
        'payer_email' => 'amenezes@hotmail.com',
        'txn_id' => '4Y190387AG109562T',
        'payment_type' => 'instant',
        'payer_business_name' => 'eCampus',
        'last_name' => 'de Neto',
        'receiver_email' => 'magnusadilsom@gmail.com',
        'payment_fee' => '4.00',
        'receiver_id' => 'HVUEC4FXXDVDB',
        'txn_type' => 'web_accept',
        'item_name' => 'user, 44767',
        'mc_currency' => 'USD',
        'item_number' => '1458545545-user-110',
        'residence_country' => 'AR',
        'handling_amount' => '0.00',
        'transaction_subject' => 'user, 44767',
        'payment_gross' => '50.00',
        'shipping' => '0.00',
        'ipn_track_id' => 'ed832d58e566b'
        );*/

        Yii::log(print_r($_POST, true), 'error');

        $ipn      = new PaypalIPN();
        $verified = $ipn->verifyIPN();
        if ($verified) {
            Yii::log('EPAYMENT PAYPAL: verification successful', 'info');

            $modelMethodpay = Methodpay::model()->find("payment_method LIKE 'Paypal'");
            if (!isset($modelMethodpay->id)) {
                exit;
            }

            // assign posted variables to local variables
            $item_name        = $_POST['item_name'];
            $payment_status   = $_POST['payment_status'];
            $amount           = $modelMethodpay->fee == 1 ? $_POST['mc_gross'] - $_POST['mc_fee'] : $_POST['mc_gross'];
            $payment_currency = $_POST['mc_currency'];
            $txn_id           = $_POST['txn_id'];
            $receiver_email   = $_POST['receiver_email'];
            $payer_email      = $_POST['payer_email'];
            $item_number      = $_POST['item_number'];
            $description      = 'Paypal, Nro. de transaccion ' . $txn_id;
            $date             = date('Ymd');

            $identification = Util::getDataFromMethodPay($item_number);
            if (!is_array($identification)) {
                exit;
            }
            $username = $identification['username'];
            $id_user  = $identification['id_user'];

            Yii::log('EPAYMENT PAYPAL: OK CONTINE TO ADD CREDIT', 'info');

            if ($_POST['payment_status'] == 'Completed') {
                Yii::log('PAYMENT VERIFIED', 'info');
                $modelUser = User::model()->findByPk((int) $id_user);

                if (isset($modelUser->id) && Refill::model()->countRefill($txn_id, $modelUser->id) == 0) {

                    //checa se o usaurio ja fez pagamentos
                    if ($this->config['global']['paypal_new_user'] == 0) {
                        $modelRefillCount = Refill::model()->count('id_user = :key', array(':key' => $modelUser->id));

                        if ($modelRefillCount == 0) {
                            $mail_subject = "RECURRING SERVICES : PAYPAL";
                            $mail_content = "SERVICE NAME = PAYPAL";
                            $mail_content .= "\n\nCARDID = " . $modelUser->id;
                            $mail_content .= "\nTotal transation = " . $amount;
                            $mail_content .= "\nERROR,  PAYMENT STARTD BUT NO COMPLETE, FISRT PAYMENT FOR USER " . $modelUser->username . ",   TRANSACTION ID " . $txn_id . "";

                            $mail = new Mail(null, $modelUser->id, null, $mail_content, $mail_subject);
                            $mail->send($this->config['global']['admin_email']);
                            fclose($fp);
                            header("HTTP/1.1 200 OK");
                            exit;
                        } else {
                            Yii::log($modelUser->id . ' ' . $amount . ' ' . $description . ' ' . $txn_id, 'error');
                            UserCreditManager::releaseUserCredit($modelUser->id, $amount, $description, 1, $txn_id);
                        }

                    } else {
                        Yii::log($modelUser->id . ' ' . $amount . ' ' . $description . ' ' . $txn_id, 'error');
                        UserCreditManager::releaseUserCredit($modelUser->id, $amount, $description, 1, $txn_id);
                    }
                } else {
                    Yii::log('USERNAE NOT FOUND', 'info');
                }
            }
        } else {
            Yii::log('EPAYMENT PAYPAL: VERIFICATION FAILED', 'info');
        }
        header("HTTP/1.1 200 OK");
    }
}

class PaypalIPN
{
    /** @var bool Indicates if the sandbox endpoint is used. */
    private $use_sandbox = false;
    /** @var bool Indicates if the local certificates are used. */
    private $use_local_certs = true;

    /** Production Postback URL */
    const VERIFY_URI = 'https://ipnpb.paypal.com/cgi-bin/webscr';
    /** Sandbox Postback URL */
    const SANDBOX_VERIFY_URI = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';

    /** Response from PayPal indicating validation was successful */
    const VALID = 'VERIFIED';
    /** Response from PayPal indicating validation failed */
    const INVALID = 'INVALID';

    /**
     * Sets the IPN verification to sandbox mode (for use when testing,
     * should not be enabled in production).
     * @return void
     */
    public function useSandbox()
    {
        $this->use_sandbox = true;
    }

    /**
     * Sets curl to use php curl's built in certs (may be required in some
     * environments).
     * @return void
     */
    public function usePHPCerts()
    {
        $this->use_local_certs = false;
    }

    /**
     * Determine endpoint to post the verification data to.
     *
     * @return string
     */
    public function getPaypalUri()
    {
        if ($this->use_sandbox) {
            return self::SANDBOX_VERIFY_URI;
        } else {
            return self::VERIFY_URI;
        }
    }

    /**
     * Verification Function
     * Sends the incoming post data back to PayPal using the cURL library.
     *
     * @return bool
     * @throws Exception
     */
    public function verifyIPN()
    {
        if (!count($_POST)) {
            Yii::log('EPAYMENT PAYPAL: Missing POST Data', 'error');
            throw new Exception("Missing POST Data");
        }

        $raw_post_data  = file_get_contents('php://input');
        $raw_post_array = explode('&', $raw_post_data);
        $myPost         = array();
        foreach ($raw_post_array as $keyval) {
            $keyval = explode('=', $keyval);
            if (count($keyval) == 2) {
                // Since we do not want the plus in the datetime string to be encoded to a space, we manually encode it.
                if ($keyval[0] === 'payment_date') {
                    if (substr_count($keyval[1], '+') === 1) {
                        $keyval[1] = str_replace('+', '%2B', $keyval[1]);
                    }
                }
                $myPost[$keyval[0]] = urldecode($keyval[1]);
            }
        }

        // Build the body of the verification post request, adding the _notify-validate command.
        $req                     = 'cmd=_notify-validate';
        $get_magic_quotes_exists = false;
        if (function_exists('get_magic_quotes_gpc')) {
            $get_magic_quotes_exists = true;
        }
        foreach ($myPost as $key => $value) {
            if ($get_magic_quotes_exists == true && get_magic_quotes_gpc() == 1) {
                $value = urlencode(stripslashes($value));
            } else {
                $value = urlencode($value);
            }
            $req .= "&$key=$value";
        }

        // Post the data back to PayPal, using curl. Throw exceptions if errors occur.
        $ch = curl_init($this->getPaypalUri());
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
        curl_setopt($ch, CURLOPT_SSLVERSION, 6);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

        // This is often required if the server is missing a global cert bundle, or is using an outdated one.
        if ($this->use_local_certs) {
            curl_setopt($ch, CURLOPT_CAINFO, __DIR__ . "/cert/cacert.pem");
        }
        curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'User-Agent: PHP-IPN-Verification-Script',
            'Connection: Close',
        ));
        $res = curl_exec($ch);

        Yii::log(print_r($res, true), 'error');
        if (!($res)) {
            $errno  = curl_errno($ch);
            $errstr = curl_error($ch);
            curl_close($ch);
            Yii::log("cURL error: [$errno] $errstr", 'error');
            throw new Exception("cURL error: [$errno] $errstr");
        }

        $info      = curl_getinfo($ch);
        $http_code = $info['http_code'];
        if ($http_code != 200) {
            Yii::log("PayPal responded with http code $http_code", 'error');
            throw new Exception("PayPal responded with http code $http_code");
        }

        curl_close($ch);

        // Check if PayPal verifies the IPN data, and if so, return true.
        if ($res == self::VALID) {
            return true;
        } else {
            return false;
        }
    }
}
