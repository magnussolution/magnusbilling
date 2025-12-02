<?php


namespace Dnetix\Redirection;


class Document
{

    const TYPE_CC = 'CC';
    const TYPE_CE = 'CE';
    const TYPE_NIT = 'NIT';
    const TYPE_RUT = 'RUT';
    const TYPE_TI = 'TI';
    const TYPE_SSN = 'SSN';
    const TYPE_PPN = 'PPN';

    protected static $DOCUMENT_TYPES = [
        self::TYPE_CC,
        self::TYPE_CE,
        self::TYPE_NIT,
        self::TYPE_RUT,
        self::TYPE_TI,
        self::TYPE_SSN,
        self::TYPE_PPN,
    ];

    public static $VALIDATION_PATTERNS = [
        self::TYPE_CC => '/^[1-9][0-9]{4,9}$/',
        self::TYPE_CE => '/^([a-zA-Z]{1,5})?[1-9][0-9]{3,7}$/',
        self::TYPE_NIT => '/^[1-9][0-9]{6,8}(\-[0-9])?$/',
        self::TYPE_PPN => '/^[a-zA-z0-9]{4,12}$/',
    ];

    public static function documentTypes($exclude = [])
    {
        $types = self::$DOCUMENT_TYPES;
        if ($exclude && is_array($exclude)) {
            $types = array_diff_key($types, array_flip($exclude));
        }

        return $types;
    }

    public static function isValidType($type)
    {
        return in_array($type, self::$DOCUMENT_TYPES);
    }

    public static function isValidDocument($type, $document)
    {
        if (!self::isValidType($type))
            return false;

        $pattern = isset(self::$VALIDATION_PATTERNS[$type]) ? self::$VALIDATION_PATTERNS[$type] : null;
        if (!$pattern)
            return true;

        return !!preg_match($pattern, $document);
    }

}