<?php


namespace Dnetix\Redirection\Validators;


class PhoneNumber
{

    const VALIDATION_PATTERN = '/^([0|\+?[0-9]{1,5})?([0-9 \(\)]{7,})([\(\)\w\d\. ]+)?$/';

    public static function isValidNumber($number)
    {
        return !!preg_match(self::VALIDATION_PATTERN, $number);
    }

}