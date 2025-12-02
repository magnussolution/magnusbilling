<?php

namespace Efi\Exception;

use Exception;

/**
 * Exception class for OPENING-ACCOUNTS API errors in the EFI SDK.
 */
class OpeningAccountsException extends Exception
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
        return $error['nome'] ?? $error['error'] ?? ($code === 401 ? 'unauthorized' : 'Precondition failed');
    }

    private function getErrorDescription(array $error, int $code): string
    {
        return  $error['mensagem'] ?? $error['error_description'] ?? (($code === 401) ? 'Credenciais inválidas ou inativas' : 'Acesse a documentação API Efí para mais detalhes do código de erro.');
    }
}
