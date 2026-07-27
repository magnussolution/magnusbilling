<?php

class CallDiagnosticController extends Controller
{
    public function init()
    {
        parent::init();
        $this->applySessionLanguage();
        header('Content-Type: application/json; charset=utf-8');
        if (empty(Yii::app()->session['isAdmin'])
            || !AccessManager::getInstance('callDiagnostic')->canRead()
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

    private function runDiagnostic($type, $entityId, $callback)
    {
        try {
            $service = new CallDiagnosticService(
                Yii::app()->db,
                !empty(Yii::app()->session['isAdmin']),
                (int) Yii::app()->session['id_user'],
                8
            );
            $result = call_user_func($callback, $service);
            MagnusLog::insertLOG(1, sprintf(
                'Call diagnostic admin=%d type=%s entity=%d',
                (int) Yii::app()->session['id_user'],
                $type,
                (int) $entityId
            ));
            $this->respond(true, $result);
        } catch (Exception $e) {
            Yii::log('Call diagnostic failed: ' . $e->getMessage(), CLogger::LEVEL_ERROR, 'callDiagnostic');
            $this->respond(false, null, Yii::t('zii', 'The diagnostic could not be completed safely.'), 500);
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
        echo json_encode(['success' => (bool) $success, 'result' => $result, 'msg' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        Yii::app()->end();
    }
}
