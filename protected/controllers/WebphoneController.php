<?php

/**
 * Public webphone shell. Authentication takes place directly with the SIP server.
 * CController intentionally avoids inheriting the billing CRUD/API actions.
 */
class WebphoneController extends CController
{
    public function init()
    {
        parent::init();
        $supported = ['pt_BR', 'en', 'es', 'fr', 'de', 'it', 'pl', 'ru'];
        $language = Yii::app()->request->getQuery('language', '');
        if (!is_string($language) || !in_array($language, $supported, true)) {
            $language = Yii::app()->session['language'];
        }
        if (!in_array($language, $supported, true)) {
            $config = LoadConfig::getConfig();
            $language = isset($config['global']['base_language']) ? $config['global']['base_language'] : 'en';
        }
        Yii::app()->setLanguage(in_array($language, $supported, true) ? $language : 'en');
    }

    public function actionCheck()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        if (empty(Yii::app()->session['id_user']) || !AccessManager::getInstance('sip')->canRead()) {
            throw new CHttpException(403, Yii::t('zii', 'Access denied.'));
        }
        if (Yii::app()->request->requestType !== 'GET') {
            header('Allow: GET');
            throw new CHttpException(405, Yii::t('zii', 'Method not allowed.'));
        }
        try {
            $result = AsteriskAccess::instance()->webphoneReadiness();
        } catch (Exception $e) {
            $result = 'unavailable';
        }
        $messages = [
            'ready' => Yii::t('zii', 'Asterisk is ready for WebRTC.'),
            'modules' => Yii::t('zii', 'Enable the HTTP WebSocket and PJSIP WebSocket modules in Asterisk.'),
            'https' => Yii::t('zii', 'Enable Asterisk HTTPS on port 8089 with the /ws endpoint and a valid certificate.'),
            'unavailable' => Yii::t('zii', 'Unable to check Asterisk configuration. Please contact the administrator.'),
        ];
        echo json_encode([
            'success' => $result === 'ready',
            'reason' => $result,
            'message' => isset($messages[$result]) ? $messages[$result] : $messages['unavailable'],
        ]);
    }

    public function actionIndex()
    {
        if (!in_array(Yii::app()->request->requestType, ['GET', 'HEAD'], true)) {
            header('Allow: GET, HEAD');
            throw new CHttpException(405, Yii::t('zii', 'Method not allowed.'));
        }

        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        $this->renderPartial('index', [
            'assetBase' => Yii::app()->request->baseUrl . '/resources/webphone/',
        ]);
    }
}
