<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Entities\Amount;

class AmountValidator extends BaseValidator
{

    /**
     * @param Amount $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];

        // TODO: Validate calculations related

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'Amount', $silent);
            return false;
        }
        return true;
    }

}