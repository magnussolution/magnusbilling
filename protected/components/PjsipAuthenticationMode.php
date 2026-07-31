<?php

require_once dirname(__FILE__) . '/AsteriskConfigValue.php';

/**
 * Centralizes the persisted SIP-account rules used to generate PJSIP
 * authentication. Fixed-IP accounts configured with chan_sip's
 * insecure=invite semantics, or without a password, are IP-only.
 */
class PjsipAuthenticationMode
{
    public static function isIpOnly($sip)
    {
        $host = strtolower(trim((string) self::value($sip, 'host')));
        if ($host === '' || $host === 'dynamic') {
            return false;
        }

        $secret = (string) self::value($sip, 'secret');
        $insecure = strtolower((string) self::value($sip, 'insecure'));
        return trim($secret) === ''
            || preg_match('/(?:^|,)\\s*invite\\s*(?:,|$)/', $insecure) === 1;
    }

    public static function requiresInboundAuth($sip)
    {
        return ! self::isIpOnly($sip);
    }

    public static function normalizedInsecure($host, $secret, $insecure)
    {
        $host = strtolower(trim((string) $host));
        if ($host === '' || $host === 'dynamic') {
            return 'no';
        }
        if (trim((string) $secret) === '') {
            return 'port,invite';
        }
        return trim((string) $insecure);
    }

    public static function authSection($sip, $authName, $authUsername)
    {
        if (! self::requiresInboundAuth($sip)) {
            return '';
        }

        $authName = AsteriskConfigValue::assertSingleLine($authName, 'authName');
        $authUsername = AsteriskConfigValue::assertSingleLine($authUsername, 'authUsername');
        $secret = AsteriskConfigValue::assertSingleLine(
            self::value($sip, 'secret'),
            'secret'
        );
        $line  = "\n\n[" . $authName . "]\n";
        $line .= "type=auth\n";
        $line .= "auth_type=userpass\n";
        $line .= "username=" . $authUsername . "\n";
        if ($secret !== '') {
            $line .= "password=" . $secret . "\n";
        }
        return $line;
    }

    public static function endpointAuthLine($sip, $authName)
    {
        $authName = AsteriskConfigValue::assertSingleLine($authName, 'authName');
        return self::requiresInboundAuth($sip)
            ? "auth=" . $authName . "\n"
            : '';
    }

    public static function endpointIdentifyBy($sip)
    {
        return self::isIpOnly($sip)
            ? 'ip'
            : 'username,auth_username,ip';
    }

    private static function value($sip, $name)
    {
        if (is_array($sip)) {
            return isset($sip[$name]) ? $sip[$name] : null;
        }
        return is_object($sip) && isset($sip->{$name}) ? $sip->{$name} : null;
    }
}
