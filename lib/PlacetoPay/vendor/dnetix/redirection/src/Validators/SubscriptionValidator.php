<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Entities\Subscription;

class SubscriptionValidator extends BaseValidator
{

    /**
     * @param Subscription $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];

        if (!$entity->reference() || self::matchPattern($entity->reference(), '/[ ]/'))
            $errors[] = 'reference';

        if (!$entity->description() || !self::matchPattern($entity->description(), self::PATTERN_DESCRIPTION))
            $errors[] = 'description';

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'Subscription', $silent);
            return false;
        }
        return true;
    }

}