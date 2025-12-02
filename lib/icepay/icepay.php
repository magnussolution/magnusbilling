<?php
/**
 * ICEPAY Library for PHP
 *
 * This file is a base class for all payment methods of ICEPAY.
 * However, creating an instance of this class will redirect you to a payment screen of ICEPAY
 * where you will be able to choose from different payment methods.
 *
 * @author ICEPAY <support@icepay.eu>
 * @copyright Copyright (c) 2011, ICEPAY
 * @version 1.0.9
 */

foreach (ICEPAY::GetCoreClasses() as $filename) {
    require_once $filename;
}

class ICEPAY
{
    protected $version = "1.1.2";

    protected $merchantID       = 0;
    protected $secretCode       = "";
    protected $orderID          = "";
    protected $issuer           = "";
    protected $country          = "";
    protected $language         = "";
    protected $currency         = "";
    protected $amount           = 0;
    protected $description      = "";
    protected $paymentMethod    = "";
    protected $reference        = "";
    protected $logging          = false;
    protected $loggingDirectory = ".";
    protected $apiURL           = "https://pay.icepay.eu/basic/";

    protected $streamMethod = "fopen";
    protected $postback     = null;

    protected $pageData = null;

    protected $fingerPrint = "";

    /**
     * Constructor
     * @since Version 1.0
     * @param int $merchantID This is the merchant ID that you can create in your ICEPAY account.
     * @param int $secretCode This is the key that belongs to your merchant ID.
     * @return ICEPAY
     */
    public function __construct($merchantID = null, $secretCode = null)
    {
        $this->merchantID = $merchantID;
        $this->secretCode = $secretCode;

        if ($this->merchantID == null) {
            throw new Exception("Please provide a merchantID");
        }

        if ($this->secretCode == null) {
            throw new Exception("Please provide a secret code");
        }

        $this->clearPostback();
    }

    /**
     * Enables overloading of Pay class
     * @since Version 1.0.8
     */
    public function __call($name, $arguments = null)
    {
        switch ($name) {
            case "Pay":
                return $this->doPay(
                    isset($arguments[0]) ? $arguments[0] : null,
                    isset($arguments[1]) ? $arguments[1] : null,
                    isset($arguments[2]) ? $arguments[2] : null,
                    isset($arguments[3]) ? $arguments[3] : null,
                    isset($arguments[4]) ? $arguments[4] : null
                );
                break;
        }
    }

    /**
     * Returns a list of filenames for the ICEPAY classes
     * @access public
     * @since Version 1.0
     * @return array Returns an array with the filenames
     */
    public static function GetCoreClasses()
    {
        return
            [
            'icepay.php',
            //'icepay-bancash.php',
            'icepay-cc.php',
            'icepay-ddebit.php',
            'icepay-directebank.php',
            'icepay-giropay.php',
            'icepay-ideal.php',
            'icepay-mistercash.php',
            'icepay-paypal.php',
            'icepay-paysafecard.php',
            'icepay-phone.php',
            'icepay-sms.php',
            'icepay-wire.php',
        ];
    }

    /**
     * Returns the current API version
     * @access public
     * @since Version 1.0.9
     * @return string
     */
    public function GetAPIVersion()
    {
        return $this->version;
    }

    /**
     * Returns the API ID
     * @access public
     * @since Version 1.0.9
     * @return string
     */
    public function GetAPIID()
    {
        return $this->generateFingerPrint();
    }

    /**
     * Clears the Postback
     * @access protected
     * @since Version 1.0
     */
    protected function clearPostback()
    {
        $this->postback = new stdClass();

        $this->postback->status                = "";
        $this->postback->statusCode            = "";
        $this->postback->merchant              = "";
        $this->postback->orderID               = "";
        $this->postback->paymentID             = "";
        $this->postback->reference             = "";
        $this->postback->transactionID         = "";
        $this->postback->consumerName          = "";
        $this->postback->consumerAccountNumber = "";
        $this->postback->consumerAddress       = "";
        $this->postback->consumerHouseNumber   = "";
        $this->postback->consumerCity          = "";
        $this->postback->consumerCountry       = "";
        $this->postback->consumerEmail         = "";
        $this->postback->consumerPhoneNumber   = "";
        $this->postback->consumerIPAddress     = "";
        $this->postback->amount                = "";
        $this->postback->currency              = "";
        $this->postback->duration              = "";
        $this->postback->paymentMethod         = "";
        $this->postback->checksum              = "";

        return;
    }

    /**
     * Find for a string in an array of strings
     * @access protected
     * @param $collection An array of strings
     * @param $find The string that needs to be found in the collection
     * @return true|false TRUE if the string is found, otherwise FALSE
     */
    protected function inCollection($collection, $find)
    {
        foreach ($collection as $item) {
            if ($find == $item) {
                return true;
            }
        }

        return false;
    }

    /**
     * Used internally by the public Pay method to assign an amount
     * @access protected
     * @return TRUE Returns TRUE if the amount is assigned, otherwise an exception occurs
     */
    protected function assignAmount($amount = null)
    {
        if ($amount == null) {
            throw new Exception("Please specify an amount for the payment");
        }

        $this->amount = $amount;

        return true;
    }

    /**
     * Used internally by the public Pay method to assign an issuer
     * @access protected
     * @return TRUE Returns TRUE if the issuer is assigned, otherwise an exception occurs
     */
    protected function assignIssuer($issuer = null)
    {
        if ($issuer == null) {
            throw new Exception("Please specify an issuer for the payment");
        }

        $this->issuer = $issuer;

        return true;
    }

    /**
     * Used internally by the public Pay method to assign the currency code
     * @access protected
     * @return TRUE Returns TRUE if the currency code is assigned, otherwise an exception occurs
     */
    protected function assignCurrency($currency = null)
    {
        if ($currency == null) {
            throw new Exception("Please specify a currency for the payment");
        }

        $this->currency = $currency;

        return true;
    }

    /**
     * Used internally by the public Pay method to assign the country
     * @access protected
     * @return TRUE Returns TRUE if the country is assigned, otherwise an exception occurs
     */
    protected function assignCountry($country = null)
    {
        if ($country == null) {
            throw new Exception("Please specify a country for the payment");
        }

        $this->country = $country;

        return true;
    }

    /**
     * Used internally by the public 'Pay' method to assign the language code
     * @access protected
     * @return TRUE Returns TRUE if the language code is assigned, otherwise an exception occurs
     */
    protected function assignLanguage($language = null)
    {
        if ($language == null) {
            throw new Exception("Please specify a language for the payment screen");
        }

        $this->language = $language;

        return true;
    }

    /**
     * Set the order ID if you do not wish to use automatic order ID generation.
     * @access public
     * @return void
     */
    public function SetOrderID($orderID)
    {
        $orderID = trim($orderID);

        if (strlen($orderID) > 10) {
            throw new Exception(sprintf("Your order ID '%s' may not be longer than 10 characters", $orderID));
        }

        $this->orderID = $orderID;

        return;
    }

    /**
     * Set the reference
     * @access public
     * @return void
     */
    public function SetReference($reference)
    {
        $this->reference = $reference;

        return;
    }

    /**
     * Enable/disable logging
     * @access public
     * @return void
     */
    public function SetLogging($logging)
    {
        $this->logging = $logging;

        return;
    }

    /**
     * Set logging directory
     * @access public
     * @return void
     */
    public function SetLoggingDirectory($loggingDirectory)
    {
        $this->loggingDirectory = $loggingDirectory;

        return;
    }

    /**
     * Sets the API URL
     * @access public
     * @return void
     */
    public function SetApiURL($url)
    {
        $this->apiURL = $url;
        return;
    }

    /**
     * Set stream method
     * @access public
     * @return void
     */
    public function SetStreamMethod($streamMethod)
    {
        $this->streamMethod = strtolower($streamMethod);
        return;
    }

    /**
     * Appends text to a log file
     * @access protected
     * @return bool Returns TRUE if logging is enabled, otherwise FALSE
     */
    protected function doLogging($line)
    {
        if ( ! $this->logging) {
            return false;
        }

        date_default_timezone_set("Europe/Paris");
        $filename = sprintf("%s/#%s.log", $this->loggingDirectory, date("Ymd", time()));
        $fp       = @fopen($filename, "a");
        $line     = sprintf("%s - %s\r\n", date("H:i", time()), $line);
        @fwrite($fp, $line);
        @fclose($fp);

        return true;
    }

    /**
     * Generates a URL to the ICEPAY basic API service
     * @access protected
     * @return string Returns the URL
     */
    protected function basicMode()
    {
        if ($this->paymentMethod != null) {
            $querystring = http_build_query([
                'type'        => $this->paymentMethod,
                'checkout'    => 'yes',
                'ic_redirect' => 'no',
                'ic_country'  => $this->country,
                'ic_language' => $this->language,
                'ic_fp'       => $this->generateFingerPrint(),
            ], '', '&');
        } else {
            $querystring = http_build_query([
                'ic_country'  => $this->country,
                'ic_language' => $this->language,
                'ic_fp'       => $this->generateFingerPrint(),
            ], '', '&');
        }

        $url = $this->apiURL . "?" . $querystring;
        return $url;
    }

    /**
     * Used to determine which method is installed if not set beforehand
     * @access protected
     * @return string Returns a stream method: fopen/curl/file_get_contents
     */
    protected function getStreamMethod()
    {
        if (function_exists("fopen")) {
            return "fopen";
        }

        if (function_exists("curl_init")) {
            return "curl";
        }

        if (function_exists("file_get_contents")) {
            return "file_get_contents";
        }

        return "fopen";
    }

    /**
     * Used to connect to the ICEPAY servers
     * @access protected
     * @return string Returns a response from the specified URL
     */
    protected function postRequest($url, $data)
    {
        $params =
            [
            'http' =>
            [
                'method'  => 'POST',
                'content' => $data,
                'header'  => "Content-Type: application/x-www-form-urlencoded",
            ],
        ];
        $this->doLogging($params);

        if ( ! $this->streamMethod) {
            $this->streamMethod = $this->getStreamMethod();
        }

        if ($this->streamMethod == "fopen") {
            $ctx = @stream_context_create($params);
            $fp  = @fopen($url, 'rb', false, $ctx);
            if ( ! $fp) {
                $this->doLogging("Error opening $url");
                throw new Exception("Error opening $url");
            }
            $response = @stream_get_contents($fp);
        }

        if ($this->streamMethod == "curl") {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            $response = curl_exec($ch);
            curl_close($ch);
        }

        if ($this->streamMethod == "file_get_contents") {
            $context  = stream_context_create($params);
            $response = file_get_contents($url, false, $context);
        }

        if ($response == false) {
            $this->doLogging("Error reading $url");
            throw new Exception("Error reading $url");
        }

        if ((substr(strtolower($response), 0, 7) == "http://") || (substr(strtolower($response), 0, 8) == "https://")) {
            return $response;
        } else {
            $this->doLogging("Server response: " . $response);
            throw new Exception("Server response: " . strip_tags($response));
        }
    }

    /**
     * Generate a checksum for the ICEPAY basic API
     * @access protected
     * @return string Returns a SHA1 string
     */
    protected function generateChecksumForBasicMode()
    {
        return sha1
            (
            $this->merchantID . "|" .
            $this->secretCode . "|" .
            $this->amount . "|" .
            $this->orderID . "|" .
            $this->reference . "|" .
            $this->currency . "|" .
            $this->country
        );
    }

    /**
     * Generate a checksum for the ICEPAY postbacks
     * @access protected
     * @return string Returns a SHA1 string
     */
    protected function generateChecksumForPostback()
    {
        return sha1
            (
            $this->secretCode . "|" .
            $this->postback->merchant . "|" .
            $this->postback->status . "|" .
            $this->postback->statusCode . "|" .
            $this->postback->orderID . "|" .
            $this->postback->paymentID . "|" .
            $this->postback->reference . "|" .
            $this->postback->transactionID . "|" .
            $this->postback->amount . "|" .
            $this->postback->currency . "|" .
            $this->postback->duration . "|" .
            $this->postback->consumerIPAddress
        );
    }

    /**
     * Generate a checksum for the ICEPAY Success URL/Error URL
     * @access protected
     * @return string Returns a SHA1 string
     */
    protected function generateChecksumForPage()
    {
        $data = $this->GetData();

        return sha1
            (
            $this->secretCode . "|" .
            $data->merchant . "|" .
            $data->status . "|" .
            $data->statusCode . "|" .
            $data->orderID . "|" .
            $data->paymentID . "|" .
            $data->reference . "|" .
            $data->transactionID
        );
    }

    /**
     * Generates a fingerprint of the ICEPAY classes for identification
     * @access protected
     * @return string Returns a SHA1 string
     */
    protected function generateFingerPrint()
    {
        if ($this->fingerPrint != "") {
            return $this->fingerPrint;
        }

        $content = "";

        foreach ($this->GetCoreClasses() as $item) {
            if (false === ($content .= file_get_contents(dirname(__FILE__) . '/' . $item))) {
                throw new Exception("Could not generate fingerprint");
            }
        }

        $this->fingerPrint = sha1($content);

        return $this->fingerPrint;
    }

    /**
     * Prepare URL-encoded query string for communication with ICEPAY
     * @access protected
     * @return string Returns a URL-encoded query string
     */
    public function prepareParameters()
    {
        return http_build_query
            (

            [
                'ic_merchantid'    => $this->merchantID,
                'ic_currency'      => $this->currency,
                'ic_amount'        => $this->amount,
                'ic_description'   => $this->description,
                'ic_country'       => $this->country,
                'ic_language'      => $this->language,
                'ic_reference'     => $this->reference,
                'ic_paymentmethod' => $this->paymentMethod,
                'ic_issuer'        => $this->issuer,
                'ic_orderid'       => $this->orderID,
                'chk'              => $this->generateChecksumForBasicMode(),
            ], '', '&'
        );
    }

    /**
     * Communicates with the ICEPAY server and generates a link to the ICEPAY payment method selection screen.
     * The specified arguments will have an influence on the selection screen, e.g. if you specify the country
     * to be "NL" then you will only get payment methods which are supported in the Netherlands.
     *
     * @param $country string Specifies the country that the listed payment methods must support
     * @param $language string Specifies the language that the listed payment methods must support
     * @param $currency string Specifies that the listed payment methods must support the currency
     * @param $amount int Specifies the amount that will be charged
     * @param $description string A short description about the product/service for which will be paid
     * @return string A link to the ICEPAY payment method selection screen
     */
    public function doPay($country = null, $language = null, $currency = null, $amount = null, $description = null)
    {
        $this->assignCountry($country);
        $this->assignLanguage($language);
        $this->assignCurrency($currency);
        $this->assignAmount($amount);
        $this->description   = $description;
        $this->paymentMethod = null;

        return $this->basicMode() . "&" . $this->prepareParameters();
    }

    /**
     * Returns whether the success data originated from icepay
     * @return bool Returns TRUE/FALSE
     */
    public function OnSuccess()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'GET') {
            return false;
        }

        $data = $this->GetData();
        $this->doLogging(serialize($data));

        return (($data->status == "OK" || $data->status == "OPEN") && $data->checksum == $this->generateChecksumForPage());
    }

    /**
     * Returns whether the error data originated from icepay
     * @return bool Returns TRUE/FALSE
     */
    public function OnError()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'GET') {
            return false;
        }

        $data = $this->GetData();
        $this->doLogging(serialize($data));

        return (($data->status == "ERR" || $data->status == "OPEN") && $data->checksum == $this->generateChecksumForPage());
    }

    /**
     * Returns an array of the data for the SUCCESS or ERROR page.
     * @return array Returns an array with data
     */
    public function GetData()
    {
        $o = new stdClass();

        $o->status        = (isset($_GET['Status'])) ? $_GET['Status'] : "";
        $o->statusCode    = (isset($_GET['StatusCode'])) ? $_GET['StatusCode'] : "";
        $o->merchant      = (isset($_GET['Merchant'])) ? $_GET['Merchant'] : "";
        $o->orderID       = (isset($_GET['OrderID'])) ? $_GET['OrderID'] : "";
        $o->paymentID     = (isset($_GET['PaymentID'])) ? $_GET['PaymentID'] : "";
        $o->reference     = (isset($_GET['Reference'])) ? $_GET['Reference'] : "";
        $o->transactionID = (isset($_GET['TransactionID'])) ? $_GET['TransactionID'] : "";
        $o->checksum      = (isset($_GET['Checksum'])) ? $_GET['Checksum'] : "";

        return $o;
    }

    /**
     * This method is meant for 'listening' to and handling all postbacks sent by ICEPAY.
     * If logging is enabled, then the received postbacks and possible errors will be logged.
     * The logs are handy for debugging purposes and/or in case you contact technical support
     *
     * @return bool Returns TRUE if a valid ICEPAY postback is detected, otherwise FALSE
     */
    public function OnPostback()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return false;
        }

        $this->postback                        = null;
        $this->postback->status                = (isset($_POST['Status'])) ? $_POST['Status'] : "";
        $this->postback->statusCode            = (isset($_POST['StatusCode'])) ? $_POST['StatusCode'] : "";
        $this->postback->merchant              = (isset($_POST['Merchant'])) ? $_POST['Merchant'] : "";
        $this->postback->orderID               = (isset($_POST['OrderID'])) ? $_POST['OrderID'] : "";
        $this->postback->paymentID             = (isset($_POST['PaymentID'])) ? $_POST['PaymentID'] : "";
        $this->postback->reference             = (isset($_POST['Reference'])) ? $_POST['Reference'] : "";
        $this->postback->transactionID         = (isset($_POST['TransactionID'])) ? $_POST['TransactionID'] : "";
        $this->postback->consumerName          = (isset($_POST['ConsumerName'])) ? $_POST['ConsumerName'] : "";
        $this->postback->consumerAccountNumber = (isset($_POST['ConsumerAccountNumber'])) ? $_POST['ConsumerAccountNumber'] : "";
        $this->postback->consumerAddress       = (isset($_POST['ConsumerAddress'])) ? $_POST['ConsumerAddress'] : "";
        $this->postback->consumerHouseNumber   = (isset($_POST['ConsumerHouseNumber'])) ? $_POST['ConsumerHouseNumber'] : "";
        $this->postback->consumerCity          = (isset($_POST['ConsumerCity'])) ? $_POST['ConsumerCity'] : "";
        $this->postback->consumerCountry       = (isset($_POST['ConsumerCountry'])) ? $_POST['ConsumerCountry'] : "";
        $this->postback->consumerEmail         = (isset($_POST['ConsumerEmail'])) ? $_POST['ConsumerEmail'] : "";
        $this->postback->consumerPhoneNumber   = (isset($_POST['ConsumerPhoneNumber'])) ? $_POST['ConsumerPhoneNumber'] : "";
        $this->postback->consumerIPAddress     = (isset($_POST['ConsumerIPAddress'])) ? $_POST['ConsumerIPAddress'] : "";
        $this->postback->amount                = (isset($_POST['Amount'])) ? $_POST['Amount'] : "";
        $this->postback->currency              = (isset($_POST['Currency'])) ? $_POST['Currency'] : "";
        $this->postback->duration              = (isset($_POST['Duration'])) ? $_POST['Duration'] : "";
        $this->postback->paymentMethod         = (isset($_POST['PaymentMethod'])) ? $_POST['PaymentMethod'] : "";
        $this->postback->checksum              = (isset($_POST['Checksum'])) ? $_POST['Checksum'] : "";

        $this->doLogging(sprintf("Postback: %s", serialize($_POST)));

        if ( ! is_numeric($this->postback->merchant)) {
            $this->clearPostback();
            return false;
        }
        if ( ! is_numeric($this->postback->amount)) {
            $this->clearPostback();
            return false;
        }

        if ($this->merchantID != $this->postback->merchant) {
            $this->clearPostback();
            $this->doLogging("Invalid merchant ID");
            return false;
        }

        if ( ! $this->inCollection(['OK', 'ERR', 'REFUND', 'CBACK', 'OPEN'], strtoupper($this->postback->status))) {
            $this->clearPostback();
            $this->doLogging("Unknown status");
            return false;
        }

        if ($this->generateChecksumForPostback() != $this->postback->checksum) {
            $this->clearPostback();
            $this->doLogging("Checksum does not match");
            return false;
        }

        return true;
    }

    /**
     * Get postback information
     * @return array Returns an array with information about the postback such as "Status", "Order ID", etc.
     */
    public function GetPostback()
    {
        return $this->postback;
    }

}
