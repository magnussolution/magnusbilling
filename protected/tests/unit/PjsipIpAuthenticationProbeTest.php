<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../../yii/framework/yii.php';
require_once dirname(__FILE__) . '/../../components/PjsipIpAuthenticationProbe.php';

class PjsipIpAuthenticationProbeTest extends TestCase
{
    public function testDetectsInboundAuthThatWillCause401()
    {
        $probe = new PjsipIpAuthenticationProbe(function ($name) {
            return "Endpoint: {$name}/{$name}\n"
                . "InAuth: {$name}_auth/{$name}\n"
                . "Identify: {$name}_identify/{$name}\n"
                . "Match: 149.34.49.47/32\n";
        });

        $step = $probe->inspect(['name' => 'account-ip', 'host' => '149.34.49.47']);

        $this->assertSame('PJSIP_IP_INBOUND_AUTH_ENABLED', $step['resultCode']);
        $this->assertSame('warning', $step['status']);
        $this->assertStringContainsString('401', $step['message']);
    }

    public function testDetectsIdentifyRestrictedToSourcePort()
    {
        $probe = new PjsipIpAuthenticationProbe(function ($name) {
            return "Endpoint: {$name}/{$name}\n"
                . "Identify: {$name}_identify/{$name}\n"
                . "Match: 149.34.49.47:5060/32\n";
        });

        $step = $probe->inspect(['name' => 'account-ip', 'host' => '149.34.49.47']);

        $this->assertSame('PJSIP_IP_IDENTIFY_PORT_RESTRICTED', $step['resultCode']);
        $this->assertSame('warning', $step['status']);
        $this->assertStringContainsString('different source port', $step['message']);
    }

    public function testPassesIpOnlyIdentifyWithoutInboundAuth()
    {
        $probe = new PjsipIpAuthenticationProbe(function ($name) {
            return "Endpoint: {$name}/{$name}\n"
                . "Identify: {$name}_identify/{$name}\n"
                . "Match: 149.34.49.47/32\n";
        });

        $step = $probe->inspect(['name' => 'account-ip', 'host' => '149.34.49.47:5060']);

        $this->assertSame('PJSIP_IP_AUTH_READY', $step['resultCode']);
        $this->assertSame('passed', $step['status']);
        $this->assertStringContainsString('without a source-port restriction', $step['message']);
    }

    public function testMissingIdentifyIsReported()
    {
        $probe = new PjsipIpAuthenticationProbe(function ($name) {
            return "Endpoint: {$name}/{$name}\nInAuth: {$name}_auth/{$name}\n";
        });

        $step = $probe->inspect(['name' => 'account-ip', 'host' => '149.34.49.47']);

        $this->assertSame('PJSIP_IP_IDENTIFY_MISSING', $step['resultCode']);
        $this->assertSame('warning', $step['status']);
    }

    public function testDynamicAccountIsNotApplicableAndRunsNoCommand()
    {
        $called = false;
        $probe = new PjsipIpAuthenticationProbe(function () use (&$called) {
            $called = true;
        });

        $this->assertNull($probe->inspect(['name' => 'dynamic-account', 'host' => 'dynamic']));
        $this->assertFalse($called);
    }

    public function testMissingEndpointIsReported()
    {
        $probe = new PjsipIpAuthenticationProbe(function () {
            return 'Unable to find object account-ip.';
        });

        $step = $probe->inspect(['name' => 'account-ip', 'host' => '149.34.49.47']);

        $this->assertSame('PJSIP_ENDPOINT_NOT_LOADED', $step['resultCode']);
        $this->assertSame('warning', $step['status']);
    }

    public function testUnsafeEndpointNameRunsNoAsteriskCommand()
    {
        $called = false;
        $probe = new PjsipIpAuthenticationProbe(function () use (&$called) {
            $called = true;
        });

        $step = $probe->inspect([
            'name' => "account\ncore stop now",
            'host' => '149.34.49.47',
        ]);

        $this->assertSame('inconclusive', $step['status']);
        $this->assertFalse($called);
    }
}
