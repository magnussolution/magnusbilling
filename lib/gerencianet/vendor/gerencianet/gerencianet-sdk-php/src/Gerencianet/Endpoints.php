<?php

namespace Gerencianet;

use Exception;

class Endpoints
{
    private $requester;
    private $endpoints;
    private $methods;
    private static $instance;

    public function __construct($options, $requester = null)
    {
        $this->requester = $requester;

        if (!$this->requester) {
            $this->requester = new ApiRequest($options);
        }

        $this->endpoints = Config::get('ENDPOINTS');
        $this->endpoints = Config::isPix($options) ? $this->endpoints['PIX'] : $this->endpoints['DEFAULT'];
        $this->map();
    }

    public static function getInstance($options = null, $requester = null)
    {
        if (!isset(self::$instance)) {
            if(!isset($options)) {
                throw new Exception('config not defined');
            }

            self::$instance = new self($options, $requester);
        }
        return self::$instance;
    }

    public function __call($method, $args)
    {
        if (isset($this->methods[$method])) {
            return $this->methods[$method]((isset($args[0]) ? $args[0] : null), (isset($args[1]) ? $args[1] : null));
        } else {
            throw new Exception('nonexistent endpoint');
        }
    }

    public static function __callStatic($method, $args)
    {
        if (method_exists('\\Gerencianet\Utils', $method)) {
            return Utils::$method((isset($args[0]) ? $args[0] : null), (isset($args[1]) ? $args[1] : null));
        } else {
            throw new Exception('nonexistent endpoint');
        }
    }

    private function map()
    {
        $this->methods = array_map(function ($endpoint) {
            return function ($params, $body) use ($endpoint) {
                $route = $this->getRoute($endpoint, $params);
                $query = $this->getQueryString($params);
                $route .= $query;

                return $this->requester->send($endpoint['method'], $route, $body);
            };
        }, $this->endpoints);
    }

    private function getRoute($endpoint, &$params)
    {
        $route = $endpoint['route'];
        $placeholders = '/\:(\w+)/im';
        preg_match_all($placeholders, $route, $matches);
        $variables = $matches[1];

        foreach ($variables as $value) {
            if (isset($params[$value])) {
                $route = str_replace(':'.$value, $params[$value], $route);
                unset($params[$value]);
            }
        }

        return $route;
    }

    private function getQueryString($params)
    {
        $keys = array_keys($params);
        $length = count($keys);

        if ($length == 0) {
            return '';
        }

        $reduce = function ($previous, $current) use ($keys, $params, $length) {
            $next = ($current == $length - 1) ? '' : '&';

            return $previous.$keys[$current].'='.$params[$keys[$current]].$next;
        };

        return array_reduce(array_keys($keys), $reduce, '?');
    }
}
