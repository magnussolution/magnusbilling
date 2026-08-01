<?php

/**
 * Enforces the single-line boundary required by Asterisk configuration files.
 */
class AsteriskConfigValue
{
    public static function assertSingleLine($value, $field = 'value')
    {
        $value = (string) $value;
        if (preg_match('/[\r\n\x00]/', $value)) {
            throw new InvalidArgumentException(
                'Invalid control character in Asterisk configuration field: ' . $field
            );
        }
        return $value;
    }

    public static function assertRecord($values, $context = 'record')
    {
        foreach ($values as $field => $value) {
            if ($value === null || is_scalar($value)) {
                self::assertSingleLine($value, $context . '.' . $field);
            }
        }
    }
}
