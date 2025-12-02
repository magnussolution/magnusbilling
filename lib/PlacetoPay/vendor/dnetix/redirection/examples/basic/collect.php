<?php

require_once(__DIR__ . "/../bootstrap.php");

// Creating a random reference for the test
$reference = 'TEST_' . time();

// Request Information
$request = [
    'payer' => [
        'name' => 'John',
        'surname' => 'Doe',
        'email' => 'john.doe@example.com',
        'document' => '1040035000',
        'documentType' => 'CC',
        'mobile' => '3006108300'
    ],
    'payment' => [
        'reference' => $reference,
        'description' => 'Testing payment',
        'amount' => [
            'currency' => 'COP',
            'total' => 12000,
        ],
    ],
    'instrument' => [
        'token' => [
            'token' => 'YOUR_TOKEN_HERE'
        ]
    ]
];

try {
    $response = placetopay()->collect($request);

    if ($response->isSuccessful()) {

        // Store this id associating it with the order that you are collecting for to query for it later
        $requestId = $response->requestId();

        if ($response->status()->isApproved()) {
            // The payment has been approved
            print_r($requestId . " PAYMENT APPROVED\n");
            // This is additional information about it
            var_dump($response->payment());
        }else{
            if ($response->status()->isRejected()) {
                // This is why it has been rejected
                print_r($response);
            } else{
                // Is pending so make a query for it later (see information.php example)
                print_r($requestId . " PAYMENT PENDING\n");
            }
        }
    } else {
        // There was some error so check the message
        print_r($response->status()->message() . "\n");
    }
} catch (Exception $e) {
    var_dump($e->getMessage());
}

