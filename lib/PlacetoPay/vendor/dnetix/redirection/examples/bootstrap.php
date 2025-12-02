<?php

/**
 * The only purpose for this file its bootstrap the classes and generate a single point
 * to instanciate the PlacetoPay class
 */
require_once __DIR__ . '/../vendor/autoload.php';

use Dnetix\Redirection\PlacetoPay;

/**
 * Instanciates the PlacetoPay object providing the login and tranKey, also the url that will be
 * used for the service
 * @return PlacetoPay
 */
function placetopay()
{
    return new PlacetoPay([
        'login' => getenv('P2P_LOGIN'),
        'tranKey' => getenv('P2P_TRANKEY'),
        'url' => getenv('P2P_URL'),
        'type' => getenv('P2P_TYPE') ?: PlacetoPay::TP_REST
    ]);
}