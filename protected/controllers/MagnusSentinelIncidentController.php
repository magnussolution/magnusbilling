<?php

/**
 * API autenticada e somente de leitura dos incidentes do Magnus Sentinel.
 *
 * @magnus-sentinel-managed
 */
class MagnusSentinelIncidentController extends Controller
{
    public function init()
    {
        $this->instanceModel = new MagnusSentinelIncident;
        $this->abstractModel = MagnusSentinelIncident::model();
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        $this->runReadAction('listIncidents');
    }

    public function actionDetail()
    {
        $this->runReadAction('getIncident', true);
    }

    public function actionTransitions()
    {
        $this->runReadAction('getTransitions', true);
    }

    public function actionSave()
    {
        $this->readOnly();
    }

    public function actionDestroy()
    {
        $this->readOnly();
    }

    public function actionImportFromCsv()
    {
        $this->readOnly();
    }

    public function actionReport()
    {
        $this->readOnly();
    }

    public function actionDestroyReport()
    {
        $this->readOnly();
    }

    public function actionCsv()
    {
        $this->readOnly();
    }

    private function runReadAction($method, $notFoundIsError = false)
    {
        $this->jsonHeaders();
        if (! in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'], true)) {
            $this->respond(
                405,
                false,
                null,
                'method_not_allowed'
            );
        }
        $this->checkActionAccess(
            [],
            $this->instanceModel->getModule(),
            'canRead'
        );
        $input = array_merge($_GET, $_POST);
        try {
            $data = call_user_func(
                ['MagnusSentinelIncidentApiV1', $method],
                Yii::app()->db,
                $input
            );
            if ($notFoundIsError && $data === null) {
                $this->respond(404, false, null, 'incident_not_found');
            }
            $this->respond(200, true, $data, null);
        } catch (InvalidArgumentException $exc) {
            $this->respond(400, false, null, $exc->getMessage());
        } catch (Exception $exc) {
            Yii::log(
                'Magnus Sentinel API: ' . get_class($exc),
                CLogger::LEVEL_ERROR
            );
            $this->respond(500, false, null, 'internal_error');
        }
    }

    private function readOnly()
    {
        $this->jsonHeaders();
        $this->respond(405, false, null, 'read_only_api');
    }

    private function jsonHeaders()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, max-age=0');
        header('X-Content-Type-Options: nosniff');
    }

    private function respond($status, $success, $data, $error)
    {
        http_response_code($status);
        echo json_encode([
            'success' => $success,
            'api_version' => MagnusSentinelIncidentApiV1::API_VERSION,
            'timezone' => 'UTC',
            'data' => $data,
            'error' => $error,
        ]);
        Yii::app()->end();
    }
}
