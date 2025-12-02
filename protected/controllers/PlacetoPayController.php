<?php

/**
 * Url for paypal ruturn http://ip/billing/index.php/placetoPay .
 */
class PlacetoPayController extends Controller
{

    public function actionIndex()
    {

        if (isset($_GET['status']) && isset($_GET['ref'])) {
            $modelRefill = Refill::model()->findByPk((int) $_GET['ref']);
            if ($modelRefill->payment == 1) {
                echo '<br><br><center><font color=green>Estado: APROBADO Referencia:' . $_GET['ref'] . '</font></center>';
            } elseif ($_GET['status'] == 0) {
                echo '<br><br><center><font color=red>Estado: RECHAZADO Referencia:' . $_GET['ref'] . '</font></center>';
            } elseif ($_GET['status'] == 1) {
                echo '<br><br><center><font color=yellow>Estado: PENDIENTE Referencia:' . $_GET['ref'] . '</font></center>';
            }
            echo '<center> <a href="../../">Volver al panel</a> </center>';
            exit;
        }

        $rest = json_decode(file_get_contents('php://input'), true);
        Yii::log(print_r($rest, true), 'error');

        $modelMethodPay = Methodpay::model()->find('payment_method = :key', [':key' => 'PlacetoPay']);

        $val = sha1($rest['requestId'] . $rest['status']['status'] . $rest['status']['date'] . $modelMethodPay->P2P_KeyID);

        if ($val == $rest['signature']) {

            echo $rest['requestId'];

            $modelRefill = Refill::model()->find('invoice_number = :key', ['key' => $rest['requestId']]);
            if (isset($modelRefill->id)) {

                if ($rest['status']['status'] == 'APPROVED') {
                    $description = 'Recarga PlaceToPay <font color=green>Aprobada</font>. Referencia: ' . $rest['reference'];

                    if ($modelRefill->idUser->country == 57 && $modelRefill->credit > 0) {
                        $sql     = "INSERT INTO pkg_invoice (id_user) VALUES (:id_user)";
                        $command = Yii::app()->db->createCommand($sql);
                        $command->bindValue(":id_user", $modelRefill->id_user, PDO::PARAM_INT);
                        $command->execute();
                        $modelRefill->invoice_number = Yii::app()->db->lastInsertID;
                    }

                    $modelRefill->payment     = 1;
                    $modelRefill->description = $description;
                    $modelRefill->save();

                    $sql     = "UPDATE pkg_user SET credit = credit + :credit WHERE id = :id_user";
                    $command = Yii::app()->db->createCommand($sql);
                    $command->bindValue(":id_user", $modelRefill->id_user, PDO::PARAM_INT);
                    $command->bindValue(":credit", $modelRefill->credit, PDO::PARAM_STR);
                    $command->execute();

                    $mail = new Mail(Mail::$TYPE_REFILL, $modelRefill->id_user);
                    $mail->replaceInEmail(Mail::$ITEM_ID_KEY, $modelRefill->id);
                    $mail->replaceInEmail(Mail::$ITEM_AMOUNT_KEY, $modelRefill->credit);
                    $mail->replaceInEmail(Mail::$DESCRIPTION, $description);
                    $mail->send();
                } else {
                    $description = 'Recarga PlaceToPay <font color=red>rechazada</font>, referencia: ' . $rest['reference'];
                    Yii::log($description, 'error');
                    $modelRefill->payment     = 0;
                    $modelRefill->description = $description;
                    $modelRefill->save();
                }
            }
        } else {

            echo '<br>';
            echo 'ERROR: ';
        }
    }
}
