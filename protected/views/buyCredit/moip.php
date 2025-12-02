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
    $amount = number_format($_GET['amount'], 2);
    $amount = preg_replace("/\.|\,/", '', $amount);
?>
<form method="POST" action="<?php echo $modelMethodPay->url ?>" target="_parent" id="buyForm">
	<input type='hidden' name='id_carteira' value='<?php echo $modelMethodPay->username ?>'/>
	<input type='hidden' name='valor' value='<?php echo $amount; ?>'/>
	<input type='hidden' name='nome' value='Credito VoIP'/>
	<input type='hidden' name='id_transacao' value='<?php echo $reference; ?>'/>
	<input id="pagador_nome" type="hidden" name="pagador_nome" value="<?php echo $modelUser->firstname . ' ' . $modelUser->lastname ?>"/>
	<input id="pagador_email" type="hidden" name="pagador_email" value="<?php echo $modelUser->email; ?>"/>
	<input id="pagador_telefone" type="hidden" name="pagador_telefone" value="<?php echo $modelUser->phone; ?>"/>
	<input id="pagador_logradouro" type="hidden" name="pagador_logradouro" value="<?php echo $modelUser->address; ?>"/>
	<input id="pagador_numero" type="hidden" name="pagador_numero" value="10"/>
	<input id="pagador_bairro" type="hidden" name="pagador_bairro" value="Centro"/>
	<input id="pagador_cep" type="hidden" name="pagador_cep" value="<?php echo $modelUser->zipcode; ?>"/>
	<input id="pagador_cidade" type="hidden" name="pagador_cidade" value="<?php echo $modelUser->city; ?>"/>
	<input id="pagador_estado" type="hidden" name="pagador_estado" value="<?php echo $modelUser->state; ?>"/>
	<input id="pagador_pais" type="hidden" name="pagador_pais" value="Brasil"/>
</form>