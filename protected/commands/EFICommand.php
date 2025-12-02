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

require_once "/var/www/html/mbilling/lib/efi/vendor/autoload.php";


use Efi\Exception\EfiException;
use Efi\EfiPay;

class EFICommand extends ConsoleCommand
{

    public function run($args)
    {

        $modelMethodPay = Methodpay::model()->find('payment_method = :key', [':key' => 'EFI']);

        $clientId     = $modelMethodPay->client_id; // insira seu Client_Id, conforme o ambiente (Des ou Prod)
        $clientSecret = $modelMethodPay->client_secret; // insira seu Client_Secret, conforme o ambiente (Des ou Prod)

        $options = [
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'sandbox'       => false, // altere conforme o ambiente (true = desenvolvimento e false = producao)
        ];

        $modelRefill = Refill::model()->findAll("description LIKE '%Status:Aguardando ID:%' AND payment = 0");

        foreach ($modelRefill as $key => $refill) {

            $token = explode(" ID:", $refill->description);
            $token = $token[1];

            echo $token . "\n";
            $params = [
                'token' => $token,
            ];

            try {
                $api                = new EfiPay($options);
                $chargeNotification = $api->getNotification($params, []);
                // Para identificar o status atual da sua transação você deverá contar o número de situações contidas no array, pois a última posição guarda sempre o último status. Veja na um modelo de respostas na seção "Exemplos de respostas" abaixo.
                // Veja abaixo como acessar o ID e a String referente ao último status da transação.

                // Conta o tamanho do array data (que armazena o resultado)
                $i = count($chargeNotification["data"]);
                // Pega o último Object chargeStatus
                $ultimoStatus = $chargeNotification["data"][$i - 1];
                // Acessando o array Status
                $status = $ultimoStatus["status"];
                // Obtendo o ID da transação
                $charge_id = $ultimoStatus["identifiers"]["charge_id"];
                // Obtendo a String do status atual
                $statusAtual = $status["current"];
                $description = '';
                // Com estas informações, você poderá consultar sua base de dados e atualizar o status da transação especifica, uma vez que você possui o "charge_id" e a String do STATUS
                switch ($statusAtual) {
                    case 'paid':
                        echo "o boleto foi pago";
                        $description = "Boleto gerado, Status:Pago dia " . date("y-m-d") . ", ID:" . $token;
                        UserCreditManager::releaseUserCredit($refill->id_user, $refill->credit, $description, 1, $token);
                        break;
                    case 'unpaid':
                        echo "o boleto nao foi pago";
                        $description = "Boleto gerado, Status:Não foi pago, ID:" . $token;
                        break;
                    case 'refunded':
                        echo "Pagamento devolvido pelo lojista ou pelo intermediador EFI.";
                        $description = "Boleto gerado, Status:Pagamento devolvido pelo lojista ou pelo intermediador EFI, ID:" . $token;
                        break;
                    case 'contested':
                        echo "Pagamento em processo de contestação.";
                        $description = "Boleto gerado, Status:Pagamento em processo de contestação, ID:" . $token;
                        break;
                    case 'canceled':
                        echo "Cobrança cancelada pelo vendedor ou pelo pagador.";
                        $description = "Boleto gerado, Status:Cobrança cancelada pelo vendedor ou pelo pagador, ID:" . $token;
                        break;
                    case 'waiting':
                        echo "Cobrança Aguardando pagamento";
                        break;
                }

                $refill->description = $description;
                $refill->save();

                //print_r($chargeNotification);
            } catch (EfiException $e) {
                print_r($e->code);
                print_r($e->error);
                print_r($e->errorDescription);
            } catch (Exception $e) {
                print_r($e->getMessage());
            }
        }
    }
}
