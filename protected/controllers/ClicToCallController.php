<?php

/**
 * Url for customer register http://ip/billing/index.php/clicToCall?id=username .
 */
class ClicToCallController extends Controller
{

    public function init()
    {
        parent::init();
        if (!isset(Yii::app()->session['language'])) {
            $language = Configuration::model()->findAll(array(
                'select'    => 'config_value',
                'condition' => "config_key LIKE 'base_language'",
            ));

            Yii::app()->session['language'] = $language[0]->config_value;

            Yii::app()->language = Yii::app()->sourceLanguage = isset(Yii::app()->session['language']) ? Yii::app()->session['language'] : Yii::app()->language;
        }
        $startSession = strlen(session_id()) < 1 ? session_start() : null;

    }

    public function actionIndex()
    {
        $this->render('index', 'cliToCall');
    }

    public function actionAdd()
    {
        $username = $_POST['id'];
        $exten    = $_POST['ddi'] . $_POST['ddd'] . $_POST['number'];

        $model          = new CallBack;
        $model->exten   = $exten;
        $model->channel = $username;
        $model->account = $model->channel;

        try {
            $model->save();
            $errors = $model->getErrors();
            echo '<h4>' . Yii::t('zii', 'Operation was successful.') . '</h4>';
        } catch (Exception $e) {
            $errors = $e;
        }
    }
}
