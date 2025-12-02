<?php

namespace Efi;

class Security
{
    private $encryptionMethod = "aes-256-cbc";
    private $encryptionKey;

    /**
     * Security constructor.
     *
     * @param string $encryptionKey - The encryption key used for encryption and decryption.
     */
    public function __construct(string $encryptionKey)
    {
        Utils::checkOpenSslExtension();
        $this->encryptionKey = $encryptionKey;
    }

    /**
     * Encrypts the data using OpenSSL.
     *
     * @param string $data - The data to be encrypted.
     * @return string The encrypted data.
     */
    public function encrypt(string $data): string
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($this->encryptionMethod));
        $encrypted = openssl_encrypt($data, $this->encryptionMethod, $this->encryptionKey, 0, $iv);

        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypts the data using OpenSSL.
     *
     * @param string $data - The encrypted data.
     * @return string|bool The decrypted data or false if decryption fails.
     */
    public function decrypt($data)
    {
        if ($data === null) {
            return false;
        }
        $data = base64_decode($data);
        $ivSize = openssl_cipher_iv_length($this->encryptionMethod);
        $iv = substr($data, 0, $ivSize);
        $encrypted = substr($data, $ivSize);

        return openssl_decrypt($encrypted, $this->encryptionMethod, $this->encryptionKey, 0, $iv);
    }

    /**
     * Generates a cache hash based on the provided parameters.
     *
     * @param string $prefix - Prefix for the hash.
     * @param string $api - API identifier.
     * @param string $credencial - ClientId.
     * @return string The generated cache hash.
     */
    public static function getHash(string $prefix, string $api, string $credencial): string
    {
        $ip = Utils::getIPAddress();
        return hash('sha512', 'Efí-' . $prefix . "-" . $api . $ip . substr($credencial, -6));
    }
}
