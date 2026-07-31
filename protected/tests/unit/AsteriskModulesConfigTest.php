<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../components/AsteriskModulesConfig.php';

class AsteriskModulesConfigTest extends TestCase
{
    private $directory;
    private $path;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/mb-modules-' . bin2hex(random_bytes(6));
        mkdir($this->directory, 0700, true);
        $this->path = $this->directory . '/modules.conf';
    }

    protected function tearDown(): void
    {
        if (is_file($this->path)) {
            unlink($this->path);
        }
        if (is_dir($this->directory)) {
            rmdir($this->directory);
        }
    }

    public function testAddsNoloadWithoutReplacingExistingConfiguration()
    {
        $original = "[modules]\nautoload=yes\nnoload => chan_sip.so\n";
        file_put_contents($this->path, $original);

        $changed = AsteriskModulesConfig::ensureNoload(
            $this->path,
            'res_pjsip_endpoint_identifier_anonymous.so'
        );
        $updated = file_get_contents($this->path);

        $this->assertTrue($changed);
        $this->assertStringStartsWith($original, $updated);
        $this->assertStringContainsString(
            "noload => res_pjsip_endpoint_identifier_anonymous.so\n",
            $updated
        );
    }

    public function testIsIdempotentWithEquivalentSpacing()
    {
        file_put_contents(
            $this->path,
            "[modules]\n  noload   =>   res_pjsip_endpoint_identifier_anonymous.so\n"
        );

        $changed = AsteriskModulesConfig::ensureNoload(
            $this->path,
            'res_pjsip_endpoint_identifier_anonymous.so'
        );

        $this->assertFalse($changed);
        $this->assertSame(
            1,
            substr_count(
                file_get_contents($this->path),
                'res_pjsip_endpoint_identifier_anonymous.so'
            )
        );
    }

    public function testRejectsUnsafeModuleName()
    {
        file_put_contents($this->path, "[modules]\n");
        $this->expectException(InvalidArgumentException::class);
        AsteriskModulesConfig::ensureNoload($this->path, "module.so\nload => bad.so");
    }

    public function testCommentedDirectiveDoesNotCountAsDisabled()
    {
        file_put_contents(
            $this->path,
            "[modules]\n; noload => res_pjsip_endpoint_identifier_anonymous.so\n"
        );

        $changed = AsteriskModulesConfig::ensureNoload(
            $this->path,
            'res_pjsip_endpoint_identifier_anonymous.so'
        );

        $this->assertTrue($changed);
        $this->assertStringEndsWith(
            "noload => res_pjsip_endpoint_identifier_anonymous.so\n",
            file_get_contents($this->path)
        );
    }
}
