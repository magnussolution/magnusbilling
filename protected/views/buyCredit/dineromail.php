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
    $url    = "http://finance.yahoo.com/d/quotes.csv?s=ARSUSD=X&f=l1";
    $handle = @fopen($url, 'r');
    if ($handle) {
        $result = fgets($handle, 4096);
        fclose($handle);
    }
    $cambio      = trim($result);
    $precioPesos = ($_GET['amount'] * 1.15) / $cambio;
?>


<form method="POST" action="<?php echo $modelMethodPay->url ?>" target="_parent" id="buyForm">
<input type='hidden' name='PrecioItem' value="<?php echo round($precioPesos, 2) ?>">
<input type='hidden' name='NombreItem' value="<?php echo $reference ?>">
<input type='hidden' name='TipoMoneda' value='1'>
<input type='hidden' name='E_Comercio' value='<?php echo $modelMethodPay->username ?>'>
<input type='hidden' name='NroItem' value='<?php echo $modelMethodPay->username ?>'>
<input type='hidden' name='image_url' value='http://'>
<input type='hidden' name='DireccionExito' value='http://<?php echo $_SERVER['HTTP_HOST'] ?>/index.php'>
<input type='hidden' name='DireccionFracaso' value='http://<?php echo $_SERVER['HTTP_HOST'] ?>/index.php'>
<input type='hidden' name='DireccionEnvio' value='1'>
<input type='hidden' name='Mensaje' value='1'>
<input type='hidden' name='MediosPago' value='4,2,7,13'>
<input type='hidden' name='transaction_id' value='<?php echo $modelMethodPay->id ?>'>
<input type='hidden' name='TRX_ID' value='<?php echo $modelMethodPay->id ?>' >
</form>