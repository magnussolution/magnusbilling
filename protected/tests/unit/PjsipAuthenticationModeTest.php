<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../components/PjsipAuthenticationMode.php';

class PjsipAuthenticationModeTest extends TestCase
{
    /**
     * @dataProvider accountSources
     */
    public function testAuthenticationModeAcrossAccountSources($sip, $expectsAuth)
    {
        $this->assertSame(
            $expectsAuth,
            PjsipAuthenticationMode::requiresInboundAuth($sip)
        );
        $config = PjsipAuthenticationMode::authSection(
            $sip,
            'test_auth',
            'test'
        ) . PjsipAuthenticationMode::endpointAuthLine($sip, 'test_auth');
        $this->assertSame($expectsAuth, strpos($config, 'auth=') !== false);
        $this->assertSame(
            $expectsAuth ? 'username,auth_username,ip' : 'ip',
            PjsipAuthenticationMode::endpointIdentifyBy($sip)
        );
    }

    public static function accountSources()
    {
        return [
            'manual username and password' => [[
                'host' => 'dynamic',
                'secret' => 'password',
                'insecure' => 'no',
            ], true],
            'API fixed IP without password' => [[
                'host' => '198.51.100.10',
                'secret' => '',
                'insecure' => 'no',
            ], false],
            'MB7 migrated IP account' => [[
                'host' => '198.51.100.20',
                'secret' => 'legacy-value',
                'insecure' => 'port,invite',
            ], false],
            'fixed IP with required credentials' => [[
                'host' => '198.51.100.30',
                'secret' => 'password',
                'insecure' => 'no',
            ], true],
        ];
    }
}
