<?php

/**
 * File-backed IP allowlist for sensitive panel users.
 *
 * A user is unrestricted while its allowlist file does not exist. Once the
 * file exists, only the IP addresses listed in it are accepted. This makes the
 * feature opt-in and prevents an application update from locking out existing
 * installations.
 */
class PanelIpAccess
{
    const DEFAULT_DIRECTORY = '/etc/magnusbilling/panel-ip-access';

    private $directory;

    public function __construct($directory = self::DEFAULT_DIRECTORY)
    {
        $this->directory = rtrim((string) $directory, DIRECTORY_SEPARATOR);
    }

    public function isAllowed($username, $ipAddress)
    {
        if (! $this->isValidUsername($username)) {
            return false;
        }

        $normalizedAddress = $this->normalizeIpAddress($ipAddress);
        if ($normalizedAddress === false) {
            return false;
        }

        $allowlist = $this->getAllowlistPath($username);
        $legacyAllowlist = $this->getLegacyAllowlistPath($username);

        if (! file_exists($allowlist) && $legacyAllowlist !== false
            && file_exists($legacyAllowlist)) {
            $allowlist = $legacyAllowlist;
        }

        if (! file_exists($allowlist)) {
            return true;
        }

        if (! is_file($allowlist) || ! is_readable($allowlist)) {
            return false;
        }

        $entries = file($allowlist, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($entries === false) {
            return false;
        }

        foreach ($entries as $entry) {
            $normalizedEntry = $this->normalizeIpAddress(trim($entry));
            if ($normalizedEntry !== false && hash_equals($normalizedEntry, $normalizedAddress)) {
                return true;
            }
        }

        return false;
    }

    private function isValidUsername($username)
    {
        return is_string($username) && $username !== '';
    }

    private function getAllowlistPath($username)
    {
        return $this->directory . DIRECTORY_SEPARATOR
            . 'user-' . hash('sha256', $username) . '.allow';
    }

    private function getLegacyAllowlistPath($username)
    {
        if (preg_match('/\A[A-Za-z0-9_.@-]{1,100}\z/D', $username) !== 1
            || $username === '.' || $username === '..') {
            return false;
        }

        return $this->directory . DIRECTORY_SEPARATOR . $username . '.allow';
    }

    private function normalizeIpAddress($ipAddress)
    {
        if (! is_string($ipAddress) || filter_var($ipAddress, FILTER_VALIDATE_IP) === false) {
            return false;
        }

        $binaryAddress = @inet_pton($ipAddress);
        if ($binaryAddress === false) {
            return false;
        }

        // Apache can expose an IPv4 client as an IPv4-mapped IPv6 address.
        if (strlen($binaryAddress) === 16
            && substr($binaryAddress, 0, 12) === str_repeat("\x00", 10) . "\xff\xff") {
            $binaryAddress = substr($binaryAddress, 12);
        }

        return $binaryAddress;
    }
}
