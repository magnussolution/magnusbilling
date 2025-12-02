<?php

/**
 * MercadoPago Integration Library
 * Access MercadoPago for payments integration
 *
 * @author hcasatti
 *
 */
$GLOBALS["LIB_LOCATION"] = dirname(__FILE__);

class MP
{

    const version = "0.5.3";

    private $client_id;
    private $client_secret;
    private $ll_access_token;
    private $access_data;
    private $sandbox = false;

    public function __construct()
    {
        $i = func_num_args();

        if ($i > 2 || $i < 1) {
            throw new MercadoPagoException("Invalid arguments. Use CLIENT_ID and CLIENT SECRET, or ACCESS_TOKEN");
        }

        if ($i == 1) {
            $this->ll_access_token = func_get_arg(0);
        }

        if ($i == 2) {
            $this->client_id     = func_get_arg(0);
            $this->client_secret = func_get_arg(1);
        }
    }

    public function sandbox_mode($enable = null)
    {
        if (!is_null($enable)) {
            $this->sandbox = $enable === true;
        }

        return $this->sandbox;
    }

    /**
     * Get Access Token for API use
     */
    public function get_access_token()
    {
        if (isset($this->ll_access_token) && !is_null($this->ll_access_token)) {
            return $this->ll_access_token;
        }

        $app_client_values = array(
            'client_id'     => $this->client_id,
            'client_secret' => $this->client_secret,
            'grant_type'    => 'client_credentials',
        );

        $access_data = MPRestClient::post(array(
            "uri"     => "/oauth/token",
            "data"    => $app_client_values,
            "headers" => array(
                "content-type" => "application/x-www-form-urlencoded",
            ),
        ));

        if ($access_data["status"] != 200) {
            throw new MercadoPagoException($access_data['response']['message'], $access_data['status']);
        }

        $this->access_data = $access_data['response'];

        return $this->access_data['access_token'];
    }

    /**
     * Get information for specific payment
     * @param int $id
     * @return array(json)
     */
    public function get_payment($id)
    {
        $uri_prefix = $this->sandbox ? "/sandbox" : "";

        $request = array(
            "uri"    => "/v1/payments/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
        );

        $payment_info = MPRestClient::get($request);
        return $payment_info;
    }
    public function get_payment_info($id)
    {
        return $this->get_payment($id);
    }

    /**
     * Get information for specific authorized payment
     * @param id
     * @return array(json)
     */
    public function get_authorized_payment($id)
    {
        $request = array(
            "uri"    => "/authorized_payments/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
        );

        $authorized_payment_info = MPRestClient::get($request);
        return $authorized_payment_info;
    }

    /**
     * Refund accredited payment
     * @param int $id
     * @return array(json)
     */
    public function refund_payment($id)
    {
        $request = array(
            "uri"    => "/v1/payments/{$id}/refunds",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => array(
            ),
        );

        $response = MPRestClient::post($request);
        return $response;
    }

    /**
     * Cancel pending payment
     * @param int $id
     * @return array(json)
     */
    public function cancel_payment($id)
    {
        $request = array(
            "uri"    => "/v1/payments/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => array(
                "status" => "cancelled",
            ),
        );

        $response = MPRestClient::put($request);
        return $response;
    }

    /**
     * Cancel preapproval payment
     * @param int $id
     * @return array(json)
     */
    public function cancel_preapproval_payment($id)
    {
        $request = array(
            "uri"    => "/preapproval/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => array(
                "status" => "cancelled",
            ),
        );

        $response = MPRestClient::put($request);
        return $response;
    }

    /**
     * Search payments according to filters, with pagination
     * @param array $filters
     * @param int $offset
     * @param int $limit
     * @return array(json)
     */
    public function search_payment($filters, $offset = 0, $limit = 0)
    {
        $filters["offset"] = $offset;
        $filters["limit"]  = $limit;

        $uri_prefix = $this->sandbox ? "/sandbox" : "";

        $request = array(
            "uri"    => "/v1/payments/search",
            "params" => array_merge($filters, array(
                "access_token" => $this->get_access_token(),
            )),
        );

        $collection_result = MPRestClient::get($request);
        return $collection_result;
    }

    /**
     * Create a checkout preference
     * @param array $preference
     * @return array(json)
     */
    public function create_preference($preference)
    {
        $request = array(
            "uri"    => "/checkout/preferences",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => $preference,
        );

        $preference_result = MPRestClient::post($request);
        return $preference_result;
    }

    /**
     * Update a checkout preference
     * @param string $id
     * @param array $preference
     * @return array(json)
     */
    public function update_preference($id, $preference)
    {
        $request = array(
            "uri"    => "/checkout/preferences/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => $preference,
        );

        $preference_result = MPRestClient::put($request);
        return $preference_result;
    }

    /**
     * Get a checkout preference
     * @param string $id
     * @return array(json)
     */
    public function get_preference($id)
    {
        $request = array(
            "uri"    => "/checkout/preferences/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
        );

        $preference_result = MPRestClient::get($request);
        return $preference_result;
    }

    /**
     * Create a preapproval payment
     * @param array $preapproval_payment
     * @return array(json)
     */
    public function create_preapproval_payment($preapproval_payment)
    {
        $request = array(
            "uri"    => "/preapproval",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => $preapproval_payment,
        );

        $preapproval_payment_result = MPRestClient::post($request);
        return $preapproval_payment_result;
    }

    /**
     * Get a preapproval payment
     * @param string $id
     * @return array(json)
     */
    public function get_preapproval_payment($id)
    {
        $request = array(
            "uri"    => "/preapproval/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
        );

        $preapproval_payment_result = MPRestClient::get($request);
        return $preapproval_payment_result;
    }

    /**
     * Update a preapproval payment
     * @param string $preapproval_payment, $id
     * @return array(json)
     */

    public function update_preapproval_payment($id, $preapproval_payment)
    {
        $request = array(
            "uri"    => "/preapproval/{$id}",
            "params" => array(
                "access_token" => $this->get_access_token(),
            ),
            "data"   => $preapproval_payment,
        );

        $preapproval_payment_result = MPRestClient::put($request);
        return $preapproval_payment_result;
    }

    /* Generic resource call methods */

    /**
     * Generic resource get
     * @param request
     * @param params (deprecated)
     * @param authenticate = true (deprecated)
     */
    public function get($request, $params = null, $authenticate = true)
    {
        if (is_string($request)) {
            $request = array(
                "uri"          => $request,
                "params"       => $params,
                "authenticate" => $authenticate,
            );
        }

        $request["params"] = isset($request["params"]) && is_array($request["params"]) ? $request["params"] : array();

        if (!isset($request["authenticate"]) || $request["authenticate"] !== false) {
            $request["params"]["access_token"] = $this->get_access_token();
        }

        $result = MPRestClient::get($request);
        return $result;
    }

    /**
     * Generic resource post
     * @param request
     * @param data (deprecated)
     * @param params (deprecated)
     */
    public function post($request, $data = null, $params = null)
    {
        if (is_string($request)) {
            $request = array(
                "uri"    => $request,
                "data"   => $data,
                "params" => $params,
            );
        }

        $request["params"] = isset($request["params"]) && is_array($request["params"]) ? $request["params"] : array();

        if (!isset($request["authenticate"]) || $request["authenticate"] !== false) {
            $request["params"]["access_token"] = $this->get_access_token();
        }

        $result = MPRestClient::post($request);
        return $result;
    }

    /**
     * Generic resource put
     * @param request
     * @param data (deprecated)
     * @param params (deprecated)
     */
    public function put($request, $data = null, $params = null)
    {
        if (is_string($request)) {
            $request = array(
                "uri"    => $request,
                "data"   => $data,
                "params" => $params,
            );
        }

        $request["params"] = isset($request["params"]) && is_array($request["params"]) ? $request["params"] : array();

        if (!isset($request["authenticate"]) || $request["authenticate"] !== false) {
            $request["params"]["access_token"] = $this->get_access_token();
        }

        $result = MPRestClient::put($request);
        return $result;
    }

    /**
     * Generic resource delete
     * @param request
     * @param data (deprecated)
     * @param params (deprecated)
     */
    public function delete($request, $params = null)
    {
        if (is_string($request)) {
            $request = array(
                "uri"    => $request,
                "params" => $params,
            );
        }

        $request["params"] = isset($request["params"]) && is_array($request["params"]) ? $request["params"] : array();

        if (!isset($request["authenticate"]) || $request["authenticate"] !== false) {
            $request["params"]["access_token"] = $this->get_access_token();
        }

        $result = MPRestClient::delete($request);
        return $result;
    }

    /* **************************************************************************************** */

}

/**
 * MercadoPago cURL RestClient
 */
class MPRestClient
{
    const API_BASE_URL = "https://api.mercadopago.com";

    private static function build_request($request)
    {
        if (!extension_loaded("curl")) {
            throw new MercadoPagoException("cURL extension not found. You need to enable cURL in your php.ini or another configuration you have.");
        }

        if (!isset($request["method"])) {
            throw new MercadoPagoException("No HTTP METHOD specified");
        }

        if (!isset($request["uri"])) {
            throw new MercadoPagoException("No URI specified");
        }

        // Set headers
        $headers              = array("accept: application/json");
        $json_content         = true;
        $form_content         = false;
        $default_content_type = true;

        if (isset($request["headers"]) && is_array($request["headers"])) {
            foreach ($request["headers"] as $h => $v) {
                $h = strtolower($h);
                $v = strtolower($v);

                if ($h == "content-type") {
                    $default_content_type = false;
                    $json_content         = $v == "application/json";
                    $form_content         = $v == "application/x-www-form-urlencoded";
                }

                array_push($headers, $h . ": " . $v);
            }
        }
        if ($default_content_type) {
            array_push($headers, "content-type: application/json");
        }

        array_push($headers, "x-product-id: BC32A7VTRPP001U8NHK0");

        // Build $connect
        $connect = curl_init();

        curl_setopt($connect, CURLOPT_USERAGENT, "MercadoPago PHP SDK /v" . MP::version);
        curl_setopt($connect, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($connect, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($connect, CURLOPT_CAINFO, $GLOBALS["LIB_LOCATION"] . "/cacert.pem");
        curl_setopt($connect, CURLOPT_CUSTOMREQUEST, $request["method"]);
        curl_setopt($connect, CURLOPT_HTTPHEADER, $headers);

        // Set parameters and url
        if (isset($request["params"]) && is_array($request["params"]) && count($request["params"]) > 0) {
            $request["uri"] .= (strpos($request["uri"], "?") === false) ? "?" : "&";
            $request["uri"] .= self::build_query($request["params"]);
        }
        curl_setopt($connect, CURLOPT_URL, self::API_BASE_URL . $request["uri"]);

        // Set data
        if (isset($request["data"])) {
            if ($json_content) {
                if (gettype($request["data"]) == "string") {
                    json_decode($request["data"], true);
                } else {
                    $request["data"] = json_encode($request["data"]);
                }

                if (function_exists('json_last_error')) {
                    $json_error = json_last_error();
                    if ($json_error != JSON_ERROR_NONE) {
                        throw new MercadoPagoException("JSON Error [{$json_error}] - Data: " . $request["data"]);
                    }
                }
            } else if ($form_content) {
                $request["data"] = self::build_query($request["data"]);
            }

            curl_setopt($connect, CURLOPT_POSTFIELDS, $request["data"]);
        }

        return $connect;
    }

    private static function exec($request)
    {
        // private static function exec($method, $uri, $data, $content_type) {

        $connect = self::build_request($request);

        $api_result    = curl_exec($connect);
        $api_http_code = curl_getinfo($connect, CURLINFO_HTTP_CODE);

        if ($api_result === false) {
            throw new MercadoPagoException(curl_error($connect));
        }

        $response = array(
            "status"   => $api_http_code,
            "response" => json_decode($api_result, true),
        );

        if ($response['status'] >= 400) {
            $message = $response['response']['message'];
            if (isset($response['response']['cause'])) {
                if (isset($response['response']['cause']['code']) && isset($response['response']['cause']['description'])) {
                    $message .= " - " . $response['response']['cause']['code'] . ': ' . $response['response']['cause']['description'];
                } else if (is_array($response['response']['cause'])) {
                    foreach ($response['response']['cause'] as $causes) {
                        if (is_array($causes)) {
                            foreach ($causes as $cause) {
                                $message .= " - " . $cause['code'] . ': ' . $cause['description'];
                            }
                        } else {
                            $message .= " - " . $causes['code'] . ': ' . $causes['description'];
                        }
                    }
                }
            }

            throw new MercadoPagoException($message, $response['status']);
        }

        curl_close($connect);

        return $response;
    }

    private static function build_query($params)
    {
        if (function_exists("http_build_query")) {
            return http_build_query($params, "", "&");
        } else {
            foreach ($params as $name => $value) {
                $elements[] = "{$name}=" . urlencode($value);
            }

            return implode("&", $elements);
        }
    }

    public static function get($request)
    {
        $request["method"] = "GET";

        return self::exec($request);
    }

    public static function post($request)
    {
        $request["method"] = "POST";

        return self::exec($request);
    }

    public static function put($request)
    {
        $request["method"] = "PUT";

        return self::exec($request);
    }

    public static function delete($request)
    {
        $request["method"] = "DELETE";

        return self::exec($request);
    }
}

class MercadoPagoException extends Exception
{
    public function __construct($message, $code = 500, Exception $previous = null)
    {
        // Default code 500
        parent::__construct($message, $code, $previous);
    }
}
