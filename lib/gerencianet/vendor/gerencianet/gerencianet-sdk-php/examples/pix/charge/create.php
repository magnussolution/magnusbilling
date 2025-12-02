<?php

require __DIR__.'/../../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../../config.json');
$options = json_decode($file, true);

try {
    $api = Gerencianet::getInstance($options);

    $params = [];

    $body = [
          "calendario" => [
            "expiracao" => 3600
          ],
          "devedor" => [
            "cpf" => "12345678909",
            "nome" => "Francisco da Silva"
          ],
          "valor" => [
            "original" => "0.01"
          ],
          "chave" => "",
          "solicitacaoPagador" => "Cobrança dos serviços prestados.",
          "infoAdicionais" => [
            [
                "nome" => "Campo 1", // Nome do campo string (Nome) ≤ 50 characters
                "valor" => "Informação Adicional1 do PSP-Recebedor" // Dados do campo string (Valor) ≤ 200 characters
            ],
            [
                "nome" => "Campo 2",
                "valor" => "Informação Adicional2 do PSP-Recebedor"
            ]
          ]
    ];

    $pix = $api->pixCreateImmediateCharge($params, $body);

    if($pix['txid']) {

        // Gera QRCode
        $params = [
            'id' => $pix['loc']['id']
        ];
        $qrcode = $api->pixGenerateQRCode($params);

        echo 'Detalhes da cobrança:';
        echo '<pre>'.json_encode($pix, JSON_PRETTY_PRINT).'</pre>';

        echo 'QR Code:';
        echo '<pre>'.json_encode($qrcode, JSON_PRETTY_PRINT).'</pre>';

        echo 'Imagem:<br />';
        echo '<img src="'. $qrcode['imagemQrcode'] .'" />';
    }

} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);

    throw new Error($e->error);
} catch (Exception $e) {
    throw new Error($e->getMessage());
}
