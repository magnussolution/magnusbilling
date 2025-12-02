<?php

/**
 * Acoes do modulo "Methodpay".
 *
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
 * 04/09/2017
 */
class PagHiperController extends Controller
{
    public function actionIndex()
    {
        Yii::log(print_r($_POST, true), 'error');

        if (isset($_POST['transaction_id'])) {
            $filter = "payment_method = 'paghiperpix'";
        } else {
            $filter = "payment_method = 'paghiper'";
        }
        $params = [];

        if (isset($_GET['id_agent'])) {
            $filter .= " AND id_user = :key1";
            $params = [':key1' => (int) $_GET['id_agent']];
        } else {
            $filter .= " AND id = 1";
        }

        $modelMethodpay = Methodpay::model()->find([
            'condition' => $filter,
            'params'    => $params,
        ]);

        if ( ! isset($modelMethodpay->id)) {
            Yii::log(print_r('Not found paghiper method', true), 'error');
            exit;
        }

        $idUser = $modelMethodpay->idUser->id_user;
        $token  = $modelMethodpay->pagseguro_TOKEN;

        $apiKey = $modelMethodpay->client_id;

        if (count($_POST) > 0) {
            // POST recebido, indica que é a requisição do NPI.

            if (isset($_POST['transaction_id'])) {

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "https://pix.paghiper.com/invoice/notification/");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HEADER, false);
                curl_setopt($ch, CURLOPT_POST, true);

                $requestBody = json_encode([
                    "apiKey"          => $apiKey,
                    "transaction_id"  => $_POST['transaction_id'],
                    "notification_id" => $_POST['notification_id'],
                    "token"           => $token,
                ]);

                Yii::log(print_r($requestBody, true), 'error');

                curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    "Content-Type: application/json",
                    "Accept: application/json",
                ]);

                $result = curl_exec($ch);

                $result = json_decode($result);
                Yii::log(print_r($result, true), 'error');
                if (isset($result->status_request->status) && $result->status_request->status == 'paid') {
                    // code...

                    $modelRefill = Refill::model()->find('description LIKE :key AND payment = 0', [':key' => '%' . $_POST['transaction_id'] . '%']);
                    if (isset($modelRefill->id)) {
                        $modelRefill->payment     = 1;
                        $modelRefill->description = preg_replace('/pendente/', 'confirmado', $modelRefill->description);
                        $modelRefill->save();

                        UserCreditManager::releaseUserCredit($modelRefill->id_user, $modelRefill->credit, 'PIX', 2, $_POST['transaction_id']);
                        header("HTTP/1.1 200 OK");
                        exit;
                    }
                } else {
                    exit;
                }
            }

            $transacaoID = isset($_POST['idTransacao']) ? $_POST['idTransacao'] : '';

            $status        = $_POST['status'];
            $codRetorno    = $_POST['codRetorno'];
            $valorOriginal = $_POST['valorOriginal'];
            $valorLoja     = $_POST['valorLoja'];
            //PREPARA O POST A SER ENVIADO AO PAGHIPER PARA CONFIRMAR O RETORNO
            //INICIO - NAO ALTERAR//
            //Não realizar alterações no script abaixo//
            $post = "idTransacao=$transacaoID" .
                "&status=$status" .
                "&codRetorno=$codRetorno" .
                "&valorOriginal=$valorOriginal" .
                "&valorLoja=$valorLoja" .
                "&token=$token";

            $enderecoPost = "https://www.paghiper.com/checkout/confirm/";

            ob_start();
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $enderecoPost);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $resposta = curl_exec($ch);
            curl_close($ch);

            $confirmado = (strcmp($resposta, "VERIFICADO") == 0);

            Yii::log('confirmado=' . $confirmado, 'error');

            //FIM - NAO ALTERAR//

            if ($confirmado) {
                $idPlataforma     = $_POST['idPlataforma'];
                $dataFromPagHiper = explode("-", $idPlataforma);
                $usuario          = trim($dataFromPagHiper[1]);
                $id_user          = trim($dataFromPagHiper[2]);
                $StatusTransacao  = $_POST['status'];
                $monto            = str_replace(",", ".", $_POST['valorTotal']);

                $description = "Pagamento confirmado, PAGHIPER:" . $transacaoID;
                Yii::log('description=' . $description, 'error');
                Yii::log('status=' . $status, 'error');
                if ($status == 'Aprovado') {
                    $modelUser = User::model()->find(
                        "username = :usuario AND id = :key",
                        [
                            ':usuario' => $usuario,
                            ':key'     => $id_user]
                    );

                    if (isset($modelUser->id) && Refill::model()->countRefill($transacaoID, $modelUser->id) == 0) {
                        Yii::log('teste liberar credito=' . $modelUser->id, 'error');
                        UserCreditManager::releaseUserCredit($modelUser->id, $monto, $description, 1, $transacaoID);
                    }
                }
                header("HTTP/1.1 200 OK");
            } else {
                echo 'error';
            }
        } else {
            echo '<h3>Obrigado por efetuar a compra.</h3>';
            header("HTTP/1.1 200 OK");
        }
    }
}
