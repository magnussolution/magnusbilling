<?php

/**
 * Authentication helpers for the public ATA provisioning endpoint.
 */
class AtaProvisioningAuth
{
    const TOKEN_BYTES = 32;

    public static function normalizeMac($mac)
    {
        if (! is_string($mac)) {
            return null;
        }

        $mac = strtoupper(trim($mac));
        return preg_match('/^[A-F0-9]{12}$/D', $mac) ? $mac : null;
    }

    public static function normalizeToken($token)
    {
        if (! is_string($token)) {
            return null;
        }

        $token = trim($token);
        return preg_match('/^[a-f0-9]{64}$/D', $token) ? $token : null;
    }

    public static function generateToken()
    {
        return bin2hex(random_bytes(self::TOKEN_BYTES));
    }

    public static function hashToken($token)
    {
        $token = self::normalizeToken($token);
        if ($token === null) {
            throw new InvalidArgumentException('Invalid ATA provisioning token.');
        }

        return hash('sha256', $token);
    }

    public static function matches($token, $storedHash)
    {
        $token = self::normalizeToken($token);
        $storedHash = is_string($storedHash) ? trim($storedHash) : '';

        if ($token === null || ! preg_match('/^[a-f0-9]{64}$/D', $storedHash)) {
            return false;
        }

        return hash_equals($storedHash, hash('sha256', $token));
    }

    public static function buildProfileRule($server, $mac, $token)
    {
        $mac = self::normalizeMac($mac);
        $token = self::normalizeToken($token);
        if ($mac === null || $token === null || ! is_string($server)) {
            throw new InvalidArgumentException('Invalid ATA provisioning URL data.');
        }

        $authority = preg_replace('#^https?://#i', '', trim($server));
        $authority = rtrim($authority, '/');
        if (! preg_match('/^[A-Za-z0-9.\-:\[\]]+$/D', $authority)) {
            throw new InvalidArgumentException('Invalid ATA provisioning server.');
        }

        return 'https://' . $authority . '/mbilling/index.php/ata?mac=' . $mac . '&token=' . $token;
    }

    public static function isSecureRequest(array $server)
    {
        if (isset($server['HTTPS']) && strtolower((string) $server['HTTPS']) !== 'off') {
            return true;
        }

        if (! isset($server['HTTP_X_FORWARDED_PROTO'])) {
            return false;
        }

        $forwardedProtocols = explode(',', (string) $server['HTTP_X_FORWARDED_PROTO']);
        return strtolower(trim($forwardedProtocols[0])) === 'https';
    }
}
