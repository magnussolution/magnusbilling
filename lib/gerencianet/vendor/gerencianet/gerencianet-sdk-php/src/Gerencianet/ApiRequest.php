<?php

namespace Gerencianet;

use Gerencianet\Exception\AuthorizationException;

class ApiRequest
{
    private $auth;
    private $request;
    private $options;

    public function __construct(array $options = null)
    {
        $this->auth = new Auth($options);
        $this->request = new Request($options);
        $this->options = $options;
    }

    public function send($method, $route, $body)
    {
        if (!$this->auth->expires || $this->auth->expires <= time()) {
            $this->auth->authorize();
        }

        $composerData = json_decode(file_get_contents(__DIR__.'/../../composer.json'), true);
        $partner_token = isset($this->options['partner_token'])? $this->options['partner_token'] : "";
        $requestTimeout = isset($this->options['timeout'])? (double)$this->options['timeout'] : 30.0;
                
        try {
            return $this->request->send($method, $route, ['json' => $body, 
            'timeout' => $requestTimeout,
            'headers' => ['Authorization' => 'Bearer '.$this->auth->accessToken, 'api-sdk' => 'php-' . $composerData['version'], 'partner-token' => $partner_token]]);
        } catch (AuthorizationException $e) {
            $this->auth->authorize();

            return $this->request->send($method, $route, ['json' => $body,
            'timeout' => $requestTimeout,
            'headers' => ['Authorization' => 'Bearer '.$this->auth->accessToken, 'api-sdk' => 'php-' . $composerData['version'], 'partner-token' => $partner_token]]);
        }
    }

    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }

    public function __set($property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }
    }
}
