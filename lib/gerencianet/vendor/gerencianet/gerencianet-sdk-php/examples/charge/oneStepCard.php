<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);
​
$paymentToken = 'a6c8ee07360c2a342662d73f3a1e18db5e1a890a';
​
$item_1 = [
   'name' => 'Gorbadoc Oldbuck',
   'amount' => 1,
   'value' => 3000
];
$items = [
   $item_1
];
$metadata = array('notification_url'=>'https://meuip.in/xxxxx.php');
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
  'discount' =>$discount,
  'billing_address' => $billingAddress,
  'payment_token' => $paymentToken,
  'message' => 'teste\nteste\nteste\nteste'
];
$payment = [
   'credit_card' => $credit_card
];
$body = [
   'items' => $items,
   'metadata' =>$metadata,
   'payment' => $payment
];
try {
       $api = new Gerencianet($options);
       $pay_charge = $api->oneStep([],$body);
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