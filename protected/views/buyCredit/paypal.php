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
?>
<div id="load" ><?php echo Yii::t('zii', 'Please wait while loading...') ?></div>

<script languaje="JavaScript">
    window.onload = function () {
        var form = document.getElementById("buyForm");
        form.submit();
    };
</script>
<?php
    if (Yii::app()->session['currency'] == 'U$S' || Yii::app()->session['currency'] == 'U$' || Yii::app()->session['currency'] == '$') {
        $currency = 'USD';
    } else if (Yii::app()->session['currency'] == 'R$') {
        $currency = 'BRL';
    } elseif (Yii::app()->session['currency'] == '€') {
        $currency = 'EUR';
    } elseif (Yii::app()->session['currency'] == 'AUD$') {
        $currency = 'AUD';
    } else {
        $currency = Yii::app()->session['currency'];
    }

    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://';
?>

<form method="POST" action="<?php echo $modelMethodPay->url ?>" target="_parent" id="buyForm">
    <input type="hidden" name="cmd" value="_xclick">
    <input type="hidden" name="business" value="<?php echo $modelMethodPay->username ?>">
    <input type="hidden" name="item_name" value="user,                                                       <?php echo $modelUser->username ?>">
    <input type="hidden" name="item_number" value="<?php echo $reference ?>">
    <input type="hidden" name="amount" value="<?php echo $_GET['amount'] ?>">
    <input type="hidden" name="no_shipping" value="1">
    <input type="hidden" name="return" value="<?php echo $protocol . $_SERVER['HTTP_HOST'] ?>/index.php">
    <input type="hidden" name="currency_code" value="<?php echo strtoupper($currency) ?>">
    <input type="hidden" name="lc" value="<?php echo $modelUser->language ?>">
    <input type="hidden" name="bn" value="PP-BuyNowBF">
    <input type="hidden" name="first_name" value="<?php echo $modelUser->firstname; ?>">
    <input type="hidden" name="last_name" value="<?php echo $modelUser->lastname; ?>">
    <input type="hidden" name="address1" value="<?php echo $modelUser->address; ?>">
    <input type="hidden" name="city" value="<?php echo $modelUser->city; ?>">
    <input type="hidden" name="state" value="<?php echo $modelUser->state; ?>">
    <input type="hidden" name="zip" value="<?php echo $modelUser->zipcode; ?>">
    <input type="hidden" name="night_phone_a" value="<?php echo $modelUser->phone; ?>">
    <input type="hidden" name="email" value="<?php echo $modelUser->email; ?>">
    <input type="hidden" name="notify_url" value="<?php echo $protocol . $_SERVER['HTTP_HOST'] ?>/mbilling/index.php/paypal" type="text">
 </form>