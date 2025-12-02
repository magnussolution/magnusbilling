<?php

$charges = include __DIR__ . '/Charges.php';
$pix = include __DIR__ . '/Pix.php';
$openFinance = include __DIR__ . '/OpenFinance.php';
$payments = include __DIR__ . '/Payments.php';
$openingAccounts = include __DIR__ . '/OpeningAccounts.php';

return [
    "APIs" => [
        "CHARGES" => $charges,
        "PIX" => $pix,
        "OPEN-FINANCE" => $openFinance,
        "PAYMENTS" => $payments,
        "OPENING-ACCOUNTS" => $openingAccounts,
    ]
];
