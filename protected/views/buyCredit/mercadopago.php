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

<?php
    if (Yii::app()->session['currency'] == 'U$S') {
        $currency = 'USD';
    } else if (Yii::app()->session['currency'] == 'R$') {
        $currency = 'BRL';
    } elseif (Yii::app()->session['currency'] == '€') {
        $currency = 'EUR';
    } else {
        $currency = 'USD';
    }

?>

<?php
    require_once 'lib/mercadopago/mercadopago.php';

    $mp = new MP($modelMethodPay->username, $modelMethodPay->pagseguro_TOKEN);

    $preference_data = [
        "items" => [
            [
                "title"       => $reference,
                "quantity"    => 1,
                "currency_id" => $currency,
                "unit_price"  => floatval($_GET['amount']),
            ],
        ],
    ];

    $preference = $mp->create_preference($preference_data);
?>
<script type="text/javascript">
    window.location.href = '<?php echo $preference['response']['init_point']; ?>';
</script>
<div id="load" >
    <a id='link' href="<?php echo $preference['response']['init_point']; ?>">
        <?php echo Yii::t('zii', 'Pay Now') ?>
    </a>

</div>