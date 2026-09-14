<?php

/**
 * Enforces the single-line boundary required by Asterisk configuration files.
 */
class AsteriskConfigValue
{
    public static function assertSingleLine($value, $field = 'value')
    {
        return str_replace(["\r", "\n", "\x00"], '', (string) $value);
    }

    public static function assertRecord($values, $context = 'record')
    {
        foreach ($values as $field => $value) {
            if (is_string($value)) {
                $values[$field] = self::assertSingleLine($value, $context . '.' . $field);
            }
        }
        return $values;
    }
}
