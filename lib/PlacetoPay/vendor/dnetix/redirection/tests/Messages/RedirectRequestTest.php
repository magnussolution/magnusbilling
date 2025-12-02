<?php

use Dnetix\Redirection\Message\RedirectRequest;

class RedirectRequestTest extends TestCase
{
    public function testItParsesCorrectlyAPaymentRequest()
    {
        $data = [
            'locale' => 'en_US',
            'payer' => [
                'name' => 'Diego',
                'surname' => 'Calle',
                'email' => 'diego@testing.com',
                'documentType' => 'CC',
                'document' => '123456789',
                'mobile' => '3006108300',
                'address' => [
                    'street' => 'Fake street 123',
                    'city' => 'Medellin',
                    'state' => 'Antioquia',
                    'postalCode' => '050012',
                    'country' => 'CO',
                    'phone' => '4442310',
                ],
            ],
            'buyer' => [
                'name' => 'Johan',
                'surname' => 'Arango',
                'email' => 'joahn@testing.com',
                'documentType' => 'CC',
                'document' => '987654321',
                'mobile' => '3006108301',
                'address' => [
                    'street' => 'Fake street 321',
                    'city' => 'Bogota',
                    'state' => 'Bogota',
                    'postalCode' => '010012',
                    'country' => 'CO',
                    'phone' => '4442311',
                ],
            ],
            'payment' => [
                'reference' => 'Testing_2017',
                'description' => 'Testing payment for PHPUnit',
                'amount' => [
                    'taxes' => [
                        [
                            'kind' => 'valueAddedTax',
                            'amount' => 1.2,
                            'base' => 8,
                        ],
                    ],
                    'details' => [
                        [
                            'kind' => 'tip',
                            'amount' => 1,
                        ],
                        [
                            'kind' => 'insurance',
                            'amount' => 0.1,
                        ],
                    ],
                    'currency' => 'USD',
                    'total' => 10.283,
                ],
                'recurring' => [
                    'periodicity' => 'D',
                    'interval' => 7,
                    'nextPayment' => '2017-06-01',
                    'maxPeriods' => 4,
                    'notificationUrl' => 'http://recurring-notification.com/hello',
                ],
                'shipping' => [
                    'name' => 'Freddy',
                    'surname' => 'Mendivelso',
                    'email' => 'freddy@testing.com',
                    'documentType' => 'CC',
                    'document' => '918273645',
                    'mobile' => '3006108302',
                    'address' => [
                        'street' => 'Fake street 213',
                        'city' => 'Medellin',
                        'state' => 'Antioquia',
                        'postalCode' => '050012',
                        'country' => 'CO',
                        'phone' => '4442312',
                    ],
                ],
                'allowPartial' => true,
            ],
            'expiration' => '2018-05-18T21:42:21+00:00',
            'ipAddress' => '127.0.0.1',
            'userAgent' => 'PHPUnit',
            'returnUrl' => 'http://your-return-url.com',
            'cancelUrl' => 'http://your-cancel-url.com',
            'skipResult' => true,
            'noBuyerFill' => true,
            'captureAddress' => true,
            'paymentMethod' => 'CR_VS,_ATH_',
        ];
        $request = new RedirectRequest($data);

        $this->assertEquals($data['locale'], $request->locale());
        $this->assertEquals('EN', $request->language());
        $this->assertEquals($data['payment']['reference'], $request->reference());
        $this->assertTrue($request->payment()->allowPartial());
        $this->assertEquals($data['returnUrl'], $request->returnUrl());
        $this->assertEquals($data['cancelUrl'], $request->cancelUrl());
    }

    public function testItParsesCorrectlyASubscriptionRequest()
    {
        $data = [
            'buyer' => [
                'name' => 'Johan',
                'surname' => 'Arango',
                'email' => 'joahn@testing.com',
                'documentType' => 'CC',
                'document' => '987654321',
                'mobile' => '3006108301',
                'address' => [
                    'street' => 'Fake street 321',
                    'city' => 'Bogota',
                    'state' => 'Bogota',
                    'postalCode' => '010012',
                    'country' => 'CO',
                    'phone' => '4442311',
                ],
            ],
            'subscription' => [
                'reference' => 'Testing_S_2017',
                'description' => 'Testing payment for PHPUnit',
            ],
            'ipAddress' => '127.0.0.1',
            'userAgent' => 'PHPUnit',
        ];

        $additional = [
            'expiration' => '2018-05-18T21:42:21+00:00',
            'returnUrl' => 'http://your-return-url.com',
            'cancelUrl' => 'http://your-cancel-url.com',
            'skipResult' => true,
            'noBuyerFill' => true,
            'captureAddress' => true,
            'paymentMethod' => 'CR_VS,_ATH_',
            'userAgent' => 'PHPUnit',
            'ipAddress' => '127.0.0.12',
        ];

        $request = new RedirectRequest($data);
        $request->setReturnUrl($additional['returnUrl'])
            ->setIpAddress($additional['ipAddress'])
            ->setUserAgent($additional['userAgent'])
            ->setExpiration($additional['expiration'])
            ->setCancelUrl($additional['cancelUrl']);

        $this->assertEquals($data['subscription']['reference'], $request->reference());

        $this->assertEquals($additional['returnUrl'], $request->returnUrl());
        $this->assertEquals($additional['ipAddress'], $request->ipAddress());
        $this->assertEquals($additional['userAgent'], $request->userAgent());
        $this->assertEquals($additional['expiration'], $request->expiration());
        $this->assertEquals($additional['cancelUrl'], $request->cancelUrl());
    }
}