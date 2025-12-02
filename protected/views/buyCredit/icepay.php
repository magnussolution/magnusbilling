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

    require_once "lib/icepay/icepay.php";

    if (preg_match("/ /", $modelMethodPay->show_name)) {
        $type        = explode(" ", $modelMethodPay->show_name);
        $typePayment = 'ICEPAY_' . $type[0];
    } else {
        $typePayment = 'ICEPAY_' . $modelMethodPay->show_name;
    }

    if (isset($_GET['sussess'])) {

        $order = Yii::app()->session['id_user'] . '_' . date('his');

        $method = new $typePayment($modelMethodPay->username, $modelMethodPay->pagseguro_TOKEN);

        if ( ! $method->OnSuccess()) {
            exit('error');
        }

        $data = $method->GetData();

        if ($data->status == "OK") {
            echo '<h1>Thank You! You have successfully completed the payment!</h1>';
        }

        exit('error');
    }

?>




<?php if ( ! isset($_POST['bank']) && $typePayment == 'ICEPAY_iDEAL'): ?>
<link rel="stylesheet" type="text/css" href="../../../resources/css/signup.css" />
<form class="rounded" id="contactform" action="" method="post">

    <h2><?php echo Yii::t('zii', 'Select the Bank') ?></h2>

            <div class="field">
                <div class="styled-select">
                <?php echo CHtml::dropDownList('bank', '', [
                        'ABNAMRO'      => 'ABN AMRO Bank',
                        'ASNBANK'      => 'ASN Bank',
                        'FRIESLAND'    => 'Friesland Bank',
                        'RABOBANK'     => 'Rabobank',
                        'ING'          => 'ING Bank',
                        'SNSBANK'      => 'SNS Bank',
                        'SNSREGIOBANK' => 'SNS Regio Bank',
                        'TRIODOSBANK'  => 'Triodos Bank',
                        'VANLANSCHOT'  => 'Van Lanschot Bankiers',
                ]); ?>
                </div>
            </div>

            <input class="button" type="submit" value = "<?php echo Yii::t('zii', 'Continue') ?>" />
</form>

<?php exit;?>
<?php endif;?>


<?php

    $method = new $typePayment($modelMethodPay->username, $modelMethodPay->pagseguro_TOKEN);

    if (isset($_GET['amount'])) {

        if ($typePayment == 'ICEPAY_iDEAL') {

            $sql     = "INSERT INTO pkg_refill_icepay (id_user, credit) VALUES (:id_user, :amount)";
            $command = Yii::app()->db->createCommand($sql);
            $command->bindValue(":id_user", $_SESSION["id_user"], PDO::PARAM_STR);
            $command->bindValue(":amount", $_GET['amount'], PDO::PARAM_STR);
            $command->execute();

            $OrderID = Yii::app()->db->lastInsertID;

            $method->SetOrderID($OrderID);
            $url = $method->Pay($_POST['bank'], $_GET['amount'] . '00', "Credit payment " . $_SESSION["username"]);

        }
        header("location: " . $url);
    }
?>
