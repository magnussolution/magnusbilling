<?php
/**
 * Acoes do modulo "Configuration".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 17/08/2012
 */

class ConfigurationController extends Controller
{
    public $attributeOrder = 'config_group_title DESC';
    public $defaultFilter  = 'status =1';

    public function init()
    {
        $this->instanceModel = new Configuration;
        $this->abstractModel = Configuration::model();
        $this->titleReport   = Yii::t('zii', 'Config');
        parent::init();
    }

    public function actionLayout()
    {
        if ( ! isset($_POST['status'])) {
            exit;
        }

        $model         = Configuration::model()->find('config_key = :config_key', ['config_key' => 'layout']);
        $model->status = $_POST['status'];
        if ($_POST['status'] == 0) {
            $model->config_value = 0;
        }
        $model->save();

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => '',
        ]);
    }

    public function actionTheme()
    {
        if ( ! isset($_POST['field']) || ! isset($_POST['value'])) {
            exit;
        }
        $info = 'User change the theme ' . $_POST['value'];
        MagnusLog::insertLOG(2, $info);

        $model               = Configuration::model()->find('config_key = :config_key', [':config_key' => $_POST['field']]);
        $model->config_value = $_POST['value'];
        $model->save();
        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => '',
        ]);
    }

    public function actionSetData()
    {
        if ( ! isset($_POST)) {
            exit;
        }

        $model               = Configuration::model()->find('config_key = :config_key', ['config_key' => 'admin_email']);
        $model->config_value = $_POST['email'];
        $model->save();

        $model               = Configuration::model()->find('config_key = :config_key', ['config_key' => 'base_country']);
        $model->config_value = $_POST['countryiso'];
        $model->save();

        $model               = Configuration::model()->find('config_key = :config_key', ['config_key' => 'base_currency']);
        $model->config_value = $_POST['currency'];
        $model->save();

        Yii::app()->session['base_country'] = $_POST['countryiso'];
        Yii::app()->session['email']        = $_POST['email'];
        Yii::app()->session['currency']     = $_POST['currency'];

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => 'Success',
        ]);
    }

    public function setAttributesModels($attributes, $models)
    {
        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            if ($attributes[$i]['config_key'] == 'reCaptchaKey' && strlen($attributes[$i]['config_value'])) {
                $attributes[$i]['config_value'] = '***************************************';
            } else if ($attributes[$i]['config_key'] == 'reCaptchaSecret' && strlen($attributes[$i]['config_value'])) {
                $attributes[$i]['config_value'] = '***************************************';
            }

        }
        return $attributes;
    }

    public function afterSave($model, $values)
    {
        $this->config = LoadConfig::getConfig();
        $cpstotal     = isset($this->config['global']['cpstotal']) ? $this->config['global']['cpstotal'] : 0;
        $lines        = '
[config]
base_country = ' . $this->config['global']['base_country'] . '
cpstotal = ' . $cpstotal . '
ip_tech_length = ' . $this->config['global']['ip_tech_length'] . '
bloc_time_call = ' . $this->config['global']['bloc_time_call'] . '
global_monitor = ' . $this->config['global']['global_record_calls'] . '
max_call_duration = ' . $this->config['global']['max_call_duration'] . '
';

        if (isset($this->config['global']['total_analysis_time']) && strlen($this->config['global']['total_analysis_time'])) {
            $lines .= '
[general]
total_analysis_time = ' . $this->config['global']['total_analysis_time'] . '
wait_when_silence = ' . $this->config['global']['wait_when_silence'] . '
min_word_length = ' . $this->config['global']['min_word_length'] . '
maximum_number_of_words = ' . $this->config['global']['maximum_number_of_words'] . '
maximum_number_of_words_ringing = ' . $this->config['global']['maximum_number_of_words_ringing'] . '
total_analysis_time_ringing = ' . $this->config['global']['total_analysis_time_ringing'] . '
hangup_after_total_time_ringing = ' . $this->config['global']['hangup_after_total_time_ringing'] . '

';
        }

        $fd = fopen('/etc/asterisk/mbilling.conf', "w");
        fwrite($fd, $lines);
        fclose($fd);

        AsteriskAccess::instance()->reload();

        return;
    }
}
