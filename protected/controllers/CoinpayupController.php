<?php

/**
 * URL for CoinPayUp webhook handler http://ip/billing/index.php/coinpayup .
 * 
 * INSERT INTO `pkg_method_pay` (`id`, `id_user`, `payment_method`, `show_name`, `country`, `active`, `active_agent`, `obs`, `url`, `username`, `pagseguro_TOKEN`, `fee`, `boleto_convenio`, `boleto_banco`, `boleto_agencia`, `boleto_conta_corrente`, `boleto_inicio_nosso_numeroa`, `boleto_carteira`, `boleto_taxa`, `boleto_instrucoes`, `boleto_nome_emp`, `boleto_end_emp`, `boleto_cidade_emp`, `boleto_estado_emp`, `boleto_cpf_emp`, `P2P_CustomerSiteID`, `P2P_KeyID`, `P2P_Passphrase`, `P2P_RecipientKeyID`, `P2P_tax_amount`, `client_id`, `client_secret`, `SLAppToken`, `SLAccessToken`, `SLSecret`, `SLIdProduto`, `SLvalidationtoken`, `min`, `max`, `showFields`) VALUES (NULL, '1', 'coinpayup', 'Coin pay up', 'Global', '0', '0', NULL, '', '', '', '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', '', '0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '10', '500', 'payment_method,show_name,id_user,country,active,min,max,min,max,username')
            
 */
class CoinpayupController extends CController
{
    public function actionIndex()
    {
        // Handle frontend success/error redirect URLs from CoinPayUp
        $result = isset($_GET['result']) ? strtolower($_GET['result']) : null;
        if ($result === 'success' || $result === 'error') {
            $invoiceId = isset($_GET['invoice_id']) ? htmlspecialchars($_GET['invoice_id']) : null;
            $status    = isset($_GET['status']) ? htmlspecialchars($_GET['status']) : null;

            header('Content-Type: text/html; charset=utf-8');
            if ($result === 'success') {
                echo '<h2>Payment completed successfully</h2>';
                if ($invoiceId) {
                    echo '<p>Invoice ID: ' . $invoiceId . '</p>';
                }
                if ($status) {
                    echo '<p>Status: ' . $status . '</p>';
                }
            } else {
                echo '<h2>Payment canceled / error</h2>';
                if ($invoiceId) {
                    echo '<p>Invoice ID: ' . $invoiceId . '</p>';
                }
                if ($status) {
                    echo '<p>Status: ' . $status . '</p>';
                }
            }
            return;
        }

        Yii::log('Coinpayup webhook received: ' . print_r($_SERVER, true), 'error');

        $rawBody = file_get_contents('php://input');
        Yii::log('Coinpayup raw body: ' . $rawBody, 'error');

        $payload = json_decode($rawBody, true);
        if (!is_array($payload)) {
            Yii::log('Coinpayup: invalid JSON payload', 'error');
            http_response_code(400);
            echo 'Invalid payload';
            return;
        }

        $signatureHeader = isset($_SERVER['HTTP_X_COINPAYUP_SIGNATURE']) ? $_SERVER['HTTP_X_COINPAYUP_SIGNATURE'] : '';
        $eventHeader     = isset($_SERVER['HTTP_X_COINPAYUP_EVENT']) ? $_SERVER['HTTP_X_COINPAYUP_EVENT'] : (isset($payload['event']) ? $payload['event'] : '');

        $modelMethodpay = Methodpay::model()->find('payment_method = :key AND active = 1', [':key' => 'Coinpayup']);
        if (!isset($modelMethodpay->id)) {
            Yii::log('Coinpayup: payment method Coinpayup not configured', 'error');
            http_response_code(404);
            echo 'Payment method not configured';
            return;
        }

        $webhookSecret = trim($modelMethodpay->client_secret);
        if (!strlen($webhookSecret) || !strlen($signatureHeader)) {
            Yii::log('Coinpayup: missing webhook secret or signature', 'error');
            http_response_code(401);
            echo 'Missing signature';
            return;
        }

        $serializedData = $payload;
        ksort($serializedData);
        $expectedSignature = hash_hmac('sha256', json_encode($serializedData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $webhookSecret);

        if (!hash_equals($expectedSignature, $signatureHeader)) {
            Yii::log("Coinpayup: invalid signature expected {$expectedSignature} received {$signatureHeader}", 'error');
            http_response_code(401);
            echo 'Invalid signature';
            return;
        }

        $event = isset($payload['event']) ? $payload['event'] : $eventHeader;
        $data  = isset($payload['data']) ? $payload['data'] : [];

        if (!is_array($data) || empty($data)) {
            Yii::log('Coinpayup: missing data section', 'error');
            http_response_code(400);
            echo 'Missing data';
            return;
        }

        $invoiceId  = isset($data['invoice_id']) ? $data['invoice_id'] : (isset($data['invoiceId']) ? $data['invoiceId'] : null);
        $externalId = isset($data['external_id']) ? $data['external_id'] : (isset($data['reference']) ? $data['reference'] : null);

        $amount = 0;
        if (isset($data['amount'])) {
            $amount = floatval($data['amount']);
        } elseif (isset($data['amount_paid'])) {
            $amount = floatval($data['amount_paid']);
        } elseif (isset($data['amount_received'])) {
            $amount = floatval($data['amount_received']);
        }

        if (!isset($invoiceId) || !isset($externalId) || !strlen($externalId) || !strlen($invoiceId)) {
            Yii::log('Coinpayup: invoice_id or external_id missing', 'error');
            http_response_code(400);
            echo 'Missing invoice_id or external_id';
            return;
        }

        $identification = Util::getDataFromMethodPay($externalId);
        if (!is_array($identification)) {
            Yii::log('Coinpayup: invalid external_id format: ' . $externalId, 'error');
            http_response_code(400);
            echo 'Invalid external_id';
            return;
        }

        $id_user   = (int) $identification['id_user'];
        $modelUser = User::model()->findByPk($id_user);
        if (!isset($modelUser->id)) {
            Yii::log('Coinpayup: user not found for id_user ' . $id_user, 'error');
            http_response_code(404);
            echo 'User not found';
            return;
        }

        if (!in_array($event, ['payment.confirmed', 'invoice.paid', 'invoice.overpaid'])) {
            Yii::log('Coinpayup: ignored event ' . $event, 'info');
            http_response_code(200);
            echo 'Event ignored';
            return;
        }

        if (Refill::model()->countRefill($invoiceId, $modelUser->id) > 0) {
            Yii::log('Coinpayup: duplicate invoice already processed ' . $invoiceId, 'info');
            http_response_code(200);
            echo 'Already processed';
            return;
        }

        if ($amount <= 0) {
            Yii::log('Coinpayup: zero amount for event ' . $event . ' invoice ' . $invoiceId, 'info');
            http_response_code(200);
            echo 'No amount to credit';
            return;
        }

        $description = "CoinPayUp {$event} invoice {$invoiceId}";
        Yii::log('Coinpayup: releasing credit for user ' . $modelUser->id . ' amount ' . $amount . ' description ' . $description, 'info');

        UserCreditManager::releaseUserCredit($modelUser->id, $amount, $description, 1, $invoiceId);

        http_response_code(200);
        echo json_encode(['status' => 'ok']);
    }
}
