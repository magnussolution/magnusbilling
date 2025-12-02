<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

$params = ['id' => 1];

$body = [
  'title' => 'Balancete Demonstrativo',
  'body' => 
  [
    0 => 
    [
      'header' => 'Demonstrativo de Consumo',
      'tables' => 
      [
        0 => 
        [
          'rows' => 
          [
            0 => 
            [
              0 => 
              [
                'align' => 'left',
                'color' => '#000000',
                'style' => 'bold',
                'text' => 'Exemplo de despesa',
                'colspan' => 2,
              ],
              1 => 
              [
                'align' => 'left',
                'color' => '#000000',
                'style' => 'bold',
                'text' => 'Total lançado',
                'colspan' => 2,
              ],
            ],
            1 => 
            [
              0 => 
              [
                'align' => 'left',
                'color' => '#000000',
                'style' => 'normal',
                'text' => 'Instalação',
                'colspan' => 2,
              ],
              1 => 
              [
                'align' => 'left',
                'color' => '#000000',
                'style' => 'normal',
                'text' => 'R$ 100,00',
                'colspan' => 2,
              ],
            ],
          ],
        ],
      ],
    ],
    1 => 
    [
      'header' => 'Balancete Geral',
      'tables' => 
      [
        0 => 
        [
          'rows' => 
          [
            0 => 
            [
              0 => 
              [
                'align' => 'left',
                'color' => '#000000',
                'style' => 'normal',
                'text' => 'Confira na documentação da Gerencianet todas as configurações possíveis de um boleto balancete.',
                'colspan' => 4,
              ],
            ],
          ],
        ],
      ],
    ],
  ],
];

try {
    $api = new Gerencianet($options);
    $response = $api->createChargeBalanceSheet($params, $body);

    print_r($response);
} catch (GerencianetException $e) {
    print_r($e->code);
    print_r($e->error);
    print_r($e->errorDescription);
} catch (Exception $e) {
    print_r($e->getMessage());
}
