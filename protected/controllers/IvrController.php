<?php

/**
 * Acoes do modulo "Ivr".
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
 * 19/09/2012
 */

class IvrController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idUser' => 'username'];
    private $uploaddir;
    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];

    public function init()
    {
        $this->uploaddir     = $this->magnusFilesDirectory . 'sounds/';
        $this->instanceModel = new Ivr;
        $this->abstractModel = Ivr::model();
        $this->titleReport   = Yii::t('zii', 'IVR');
        parent::init();
    }

    public function beforeSave($values)
    {
        $this->checkRelation($values);

        for ($i = 0; $i <= 10; $i++) {

            if (isset($values['type_' . $i])) {

                if ($values['type_' . $i] == 'repeat') {
                    $values['option_' . $i] = 'repeat';
                } elseif ($values['type_' . $i] == 'undefined' || $values['type_' . $i] == '') {
                    $values['option_' . $i] = '';
                } elseif (preg_match("/group|number|custom|hangup/", $values['type_' . $i])) {

                    $values['option_' . $i] = $values['type_' . $i] . '|' . $values['extension_' . $i];
                } else {
                    $values['option_' . $i] = $values['type_' . $i] . '|' . $values['id_' . $values['type_' . $i] . '_' . $i];
                }
            }

            if (isset($values['type_out_' . $i])) {
                if ($values['type_out_' . $i] == 'repeat') {
                    $values['option_out_' . $i] = 'repeat';
                } elseif ($values['type_out_' . $i] == 'undefined' || $values['type_out_' . $i] == '') {
                    $values['option_out_' . $i] = '';
                } elseif (preg_match("/group|number|custom|hangup/", $values['type_out_' . $i])) {
                    $values['option_out_' . $i] = $values['type_out_' . $i] . '|' . $values['extension_out_' . $i];
                } else {
                    $values['option_out_' . $i] = $values['type_out_' . $i] . '|' . $values['id_' . $values['type_out_' . $i] . '_out_' . $i];
                }
            }
        }
        return $values;
    }

    public function showError($model_id_user, $values, $name, $key, $i, $type = '')
    {
        if ($values['id_user'] != $model_id_user) {

            $key = $i == 10 ? substr($key, -2) : substr($key, -1);
            $msg = $model_id_user == 0 ? [$name . ' ' . Yii::t('zii', 'cannot be blank')] : [$name . ' ' . Yii::t('zii', 'must belong to the IVR owner')];
            echo json_encode([
                'success' => false,
                'rows'    => [],
                'errors'  => ['type_' . $type . $key => $msg],
            ]);
            exit;
        }
    }

    public function checkRelation($values)
    {
        //ensure all pjsip, ivr or queue belong to the IVR ouned
        for ($i = 0; $i <= 10; $i++) {

            if ($values['type_' . $i] != 'undefined' && strlen($values['type_' . $i]) > 0) {
                $type = $values['type_' . $i];

                if ($type == 'pjsip') {

                    $id_pjsip = $values['id_pjsip_' . $i];
                    if (! is_numeric($id_pjsip)) {
                        $this->showError(0, $values, 'PJSIP ACCOUNT', 'id_pjsip' . $i, $i);
                    } else {
                        $model = Sip::model()->findByPk((int) $id_pjsip);
                        $this->showError($model->id_user, $values, 'PJSIP ACCOUNT', 'id_pjsip' . $i, $i);
                    }
                } else if ($type == 'ivr') {
                    $id_ivr = $values['id_ivr_' . $i];
                    if (! is_numeric($id_ivr)) {
                        $this->showError(0, $values, 'IRV', 'id_ivr' . $i, $i);
                    } else {
                        $model = Ivr::model()->findByPk((int) $id_ivr);
                        $this->showError($model->id_user, $values, 'IVR', 'id_ivr' . $i, $i);
                    }
                } else if ($type == 'queue') {
                    $id_queue = $values['id_queue_' . $i];
                    if (! is_numeric($id_queue)) {
                        $this->showError(0, $values, 'QUEUE', 'id_queue' . $i, $i);
                    } else {
                        $model = Queue::model()->findByPk((int) $id_queue);
                        $this->showError($model->id_user, $values, 'QUEUE', 'id_queue' . $i, $i);
                    }
                }
            }
        }

        for ($i = 0; $i <= 10; $i++) {

            if ($values['type_out_' . $i] != 'undefined' && strlen($values['type_out_' . $i]) > 0) {
                $type = $values['type_out_' . $i];

                if ($type == 'pjsip') {
                    $id_pjsip = $values['id_pjsip_out_' . $i];
                    if (! is_numeric($id_pjsip)) {
                        $this->showError(0, $values, 'PJSIP ACCOUNT', 'id_pjsip_out' . $i, $i, 'out_');
                    } else {
                        $model = Sip::model()->findByPk((int) $id_pjsip);
                        $this->showError($model->id_user, $values, 'PJSIP ACCOUNT', 'id_pjsip_out' . $i, $i, 'out_');
                    }
                } else if ($type == 'ivr') {
                    $id_ivr = $values['id_ivr_out_' . $i];
                    if (! is_numeric($id_ivr)) {
                        $this->showError(0, $values, 'IRV', 'id_ivr_out' . $i, $i, 'out_');
                    } else {
                        $model = Ivr::model()->findByPk((int) $id_ivr);
                        $this->showError($model->id_user, $values, 'IVR', 'id_ivr_out' . $i, $i, 'out_');
                    }
                } else if ($type == 'queue') {
                    $id_queue = $values['id_queue_out_' . $i];
                    if (! is_numeric($id_queue)) {
                        $this->showError(0, $values, 'QUEUE', 'id_queue_out' . $i, $i, 'out_');
                    } else {
                        $model = Queue::model()->findByPk((int) $id_queue);
                        $this->showError($model->id_user, $values, 'QUEUE', 'id_queue_out' . $i, $i, 'out_');
                    }
                }
            }
        }
    }

    public function afterSave($model, $values)
    {
        if (isset($_FILES["workaudio"]) && strlen($_FILES["workaudio"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idIvrDidWork_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idIvrDidWork_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['workaudio']['tmp_name'], $_FILES["workaudio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idIvrDidWork_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["workaudio"]["tmp_name"], $uploadfile);
        }

        if (isset($_FILES["noworkaudio"]) && strlen($_FILES["noworkaudio"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idIvrDidNoWork_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idIvrDidNoWork_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['noworkaudio']['tmp_name'], $_FILES["noworkaudio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idIvrDidNoWork_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["noworkaudio"]["tmp_name"], $uploadfile);
        }

        return;
    }
    public function setAttributesModels($attributes, $models)
    {
        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];

        for ($i = 0; $i < count($pkCount); $i++) {
            foreach ($attributes[$i] as $key => $value) {

                if (preg_match("/^option_out_/", $key)) {

                    $itemOption = explode("|", $value);
                    $itemKey    = explode("_", $key);
                    if (! isset($attributes[$i]['type_out_' . end($itemKey)])) {
                        $attributes[$i]['type_out_' . end($itemKey)] = $itemOption[0];
                    }

                    if (isset($itemOption[1]) && preg_match("/number|group|custom|hangup/", $itemOption[0])) {
                        $attributes[$i]['extension_out_' . end($itemKey)] = $itemOption[1];
                    } else if (isset($itemOption[1])) {
                        $attributes[$i]['id_' . $itemOption[0] . '_out_' . end($itemKey)] = end($itemOption);
                        if (is_numeric($itemOption[1])) {
                            $model = ucfirst($itemOption[0]) == 'Pjsip' ? 'Sip' : ucfirst($itemOption[0]);
                            $model = $model::model()->findByPk(end($itemOption));

                            $attributes[$i]['id_' . $itemOption[0] . '_out_' . end($itemKey) . '_name'] = isset($model->name) ? $model->name : '';
                        } else {
                            $attributes[$i]['id_' . $itemOption[0] . '_out_' . end($itemKey) . '_name'] = '';
                        }
                    }
                } else if (preg_match("/^option_/", $key)) {

                    $itemOption = explode("|", $value);
                    $itemKey    = explode("_", $key);
                    if (! isset($attributes[$i]['type_' . end($itemKey)])) {
                        $attributes[$i]['type_' . end($itemKey)] = $itemOption[0];
                    }

                    if (isset($itemOption[1]) && preg_match("/number|group|custom|hangup/", $itemOption[0])) {
                        $attributes[$i]['extension_' . end($itemKey)] = $itemOption[1];
                    } else if (isset($itemOption[1])) {
                        $attributes[$i]['id_' . $itemOption[0] . '_' . end($itemKey)] = end($itemOption);
                        if (is_numeric($itemOption[1])) {
                            $model = ucfirst($itemOption[0]) == 'Pjsip' ? 'Sip' : ucfirst($itemOption[0]);

                            $model = $model::model()->findByPk(end($itemOption));

                            $attributes[$i]['id_' . $itemOption[0] . '_' . end($itemKey) . '_name'] = isset($model->name) ? $model->name : '';
                        } else {
                            $attributes[$i]['id_' . $itemOption[0] . '_' . end($itemKey) . '_name'] = '';
                        }
                    }
                }
            }
        }

        return $attributes;
    }

    public function actionDeleteAudio()
    {

        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canUpdate');

        if (! isset($_POST['id_ivr']) || ! is_numeric($_POST['id_ivr'])) {
            return;
        }

        $modelIvr = $this->findAuthorizedIvrForAudioDelete((int) $_POST['id_ivr']);
        if (! isset($modelIvr->id)) {
            header('HTTP/1.0 404 Not Found');
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => $this->msgRecordNotFound,
            ]);
            return;
        }

        foreach (['DidWork_', 'DidNoWork_'] as $audioType) {
            foreach (['gsm', 'wav'] as $extension) {
                $audioFile = $this->uploaddir . 'idIvr' . $audioType . $modelIvr->id . '.' . $extension;
                if (is_file($audioFile)) {
                    unlink($audioFile);
                }
            }
        }
        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }

    protected function findAuthorizedIvrForAudioDelete($idIvr)
    {
        return $this->findAuthorizedOwnedModel(Ivr::model(), (int) $idIvr);
    }

    protected function findAuthorizedOwnedModel($model, $id)
    {
        $condition = 't.id = :recordId';
        $params    = [':recordId' => (int) $id];

        if (Yii::app()->session['isClient']) {
            $condition .= ' AND t.id_user = :authenticatedUser';
            $params[':authenticatedUser'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAgent']) {
            $condition .= ' AND t.id_user IN ('
                . 'SELECT id FROM pkg_user WHERE id_user = :authenticatedAgent)';
            $params[':authenticatedAgent'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAdmin']) {
            if (Yii::app()->session['adminLimitUsers'] == true) {
                $condition .= ' AND t.id_user IN ('
                    . 'SELECT id FROM pkg_user WHERE id_group IN ('
                    . 'SELECT gug.id_group FROM pkg_group_user_group gug '
                    . 'WHERE gug.id_group_user = :authenticatedGroup))';
                $params[':authenticatedGroup'] = (int) Yii::app()->session['id_group'];
            }
        } else {
            $condition .= ' AND 1 = 0';
        }

        return $model->find(['condition' => $condition, 'params' => $params]);
    }
}
