<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

$items = [
  [
    'name' => 'Item 1',
    'amount' => 1,
    'value' => 1000
  ],
  [
    'name' => 'Item 2',
    'amount' => 2,
    'value' => 2000
  ] 
];

$customer = [
	'name' => 'Gorbadoc Oldbuck',
	'cpf' => '04267484171',
	'phone_number' => '5144916523'
];

$body = [
  'items' => $items,
  'customer' => $customer,
  'expire_at' => '2020-12-02',
  'repeats' => 5,
  'split_items' => false
];

try {
    $api = new Gerencianet($options);
    $carnet = $api->createCarnet([], $body);

    print_r($carnet);
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);
} catch (Exception $e) {
    print_r($e->getMessage());
}
