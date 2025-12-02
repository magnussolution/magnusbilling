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

$doc      = preg_replace('/\.|\-|\//', '', $modelUser->doc);
$cpf_cnpj = new ValidaCPFCNPJ($doc);

// URL DE SANDBOX https://sandbox.pagseguro.uol.com.br
$url                      = 'https://ws.pagseguro.uol.com.br/v2/checkout';
$data['email']            = $modelMethodPay->username;
$data['token']            = $modelMethodPay->pagseguro_TOKEN;
$data['currency']         = 'BRL';
$data['itemId1']          = $reference;
$data['itemDescription1'] = "Credito voip";
$data['itemAmount1']      = number_format($_GET['amount'], 2, '.', '');
$data['itemQuantity1']    = 1;
$data['itemWeight1']      = 0;
$data['reference']        = $reference; //aqui vai o código que será usado para receber os retornos das notificações
$data['senderAreaCode']   = "11";
$data['senderPhone']      = "940040435";
$data['senderEmail']      = $modelUser->email;
if ($cpf_cnpj->valida() == 1) {
    $data['documentstype'] = strlen($doc) == 11 ? 'CPF' : 'CNPJ';

    if (strlen($doc) == 11) {
        $data['senderCPF'] = $doc;
    } else {
        $data['senderCNPJ'] = $doc;
    }
}
$data['senderName']            = $modelUser->firstname . ' ' . $modelUser->lastname;
$data['shippingType']          = "3";
$data['shippingAddressStreet'] = $modelUser->address;
$data['shippingAddressNumber'] = 4875;

$data['shippingAddressDistrict']   = "centro";
$data['shippingAddressPostalCode'] = preg_replace('/ |\-/', '', $modelUser->zipcode);
$data['shippingAddressCity']       = $modelUser->city;
$data['shippingAddressState']      = $modelUser->state;
$data['shippingAddressCountry']    = $modelUser->country;

$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://';

$data['redirectURL'] = $protocol . $_SERVER['HTTP_HOST'] . '/mbilling/index.php/pagseguro';
$data                = http_build_query($data);
$curl                = curl_init($url);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
$xml = curl_exec($curl);

if ($xml == 'Unauthorized') {
    echo "Unauthorized";
    exit();
}
curl_close($curl);
$xml = simplexml_load_string($xml);
if (count($xml->error) > 0) {
    echo '<center><br>';
    foreach ($xml->error->message as $key => $value) {
        echo '<font color=red>' . $value . '</font>';
    }
    echo '</center>';
    exit();
}

// Redireciona o comprador para a página de pagamento
header('Location: https://pagseguro.uol.com.br/v2/checkout/payment.html?code=' . $xml->code);
