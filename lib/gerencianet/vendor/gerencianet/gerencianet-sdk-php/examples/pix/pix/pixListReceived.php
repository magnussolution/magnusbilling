<?php

require __DIR__.'/../../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../../config.json');
$options = json_decode($file, true);

try {
    $params = ['inicio' => '2020-11-22T16:01:35Z', 'fim' => '2021-01-22T16:01:35Z'];

    $api = Gerencianet::getInstance($options);
    $pix = $api->pixReceivedList($params);

    echo json_encode($pix);
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);

    throw new Error($e->error);
} catch (Exception $e) {
    throw new Error($e->getMessage());
}
