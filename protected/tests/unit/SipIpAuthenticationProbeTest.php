<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../../yii/framework/yii.php';
require_once dirname(__FILE__) . '/../../components/SipIpAuthenticationProbe.php';

class SipIpAuthenticationProbeTest extends TestCase
{
    public function testWarnsForFixedIpChanSipPeerWithoutPortAndInvite()
    {
        $commands = [];
        $probe = new SipIpAuthenticationProbe(function ($driver, $name) use (&$commands) {
            $commands[] = [$driver, $name];
            if ($driver === 'pjsip') {
                return ['data' => 'Unable to find object account-ip.'];
            }
            return ['data' => "* Name : account-ip\nAddr->IP : 149.34.49.47:5092\nInsecure : no\n"];
        });

        $step = $probe->inspect([
            'name' => 'account-ip',
            'host' => '149.34.49.47',
            'insecure' => 'no',
        ]);

        $this->assertSame('SIP_IP_AUTH_SOURCE_PORT_RISK', $step['resultCode']);
        $this->assertSame('warning', $step['status']);
        $this->assertStringContainsString('401', $step['message']);
        $this->assertStringContainsString('port,invite', $step['resolution']['message']);
        $this->assertSame([['pjsip', 'account-ip'], ['sip', 'account-ip']], $commands);
    }

    public function testPassesFixedIpChanSipPeerWithPortAndInvite()
    {
        $probe = new SipIpAuthenticationProbe(function ($driver) {
            return $driver === 'pjsip'
                ? 'Could not find endpoint'
                : "* Name : account-ip\nInsecure : port,invite\n";
        });

        $step = $probe->inspect([
            'name' => 'account-ip',
            'host' => '149.34.49.47:5060',
            'insecure' => 'no',
        ]);

        $this->assertSame('SIP_IP_AUTH_CHAN_SIP_READY', $step['resultCode']);
        $this->assertSame('passed', $step['status']);
    }

    public function testPjsipDoesNotRecommendChanSipInsecure()
    {
        $commands = [];
        $probe = new SipIpAuthenticationProbe(function ($driver, $name) use (&$commands) {
            $commands[] = $driver;
            return $driver === 'pjsip'
                ? " Endpoint:  {$name}/{$name}  Not in use\n"
                : 'Peer not found';
        });

        $step = $probe->inspect([
            'name' => 'account-ip',
            'host' => '149.34.49.47',
            'insecure' => 'no',
        ]);

        $this->assertSame('SIP_IP_AUTH_PJSIP_IDENTIFY', $step['resultCode']);
        $this->assertSame('passed', $step['status']);
        $this->assertStringNotContainsString('set insecure', strtolower($step['resolution']['message']));
        $this->assertSame(['pjsip', 'sip'], $commands);
    }

    public function testDynamicAccountIsNotApplicableAndRunsNoCommand()
    {
        $called = false;
        $probe = new SipIpAuthenticationProbe(function () use (&$called) {
            $called = true;
        });

        $this->assertNull($probe->inspect([
            'name' => 'dynamic-account',
            'host' => 'dynamic',
            'insecure' => 'no',
        ]));
        $this->assertFalse($called);
    }

    public function testMissingLivePeerIsInconclusive()
    {
        $probe = new SipIpAuthenticationProbe(function () {
            return 'Peer not found';
        });

        $step = $probe->inspect([
            'name' => 'account-ip',
            'host' => '149.34.49.47',
            'insecure' => 'no',
        ]);

        $this->assertSame('SIP_IP_AUTH_DRIVER_INCONCLUSIVE', $step['resultCode']);
        $this->assertSame('inconclusive', $step['status']);
        $this->assertStringContainsString('Do not change insecure', $step['resolution']['message']);
    }

    public function testAccountLoadedByBothDriversIsInconclusive()
    {
        $probe = new SipIpAuthenticationProbe(function ($driver, $name) {
            return $driver === 'pjsip'
                ? " Endpoint:  {$name}/{$name}  Not in use\n"
                : "* Name : {$name}\nInsecure : no\n";
        });

        $step = $probe->inspect([
            'name' => 'account-ip',
            'host' => '149.34.49.47',
            'insecure' => 'no',
        ]);

        $this->assertSame('SIP_IP_AUTH_DRIVER_INCONCLUSIVE', $step['resultCode']);
        $this->assertSame('inconclusive', $step['status']);
        $this->assertStringContainsString('both chan_sip and PJSIP', $step['message']);
    }

    public function testUnsafePeerNameRunsNoAsteriskCommand()
    {
        $called = false;
        $probe = new SipIpAuthenticationProbe(function () use (&$called) {
            $called = true;
        });

        $step = $probe->inspect([
            'name' => "account\ncore stop now",
            'host' => '149.34.49.47',
            'insecure' => 'no',
        ]);

        $this->assertSame('inconclusive', $step['status']);
        $this->assertFalse($called);
    }
}
