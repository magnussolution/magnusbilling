<?php

require __DIR__ . '/../../autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__ . '/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

$paymentToken = 'Insira_aqui_seu_paymentToken';

$repass_1 = [
   'payee_code' => "Insira_aqui_o_indentificador_da conta_destino", // identificador da conta Gerencianet (repasse 1)
   'percentage' => 2500 // porcentagem de repasse (2500 = 25%)
];

$repass_2 = [
   'payee_code' => "Insira_aqui_o_indentificador_da conta_destino", // identificador da conta Gerencianet (repasse 2)
   'percentage' => 1500 // porcentagem de repasse (1500 = 15%)
];

$repasses = [
   $repass_1,
   $repass_2
];

$item_1 = [
   'name' => 'Item 1', // nome do item, produto ou serviço
   'amount' => 1, // quantidade
   'value' => 1500, // valor (1000 = R$ 10,00) (Obs: É possível a criação de itens com valores negativos. Porém, o valor total da fatura deve ser superior ao valor mínimo para geração de transações.)
   'marketplace' => array('repasses' => $repasses)
];
$items = [
   $item_1
];
$metadata = array('notification_url' => 'https:/seu.dominio/retorno');
$customer = [
   'name' => 'Gorbadoc Oldbuck',
   'cpf' => '04267484171',
   'phone_number' => '5144916523',
   'email' => 'oldbuck@api.efipay.com.br',
   'birth' => '1977-01-15'
];
$billingAddress = [
   'street' => 'Av JK',
   'number' => 909,
   'neighborhood' => 'Bauxita',
   'zipcode' => '35400000',
   'city' => 'Ouro Preto',
   'state' => 'MG'
];
$discount = [
   'type' => 'currency',
   'value' => 599
];
$configurations = [
   'fine' => 200,
   'interest' => 33
];
$credit_card = [
   'customer' => $customer,
   'installments' => 1,
   'discount' => $discount,
   'billing_address' => $billingAddress,
   'payment_token' => $paymentToken,
   'message' => 'teste\nteste\nteste\nteste'
];
$payment = [
   'credit_card' => $credit_card
];
$body = [
   'items' => $items,
   'metadata' => $metadata,
   'payment' => $payment
];
try {
   $api = new Gerencianet($options);
   $pay_charge = $api->oneStep([], $body);
   echo '<pre>';
   print_r($pay_charge);
   echo '<pre>';
} catch (GerencianetException $e) {
   print_r($e->code);
   print_r($e->error);
   print_r($e->errorDescription);
} catch (Exception $e) {
   print_r($e->getMessage());
}
