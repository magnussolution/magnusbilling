<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

$params = ['id' => 0];

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

$body = [
	'items' => $items
];

try {
    $api = new Gerencianet($options);
    $subscription = $api->createSubscription($params, $body);

    print_r($subscription);
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);
} catch (Exception $e) {
    print_r($e->getMessage());
}
