<?php


namespace Dnetix\Redirection\Validators;


use Dnetix\Redirection\Exceptions\EntityValidationFailException;

class BaseValidator
{
    const PATTERN_DESCRIPTION = '/^[\w\d\- \,\.\[\]\(\)\%ÑñÁÉÍÓÚáéíóú]+$/';

    public static function isValidUrl($url)
    {
        return filter_var($url, FILTER_VALIDATE_URL);
    }

    public static function isValidIp($ip)
    {
        return filter_var($ip, FILTER_VALIDATE_IP);
    }

    public static function isEmpty($value)
    {
        return empty($value);
    }

    public static function matchPattern($value, $pattern)
    {
        return preg_match($pattern, $value);
    }

    public static function isValidString($value, $min, $required)
    {
        if ($required && self::isEmpty($value))
            return false;
        if (!$value || !is_string($value) || strlen($value) < $min)
            return false;

        return true;
    }

    public static function isInteger($value)
    {
        return !!filter_var($value, FILTER_VALIDATE_INT);
    }

    public static function isActualDate($date, $minDifference = -1)
    {
        return strtotime($date) - time() > $minDifference;
    }

    public static function parseDate($date, $format = 'c')
    {
        $time = strtotime($date);
        if (!$time)
            return false;
        return date($format, $time);
    }

    public static function throwValidationException($fields, $from, $silent = true, $message = null)
    {
        if (!$silent)
            throw new EntityValidationFailException($fields, $from, $message);
    }
}