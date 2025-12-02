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
    //need receive two decimal.
    $amount = $_GET['amount'];

?>
<form method="POST" action="https://paynow.sagepay.co.za/site/paynow.aspx" id="buyForm">



<input type='hidden' name='m4' value='<?php $modelMethodPay->username;?>'/>
<input type='hidden' name='m5' value='<?php echo $amount; ?>'/>


<input type='hidden' name='p4' value='<?php echo $amount; ?>'/>
<input type='hidden' name='p3' value='VoIP Refill ammount                                                          <?php echo $amount; ?> ZAR for<?php echo $modelUser->firstname . ' ' . $modelUser->lastname ?>'/>
<input type='hidden' name='p2' value='<?php echo $reference; ?>'/>


<input type="hidden" name="m1" value="<?php echo $modelMethodPay->P2P_KeyID ?>">
<input type="hidden" name="m2" value="<?php echo $modelMethodPay->client_id ?>">

<input type="hidden" name="Budget" value="N">
</form>