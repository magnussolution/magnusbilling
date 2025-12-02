<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Entities\TaxDetail;

class TaxDetailValidator extends BaseValidator
{
    const TP_IVA = 'valueAddedTax';
    const TP_IPO = 'exciseDuty';

    public static $TYPES = [
        self::TP_IVA,
        self::TP_IPO,
    ];

    public static function isValidKind($kind = null)
    {
        if (!$kind)
            return self::$TYPES;

        return in_array($kind, self::$TYPES);
    }

    /**
     * @param TaxDetail $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];
        if (!$entity->kind() || !self::isValidKind($entity->kind()))
            $errors[] = 'kind';

        if (!$entity->amount() || !is_numeric($entity->amount()) || $entity->amount() < 0)
            $errors[] = 'amount';

        if ($entity->base() && (!is_numeric($entity->base()) || $entity->base() < 0 || $entity->base() < $entity->amount()))
            $errors[] = 'base';

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'TaxDetail', $silent);
            return false;
        }
        return true;
    }

}