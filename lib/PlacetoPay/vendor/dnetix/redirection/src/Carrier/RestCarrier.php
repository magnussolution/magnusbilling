<?php


namespace Dnetix\Redirection\Carrier;


use Dnetix\Redirection\Contracts\Carrier;
use Dnetix\Redirection\Entities\Status;
use Dnetix\Redirection\Exceptions\PlacetoPayException;
use Dnetix\Redirection\Message\CollectRequest;
use Dnetix\Redirection\Message\RedirectInformation;
use Dnetix\Redirection\Message\RedirectRequest;
use Dnetix\Redirection\Message\RedirectResponse;
use Dnetix\Redirection\Message\ReverseResponse;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;

class RestCarrier extends Carrier
{
    protected $baseUrl;

    public function __construct(Authentication $auth, $config)
    {
        parent::__construct($auth, $config);

        if (!isset($config['url']))
            throw new PlacetoPayException('Base URL not found for this');

        $this->baseUrl = $config['url'];
    }

    /**
     * @param $method
     * @param $url
     * @param $arguments
     * @return array|mixed
     */
    private function makeRequest($method, $url, $arguments)
    {
        try {
            $client = new Client();
            $data = array_merge($arguments, [
                'auth' => $this->authentication()->asArray(),
            ]);
            if ($method == 'POST') {
                $response = $client->post($url, [
                    'json' => $data,
                ]);
            } else if ($method == 'GET') {
                $response = $client->get($url, [
                    'json' => $data,
                ]);
            } else if ($method == 'PUT') {
                $response = $client->put($url, [
                    'json' => $data,
                ]);
            } else {
                throw new PlacetoPayException("No valid method for this request");
            }
            return json_decode($response->getBody()->getContents(), true);
        } catch (ClientException $e) {
            return json_decode($e->getResponse()->getBody()->getContents(), true);
        } catch (ServerException $e) {
            return json_decode($e->getResponse()->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return [
                'status' => [
                    'status' => Status::ST_ERROR,
                    'reason' => 'WR',
                    'message' => PlacetoPayException::readException($e),
                    'date' => date('c'),
                ],
            ];
        }
    }

    private function url($endpoint)
    {
        return $this->baseUrl . $endpoint;
    }

    /**
     * @param RedirectRequest $redirectRequest
     * @return RedirectResponse
     */
    public function request(RedirectRequest $redirectRequest)
    {
        $result = $this->makeRequest('POST', $this->url('api/session'), $redirectRequest->toArray());
        return new RedirectResponse($result);
    }

    /**
     * @param int $requestId
     * @return RedirectInformation
     */
    public function query($requestId)
    {
        $result = $this->makeRequest('POST', $this->url('api/session/' . $requestId), []);
        return new RedirectInformation($result);
    }

    /**
     * @param CollectRequest $collectRequest
     * @return RedirectInformation
     */
    public function collect(CollectRequest $collectRequest)
    {
        $result = $this->makeRequest('POST', $this->url('api/collect'), $collectRequest->toArray());
        return new RedirectInformation($result);
    }

    /**
     * @param string $internalReference
     * @return ReverseResponse
     */
    public function reverse($internalReference)
    {
        $result = $this->makeRequest('POST', $this->url('api/reverse'), [
            'internalReference' => $internalReference,
        ]);
        return new ReverseResponse($result);
    }
}