<?php

namespace Efi;

use Exception;
use Efi\CacheRetriever;
use Efi\Config;
use Efi\Request;
use Efi\Security;

class Auth extends BaseModel
{
    protected $accessToken;
    private $clientId;
    private $clientSecret;
    private $expires;
    private $config;
    private $options;
    private $endpoints;
    private $request;
    private $cache;

    /**
     * Constructor of the Auth.
     * @param array $options - Array with configuration options and credentials.
     */
    public function __construct(array $options)
    {
        $this->options = $options;
        $this->config = Config::options($options);

        if (!isset($this->config['clientId']) || !isset($this->config['clientSecret'])) {
            throw new Exception('Credenciais Client_Id ou Client_Secret não encontradas');
        }

        $this->request = new Request($options);
        $this->cache = new CacheRetriever();

        $this->clientId = $this->config['clientId'];
        $this->clientSecret = $this->config['clientSecret'];
    }

    /**
     * Authorize the client and retrieve the access token.
     */
    public function authorize()
    {
        $this->initializeRequestOptions();
        $response = $this->sendAuthorizationRequest();
        $this->processAuthorizationResponse(($this->config['responseHeaders']) ? $response->body : $response);
    }

    /**
     * Initializes the request options based on configuration settings.
     */
    private function initializeRequestOptions()
    {
        $this->endpoints = Config::get($this->options['api']);
        $requestTimeout = $this->options['timeout'];
        $composerData = Utils::getComposerData();

        $this->requestOptions = [
            'auth' => [$this->clientId, $this->clientSecret],
            'json' => ['grant_type' => 'client_credentials'],
            'timeout' => $requestTimeout,
            'api-sdk' => 'efi-php-' . $composerData['version']
        ];
    }

    /**
     * Sends an HTTP request for client credentials authorization.
     *
     * @return mixed The response data.
     */
    private function sendAuthorizationRequest()
    {
        return $this->request->send(
            $this->endpoints['ENDPOINTS']['authorize']['method'],
            $this->endpoints['ENDPOINTS']['authorize']['route'],
            $this->requestOptions
        );
    }

    /**
     * Processes the authorization response, updates cache if enabled.
     *
     * @param array $response The response data from authorization request.
     */
    private function processAuthorizationResponse(array $response)
    {
        $this->accessToken = $response['access_token'];
        $this->updateCache($response);
    }

    /**
     * Updates the cache with authorization data if caching is enabled.
     *
     * @param array $response The response data from authorization request.
     */
    private function updateCache(array $response)
    {
        $hashAccessToken = $this->getSecurityHash('accessToken');
        $hashAccessTokenExpires = $this->getSecurityHash('accessTokenExpires');
        $hashScopes = $this->getSecurityHash('scopes');

        if ($this->options['cache']) {
            $this->expires = time() + $response['expires_in'];
            $this->scopes = ($this->options['api'] === 'CHARGES') ? ['charge'] : explode(' ', $response['scope']);

            $session_expire = ($this->options['api'] === 'CHARGES') ? 600 : 3600;
            $accessTokenEncrypted = $this->encryptAccessToken();

            $this->cache->set($hashAccessToken, $accessTokenEncrypted, $session_expire);
            $this->cache->set($hashAccessTokenExpires, $this->expires, $session_expire);
            $this->cache->set($hashScopes, $this->scopes, $session_expire);
        } else {
            $this->clearCacheIfPresent([$hashAccessToken, $hashAccessTokenExpires, $hashScopes]);
        }
    }

    /**
     * Generates a security hash based on the type.
     *
     * @param string $type The type of security hash.
     * @return string The generated security hash.
     */
    private function getSecurityHash(string $type): string
    {
        return Security::getHash($type, $this->options['api'], $this->clientId);
    }

    /**
     * Encrypts the access token using a security hash.
     *
     * @return string The encrypted access token.
     */
    private function encryptAccessToken(): string
    {
        $security = new Security(Security::getHash('accessToken', $this->options['api'], $this->clientSecret));
        return $security->encrypt($this->accessToken);
    }

    /**
     * Clears the cache if specified cache keys are present.
     *
     * @param array $hashes The cache keys to check and clear if present.
     */
    private function clearCacheIfPresent(array $hashes)
    {
        $hasCache = $this->cache->hasCache($hashes);

        if ($hasCache) {
            $this->cache->clear();
        }
    }

    /**
     * Gets the access token.
     *
     * @return string The current access token.
     */
    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    /**
     * Sets the access token.
     *
     * @param string $token The access token to set.
     * @return void
     */
    public function setAccessToken(string $token): void
    {
        $this->accessToken = $token;
    }
}
