<?php


use Dnetix\Redirection\Carrier\Authentication;

class AuthenticationTest extends TestCase
{

    public function testItCreatesTheAuthenticationCorrectly()
    {
        $auth = new Authentication([
            'login' => 'login',
            'tranKey' => 'ABCD1234',
            'auth' => [
                'seed' => '2016-10-26T21:37:00+00:00',
                'nonce' => 'ifYEPnAcJbpDVR1t',
            ],
        ]);

        $data = $auth->asArray();

        $this->assertEquals('login', $data['login'], 'Login matches');
        $this->assertEquals('2016-10-26T21:37:00+00:00', $data['seed'], 'Seed matches');
        $this->assertEquals('aWZZRVBuQWNKYnBEVlIxdA==', $data['nonce'], 'Nonce matches');
        $this->assertEquals('Xi5xrRwrqPU21WE2JI4hyMaCvQ8=', $data['tranKey'], 'Trankey matches');
    }

}