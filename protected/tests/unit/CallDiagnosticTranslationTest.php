<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../components/CallDiagnosticService.php';

class CallDiagnosticTranslationTest extends TestCase
{
    public function testEveryBackendDiagnosticMessageExistsInEveryLocale()
    {
        $root = dirname(__FILE__) . '/../../..';
        $source = file_get_contents($root . '/protected/components/CallDiagnosticService.php')
            . file_get_contents($root . '/protected/components/PjsipIpAuthenticationProbe.php')
            . file_get_contents($root . '/protected/controllers/CallDiagnosticController.php');
        foreach (glob($root . '/resources/asterisk/*.php') as $agiFile) {
            $source .= file_get_contents($agiFile);
        }
        $keys = [];

        preg_match_all("/Yii::t\\('zii',\\s*'([^']*)'/", $source, $matches);
        $keys = array_merge($keys, $matches[1]);

        preg_match_all("/=> \\['(?:passed|failed|warning|inconclusive)', '([^']*)', '([^']*)'\\]/", $source, $matches);
        $keys = array_merge($keys, $matches[1], $matches[2]);

        foreach (CallDiagnosticService::failureCatalog() as $failure) {
            $keys = array_merge($keys, $failure);
        }

        preg_match_all("/\\\$this->pass\\(\\\$result,\\s*'([^']+)',\\s*'([^']+)'/", $source, $matches);
        $keys = array_merge($keys, $matches[2]);
        foreach ($matches[1] as $stepCode) {
            $keys[] = ucwords(str_replace('_', ' ', $stepCode));
        }

        preg_match_all("/verboseEvent\\('([^']+)',\\s*'[^']+',\\s*'([^']+)'/", $source, $matches);
        $keys = array_merge($keys, $matches[1], $matches[2]);

        $keys = array_unique($keys);
        foreach (glob($root . '/resources/locale/php/*/zii.php') as $localeFile) {
            $translations = require $localeFile;
            foreach ($keys as $key) {
                $this->assertArrayHasKey($key, $translations, basename(dirname($localeFile)) . ': ' . $key);
            }
        }
    }
}
