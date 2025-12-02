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

    $amount = intval($_GET['amount'] * 1.06);

    $merchantID = $modelMethodPay->username; // "teztelcom";
    $orderid    = $reference;
    $verifykey  = $modelMethodPay->pagseguro_TOKEN;
    $vcode      = md5($amount . $merchantID . $orderid . $verifykey);

?>

<form method="GET" action="https://www.onlinepayment.com.my/NBepay/pay/<?php echo $modelMethodPay->username ?>" target="_parent" id="buyForm">
<input type="hidden" name="amount" value="<?php echo $amount; ?>">
<input type="hidden" name="orderid" value="<?php echo $orderid; ?>">
<input type="hidden" name="bill_name" value="<?php echo $modelUser->lastname . ' ' . $modelUser->firstname; ?>">
<input type="hidden" name="bill_email"  value="<?php echo $modelUser->email; ?>">
<input type="hidden" name="bill_mobile" value="<?php echo $modelUser->phone; ?>">
<input type="hidden" name="bill_desc" value="Voip Credit to                                                            <?php echo $modelUser->username ?>">
<input type="hidden" name="cur" value="rm">
<input type="hidden" name="vcode" value="<?php echo $vcode; ?>">
<input type="hidden" name="returnurl" value="http://<?php echo $_SERVER['HTTP_HOST'] ?>/mbilling/index.php/molPay">
</form>