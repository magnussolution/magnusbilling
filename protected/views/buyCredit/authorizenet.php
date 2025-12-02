<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 *
 */
require_once "lib/anet/AuthorizeNet.php";

define("AUTHORIZENET_TRANSACTION_KEY", $modelMethodPay->pagseguro_TOKEN);
define("AUTHORIZENET_API_LOGIN_ID", $modelMethodPay->username);

if (preg_match("/sandbox/", $modelMethodPay->show_name)) {
    define("AUTHORIZENET_SANDBOX", true);
}

$sale           = new AuthorizeNetAIM;
$sale->amount   = $_GET['amount'];
$sale->card_num = $_GET['cc'];

$sale->exp_date    = $_GET['ed']; //'04/15';
$sale->invoice_num = date('YmdHis');

$sale->first_name = isset($modelUser->firstname) ? $modelUser->firstname : '';
$sale->last_name  = isset($modelUser->lastname) ? $modelUser->lastname : '';
$sale->address    = isset($modelUser->address) ? $modelUser->address : '';
$sale->city       = isset($modelUser->city) ? $modelUser->city : '';
$sale->state      = isset($modelUser->state) ? $modelUser->state : '';
$sale->phone      = isset($modelUser->phone) ? $modelUser->phone : '';
$sale->country    = isset($modelUser->country) ? $modelUser->country : '';

$response = $sale->authorizeAndCapture();
if ($response->approved) {
    $transaction_id = $response->transaction_id;
    $description    = 'AuthorizaNet, CreditCard ' . $response->card_type . ' ID:' . $response->transaction_id;

    $_SERVER['argv'][0] = 'cron';
    $model              = new Refill;
    $model->id_user     = $_SESSION["id_user"];
    $model->credit      = $response->amount;
    $model->description = $description;
    $model->payment     = 1;
    $model->save();

    echo json_encode([
        'success' => true,
        'msg'     => 'Thank You! You have successfully completed the payment!',
    ]);
    exit;

} else {
    echo json_encode([
        'success' => false,
        'msg'     => 'Oops, some error occured <br>' . $response->response_reason_text,
    ]);
    exit;
}
