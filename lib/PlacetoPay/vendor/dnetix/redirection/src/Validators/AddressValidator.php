<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Entities\Address;

class AddressValidator extends PersonValidator
{

    /**
     * @param Address $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];
        if (!$entity->street())
            $errors[] = 'street';

        if (!$entity->city() || !self::matchPattern($entity->city(), self::PATTERN_CITY))
            $errors[] = 'city';

        if (!$entity->country() || !Country::isValidCountryCode($entity->country()))
            $errors[] = 'country';

        if ($entity->phone() && !PhoneNumber::isValidNumber($entity->phone()))
            $errors[] = 'phone';

        if ($entity->postalCode() && !self::matchPattern($entity->postalCode(), self::PATTERN_POSTALCODE))
            $errors[] = 'postalCode';

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'Address', $silent);
            return false;
        }
        return true;
    }

}