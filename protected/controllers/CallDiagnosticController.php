<?php

class CallDiagnosticController extends Controller
{
    public function init()
    {
        parent::init();
        $this->applySessionLanguage();
        header('Content-Type: application/json; charset=utf-8');
        if (
            empty(Yii::app()->session['isAdmin'])
            || !AccessManager::getInstance('callfailed')->canRead()
        ) {
            $this->respond(false, null, Yii::t('zii', 'Access denied.'), 403);
        }
        $this->enforceRateLimit();
    }

    private function applySessionLanguage()
    {
        $supported = ['en', 'es', 'fr', 'it', 'pl', 'pt_BR', 'ru'];
        $requested = trim((string) Yii::app()->request->getParam('language', ''));
        if (in_array($requested, $supported, true)) {
            Yii::app()->session['language'] = $requested;
        }
        $sessionLanguage = isset(Yii::app()->session['language'])
            ? (string) Yii::app()->session['language']
            : '';
        if (! in_array($sessionLanguage, $supported, true)) {
            $sessionLanguage = 'en';
        }
        Yii::app()->setLanguage($sessionLanguage);
    }

    public function actionOutbound()
    {
        $this->requirePost();
        $sipId = filter_input(INPUT_POST, 'sipId', FILTER_VALIDATE_INT);
        $number = trim((string) Yii::app()->request->getPost('number', ''));
        $callerId = trim((string) Yii::app()->request->getPost('callerId', ''));
        $at = $this->validatedDate(Yii::app()->request->getPost('at'));
        if (!$sipId || strlen($number) > 40 || strlen($callerId) > 80) {
            $this->respond(false, null, Yii::t('zii', 'Invalid diagnostic input.'), 422);
        }
        $this->runDiagnostic('outbound', $sipId, function ($service) use ($sipId, $number, $callerId, $at) {
            return $service->outbound($sipId, $number, $callerId, $at);
        });
    }

    public function actionInbound()
    {
        $this->requirePost();
        $didId = filter_input(INPUT_POST, 'didId', FILTER_VALIDATE_INT);
        $callerId = trim((string) Yii::app()->request->getPost('callerId', ''));
        $at = $this->validatedDate(Yii::app()->request->getPost('at'));
        if (!$didId || strlen($callerId) > 80) {
            $this->respond(false, null, Yii::t('zii', 'Invalid diagnostic input.'), 422);
        }
        $this->runDiagnostic('inbound', $didId, function ($service) use ($didId, $callerId, $at) {
            return $service->inbound($didId, $callerId, $at);
        });
    }

    public function actionRegister()
    {
        $this->requirePost();
        $sipId = filter_input(INPUT_POST, 'sipId', FILTER_VALIDATE_INT);
        if (!$sipId) {
            $this->respond(false, null, Yii::t('zii', 'Invalid diagnostic input.'), 422);
        }
        try {
            $service = new SipRegisterDiagnosticService(Yii::app()->db);
            $result = $service->diagnose((int) $sipId);
            MagnusLog::insertLOG(1, sprintf(
                'REGISTER diagnostic admin=%d sip=%d',
                (int) Yii::app()->session['id_user'],
                (int) $sipId
            ));
            $this->respond(true, $result);
        } catch (Throwable $e) {
            Yii::log('REGISTER diagnostic failed: ' . $e->getMessage(), CLogger::LEVEL_ERROR, 'callDiagnostic');
            if (isset($service) && $service instanceof SipRegisterDiagnosticService) {
                $this->respond(true, $service->unexpectedFailure($e));
            }
            $this->respond(false, null, Yii::t('zii', 'The diagnostic could not be completed safely.'), 500);
        }
    }

    public function actionStartRegisterCapture()
    {
        $this->requirePost();
        $sipId = filter_input(INPUT_POST, 'sipId', FILTER_VALIDATE_INT);
        if (!$sipId) $this->respond(false, null, Yii::t('zii', 'Invalid diagnostic input.'), 422);
        $sip = Yii::app()->db->createCommand(
            'SELECT id,name FROM pkg_sip WHERE id=:id LIMIT 1'
        )->queryRow(true, [':id' => (int) $sipId]);
        if (!$sip || !preg_match('/^[A-Za-z0-9_.@+-]{1,50}$/D', (string) $sip['name'])) {
            $this->respond(false, null, Yii::t('zii', 'Invalid SIP account for capture.'), 422);
        }
        $existingCapture = Yii::app()->session['registerCapture'];
        if (is_array($existingCapture)
            && (int) $existingCapture['sipId'] === (int) $sipId
            && !empty($existingCapture['token'])
            && time() < (int) $existingCapture['deadline']) {
            $this->respond(true, [
                'token' => (string) $existingCapture['token'],
                'timeout' => max(1, (int) $existingCapture['deadline'] - time()),
                'port' => (int) $existingCapture['port'],
                'message' => Yii::t('zii', 'The existing SIP capture was resumed.'),
            ]);
        }
        if (SipTrace::model()->find() !== null) {
            $this->respond(false, null, Yii::t('zii', 'Another SIP capture is active. Wait for it to finish and try again.'), 409);
        }
        $path = '/var/www/html/mbilling/resources/reports/siptrace.log';
        clearstatcache(true, $path);
        $offset = is_file($path) ? (int) filesize($path) : 0;
        $port = $this->pjsipCapturePort();
        $trace = new SipTrace();
        $trace->filter = (string) $sip['name'];
        $trace->timeout = 120;
        $trace->port = $port;
        $trace->status = 1;
        $trace->in_use = 0;
        if (!$trace->save()) {
            $this->respond(false, null, Yii::t('zii', 'The SIP capture could not be started.'), 500);
        }
        $token = bin2hex(random_bytes(16));
        Yii::app()->session['registerCapture'] = [
            'token' => $token, 'sipId' => (int) $sipId, 'username' => (string) $sip['name'],
            'traceId' => (int) $trace->id, 'offset' => $offset,
            'started' => time(), 'deadline' => time() + 125, 'port' => $port,
        ];
        MagnusLog::insertLOG(1, sprintf('REGISTER capture started admin=%d sip=%d port=%d',
            (int) Yii::app()->session['id_user'], (int) $sipId, $port));
        $this->respond(true, [
            'token' => $token, 'timeout' => 120, 'port' => $port,
            'message' => Yii::t('zii', 'Capture started. Try to register the SIP account now.'),
        ]);
    }

    public function actionRegisterCaptureStatus()
    {
        $this->requirePost();
        $sipId = filter_input(INPUT_POST, 'sipId', FILTER_VALIDATE_INT);
        $token = trim((string) Yii::app()->request->getPost('token', ''));
        $capture = Yii::app()->session['registerCapture'];
        if (!$sipId || !is_array($capture) || !isset($capture['token'])
            || !hash_equals((string) $capture['token'], $token)
            || (int) $capture['sipId'] !== (int) $sipId) {
            $this->respond(false, null, Yii::t('zii', 'The REGISTER capture session is invalid or expired.'), 422);
        }
        $timedOut = time() >= (int) $capture['deadline'];
        $service = new SipRegisterCaptureService();
        $result = $service->analyze(
            '/var/www/html/mbilling/resources/reports/siptrace.log',
            (int) $capture['offset'],
            (string) $capture['username'],
            $timedOut
        );
        $result['diagnosticId'] = substr((string) $capture['token'], 0, 8) . '-capture';
        $result['type'] = 'register-capture';
        if (!empty($result['complete'])) {
            if (!empty($capture['traceId'])) SipTrace::model()->deleteByPk((int) $capture['traceId']);
            unset(Yii::app()->session['registerCapture']);
        }
        $this->respond(true, $result);
    }

    private function pjsipCapturePort()
    {
        $path = '/etc/asterisk/pjsip.conf';
        if (!is_file($path) || !is_readable($path)) return 5060;
        $section = '';
        foreach (file($path, FILE_IGNORE_NEW_LINES) as $line) {
            $line = trim($line);
            if (preg_match('/^\[([^\]]+)\]$/', $line, $match)) {
                $section = strtolower($match[1]);
                continue;
            }
            if ($section === 'transport-udp'
                && preg_match('/^bind\s*=\s*(?:\[[^\]]+\]|[^:;\s]+)?:(\d+)\s*(?:;.*)?$/i', $line, $match)
                && (int) $match[1] >= 1 && (int) $match[1] <= 65535) {
                return (int) $match[1];
            }
        }
        return 5060;
    }

    public function actionFailedCalls()
    {
        $this->requirePost();
        $sipId = filter_input(INPUT_POST, 'sipId', FILTER_VALIDATE_INT);
        $number = trim((string) Yii::app()->request->getPost('number', ''));
        $uniqueId = trim((string) Yii::app()->request->getPost('uniqueId', ''));
        $minutes = (int) Yii::app()->request->getPost('minutes', 120);
        if (!$sipId || !preg_match('/^[0-9*#+]{2,40}$/', $number) || strlen($uniqueId) > 30) {
            $this->respond(false, null, Yii::t('zii', 'Invalid diagnostic input.'), 422);
        }
        $this->runDiagnostic('failed-call-search', $sipId, function ($service) use ($sipId, $number, $uniqueId, $minutes) {
            $calls = $service->failedCalls($sipId, $number, $uniqueId ?: null, $minutes);
            return [
                'status' => count($calls) ? 'passed' : 'inconclusive',
                'summary' => count($calls) ? Yii::t('zii', 'Select the matching real call.') : Yii::t('zii', 'No matching failed CDR was found.'),
                'calls' => $calls,
                'sentinel' => $this->sentinelAvailability(),
            ];
        });
    }

    public function actionCdrFailed()
    {
        $this->requirePost();
        $keys = array_keys($_POST);
        $csrfTokenName = Yii::app()->request->csrfTokenName;
        if ($csrfTokenName !== null && $csrfTokenName !== '') {
            $keys = array_values(array_diff($keys, [$csrfTokenName]));
        }
        sort($keys);
        if ($keys !== ['cdrFailedId']) {
            $this->respond(
                false,
                null,
                Yii::t('zii', 'Only cdrFailedId is accepted.'),
                422
            );
        }
        $cdrFailedId = filter_var(
            Yii::app()->request->getPost('cdrFailedId'),
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );
        if ($cdrFailedId === false) {
            $this->respond(
                false,
                null,
                Yii::t('zii', 'Invalid diagnostic input.'),
                422
            );
        }

        try {
            $service = new FailedCallDiagnosticService(
                Yii::app()->db,
                null,
                new FailedCallTrunkRuntimeProbe(Yii::app()->db)
            );
            $result = $service->diagnose((int) $cdrFailedId);
            if ($result === null) {
                $this->respond(
                    false,
                    null,
                    Yii::t('zii', 'Failed CDR was not found.'),
                    404
                );
            }
            MagnusLog::insertLOG(1, sprintf(
                'Failed CDR diagnostic admin=%d cdr_failed=%d',
                (int) Yii::app()->session['id_user'],
                (int) $cdrFailedId
            ));
            $this->respond(true, $result);
        } catch (Exception $e) {
            Yii::log(
                'Failed CDR diagnostic failed: ' . $e->getMessage(),
                CLogger::LEVEL_ERROR,
                'callDiagnostic'
            );
            $this->respond(
                false,
                null,
                Yii::t(
                    'zii',
                    'The diagnostic could not be completed safely.'
                ),
                500
            );
        }
    }

    private function runDiagnostic($type, $entityId, $callback)
    {
        try {
            $service = new CallDiagnosticService(
                Yii::app()->db,
                !empty(Yii::app()->session['isAdmin']),
                (int) Yii::app()->session['id_user'],
                8,
                new PjsipIpAuthenticationProbe()
            );
            $result = call_user_func($callback, $service);
            MagnusLog::insertLOG(1, sprintf(
                'Call diagnostic admin=%d type=%s entity=%d',
                (int) Yii::app()->session['id_user'],
                $type,
                (int) $entityId
            ));
            $this->respond(true, $result);
        } catch (Throwable $e) {
            Yii::log('Call diagnostic failed: ' . $e->getMessage(), CLogger::LEVEL_ERROR, 'callDiagnostic');
            if (isset($service) && $service instanceof CallDiagnosticService) {
                return $this->respond(
                    true,
                    $service->unexpectedFailure($type, $e)
                );
            }
            return $this->respond(
                false,
                null,
                Yii::t('zii', 'The diagnostic could not be completed safely.'),
                500
            );
        }
    }

    private function sentinelAvailability()
    {
        $exists = (bool) Yii::app()->db->createCommand(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='pkg_magnus_sentinel_trunk_event'"
        )->queryScalar();
        return [
            'available' => $exists,
            'status' => $exists ? 'passed' : 'inconclusive',
            'message' => $exists
                ? Yii::t('zii', 'Sentinel trunk events are available for the selected call.')
                : Yii::t('zii', 'Sentinel trunk events are not available in this installation; this does not prove that no trunk was attempted.'),
        ];
    }

    private function enforceRateLimit()
    {
        $now = time();
        $bucket = Yii::app()->session['callDiagnosticRate'];
        if (!is_array($bucket) || $now - (int) $bucket['started'] >= 60) {
            $bucket = ['started' => $now, 'count' => 0];
        }
        $bucket['count']++;
        Yii::app()->session['callDiagnosticRate'] = $bucket;
        if ($bucket['count'] > 20) {
            $this->respond(false, null, Yii::t('zii', 'Diagnostic rate limit exceeded. Try again later.'), 429);
        }
    }

    private function validatedDate($value)
    {
        if ($value === null || $value === '') return null;
        $date = DateTime::createFromFormat(DateTime::ATOM, (string) $value);
        if (!$date) $this->respond(false, null, Yii::t('zii', 'Invalid simulated date.'), 422);
        return $date->format(DateTime::ATOM);
    }

    private function requirePost()
    {
        if (!Yii::app()->request->isPostRequest) {
            $this->respond(false, null, Yii::t('zii', 'POST is required.'), 405);
        }
        $length = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
        if ($length > 8192) $this->respond(false, null, Yii::t('zii', 'Diagnostic payload is too large.'), 413);
    }

    private function respond($success, $result = null, $message = null, $status = 200)
    {
        http_response_code($status);
        echo json_encode(
            [
                'success' => (bool) $success,
                'result' => $result,
                'msg' => $message,
            ],
            JSON_UNESCAPED_UNICODE
                | JSON_UNESCAPED_SLASHES
                | JSON_INVALID_UTF8_SUBSTITUTE
        );
        Yii::app()->end();
    }
}
