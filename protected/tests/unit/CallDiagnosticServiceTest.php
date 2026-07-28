<?php

use PHPUnit\Framework\TestCase;

require_once dirname(__FILE__) . '/../../components/CallDiagnosticService.php';

class CallDiagnosticServiceTest extends TestCase
{
    public function testCatalogContainsStableSuccessAndFailureCodes()
    {
        $catalog = CallDiagnosticService::catalog();
        $this->assertArrayHasKey('OUTBOUND_READY', $catalog);
        $this->assertArrayHasKey('RATE_NOT_FOUND', $catalog);
        $this->assertArrayHasKey('DID_READY', $catalog);
        $this->assertArrayHasKey('ROUTING_LOOP_DETECTED', $catalog);
        foreach ($catalog as $code => $item) {
            $this->assertMatchesRegularExpression('/^[A-Z0-9_]+$/', $code);
            $this->assertContains($item[0], ['passed', 'failed', 'warning', 'inconclusive']);
            $this->assertNotEmpty($item[1]);
            $this->assertNotEmpty($item[2]);
        }
    }

    public function testDryRunComponentHasNoOperationalWriteOrAgiCommands()
    {
        $source = file_get_contents(dirname(__FILE__) . '/../../components/CallDiagnosticService.php');
        foreach ([
            '->execute(', '->exec(', 'run_dial', 'Dial(', 'Queue(', 'Transfer(',
            'INSERT INTO', 'UPDATE pkg_', 'DELETE FROM', 'file_get_contents($url',
        ] as $forbidden) {
            $this->assertStringNotContainsString($forbidden, $source, $forbidden);
        }
    }

    public function testCatalogNeverContainsCredentialLabels()
    {
        $json = strtolower(json_encode(CallDiagnosticService::catalog()));
        foreach (['sip password', 'trunk password', 'api key', 'dsn', 'secret='] as $secret) {
            $this->assertStringNotContainsString($secret, $json);
        }
    }

    public function testInvalidOutputFailureIsClassifiedFromProcessEvidence()
    {
        $this->assertSame(
            'AGI_RESULT_JSON_INVALID',
            CallDiagnosticService::classifyInvalidOutputFailure(
                true,
                '',
                0
            )
        );
        $this->assertSame(
            'AGI_DEBUG_ARGUMENTS_INVALID',
            CallDiagnosticService::classifyInvalidOutputFailure(
                false,
                'Invalid debug arguments.',
                2
            )
        );
        $this->assertSame(
            'AGI_PHP_FATAL_ERROR',
            CallDiagnosticService::classifyInvalidOutputFailure(
                false,
                'PHP Fatal error: Uncaught Error',
                255
            )
        );
        $this->assertSame(
            'AGI_PROCESS_EXITED_WITH_ERROR',
            CallDiagnosticService::classifyInvalidOutputFailure(
                false,
                '',
                1
            )
        );
        $this->assertSame(
            'MBILLING_RESULT_NOT_FOUND',
            CallDiagnosticService::classifyInvalidOutputFailure(
                false,
                '',
                0
            )
        );
    }

    public function testDiagnosticIdIsLoggedWithAgiFailureEvidence()
    {
        $source = file_get_contents(
            dirname(__FILE__) . '/../../components/CallDiagnosticService.php'
        );
        $this->assertStringContainsString(
            "'Call diagnostic ID=' . \$diagnosticId",
            $source
        );
        $this->assertStringContainsString("'failureCause' => \$failureCause", $source);
        $this->assertStringContainsString("'exitCode' => \$exitCode", $source);
        $this->assertStringContainsString("'jsonError' => \$jsonError", $source);
        $this->assertStringContainsString('JSON_INVALID_UTF8_SUBSTITUTE', $source);
    }
}
