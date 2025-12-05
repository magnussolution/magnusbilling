<?php

class HttpRequest extends CHttpRequest
{
    // Rotas onde NÃO queremos CSRF (opcional, se quiser filtrar por URL)
    public $noCsrfValidationRoutes = [];

    public function validateCsrfToken($event)
    {
        // 1) Se vier com o header da API, pula CSRF
        if (isset($_SERVER['HTTP_KEY']) && !empty($_SERVER['HTTP_KEY'])) {
            $modelApi = Api::model()->find('api_key = :key AND status = 1', [
                ':key' => $_SERVER['HTTP_KEY'],
            ]);
            if (! isset($modelApi->id)) {
                exit('invalid API access');
            }
            $api_key         = $modelApi->api_key;
            $api_secret      = $modelApi->api_secret;

            $req = $_POST;

            $req['nonce'] = $_POST['nonce'];

            $post_data = http_build_query($req, '', '&');
            $sign      = hash_hmac('sha512', $post_data, $api_secret);

            if ($_SERVER['HTTP_SIGN'] === $sign && $_SERVER['HTTP_KEY'] == $api_key) {
                //ok    
            } else {
                exit('invalid API access');
            }

            return;
        }

        // 3) Fora disso, valida normal (painel, login, etc)
        parent::validateCsrfToken($event);
    }
}
