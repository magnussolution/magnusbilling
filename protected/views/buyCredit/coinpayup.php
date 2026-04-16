<?php
header('Content-type: text/html; charset=utf-8');

// CoinPayUp integration view (create invoice and redirect to checkout)

$apiKey = trim($modelMethodPay->username);
if (empty($apiKey)) {
    echo '<h2>CoinPayUp API key is not configured.</h2>';
    exit;
}

if (!isset($_GET['amount']) || floatval($_GET['amount']) <= 0) {
    echo '<h2>Invalid amount.</h2>';
    exit;
}

$amount = number_format(floatval($_GET['amount']), 2, '.', '');

if (Yii::app()->session['currency'] == 'U$S' || Yii::app()->session['currency'] == '$') {
    $MB_currency = 'USD';
} elseif (Yii::app()->session['currency'] == 'R$') {
    $MB_currency = 'BRL';
} elseif (Yii::app()->session['currency'] == '€') {
    $MB_currency = 'EUR';
} elseif (Yii::app()->session['currency'] == 'AUD$') {
    $MB_currency = 'AUD';
} else {
    $MB_currency = Yii::app()->session['currency'];
}

$reference = date('YmdHis') . '-' . $modelUser->username . '-' . $modelUser->id;

$callbackUrl = Yii::app()->createAbsoluteUrl('coinpayup/index');
$successUrl  = Yii::app()->createAbsoluteUrl('coinpayup/index', ['result' => 'success']);
$cancelUrl   = Yii::app()->createAbsoluteUrl('coinpayup/index', ['result' => 'error']);

$requestBody = [
    'amount'      => floatval($amount),
    'currency'    => strtoupper($MB_currency),
    'description' => 'MagnusBilling credit for user ' . $modelUser->username,
    'external_id' => $reference,
    'reference'   => $reference,
    'callback_url' => $callbackUrl,
    'success_url' => $successUrl,
    'cancel_url'  => $cancelUrl,
    'expiry_minutes' => 60,
];


$ch = curl_init('https://coinpayup.com/api/invoices');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlError) {
    echo '<h2>CoinPayUp communication error:</h2><p>' . htmlspecialchars($curlError) . '</p>';
    exit;
}

$body = json_decode($response, true);
if (!is_array($body)) {
    echo '<h2>CoinPayUp invalid response</h2><pre>' . htmlspecialchars($response) . '</pre>';
    exit;
}

$checkoutUrl = null;
if (isset($body['checkout_url'])) {
    $checkoutUrl = $body['checkout_url'];
} elseif (isset($body['invoice_url'])) {
    $checkoutUrl = $body['invoice_url'];
} elseif (isset($body['data']['checkout_url'])) {
    $checkoutUrl = $body['data']['checkout_url'];
} elseif (isset($body['data']['invoice_url'])) {
    $checkoutUrl = $body['data']['invoice_url'];
}

$invoiceId = isset($body['id']) ? $body['id'] : (isset($body['data']['id']) ? $body['data']['id'] : null);

// Fallback for CoinPayUp API versions that return only id and wallet info (no checkout_url)
if (!$checkoutUrl && isset($body['id'])) {
    $checkoutUrl = 'https://coinpayup.com/checkout/' . $body['id'];
} elseif (!$checkoutUrl && isset($body['id']) && ! isset($invoiceId)) {
    $invoiceId = $body['id'];
}

// If still no checkout URL, use invoice_id fallback as URL
if (!$checkoutUrl && $invoiceId) {
    $checkoutUrl = 'https://coinpayup.com/checkout/' . $invoiceId;
}

if ($invoiceId) {
    $modelRefill = new Refill();
    $modelRefill->id_user = $modelUser->id;
    $modelRefill->credit = floatval($amount);
    $modelRefill->payment = 0;
    $modelRefill->invoice_number = $invoiceId;
    $modelRefill->description = 'CoinPayUp pending invoice ' . $invoiceId . ' (' . $reference . ')';
    $modelRefill->save();
}

if ($checkoutUrl && $httpCode >= 200 && $httpCode < 300) {
    header('Location: ' . $checkoutUrl);
    exit;
}

$failure = isset($body['error']) ? $body['error'] : (isset($body['message']) ? $body['message'] : 'Unable to create invoice');

echo '<h2>CoinPayUp checkout failed</h2>';
echo '<p>Status: ' . htmlspecialchars($httpCode) . '</p>';
echo '<pre>' . htmlspecialchars(json_encode($body, JSON_PRETTY_PRINT)) . '</pre>';
if ($checkoutUrl) {
    echo '<p><a href="' . htmlspecialchars($checkoutUrl) . '">Go to payment page</a></p>';
}
