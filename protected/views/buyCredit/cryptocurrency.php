<?php header('Content-type: text/html; charset=utf-8');?>
<script>window.setTimeout( function() {
  window.location.reload();
}, 10000);</script>
<link rel="stylesheet" type="text/css" href="../../../resources/css/signup.css" />
<?php
    /**
     * Modelo para a tabela "Balance".
     * =======================================
     * ###################################
     * MagnusBilling
     *
     * @package MagnusBilling
     * @author Adilson Leffa Magnus.
     * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
     * ###################################
     *
     * This software is released under the terms of the GNU Lesser General Public License v3
     * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
     *
     * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
     * =======================================
     * Magnusbilling.com <info@magnusbilling.com>
     * 04/01/2018
     */

    $wallets = explode('|', $modelMethodPay->username);

    if ( ! isset($_GET['network']) || ! strlen($_GET['network'])) {

    ?>

<br>
<form id="contactform" align="center" method="get">
<table  width="100%" border="0" align="center">
    <tr>
        <td class="banco">
            <table width="100%" border="0">
            <select style="width: 100%" name="network" id="network">
                <option value="">SELECT THE CURRENCY AND NETWORK</option>
                <?php foreach ($wallets as $key => $wallet): ?>
                    <option value="<?php echo $key ?>"><?php echo $wallet ?></option>
                <?php endforeach;?>
            </select>
            <input type='hidden' name='amount' value='<?php echo $_GET['amount'] ?>' />
            <input type='hidden' name='id_method' value='<?php echo $_GET['id_method'] ?>' />
            <br>    <br>
             <input type="submit" value="Confirm">
            </table>
        </td>
    </tr>
    </tr>
</table>
</form>
<?php

    } else {

        $data    = explode('=>', $wallets[$_GET['network']]);
        $address = $data[1];
        $crypto  = strtoupper(strtok($data[0], '('));
        $network = '(' . strtok('');

        if (Yii::app()->session['currency'] == 'U$S' || Yii::app()->session['currency'] == '$') {
            $MB_currency = 'USD';
        } else if (Yii::app()->session['currency'] == 'R$') {
            $MB_currency = 'BRL';
        } elseif (Yii::app()->session['currency'] == '€') {
            $MB_currency = 'EUR';
        } elseif (Yii::app()->session['currency'] == 'AUD$') {
            $MB_currency = 'AUD';
        } else {
            $MB_currency = Yii::app()->session['currency'];
        }

        if (isset($_SESSION[$crypto]) && $_SESSION[$crypto] == $_GET['amount'] && isset($_SESSION['modelCryptocurrency_id'])) {

            $amountCrypto        = $_SESSION['amountCrypto'];
            $modelCryptocurrency = Cryptocurrency::model()->find('id = :key AND status = 0',
                [':key' => $_SESSION['modelCryptocurrency_id']]);

            if (isset($modelCryptocurrency->id)) {
                unset($_SESSION['modelCryptocurrency_id']);
                unset($_SESSION[$crypto]);
                echo '<br><center><image src="../../../resources/images/success.jpg" width=300px/><br><br><font color=green> Your PAYMENT was Accepted successfully!</font><br></center>';
                exit;
            }
        } else {
            $mb_credit = $_GET['amount'] + (rand(0, 10) / 10);

            $url = 'https://api.coinconvert.net/convert/' . $MB_currency . '/' . $crypto . '?amount=' . $_GET['amount'];

            $amountCrypto = file_get_contents($url);
            $amountCrypto = json_decode($amountCrypto);

            $amountCrypto = $amountCrypto->$crypto;

            $amountCrypto = number_format($amountCrypto, 4) . rand(11, 99);

            //avoid some amount in the same day
            for (;;) {
                $modelCryptocurrency = Cryptocurrency::model()->find('amountCrypto = :key AND date > :key1',
                    [':key' => $amountCrypto, ':key1' => date('Y-m-d')]);
                if (isset($modelCryptocurrency->id)) {
                    $amountCrypto = number_format($bitcoinPrice, 6) . rand(11, 99);

                } else {
                    break;
                }
            }

            $modelCryptocurrency               = new Cryptocurrency();
            $modelCryptocurrency->id_user      = Yii::app()->session['id_user'];
            $modelCryptocurrency->currency     = $crypto;
            $modelCryptocurrency->amountCrypto = $amountCrypto;
            $modelCryptocurrency->amount       = $_GET['amount'];
            $modelCryptocurrency->status       = 1;
            $modelCryptocurrency->save();

            $_SESSION[$crypto]                  = $_GET['amount'];
            $_SESSION['amountCrypto']           = $amountCrypto;
            $_SESSION['modelCryptocurrency_id'] = $modelCryptocurrency->id;
        }

    ?>


<form id="contactform" align="center">
<table  width="100%" border="0" align="center">
    <tr>
        <td class="banco">
            <table width="100%" border="0">
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td width="350"><p style="text-align: right;"><b>Address:&nbsp;</b></p></td>
                    <td><p style="text-align: left;"><?php echo $address; ?></p></td>
                </tr>
                <tr>
                    <td width="350"><p style="text-align: right;"><b><?php echo strtoupper($MB_currency) ?> Credit: &nbsp;</b></p></td>
                    <td width="400"><p style="text-align: left;"><?php echo strtoupper($MB_currency) ?><?php echo number_format($_GET['amount'], 2) ?></p></td>
                </tr>
                <tr>
                    <td width="350"><p style="text-align: right;"><b>Crypto amount: &nbsp;</b></p></td>
                    <td width="400"><p style="text-align: left;"><font color=red><?php echo $crypto ?><?php echo $amountCrypto ?></font></p></td>
                </tr>
                    <tr>
                    <td width="350"><p style="text-align: right;"><b>Crypto Network: &nbsp;</b></p></td>
                    <td width="400"><p style="text-align: left;"><?php echo $network ?> </p></td>
                </tr>
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td  width="350" colspan="2" style="text-align: center; font:bold 13px Arial, Helvetica, sans-serif; color:#0e119b;">
                        Send the exact amount above in the next 30 min.
                    </td>
                </tr>

                <tr>
                    <td  width="350" colspan="2" style="text-align: center; font:bold 13px Arial, Helvetica, sans-serif; color:#fc0404;">
                        If you send different amount or after 30 min the refill not be released.
                    </td>
                </tr>
                <tr><td>&nbsp;</td></tr>

                <td style="text-align: center;" colspan="2" class="banco" style="top: 100px;font:bold 13px Arial, Helvetica, sans-serif; color:#333;">
                    HOW BUY BITCOIN <br> https://www.bitcoin.com/buy-bitcoin <br> https://localbitcoins.com<br> https://poloniex.com<br> https://binance.com
                </td>

            </table>
        </td>
    </tr>
    </tr>
</table>
</form>

<?php }?>