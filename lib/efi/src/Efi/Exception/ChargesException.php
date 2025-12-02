<?php

namespace Efi\Exception;

use Exception;

/**
 * Exception class for CHARGES API errors in the EFI SDK.
 */
class ChargesException extends Exception
{
    public $code;
    public $error;
    public $errorDescription;

    public function __construct(array $error, int $code)
    {
        $this->code = $error['code'] ?? $code;
        $this->error = self::getErrorTitle($error, $this->code);
        $this->errorDescription = self::getErrorDescription($error, $this->code);

        parent::__construct($this->errorDescription, $this->code);
    }

    private static function getErrorTitle(array $error, int $code): string
    {
        if (isset($error['error']) && is_string($error['error'])) {
            return $error['error'];
        }
        return $code === 401 ? 'unauthorized' : 'request_error';
    }

    private function getErrorDescription(array $error, int $code): string
    {
        $description = '';
        if (isset($error['error_description'])) {
            if (is_array($error['error_description'])) {
                $description = isset($error['error_description']['message'])
                    ? 'Propriedade: "' . $error['error_description']['property'] . '". ' . $error['error_description']['message']
                    : $error['error_description'];
            } else {
                $description = ($code === 401) ? 'Credenciais inválidas ou inativas' : $error['error_description'];
            }
        } elseif (isset($error['error']) && isset($error['error_description'])) {
            $description = $error['error_description'];
        } elseif (isset($error['sprintfParams']) && is_string($error['sprintfParams'])) {
            $description = $error['sprintfParams'];
        } else {
            $description = 'Ocorreu um erro. Entre em contato com o suporte Efí para mais detalhes.';
        }
        return $description;
    }
}
