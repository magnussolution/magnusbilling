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
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://';

<div id="load" ><?php echo Yii::t('zii', 'Please wait while loading...') ?></div>

<script languaje="JavaScript">
window.onload = function () {
var form = document.getElementById("buyForm");
form.submit();
};
</script>

<form method="GET" action="https://www.myvirtualmerchant.com/VirtualMerchant/process.do" target="_parent" id="buyForm">
<input type="hidden" name="ssl_merchant_id" value="<?php echo $modelMethodPay->username ?>">
<input type="hidden" name="ssl_user_id" value="<?php echo $modelMethodPay->client_id ?>">
<input type="hidden" name="ssl_pin" value="<?php echo $modelMethodPay->client_secret ?>">
<input type="hidden" name="ssl_amount" value="<?php echo $_GET['amount'] ?>">
<input type="hidden" name="ssl_show_form" value="true">
<input type="hidden" name="ssl_result_format" value="HTML">
<input type="hidden" name="ssl_transaction_type" value="ccsale">
<input type="hidden" name="ssl_test_mode" value="false">
<!--<input type="hidden" name="ssl_receipt_apprvl_method" value="<?php echo $protocol . $_SERVER['HTTP_HOST'] ?>/mbilling/index.php/elevon">-->
<input type="hidden" name="ssl_receipt_apprvl_method" value="POST">
<input type="hidden" name="ssl_error_url" value="<?php echo $protocol . $_SERVER['HTTP_HOST'] ?>/mbilling/index.php/elevon">
<input type="hidden" name="ssl_receipt_apprvl_post_url" value="<?php echo $protocol . $_SERVER['HTTP_HOST'] ?>/mbilling/index.php/elevon">
<input type="hidden" name="ssl_customer_code" value="<?php echo substr($reference, 8) ?>">
</form>

 */
    $error   = '';
    $success = '';
    if ($_POST) {

        $url = 'https://www.myvirtualmerchant.com/VirtualMerchant/process.do';

        //$url = 'https://demo.myvirtualmerchant.com/VirtualMerchantDemo/process.do';

        if (strlen($_POST['card-address']) > 1) {
            $modelUser->address = $_POST['card-address'];
        }
        if (strlen($_POST['card-city']) > 1) {
            $modelUser->city = $_POST['card-city'];
        }
        if (strlen($_POST['card-state']) > 1) {
            $modelUser->state = $_POST['card-state'];
        }
        if (strlen($_POST['card-zip']) > 1) {
            $modelUser->zipcode = $_POST['card-zip'];
        }
        try {
            $modelUser->save();
        } catch (Exception $e) {
            //
        }

        $fields = [
            'ssl_merchant_id'        => $modelMethodPay->username,
            'ssl_user_id'            => $modelMethodPay->client_id,
            'ssl_pin'                => $modelMethodPay->client_secret,
            'ssl_show_form'          => 'false',
            'ssl_result_format'      => 'ASCII',
            'ssl_test_mode'          => 'false',
            'ssl_transaction_type'   => 'ccsale',
            'ssl_amount'             => $_GET['amount'],
            'ssl_card_number'        => urlencode($_POST['card-number']),
            'ssl_exp_date'           => urlencode($_POST['card-exp_date']),
            'ssl_cvv2cvc2_indicator' => 1,
            'ssl_cvv2cvc2'           => urlencode($_POST['card-cvc']),
            'ssl_customer_code'      => urlencode(substr($reference, 8)),
            'ssl_avs_address'        => urlencode($_POST['card-address']),
            'ssl_city'               => urlencode($_POST['card-city']),
            'ssl_state'              => urlencode($_POST['card-state']),
            'ssl_avs_zip'            => urlencode($_POST['card-zip']),
            'ssl_country'            => urlencode($_POST['card-country']),
        ];

        $fields_string = '';

        foreach ($fields as $key => $value) {$fields_string .= $key . '=' . $value . '&';}
        rtrim($fields_string, "&");

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $result = curl_exec($ch);

        curl_close($ch);

        if (preg_match('/ssl_result_message=APPROV/', $result)) {
            $success = 'Your payment was successful.';
            UserCreditManager::releaseUserCredit($modelUser->id, $_GET['amount'] * 0.97, 'Payment via Elevon', 1, $reference);

        } else {
            //$result = explode('errorMessage=', $result);
            $error = print_r($result, true);
        }

    }

?>
<!DOCTYPE html>
<html lang="en">
<head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
        <title>Stripe Getting Started Form</title>
      </head>

<body>
<!-- to display errors returned by createToken -->
        <span class="payment-errors"><center><font color=red size=5 ><?php echo $error ?></font></center> </span>
        <span class="payment-success"><center><font color=green size=7 ><?php echo $success ?></font></center> </span>

        <form action="" method="POST" id="payment-form">
            <div class="form-container">
                El sistema descontara el 3% del total de la transaccion por el pago con tarjeta de credito.
            <div class="personal-information">
                <h1>Payment Information : Amount                                                 <?php echo $_GET['amount'] ?></h1>
            </div> <!-- end of personal-information -->

          <input id="column-left" type="text" name="first-name" placeholder="First Name" value="<?php echo $modelUser->firstname ?>" />
          <input id="column-right" type="text" name="last-name" placeholder="Surname" value="<?php echo $modelUser->lastname ?>"  />
          <input id="input-field" class="card-number" card-numbertautocomplete="off" type="text" name="card-number" placeholder="Card Number" value="" />
          <input id="input-field" type="text" class="card-expiry-month" name ="card-exp_date" placeholder="MMYY "/>
          <input id="input-field" class="card-cvc"  type="text" name="card-cvc" placeholder="CCV"/>
          <input id="input-field" class="card-cvc"  type="text" name="card-address" placeholder="address" value="<?php echo $modelUser->address ?>"/>
          <input id="input-field" class="card-cvc"  type="text" name="card-city" placeholder="city" value="<?php echo $modelUser->city ?>" />
          <input id="input-field" class="card-cvc"  type="text" name="card-state" placeholder="state" value="<?php echo $modelUser->state ?>" />
          <input id="input-field" class="card-cvc"  type="text" name="card-zip" placeholder="zip" value="<?php echo $modelUser->zipcode ?>" />
          <input id="input-field" class="card-cvc"  type="text" name="card-country" placeholder="USA"/>

          <input id="input-button" type="submit" class="submit-button" value="Submit Payment"/>

        </form>

        <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Roboto:400,900,700,500);

body {
  padding: 60px 0;
  background-color: rgba(178,209,229,0.7);
  margin: 0 auto;
  width: 600px;
}
.body-text {
  padding: 0 20px 30px 20px;
  font-family: "Roboto";
  font-size: 1em;
  color: #333;
  text-align: center;
  line-height: 1.2em;
}
.form-container {
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.card-wrapper {
  background-color: #6FB7E9;
  width: 100%;
  display: flex;

}
.personal-information {
  background-color: #3C8DC5;
  color: #fff;
  padding: 1px 0;
  text-align: center;
}
h1 {
  font-size: 1.3em;
  font-family: "Roboto"
}
input {
  margin: 1px 0;
  padding-left: 3%;
  font-size: 14px;
}
input[type="text"]{
  display: block;
  height: 50px;
  width: 97%;
  border: none;
}
input[type="email"]{
  display: block;
  height: 50px;
  width: 97%;
  border: none;
}
input[type="submit"]{
  display: block;
  height: 60px;
  width: 100%;
  border: none;
  background-color: #3C8DC5;
  color: #fff;
  margin-top: 2px;
  curson: pointer;
  font-size: 0.9em;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
}
input[type="submit"]:hover{
  background-color: #6FB7E9;
  transition: 0.3s ease;
}
#column-left {
  width: 46.8%;
  float: left;
  margin-bottom: 2px;
}
#column-right {
  width: 46.8%;
  float: right;
}

@media only screen and (max-width: 480px){
  body {
    width: 100%;
    margin: 0 auto;
  }
  .form-container {
    margin: 0 2%;
  }
  input {
    font-size: 1em;
  }
  #input-button {
    width: 100%;
  }
  #input-field {
    width: 96.5%;
  }
  h1 {
    font-size: 1.2em;
  }
  input {
    margin: 2px 0;
  }
  input[type="submit"]{
    height: 50px;
  }
  #column-left {
    width: 96.5%;
    display: block;
    float: none;
  }
  #column-right {
    width: 96.5%;
    display: block;
    float: none;
  }
}

        </style>

   </body>
</html>
