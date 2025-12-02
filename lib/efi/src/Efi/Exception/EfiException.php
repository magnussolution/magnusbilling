<?php

namespace Efi\Exception;

use Exception;
use Efi\Exception\ChargesException;
use Efi\Exception\PixException;
use Efi\Exception\OpenFinanceException;
use Efi\Exception\PaymentsException;
use Efi\Exception\OpeningAccountsException;

/**
 * Exception class for payment-related errors in the EFI SDK.
 */
class EfiException extends Exception
{
    public $headers;
    public $code;
    public $error;
    public $errorDescription;

    /**
     * Initializes a new instance of the EfiException class.
     *
     * @param mixed $exception The original exception or error response.
     * @param int   $code      The error code.
     */
    public function __construct($api, $exception, int $code, array $headers)
    {
        $error = $exception;

        if ($exception instanceof \GuzzleHttp\Psr7\Stream) {
            $error = $this->parseStream($exception);
        }

        switch ($api) {
            case 'CHARGES':
                $exceptionClass = ChargesException::class;
                break;
            case 'PIX':
                $exceptionClass = PixException::class;
                break;
            case 'OPEN-FINANCE':
                $exceptionClass = OpenFinanceException::class;
                break;
            case 'PAYMENTS':
                $exceptionClass = PaymentsException::class;
                break;
            case 'OPENING-ACCOUNTS':
                $exceptionClass = OpeningAccountsException::class;
                break;
            default:
                $exceptionClass = self::class;
                break;
        }

        $this->handleException($exceptionClass, $error, $code, $headers);
    }

    /**
     * Parses the error stream and returns the error as an array.
     *
     * @param \GuzzleHttp\Psr7\Stream $stream The error stream.
     * @return array The parsed error array.
     */
    private function parseStream(\GuzzleHttp\Psr7\Stream $stream)
    {
        $error = '';
        while (!$stream->eof()) {
            $error .= $stream->read(1024);
        }

        return json_decode($error, true);
    }

    /**
     * Handles the API error response and sets error properties.
     *
     * @param string $exceptionClass The class name of the specific exception.
     * @param array $error The error response array.
     * @param int   $code  The error code.
     */
    private function handleException(string $exceptionClass, array $error, int $code, array $headers)
    {
        $exception = new $exceptionClass($error, $code);
        $this->error = $exception->error;
        $this->errorDescription = $exception->errorDescription;
        $this->code = $exception->code;
        $this->message = $exception->message;
        $this->headers = $headers;
    }

    /**
     * Returns a string representation of the exception.
     *
     * @return string The string representation of the exception.
     */
    public function __toString(): string
    {
        return 'Error ' . $this->code . ': ' . $this->message . "\n";
    }

    /**
     * Magic getter method to access the properties of the exception.
     *
     * @param string $property The property name.
     * @return mixed|null The value of the property or null if it doesn't exist.
     */
    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }

        return null;
    }
}
