<?php

/**
 * Applies narrowly scoped, idempotent changes to Asterisk modules.conf.
 */
class AsteriskModulesConfig
{
    public static function ensureNoload($path, $module)
    {
        if (! preg_match('/^[A-Za-z0-9_.-]+\.so$/D', (string) $module)) {
            throw new InvalidArgumentException('Invalid Asterisk module name.');
        }
        $resolvedPath = realpath($path);
        if ($resolvedPath === false
            || ! is_file($resolvedPath)
            || ! is_readable($resolvedPath)
            || ! is_writable($resolvedPath)
        ) {
            throw new RuntimeException('Asterisk modules.conf is not safely writable: ' . $path);
        }
        $path = $resolvedPath;

        $contents = file_get_contents($path);
        if ($contents === false) {
            throw new RuntimeException('Unable to read Asterisk modules.conf: ' . $path);
        }
        if (preg_match(
            '/^\s*noload\s*=>\s*' . preg_quote($module, '/') . '\s*(?:;.*)?$/mi',
            $contents
        )) {
            return false;
        }

        $updated = rtrim($contents, "\r\n")
            . "\n"
            . 'noload => ' . $module
            . "\n";
        $directory = dirname($path);
        $temporary = tempnam($directory, '.modules.conf.');
        if ($temporary === false) {
            throw new RuntimeException('Unable to create a temporary modules.conf file.');
        }

        try {
            $mode = fileperms($path);
            $owner = fileowner($path);
            $group = filegroup($path);
            if (file_put_contents($temporary, $updated, LOCK_EX) === false) {
                throw new RuntimeException('Unable to write the updated Asterisk modules.conf.');
            }
            if ($mode !== false) {
                chmod($temporary, $mode & 0777);
            }
            if ($owner !== false) {
                chown($temporary, $owner);
            }
            if ($group !== false) {
                chgrp($temporary, $group);
            }
            if (! rename($temporary, $path)) {
                throw new RuntimeException('Unable to replace Asterisk modules.conf safely.');
            }
        } catch (Throwable $e) {
            if (is_file($temporary)) {
                unlink($temporary);
            }
            throw $e;
        }
        return true;
    }
}
