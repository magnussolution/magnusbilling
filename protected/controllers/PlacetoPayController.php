<?php

/**
 * Url for PlacetoPay return http://ip/billing/index.php/placetoPay .
 */
class PlacetoPayController extends Controller
{
    public function actionIndex()
    {
        // --- 1) RETORNO VIA GET (quando usuário volta da página de pagamento) ---
        if (isset($_GET['status']) && isset($_GET['ref'])) {

            $ref    = (int) $_GET['ref'];
            $status = (int) $_GET['status'];

            $modelRefill = Refill::model()->findByPk($ref);
            if (!$modelRefill) {
                echo '<br><br><center><font color="red">Referencia inválida.</font></center>';
                echo '<center><a href="../../">Volver al panel</a></center>';
                exit;
            }

            // pago aprovado no sistema
            if ((int)$modelRefill->payment === 1) {
                echo '<br><br><center><font color="green">Estado: APROBADO Referencia: ' . $ref . '</font></center>';
            } elseif ($status === 0) {
                echo '<br><br><center><font color="red">Estado: RECHAZADO Referencia: ' . $ref . '</font></center>';
            } elseif ($status === 1) {
                echo '<br><br><center><font color="yellow">Estado: PENDIENTE Referencia: ' . $ref . '</font></center>';
            } else {
                echo '<br><br><center><font color="red">Estado: DESCONOCIDO Referencia: ' . $ref . '</font></center>';
            }

            echo '<center><a href="../../">Volver al panel</a></center>';
            exit;
        }

        // --- 2) NOTIFICAÇÃO / CALLBACK VIA JSON (PlacetoPay -> servidor) ---

        $rawBody = file_get_contents('php://input');
        $rest    = json_decode($rawBody, true);

        // Loga o corpo recebido para auditoria/debug
        Yii::log(print_r($rest, true), 'error');

        if (
            !is_array($rest)
            || !isset($rest['requestId'], $rest['status']['status'], $rest['status']['date'], $rest['signature'])
        ) {
            echo 'ERROR';
            return;
        }

        $modelMethodPay = Methodpay::model()->find(
            'payment_method = :key',
            [':key' => 'PlacetoPay']
        );

        if (!$modelMethodPay || empty($modelMethodPay->P2P_KeyID)) {
            echo 'ERROR';
            return;
        }

        $expectedSignature = sha1(
            $rest['requestId'] .
                $rest['status']['status'] .
                $rest['status']['date'] .
                $modelMethodPay->P2P_KeyID
        );

        $receivedSignature = (string)$rest['signature'];

        // comparação mais segura (quando disponível)
        if (function_exists('hash_equals')) {
            $validSignature = hash_equals($expectedSignature, $receivedSignature);
        } else {
            $validSignature = ($expectedSignature === $receivedSignature);
        }

        if (!$validSignature) {
            echo 'ERROR';
            return;
        }

        // A partir daqui, assinatura é válida
        $requestId = $rest['requestId'];

        // Se você realmente precisa imprimir isso:
        // echo (int)$requestId;

        $modelRefill = Refill::model()->find(
            'invoice_number = :key',
            [':key' => $requestId]
        );

        if (!isset($modelRefill->id)) {
            echo 'ERROR';
            return;
        }

        $statusCode = (string)$rest['status']['status'];
        $reference  = isset($rest['reference']) ? (string)$rest['reference'] : '';

        if ($statusCode === 'APPROVED') {

            // Escapa a referência para evitar HTML injetado em description
            $safeReference = htmlspecialchars($reference, ENT_QUOTES, 'UTF-8');

            $description = 'Recarga PlaceToPay Aprobada. Referencia: ' . $safeReference;

            // Exemplo de lógica específica por país
            if ((int)$modelRefill->idUser->country === 57 && $modelRefill->credit > 0) {
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
            $safeReference = htmlspecialchars($reference, ENT_QUOTES, 'UTF-8');
            $description   = 'Recarga PlaceToPay rechazada, referencia: ' . $safeReference;

            Yii::log($description, 'error');

            $modelRefill->payment     = 0;
            $modelRefill->description = $description;
            $modelRefill->save();
        }
    }
}
