<?php

require_once (__DIR__ . "/../bootstrap.php");

// Creating a random reference for the test
$reference = 'TEST_' . time();

// Request Information
$request = json_decode('{
    "locale": "es_CO",
    "buyer": {
        "name": "Isabella",
        "surname": "Caro",
        "email": "isabellacaro@javeriana.edu.co",
        "address": {
            "street": "Carrera 6 # 45 - 09 Apto 1016 Edificio Portal de la javeriana II",
            "city": "Bogota",
            "phone": "3206515736",
            "country": "CO"
        },
        "mobile": null
    },
    "payment": {
        "reference": "300038996",
        "description": "Pago en PlacetoPay",
        "amount": {
            "taxes": [
                {
                    "kind": "valueAddedTax",
                    "amount": "42635.0000",
                    "base": 224397
                }
            ],
            "details": [
                {
                    "kind": "subtotal",
                    "amount": "224397.0000"
                },
                {
                    "kind": "discount",
                    "amount": 0
                },
                {
                    "kind": "shipping",
                    "amount": "0.0000"
                }
            ],
            "currency": "COP",
            "total": "267032.0000"
        },
        "shipping": {
            "name": "Isabella",
            "surname": "Caro",
            "email": "isabellacaro@javeriana.edu.co",
            "address": {
                "street": "Carrera 6 # 45 - 09 Apto 1016 Edificio Portal de la javeriana II",
                "city": "Bogota",
                "phone": "3206515736",
                "country": "CO"
            },
            "mobile": null
        }
    },
    "returnUrl": "https:\/\/www.ciudaddemascotas.com\/Perros\/placetopay\/processing\/response\/?reference=300038996",
    "expiration": "' . date('c', strtotime('+2 days')) . '",
    "ipAddress": "190.249.138.19",
    "userAgent": "Mozilla\/5.0 (X11; Linux x86_64) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/55.0.2883.87 Safari\/537.36"
}', true);

try {
    $response = placetopay()->request($request);

    if ($response->isSuccessful()) {
        // Redirect the client to the processUrl or display it on the JS extension
        // $response->processUrl();
    } else {
        // There was some error so check the message
        // $response->status()->message();
    }
    var_dump($response);
} catch (Exception $e) {
    var_dump($e->getMessage());
}

