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
use SoapClient;

class SoapCarrier extends Carrier
{
    private function client()
    {
        $config = $this->config();

        $config = array_merge([
            'soap_version' => SOAP_1_2,
            'features' => SOAP_SINGLE_ELEMENT_ARRAYS,
            'cache_wsdl' => WSDL_CACHE_NONE,
            'trace' => false,
            'encoding' => 'UTF-8',
        ], $config);

        $wsdl = $config['wsdl'];
        unset($config['wsdl']);

        $client = new SoapClient($wsdl, $config);
        $client->__setSoapHeaders($this->authentication()->asSoapHeader());

        return $client;
    }

    private function parseArguments($arguments)
    {
        return json_decode(json_encode($arguments));
    }

    /**
     * @param RedirectRequest $redirectRequest
     * @return RedirectResponse
     */
    public function request(RedirectRequest $redirectRequest)
    {
        try {
            $arguments = $this->parseArguments([
                'payload' => $redirectRequest->toArray(),
            ]);
            $result = $this->client()->createRequest($arguments)->createRequestResult;
            return new RedirectResponse($this->asArray($result));
        } catch (\Exception $e) {
            return new RedirectResponse([
                'status' => [
                    'status' => Status::ST_ERROR,
                    'reason' => 'WR',
                    'message' => PlacetoPayException::readException($e),
                    'date' => date('c'),
                ],
            ]);
        }
    }

    /**
     * @param int $requestId
     * @return RedirectInformation
     */
    public function query($requestId)
    {
        try {
            $arguments = $this->parseArguments([
                'requestId' => $requestId,
            ]);
            $result = $this->client()->getRequestInformation($arguments)->getRequestInformationResult;
            return new RedirectInformation($this->asArray($result));
        } catch (\Exception $e) {
            return new RedirectInformation([
                'status' => [
                    'status' => Status::ST_ERROR,
                    'reason' => 'WR',
                    'message' => PlacetoPayException::readException($e),
                    'date' => date('c'),
                ],
            ]);
        }
    }

    /**
     * @param CollectRequest $collectRequest
     * @return RedirectInformation
     */
    public function collect(CollectRequest $collectRequest)
    {
        try {
            $arguments = $this->parseArguments([
                'payload' => $collectRequest->toArray(),
            ]);
            $result = $this->client()->collect($arguments)->collectResult;
            return new RedirectInformation($this->asArray($result));
        } catch (\Exception $e) {
            return new RedirectInformation([
                'status' => [
                    'status' => Status::ST_ERROR,
                    'reason' => 'WR',
                    'message' => PlacetoPayException::readException($e),
                    'date' => date('c'),
                ],
            ]);
        }
    }

    /**
     * @param string $internalReference
     * @return ReverseResponse
     */
    public function reverse($internalReference)
    {
        try {
            $arguments = $this->parseArguments([
                'internalReference' => $internalReference,
            ]);
            $result = $this->client()->reversePayment($arguments)->reversePaymentResult;
            return new ReverseResponse($this->asArray($result));
        } catch (\Exception $e) {
            return new ReverseResponse([
                'status' => [
                    'status' => Status::ST_ERROR,
                    'reason' => 'WR',
                    'message' => PlacetoPayException::readException($e),
                    'date' => date('c'),
                ],
            ]);
        }
    }
}
