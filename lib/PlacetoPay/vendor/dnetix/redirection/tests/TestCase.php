<?php

use Dnetix\Redirection\Contracts\Gateway;
use Dnetix\Redirection\PlacetoPay;

class TestCase extends PHPUnit_Framework_TestCase
{

    /**
     * @return Gateway
     */
    public function getGateway($data = [])
    {
        return new PlacetoPay(array_merge([
            'login' => getenv('P2P_LOGIN'),
            'tranKey' => getenv('P2P_TRANKEY'),
            'url' => getenv('P2P_URL'),
        ], $data));
    }

    /**
     * Adds required data to the test request, given that PHPUnit does not have a userAgent or ipAddress
     * @param $request
     * @return array
     */
    public function addRequest($request)
    {
        return array_merge([
            'ipAddress' => '127.0.0.1',
            'userAgent' => 'PHPUnit',
        ], $request);
    }

}