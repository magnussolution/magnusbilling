<?php


namespace Dnetix\Redirection\Carrier;

use Dnetix\Redirection\Exceptions\PlacetoPayException;
use SoapHeader;
use SoapVar;
use stdClass;

/**
 * Class Authentication
 * Generates the needed authentication elements
 */
class Authentication
{
    const WSU = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd';
    const WSSE = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd';

    private $login;
    private $tranKey;
    /**
     * Overrides the authentication, for testing purposes
     * @var array
     */
    private $auth;
    private $overrided = false;
    /**
     * It can be full or basic
     * @var string
     */
    private $type = 'full';
    private $additional;
    private $algorithm = 'sha1';

    public function __construct($config)
    {
        if (!isset($config['login']) || !isset($config['tranKey']))
            throw new PlacetoPayException('No login or tranKey provided on authentication');

        $this->login = $config['login'];
        $this->tranKey = $config['tranKey'];

        if (isset($config['auth'])) {
            if ((!isset($config['auth']['seed']) || !isset($config['auth']['seed'])))
                throw new PlacetoPayException('Bad definition for the override');

            $this->auth = $config['auth'];
            $this->overrided = true;
        }

        if (isset($config['auth_type']))
            $this->type = $config['auth_type'];

        if (isset($config['auth_additional']))
            $this->additional = $config['auth_additional'];

        if (isset($config['algorithm']))
            $this->additional = $config['algorithm'];

        $this->generate();
    }

    public function getNonce($encoded = true)
    {
        if ($this->auth) {
            $nonce = $this->auth['nonce'];
        } else {
            if (function_exists('random_bytes')) {
                $nonce = bin2hex(random_bytes(16));
            } elseif (function_exists('openssl_random_pseudo_bytes')) {
                $nonce = bin2hex(openssl_random_pseudo_bytes(16));
            } else {
                $nonce = mt_rand();
            }
        }

        if ($encoded)
            return base64_encode($nonce);

        return $nonce;
    }

    public function getSeed()
    {
        if ($this->auth)
            return $this->auth['seed'];

        return date('c');
    }

    public function digest($encoded = true)
    {
        if ($this->type == 'full') {
            $digest = hash($this->algorithm, $this->getNonce(false) . $this->getSeed() . $this->tranKey(), true);
        } else {
            $digest = hash($this->algorithm, $this->getSeed() . $this->tranKey(), false);
        }

        if ($encoded)
            return base64_encode($digest);

        return $digest;
    }

    public function login()
    {
        return $this->login;
    }

    public function tranKey()
    {
        return $this->tranKey;
    }

    public function additional()
    {
        return $this->additional;
    }

    public function generate()
    {
        if (!$this->overrided) {
            $this->auth = [
                'seed' => $this->getSeed(),
                'nonce' => $this->getNonce(),
            ];
        }

        return $this;
    }

    public function setAdditional($additional)
    {
        $this->additional = $additional;
        return $this;
    }

    /**
     * Parses the entity as a SOAP Header
     * @return SoapHeader
     */
    public function asSoapHeader()
    {
        $UsernameToken = new stdClass();
        $UsernameToken->Username = new SoapVar($this->login(), XSD_STRING, null, self::WSSE, null, self::WSSE);
        $UsernameToken->Password = new SoapVar($this->digest(), XSD_STRING, 'PasswordDigest', null, 'Password', self::WSSE);
        $UsernameToken->Nonce = new SoapVar($this->getNonce(), XSD_STRING, null, self::WSSE, null, self::WSSE);
        $UsernameToken->Created = new SoapVar($this->getSeed(), XSD_STRING, null, self::WSU, null, self::WSU);

        $security = new stdClass();
        $security->UsernameToken = new SoapVar($UsernameToken, SOAP_ENC_OBJECT, null, self::WSSE, 'UsernameToken', self::WSSE);

        return new SoapHeader(self::WSSE, 'Security', $security, true);
    }

    public function asArray()
    {
        return [
            'login' => $this->login(),
            'tranKey' => $this->digest(),
            'nonce' => $this->getNonce(),
            'seed' => $this->getSeed(),
            'additional' => $this->additional(),
        ];
    }

}