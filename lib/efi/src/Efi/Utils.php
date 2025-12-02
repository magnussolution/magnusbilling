<?php

namespace Efi;

use Exception;

/**
 * Utility class for various functions.
 */
class Utils
{

    /**
     * Calculates the CRC16 checksum for a given string.
     *
     * @param string $str The input string.
     * @return string The CRC16 checksum.
     */
    public static function CRC16Checksum(string $str)
    {
        $crc = 0xFFFF;
        $strlen = strlen($str);

        for ($c = 0; $c < $strlen; $c++) {
            $crc ^= ord(substr($str, $c, 1)) << 8;

            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc = $crc << 1;
                }
            }
        }

        $hex = $crc & 0xFFFF;
        $hex = dechex($hex);
        $hex = strtoupper($hex);

        return $hex;
    }

    /**
     * Gets the data from the composer.json file and decodes it.
     *
     * @return array Parsed data from the composer.json file.
     */
    public static function getComposerData(): array
    {
        $composerJsonPath = __DIR__ . '/../../composer.json';
        return json_decode(file_get_contents($composerJsonPath), true);
    }

    /**
     * Get the client's IP address by checking various headers in order of preference.
     *
     * @return string The client's IP address or 'localhost' if no valid IP is found.
     */
    public static function getIPAddress(): string
    {
        $headersToCheck = ['HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];

        foreach ($headersToCheck as $header) {
            if (isset($_SERVER[$header]) && $_SERVER[$header] !== 'unknown') {
                $ip = $_SERVER[$header];
                break;
            }
        }

        $ip = $ip ?? 'localhost';

        return $ip;
    }

    public static function checkOpenSslExtension()
	{
		if (!extension_loaded('openssl')) {
            throw new Exception('A extensão OpenSSL não está habilitada no PHP ' . PHP_VERSION);
        }
	}
}
