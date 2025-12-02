<?php

/**
 * Url for moip ruturn http://ip/billing/index.php/mercadoPago .
 * https://www.mercadopago.com.br/ipn-notifications
 */
class MercadoPagoController extends CController
{
    public $config;

    public function actionIndex()
    {
        Yii::log('mercadaoPago' . print_r($_REQUEST, true), 'error');

        require_once 'lib/mercadopago/mercadopago.php';

        $modelMethodpay = Methodpay::model()->find('payment_method = :key AND id_user = 1 AND active = 1', [':key' => 'MercadoPago']);

        $mp = new MP($modelMethodpay->username, $modelMethodpay->pagseguro_TOKEN);

        if ( ! isset($_GET["id"], $_GET["topic"]) || ! ctype_digit($_GET["id"])) {
            http_response_code(400);
            return;
        }

        $topic               = $_GET["topic"];
        $merchant_order_info = null;

        if (isset($_GET["id"])) {
            $payment_info = $mp->get_payment_info($_GET["id"]);

            if ($payment_info["status"] == 200) {

                if (isset($payment_info["response"]['status']) && $payment_info["response"]['status'] == 'approved') {
                    $amount = $payment_info["response"]['transaction_amount'];

                    $identification = Util::getDataFromMethodPay($payment_info["response"]['description']);

                    if ( ! is_array($identification)) {
                        exit;
                    }
                    $username = $identification['username'];
                    $id_user  = $identification['id_user'];

                    $code        = $payment_info["response"]['id'];
                    $description = "Pagamento confirmado, MERCADOPAGO:" . $code;
                    $modelUser   = User::model()->findByPk((int) $id_user);

                    if (isset($modelUser->id)) {
                        Yii::log($modelUser->id . ' ' . $amount . ' ' . $description . ' ' . $code, 'error');
                        UserCreditManager::releaseUserCredit($modelUser->id, $amount, $description, 1, $code);
                        header("HTTP/1.1 200 OK");
                    }

                }
            }
        }
    }
}
