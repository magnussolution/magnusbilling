<?php

/**
 * View to modulo "PlacetoPay".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package    MagnusBilling
 * @author    Adilson Leffa Magnus.
 * @copyright    Todos os direitos reservados.
 * ###################################
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 * 2016-03-18
 */
?>
<?php

require_once "lib/efi/vendor/autoload.php";

use Efi\Exception\EfiException;
use Efi\EfiPay;

$modelUser->doc = preg_replace("/-|\.|\//", "", $modelUser->doc);
if (!isset($modelUser->email) || strlen($modelUser->email) < 10 || !preg_match("/@/", $modelUser->email)) {
    echo "<div id='load' > " . Yii::t('zii', 'Invalid Email') . "</div> ";
    return;
}

if (!isset($modelUser->doc) || strlen($modelUser->doc) < 10) {
    echo "<div id='load' > " . Yii::t('zii', 'Invalid DOC') . "</div> ";
    return;
}
if (!preg_match("/^[1-9]{2}9?[0-9]./", $modelUser->mobile)) {
    echo "<div id='load' > " . 'Você precisa cadastrar seu celular: FORMATO DDD número' . "</div> ";
    return;
}
$tipo = strlen($modelUser->doc) == 11 ? 'fisica' : 'juridica';

if ($tipo == 'juridica') {
    if (!isset($modelUser->company_name) || strlen($modelUser->company_name) < 10) {
        echo "Voce precisa cadastrar o nome da empresa";
        return;
    }
}

if (!isset($_GET['id'])) {
    $amount = number_format($_GET['amount'], 2);
    $amount = preg_replace("/\.|\,/", '', $amount);

    $clientId     = $modelMethodPay->client_id; // insira seu Client_Id, conforme o ambiente (Des ou Prod)
    $clientSecret = $modelMethodPay->client_secret; // insira seu Client_Secret, conforme o ambiente (Des ou Prod)

    $options = [
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'sandbox'       => false, // altere conforme o ambiente (true = desenvolvimento e false = producao)
    ];

    $item_1 = [
        'name'   => "usuario, " . $modelUser->username, // nome do item, produto ou serviço
        'amount' => 1, // quantidade
        'value'  => intval($amount), // valor (1000 = R$ 10,00)
    ];

    $items = [
        $item_1,
    ];

    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://';

    $metadata = array('notification_url' => $protocol . $_SERVER['HTTP_HOST'] . '/mbilling/index.php/efi?id_user=' . $modelUser->id . '&id=' . time() . '&amount=' . $_GET['amount']);

    $body = [
        'items'    => $items,
        'metadata' => $metadata,
    ];

    try {
        $api    = new EfiPay($options);
        $charge = $api->createCharge([], $body);
    } catch (EfiException $e) {
        print_r($e->code);
        print_r($e->error);
        print_r($e->errorDescription);
    } catch (Exception $e) {
        print_r('88' . $e);
    }

    if (isset($charge['data']['charge_id'])) {
        //echo "Processando Pagamento ID: ". $charge['data']['charge_id']." .....<br>";
    } else {
        exit;
    }

    sleep(1);
} else {

    $charge['data']['charge_id'] = $_GET['id'];
}

$params = [
    'id' => $charge['data']['charge_id'],
];

$dataVencimento = date("Y-m-d", mktime(0, 0, 0, date("m"), date("d") + 7, date("Y")));

$body = [
    "message"                  => "Username " . $modelUser->username,
    "expire_at"                => $dataVencimento,
    "request_delivery_address" => false,
    "payment_method"           => "all",

];

$response = $api->defineLinkPayMethod($params, $body);

header('Location: ' . $response['data']['payment_url']);

?>
<div id='load'><?php echo Yii::t('zii', 'Please wait while loading...') ?></div>