<?php

/** Parse read-only Asterisk AMI command responses without exposing server details. */
class WebphoneReadiness
{
    public static function check($http, $websocket, $sipWebsocket)
    {
        foreach ([$http, $websocket, $sipWebsocket] as $response) {
            if (!is_array($response) || empty($response['data'])) {
                return 'unavailable';
            }
        }
        if (!preg_match('/^res_http_websocket\.so\s+.*\bRunning\b/m', $websocket['data'])
            || !preg_match('/^res_pjsip_transport_websocket\.so\s+.*\bRunning\b/m', $sipWebsocket['data'])) {
            return 'modules';
        }
        if (!preg_match('/^HTTPS Server Enabled and Bound to [^\r\n]+:8089\s*$/m', $http['data'])
            || !preg_match('~^/ws\s+=>~m', $http['data'])) {
            return 'https';
        }
        return 'ready';
    }
}
