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

    if (Yii::app()->session['currency'] == 'U$S') {
        $currency = 'USD';
    } else if (Yii::app()->session['currency'] == 'R$') {
        $currency = 'BRL';
    } elseif (Yii::app()->session['currency'] == '€') {
        $currency = 'EUR';
    } else {
        $currency = Yii::app()->session['currency'];
    }

    if (Yii::app()->session['language'] == 'pt_BR') {
        $language = 'pt';
    }

    if (Yii::app()->session['language'] == 'es') {
        $language = 'es';
    } else {
        $language = 'en';
    }

?>
<form method="POST" action="<?php echo $modelMethodPay->url ?>" target="_parent" id="buyForm">
	<input type="hidden" name="merchantId" value="<?php echo $modelMethodPay->username ?>">
	<input type="hidden" name="referenceCode" value="<?php echo $reference ?>">
	<input type="hidden" name="description" value="Voip Credit">
	<input type="hidden" name="ApiKey" value="<?php echo $modelMethodPay->username ?>">
	<input type="hidden" name="amount" value="<?php echo $_GET['amount'] ?>">
	<input type="hidden" name="currency" value="<?php echo $currency ?>">
	<input type="hidden" name="lng" value="<?php echo $language ?>">
	<input type="hidden" name="return" value="http://<?php echo $_SERVER['HTTP_HOST'] ?>/index.php">
	<input type="hidden" name="buyerEmail" value="<?php echo $modelUser->email; ?>">
	<input type="hidden" name="buyerFullName" value="<?php echo $modelUser->firstname . ' ' . $modelUser->lastname; ?>">
	<input type="hidden" name="payerPhone" value="<?php echo $modelUser->phone; ?>">
</form>


