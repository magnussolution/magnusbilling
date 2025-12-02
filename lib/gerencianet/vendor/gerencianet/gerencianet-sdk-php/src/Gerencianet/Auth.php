<?php

namespace Gerencianet;

use Exception;

class Auth
{
    private $clientId;
    private $clientSecret;
    private $accessToken;
    private $tokenType;
    private $expires;
    private $config;
    private $request;
    private $pixCert;

    public function __construct($options)
    {
        $this->config = Config::options($options);

        if (!isset($this->config['clientId']) ||
         !isset($this->config['clientSecret'])) {
            throw new Exception('Client id or secret not found');
        }

        $this->request = new Request($options);
        $this->clientId = $this->config['clientId'];
        $this->pixCert = isset($this->config['pixCert']) ? $this->config['pixCert'] : null;
        $this->clientSecret = $this->config['clientSecret'];
    }

    public function authorize()
    {
        $endpoints = Config::get('ENDPOINTS');

        $requestTimeout = isset($this->options['timeout'])? (double)$this->options['timeout'] : 30.0;
        $requestOptions = ['auth' => [$this->clientId, $this->clientSecret],
         'json' => ['grant_type' => 'client_credentials'], 'timeout' => $requestTimeout];

        $endpoints = $this->pixCert ? $endpoints['PIX'] : $endpoints['DEFAULT'];

        $response = $this->request
                          ->send($endpoints['authorize']['method'], $endpoints['authorize']['route'],
                          $requestOptions);

        $this->accessToken = $response['access_token'];
        $this->expires = time() + $response['expires_in'];
        $this->tokenType = $response['token_type'];
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
