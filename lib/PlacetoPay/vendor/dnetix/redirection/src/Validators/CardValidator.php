<?php


namespace Dnetix\Redirection\Validators;


class CardValidator
{

    const VISA = 'visa';
    const VISA_ELECTRON = 'visa_electron';
    const AMEX = 'amex';
    const MASTERCARD = 'master';
    const CODENSA = 'codensa';
    const DINERS = 'diners';
    const JBC = 'jbc';
    const DISCOVER = 'discover';

    public static $PATTERNS = [
        self::VISA_ELECTRON => '/^(4026|417500|4508|4844|491(3|7))/',
        self::VISA => '/^4([0-9]{12}|[0-9]{15})$/',
        self::CODENSA => '/^590712[0-9]{10}$/',
        self::MASTERCARD => '/^5[1-5][0-9]{14}$/',
        self::JBC => '/^35(2[89]|[3-8][0-9])/',
        self::AMEX => '/^3[47][0-9]{13}$/',
        self::DINERS => '/^3(0[0-5]|[68][0-9])[0-9]{11,13}$/',
        self::DISCOVER => '/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/',
    ];

    public static $FRANCHISES = [
        self::VISA,
        self::VISA_ELECTRON,
        self::AMEX,
        self::MASTERCARD,
        self::CODENSA,
        self::DINERS,
        self::JBC,
        self::DISCOVER,
    ];

    public static function cardNumberFranchise($number)
    {
        foreach (self::$PATTERNS as $franchise => $pattern) {
            if (preg_match($pattern, $number)) {
                return $franchise;
            }
        }
        return null;
    }

}