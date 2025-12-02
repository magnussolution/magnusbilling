<?php

namespace Efi\Exception;

use Exception;

/**
 * Exception class for PIX API errors in the EFI SDK.
 */
class PixException extends Exception
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
        return $error['nome'] ?? ($error['title'] ?? $error['error'] ?? ($code === 401 ? 'unauthorized' : 'request_error'));
    }

    private function getErrorDescription(array $error, int $code): string
    {
        $description = '';
        if (isset($error['detail'])) {
            $description = $error['detail'];
            $description .= $this->getDetailError($error);
        } elseif (isset($error['mensagem'])) {
            $description = $this->getMessageError($error);
        } elseif (isset($error['error_description'])) {
            $description = $error['error_description'];
        } else {
            $description = ($code === 401) ? 'Credenciais inválidas ou inativas' : 'Ocorreu um erro. Entre em contato com o suporte Efí para mais detalhes.';
        }
        return $description;
    }

    private function getDetailError(array $error): string
    {
        $detailError = '';
        if (isset($error['violacoes']) && is_array($error['violacoes'])) {
            foreach ($error['violacoes'] as $violacao) {
                if (isset($violacao['razao'])) {
                    $detailError .= ' Propriedade: "' . $violacao['propriedade'] . '". ' . $violacao['razao'];
                }
            }
        }
        return $detailError;
    }

    private function getMessageError(array $error): string
    {
        $messageDetail = json_decode($error['mensagem'], true);
        if (is_array($messageDetail) && isset($messageDetail['detail'])) {
            $messageError = $messageDetail['detail'];
        } elseif (isset($error['erros']) && is_array($error['erros'])) {
            $errorMessages = [];
            foreach ($error['erros'] as $errorItem) {
                if (!empty($errorItem['mensagem']) && !empty($errorItem['caminho'])) {
                    $errorMessages[] = 'Parâmetro "' . $errorItem['caminho'] . '", ' . $errorItem['mensagem'];
                }
            }
            $messageError = implode('. ', $errorMessages);
        } else {
            $messageError = $error['mensagem'];
        }
        return $messageError;
    }
}
