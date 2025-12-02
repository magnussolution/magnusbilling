<?php

require __DIR__.'/../../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../../config.json');
$options = json_decode($file, true);

$options['headers'] = array(
    'x-skip-mtls-checking' => 'true',
);

try {
	$api = Gerencianet::getInstance($options);

	$params = ['chave' => ''];
	$body = ['webhookUrl' => ''];

	$pix = $api->pixConfigWebhook($params, $body);
	echo json_encode($pix);

} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);

    throw new Error($e->error);
} catch (Exception $e) {
    throw new Error($e->getMessage());
}
