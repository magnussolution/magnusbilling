<?php

namespace Efi;

use Exception;

class Config
{
    /**
     * @var string Configuration file path for endpoints
     */
    private static $endpointsConfigFile = __DIR__ . '/Endpoints/Config.php';

    /**
     * Set the endpoints configuration file.
     *
     * @param string $file The file path.
     */
    public static function setEndpointsConfigFile(string $file): void
    {
        self::$endpointsConfigFile = $file;
    }

    /**
     * Load the endpoint configurations from the file.
     *
     * @param string $property The parameter key.
     * @return mixed The value of the property.
     * @throws \Exception If there is an error loading the endpoint file.
     */
    public static function get(string $property)
    {
        if (!file_exists(self::$endpointsConfigFile)) {
            throw new Exception('Arquivo de configuração não encontrado');
        }

        $config = include self::$endpointsConfigFile;

        if (!is_array($config) || !isset($config['APIs'])) {
            throw new Exception('Erro ao carregar o arquivo de endpoints');
        }

        return $config[$property] ?? $config['APIs'][$property];
    }

    /**
     * Generate the configuration options.
     *
     * @param array $options The options array.
     * @return array The generated configuration.
     */
    public static function options(array $options): array
    {
        $getBoolean = function ($key, $default = false) use ($options) {
            return isset($options[$key]) ? filter_var($options[$key], FILTER_VALIDATE_BOOLEAN) : $default;
        };

        $getFloat = function ($key, $default = 0.0) use ($options) {
            return isset($options[$key]) ? (float) $options[$key] : $default;
        };

        $getString = function ($keys, $default = null) use ($options) {
            foreach ((array) $keys as $key) {
                if (isset($options[$key])) {
                    return (string) $options[$key];
                }
            }
            return $default;
        };

        $conf = [
            'sandbox' => $getBoolean('sandbox'),
            'debug' => $getBoolean('debug'),
            'cache' => $getBoolean('cache', true),
            'responseHeaders' => $getBoolean('responseHeaders'),
            'timeout' => $getFloat('timeout', 30.0),
            'clientId' => $getString(['client_id', 'clientId']),
            'clientSecret' => $getString(['client_secret', 'clientSecret']),
            'partnerToken' => $getString(['partner_token', 'partner-token', 'partnerToken']),
            'headers' => $options['headers'] ?? null,
            'baseUri' => $options['url'] ?? null,
            'api' => $options['api'] ?? null,
        ];

        if ($conf['api'] !== 'CHARGES') {
            $conf['certificate'] = $getString(['certificate', 'pix_cert']);
            $conf['pwdCertificate'] = isset($options['pwdCertificate']) ? (string) $options['pwdCertificate'] : '';
        }

        if ($conf['debug']) {
            ini_set('display_errors', '1');
            ini_set('display_startup_errors', '1');
            error_reporting(E_ALL);
        }

        return $conf;
    }

}
