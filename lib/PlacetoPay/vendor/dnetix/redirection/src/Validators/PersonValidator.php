<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Document;
use Dnetix\Redirection\Entities\Person;

class PersonValidator extends Country
{

    const PATTERN_NAME = '/^[a-zA-ZÑÁÉÍÓÚáéíóú][a-zA-Zñáéíóú\' ]+$/';
    const PATTERN_SURNAME = '/^[a-zA-ZÑÁÉÍÓÚáéíóú][a-zA-Zñáéíóú\' ]+$/';
    const PATTERN_EMAIL = '/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/';
    const PATTERN_MOBILE = PhoneNumber::VALIDATION_PATTERN;

    // Address Patterns
    const PATTERN_CITY = '/^[a-zA-ZÑÁÉÍÓÚáéíóú][a-zA-Zñáéíóú\'\.\, ]+$/';
    const PATTERN_STATE = '/^[a-zA-ZÑÁÉÍÓÚáéíóú][a-zA-Zñáéíóú ]+$/';
    const PATTERN_STREET = '/^[a-zA-ZÑÁÉÍÓÚáéíóú\d\#\.\- ]*$/';
    const PATTERN_PHONE = PhoneNumber::VALIDATION_PATTERN;
    const PATTERN_POSTALCODE = '/^[0-9]{4,8}$/';
    const PATTERN_COUNTRY = '/^[A-Z]{2}$/';

    public static function getPattern($field, $cleanLimiters = false)
    {
        try {
            $name = 'PATTERN_' . strtoupper($field);
            $pattern = constant(self::class . '::' . $name);
            if ($cleanLimiters)
                return substr($pattern, 1, -1);
            return $pattern;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * @param Person $entity
     * @param $fields
     * @param bool $silent
     * @return bool
     */
    public static function isValid($entity, &$fields, $silent = true)
    {
        $errors = [];
        if (!$entity->name() || !self::matchPattern($entity->name(), self::PATTERN_NAME))
            $errors[] = 'name';

        if ($entity->surname() && !self::matchPattern($entity->surname(), self::PATTERN_SURNAME))
            $errors[] = 'surname';

        if (!$entity->email() || !self::matchPattern($entity->email(), self::PATTERN_EMAIL))
            $errors[] = 'email';

        if ($entity->document()) {
            if (!$entity->documentType()) {
                $errors[] = 'documentType';
            }
            if (!Document::isValidDocument($entity->documentType(), $entity->document())) {
                $errors[] = 'document';
            }
        }
        if ($entity->mobile() && !PhoneNumber::isValidNumber($entity->mobile()))
            $errors[] = 'mobile';

        if ($errors) {
            $fields = $errors;
            self::throwValidationException($errors, 'Person', $silent);
            return false;
        }
        return true;
    }

    public static function normalizePhone($phone)
    {
        return str_replace('+57', '', $phone);
    }
}