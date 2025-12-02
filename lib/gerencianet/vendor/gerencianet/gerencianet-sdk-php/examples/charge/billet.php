<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

$params = ['id' => 0];

$customer = [
	'name' => 'Gorbadoc Oldbuck',
	'cpf' => '04267484171',
	'phone_number' => '5144916523'
];

$body = [
  'payment' => [
    'banking_billet' => [
      'expire_at' => '2018-12-12',
      'customer' => $customer
    ]
  ]
];

try {
    $api = new Gerencianet($options);
    $charge = $api->payCharge($params, $body);

    print_r($charge);
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);
} catch (Exception $e) {
    print_r($e->getMessage());
}
