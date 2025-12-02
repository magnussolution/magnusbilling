<?php

namespace Efi\Exception;

use Exception;

/**
 * Exception class for PAYMENTS API errors in the EFI SDK.
 */
class PaymentsException extends Exception
{
    public $code;
    public $error;
    public $errorDescription;

    public function __construct(array $error, int $code)
    {
        $this->code = $code;
        $this->error = self::getErrorTitle($error, $this->code);
        $this->errorDescription = self::getErrorDescription($error, $this->code);

        parent::__construct($this->errorDescription, $this->code);
    }

    private static function getErrorTitle(array $error, int $code): string
    {
        return $error['nome'] ?? $error['error'] ?? ($code === 401 ? 'unauthorized' : 'request_error');
    }

    private function getErrorDescription(array $error, int $code): string
    {
        return $error['mensagem'] ?? $error['error_description'] ?? (($code === 401) ? 'Credenciais inválidas ou inativas' : 'Ocorreu um erro. Entre em contato com o suporte Efí para mais detalhes.');
    }
}
