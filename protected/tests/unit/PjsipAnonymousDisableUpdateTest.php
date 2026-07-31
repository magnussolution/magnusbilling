<?php

use PHPUnit\Framework\TestCase;

class PjsipAnonymousDisableUpdateTest extends TestCase
{
    public function testDatabaseUpdatePersistsModulesDirectiveBeforeVersionAdvance()
    {
        $source = file_get_contents(
            dirname(__FILE__) . '/../../commands/UpdateMysqlCommand.php'
        );
        $migration = strpos($source, "if (\$version == '8.0.0.6')");
        $directive = strpos(
            $source,
            "'res_pjsip_endpoint_identifier_anonymous.so'",
            $migration
        );
        $version = strpos($source, "\$version = '8.0.0.7';", $migration);

        $this->assertNotFalse($migration);
        $this->assertNotFalse($directive);
        $this->assertNotFalse($version);
        $this->assertLessThan($version, $directive);
    }

    public function testFreshAndLegacyInstallersDisableAnonymousIdentifier()
    {
        $root = dirname(__FILE__) . '/../../..';
        $directive = 'noload => res_pjsip_endpoint_identifier_anonymous.so';
        $installer = file_get_contents($root . '/script/install.sh');
        $legacyUpdate = file_get_contents($root . '/script/updateV7_to_V8.sh');

        $this->assertSame(1, substr_count($installer, $directive));
        $this->assertStringContainsString($directive, $legacyUpdate);
    }

    public function testGeneratedIdentifierOrderDoesNotAdvertiseAnonymousFallback()
    {
        $source = file_get_contents(
            dirname(__FILE__) . '/../../components/AsteriskAccess.php'
        );

        $this->assertStringContainsString(
            'endpoint_identifier_order=ip,username,auth_username\\n',
            $source
        );
        $this->assertStringNotContainsString(
            'endpoint_identifier_order=ip,username,auth_username,anonymous',
            $source
        );
    }
}
