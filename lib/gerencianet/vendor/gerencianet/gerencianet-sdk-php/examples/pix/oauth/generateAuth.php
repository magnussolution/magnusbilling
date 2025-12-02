<?php

require __DIR__.'/../../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;
use Gerencianet\Auth;

$file = file_get_contents(__DIR__.'/../../config.json');
$options = json_decode($file, true);

try {
    $auth = new Auth($options);
    $auth->authorize();//generate Access Token

    echo json_encode($auth->__get('accessToken'));
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->errorDescription);

    throw new Error($e->error);
} catch (Exception $e) {
    throw new Error($e->getMessage());
}
