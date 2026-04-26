<?php

class HttpRequest extends CHttpRequest
{
    public $noCsrfValidationRoutes = [];

    public function validateCsrfToken($event)
    {

        $file = Yii::getPathOfAlias('application.config') . '/noCsrfValidation.php';
        $route = $this->getPathInfo();
        $controller = strtolower(strtok($route, '/'));
        if (is_file($file)) {
            $noCsrf = require $file;
            if (is_array($noCsrf)) {
                foreach ($noCsrf as $c) {
                    if (strcasecmp($controller, $c) === 0) {
                        return;
                    }
                }
            }
        }
        $allow = [
            'molpay',
        ];
        if (in_array($controller, $allow)) {
            return;
        }

        if ($this->getIsPostRequest() && !empty($_SERVER['HTTP_KEY'])) {

            // 1) Valida se existe SIGN
            if (empty($_SERVER['HTTP_SIGN'])) {
                throw new CHttpException(403, 'invalid API access (missing SIGN)');
            }

            $apiKey   = $_SERVER['HTTP_KEY'];
            $apiSign  = $_SERVER['HTTP_SIGN'];

            // 2) Busca chave na tabela API
            $modelApi = Api::model()->find(
                'api_key = :key AND status = 1',
                [':key' => $apiKey]
            );

            if (!isset($modelApi->id)) {
                throw new CHttpException(403, 'invalid API access (key)');
            }

            $api_secret = $modelApi->api_secret;

            // 3) Monta exatamente o mesmo POST que você assina no magnusBilling.php
            $req = $_POST;

            // garante que nonce existe
            if (!isset($req['nonce'])) {
                throw new CHttpException(400, 'invalid API access (missing nonce)');
            }

            // se no cliente você ordenar o array antes de assinar, faça igual aqui
            // ksort($req);

            $post_data = http_build_query($req, '', '&');
            $calcSign  = hash_hmac('sha512', $post_data, $api_secret);

            // 4) Compara de forma segura
            if (!function_exists('hash_equals')) {
                $valid = ($calcSign === $apiSign);
            } else {
                $valid = hash_equals($calcSign, $apiSign);
            }

            if (!$valid) {
                throw new CHttpException(403, 'invalid API access (sign)');
            }

            // Tudo certo: é request de API autenticada -> não valida CSRF
            return;
        }

        // Fora do fluxo da API, valida CSRF normal (painel, login, etc)
        return parent::validateCsrfToken($event);
    }
}
