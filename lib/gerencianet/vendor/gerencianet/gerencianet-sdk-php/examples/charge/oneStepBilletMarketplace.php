<?php

require __DIR__.'/../../vendor/autoload.php';

use Gerencianet\Exception\GerencianetException;
use Gerencianet\Gerencianet;

$file = file_get_contents(__DIR__.'/../config.json');
$options = json_decode($file, true);
unset($options['pix_cert']);

     $repass_1 = [
      'payee_code' => "Insira_aqui_o_indentificador_da conta_destino", // identificador da conta Gerencianet (repasse 1)
      'percentage' => 2500 // porcentagem de repasse (2500 = 25%)
    ];
     
    $repass_2 = [
      'payee_code' => "Insira_aqui_o_indentificador_da conta_destino", // identificador da conta Gerencianet (repasse 2)
      'percentage' => 1500 // porcentagem de repasse (1500 = 15%)
    ];
     
    $repasses = [
      $repass_1,
      $repass_2
    ];

   $item_1 = [
       'name' => 'Item 1', // nome do item, produto ou serviço
       'amount' => 1, // quantidade
       'value' => 1500, // valor (1000 = R$ 10,00) (Obs: É possível a criação de itens com valores negativos. Porém, o valor total da fatura deve ser superior ao valor mínimo para geração de transações.)
       'marketplace'=>array('repasses'=>$repasses)
   ];
   $items = [
       $item_1
   ];

//  $metadata = array('notification_url'=>'sua_url_de_notificacao_.com.br'); //Url de notificações
   $customer = [
       'name' => 'Gorbadoc Oldbuck', // nome do cliente
       'cpf' => '94271564656', // cpf válido do cliente
       'phone_number' => '5144916523', // telefone do cliente
   ];
   $discount = [ // configuração de descontos
       'type' => 'currency', // tipo de desconto a ser aplicado
       'value' => 599 // valor de desconto 
   ];
   $configurations = [ // configurações de juros e mora
       'fine' => 200, // porcentagem de multa
       'interest' => 33 // porcentagem de juros
   ];
   $conditional_discount = [ // configurações de desconto condicional
       'type' => 'percentage', // seleção do tipo de desconto 
       'value' => 500, // porcentagem de desconto
       'until_date' => '2018-09-13' // data máxima para aplicação do desconto
   ];
   $bankingBillet = [
       'expire_at' => '2018-09-13', // data de vencimento do titulo
       'message' => 'teste\nteste\nteste\nteste', // mensagem a ser exibida no boleto
       'customer' => $customer,
       'discount' =>$discount,
       'conditional_discount' => $conditional_discount
   ];
   $payment = [
       'banking_billet' => $bankingBillet // forma de pagamento (banking_billet = boleto)
   ];
   $body = [
       'items' => $items,
    //   'metadata' =>$metadata,
       'payment' => $payment
   ];
   try {
     $api = new Gerencianet($options);
     $pay_charge = $api->oneStep([],$body);
     echo '<pre>';
     print_r($pay_charge);
     echo '<pre>';
     
    } catch (GerencianetException $e) {
       print_r($e->code);
       print_r($e->error);
       print_r($e->errorDescription);
   } catch (Exception $e) {
       print_r($e->getMessage());
   }