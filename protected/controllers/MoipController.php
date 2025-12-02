<?php

/**
 * Url for moip ruturn http://ip/billing/index.php/moip .
 * Url para configurar moip https://www.moip.com.br/AdmMainMenuMyData.do?method=transactionnotification
 * Meus dados -> Preferencia -> uNotificação das transações.
 * https://www.moip.com.br/PagamentoMoIP.do
 */
class MoipController extends Controller
{

    public function actionIndex()
    {
        if (isset($_POST['id_transacao'])) {
            $status_pagamento = $_POST['status_pagamento'];
            $monto            = $_POST['valor'];
            $tipopagamento    = $_POST['tipo_pagamento'];
            $codigo           = $_POST['cod_moip'];
            $usuario          = explode("-", $_POST['id_transacao']);
            $usuario          = trim($usuario[1]);
            $monto            = substr($monto, 0, -2);
            $description      = $tipopagamento . ', Nro. de transação MOIP ' . $codigo;
            if ($status_pagamento == 1) {
                $modelUser = User::model()->find('username = :usuario', array(':usuario' => $usuario));

                if ($modelUser && Refill::model()->countRefill($codigo, $modelUser->id) == 0) {
                    UserCreditManager::releaseUserCredit($modelUser->id, $monto, $description, 1, $codigo);
                }
            }
        }
    }
}
