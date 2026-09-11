<?php
require __DIR__ . '/../../protected/components/WebphoneReadiness.php';
$http = ['data' => "HTTP Server Status:\nHTTPS Server Enabled and Bound to 0.0.0.0:8089\n/ws => Asterisk HTTP WebSocket\n"];
$ws = ['data' => "res_http_websocket.so HTTP WebSocket Support 4 Running core\n"];
$sip = ['data' => "res_pjsip_transport_websocket.so PJSIP WebSocket Transport Support 4 Running core\n"];
$cases = [
    [WebphoneReadiness::check($http, $ws, $sip), 'ready'],
    [WebphoneReadiness::check(false, $ws, $sip), 'unavailable'],
    [WebphoneReadiness::check($http, ['data' => '0 modules loaded'], $sip), 'modules'],
    [WebphoneReadiness::check(['data' => 'Server Disabled'], $ws, $sip), 'https'],
    [WebphoneReadiness::check(['data' => str_replace(':8089', ':8090', $http['data'])], $ws, $sip), 'https'],
    [WebphoneReadiness::check(['data' => str_replace('/ws =>', '/other =>', $http['data'])], $ws, $sip), 'https'],
];
foreach ($cases as $case) {
    if ($case[0] !== $case[1]) throw new RuntimeException('Unexpected readiness result');
}
echo "6 readiness checks passed\n";
