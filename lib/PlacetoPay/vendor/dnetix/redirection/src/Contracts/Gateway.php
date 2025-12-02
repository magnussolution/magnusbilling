<?php


namespace Dnetix\Redirection\Contracts;

use Dnetix\Redirection\Exceptions\PlacetoPayException;
use Dnetix\Redirection\Message\CollectRequest;
use Dnetix\Redirection\Message\Notification;
use Dnetix\Redirection\Message\RedirectInformation;
use Dnetix\Redirection\Message\RedirectRequest;
use Dnetix\Redirection\Message\RedirectResponse;
use Dnetix\Redirection\Message\ReverseResponse;

abstract class Gateway
{
    const TP_SOAP = 'soap';
    const TP_REST = 'rest';

    protected $type = self::TP_REST;
    protected $carrier = null;
    protected $config;

    public function __construct($config = [])
    {
        if (!isset($config['login']) || !isset($config['tranKey']))
            throw new PlacetoPayException('No login or tranKey provided on gateway');

        if (!isset($config['url']) || !filter_var($config['url'], FILTER_VALIDATE_URL))
            throw new PlacetoPayException('No service URL provided to use');

        if (substr($config['url'], -1) != '/')
            $config['url'] .= '/';

        if (isset($config['type']) && in_array($config['type'], [self::TP_SOAP, self::TP_REST]))
            $this->type = $config['type'];

        $this->config = $config;
    }

    /**
     * @param RedirectRequest|array $redirectRequest
     * @return RedirectResponse
     */
    public abstract function request($redirectRequest);

    /**
     * @param int $requestId
     * @return RedirectInformation
     */
    public abstract function query($requestId);

    /**
     * @param CollectRequest|array $collectRequest
     * @return RedirectInformation
     */
    public abstract function collect($collectRequest);

    /**
     * @param string $internalReference
     * @return ReverseResponse
     */
    public abstract function reverse($internalReference);

    /**
     * Change the web service to use for the connection
     * @param string $type can be 'soap' or 'rest'
     * @return $this
     * @throws PlacetoPayException
     */
    public function using($type)
    {
        if (in_array($type, [self::TP_SOAP, self::TP_REST])) {
            $this->type = $type;
            $this->carrier = null;
        } else {
            throw new PlacetoPayException('The only connection methods are SOAP or REST');
        }
    }

    public function readNotification($data = null)
    {
        if (!$data) {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
            } catch (\Exception $e) {
                throw new PlacetoPayException('Error constructing the information from the input');
            }
        }

        return new Notification($data, $this->config['tranKey']);
    }

    /**
     * @param array $data
     * @return $this
     */
    public function addAuthenticationHeader($data = [])
    {
        if (!isset($this->config['auth_additional'])) {
            $this->config['auth_additional'] = $data;
        } else {
            $this->config['auth_additional'] = array_merge($this->config['auth_additional'], $data);
        }
        return $this;
    }

}