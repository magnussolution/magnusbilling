<?php

namespace Gerencianet\Exception;

use Exception;


class GerencianetException extends Exception
{
    private $error;
    private $errorDescription;

    public function __construct($exception)
    {
        $error = $exception;

        if ($exception instanceof \GuzzleHttp\Psr7\Stream) {
                $error = $this->parseStream($exception);
        }

        $message = isset($error['error_description']['message']) ? $error['error_description']['message'] : $error['error_description'];

        if (isset($error['error_description']['property'])) {
            $message .= ': '.$error['error_description']['property'];
        }

        $this->error = $error['error'];
        $this->errorDescription = $error['error_description'];

        parent::__construct($message, $error['code']);
    }

    private function parseStream($stream)
    {
        $error = '';
        while (!$stream->eof()) {
            $error .= $stream->read(1024);
        }

        return json_decode($error, true);
    }

    public function __toString()
    {
        return 'Error '.$this->code.': '.$this->message."\n";
    }

    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }
}
