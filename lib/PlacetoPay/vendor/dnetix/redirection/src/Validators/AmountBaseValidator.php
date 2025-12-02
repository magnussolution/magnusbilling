<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Entities\AmountBase;

class AmountBaseValidator extends BaseValidator
{

    /**
     * @param AmountBase $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];
        if (!$entity->currency() || !Currency::isValidCurrency($entity->currency()))
            $errors[] = 'currency';

        if (!$entity->total() || !is_numeric($entity->total()))
            $errors[] = 'total';

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'AmountBase', $silent);
            return false;
        }
        return true;
    }

}