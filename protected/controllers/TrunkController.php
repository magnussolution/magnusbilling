<?php

/**
 * Acoes do modulo "Trunk".
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
 * 23/06/2012
 */

class TrunkController extends Controller
{
    public $extraValues    = ['idProvider' => 'provider_name', 'failoverTrunk' => 'trunkcode'];
    public $nameFkRelated  = 'failover_trunk';
    public $attributeOrder = 'id';
    public $fieldsFkReport = [
        'id_provider'    => [
            'table'       => 'pkg_provider',
            'pk'          => 'id',
            'fieldReport' => 'provider_name',
        ],
        'failover_trunk' => [
            'table'       => 'pkg_trunk',
            'pk'          => 'id',
            'fieldReport' => 'trunkcode',
        ],
    ];
    public function init()
    {
        $this->instanceModel = new Trunk;
        $this->abstractModel = Trunk::model();
        $this->titleReport   = Yii::t('zii', 'Trunk');

        parent::init();
    }

    public function beforeSave($values)
    {

        if ($this->isNewRecord) {
            if (isset($values['fromuser']) && strlen($values['fromuser']) == 0) {
                $values['fromuser'] = $values['user'];
            }
        }

        if (isset($values['providerip'])) {
            $modelTrunk = Trunk::model()->find((int) $values['id']);
            if (isset($values['providertech']) && $values['providertech'] != 'pjsip' && $values['providertech'] != 'iax2') {
                $values['providerip'] = $modelTrunk->host;
            }
        }

        if (isset($values['failover_trunk'])) {
            $values['failover_trunk'] = $values['failover_trunk'] === 0 ? null : $values['failover_trunk'];
        }

        if (isset($values['allow'])) {
            $values['allow'] = preg_replace("/,0/", "", $values['allow']);
            $values['allow'] = preg_replace("/0,/", "", $values['allow']);
        }

        if (isset($values['status'])) {
            if ($values['status'] == 1) {
                $values['short_time_call'] = 0;
            }
        }

        return $values;
    }
    public function actionValidateRegister()
    {
        if (! Yii::app()->request->isPostRequest) {
            throw new CHttpException(405, 'POST required');
        }
        $values = $this->getAttributesRequest();
        $id = isset($values['id']) ? (int) $values['id'] : 0;
        $this->checkActionAccess([], 'trunk', $id ? 'canUpdate' : 'canCreate');
        $model = $id ? Trunk::model()->findByPk($id) : new Trunk;
        if (! $model) {
            throw new CHttpException(404, Yii::t('zii', 'Record not found.'));
        }
        foreach (['user', 'secret', 'host', 'register_string'] as $attribute) {
            if (isset($values[$attribute]) && is_scalar($values[$attribute])) {
                $model->$attribute = $values[$attribute];
            }
        }
        $model->register = 1;
        $model->checkRegister('register', []);
        echo json_encode(['success' => ! $model->hasErrors(), 'errors' => $model->getErrors()]);
    }

    public function beforeUpdateAll($values, $ids)
    {
        $registrationFields = ['host', 'register', 'user', 'secret', 'register_string'];
        if (array_intersect($registrationFields, array_keys($values))) {
            $models = Trunk::model()->findAllByPk($ids);
            $usernames = [];
            foreach ($models as $model) {
                foreach ($registrationFields as $attribute) {
                    if (array_key_exists($attribute, $values)) {
                        $model->$attribute = $values[$attribute];
                    }
                }
                $model->checkRegister('register', []);
                $username = strtolower((string) $model->user);
                // The database still contains the old names while validating a batch.
                if (isset($usernames[$username])
                    && ((int) $model->register === 1 || $usernames[$username] === 1)
                ) {
                    $model->addError('user', Yii::t('zii', 'This username is in use by a trunk'));
                }
                $usernames[$username] = (int) $model->register;
                if ($model->hasErrors()) {
                    $errors = $model->getErrors();
                    $first = reset($errors);
                    echo json_encode([
                        'success' => false,
                        'rows' => [],
                        'msg' => $first[0],
                        'errors' => $errors,
                    ]);
                    Yii::app()->end();
                }
            }
        }
        if (isset($values['register']) && (int) $values['register'] === 0) {
            $values['register_string'] = '';
        }
        return parent::beforeUpdateAll($values, $ids);
    }

    public function setAttributesModels($attributes, $models)
    {

        if ($_SERVER['HTTP_HOST'] == 'localhost') {
            return $attributes;
        }

        $trunkRegister = AsteriskAccess::instance()->pjsipShowRegistry();


        $trunkRegister = explode("\n", $trunkRegister['data']);



        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {

            foreach ($trunkRegister as $key => $trunk) {
                if (preg_match("/^reg_" . $attributes[$i]['trunkcode'] . "_" . $attributes[$i]['user'] . "_" . $attributes[$i]['host'] . ".*Registered/", $trunk) && $attributes[$i]['providertech'] == 'pjsip') {
                    $attributes[$i]['registered'] = 1;
                    break;
                }
            }
        }

        return $attributes;
    }


    public function generateSipFile()
    {

        if ($_SERVER['HTTP_HOST'] == 'localhost') {
            return;
        }
        $select = 'trunkcode, user, secret, disallow, allow, directmedia, context, dtmfmode, insecure, nat, qualify, type, host, fromdomain,fromuser, register_string,port,transport,encryption,sendrpid,maxuse,sip_config';
        $model  = Trunk::model()->findAll(
            [
                'select'    => $select,
                'condition' => 'providertech = :key AND status = 1',
                'params'    => [':key' => 'pjsip'],
            ]
        );

        if (count($model)) {
            AsteriskAccess::instance()->writeAsteriskFile($model, '/etc/asterisk/pjsip_magnus.conf', 'trunkcode');
        }

        $select = 'trunkcode, user, secret, disallow, allow, directmedia, context, dtmfmode, insecure, nat, qualify, type, host, register_string,sip_config';
        $model  = Trunk::model()->findAll(
            [
                'select'    => $select,
                'condition' => 'providertech = :key AND status = 1',
                'params'    => [':key' => 'iax2'],
            ]
        );

        if (isset($model[0]->id)) {
            AsteriskAccess::instance()->writeAsteriskFile($model, '/etc/asterisk/iax_magnus.conf', 'trunkcode');
        }
    }

    public function afterUpdateAll($strIds)
    {
        $this->generateSipFile();
        return;
    }

    public function afterSave($model, $values)
    {
        $this->generateSipFile();
    }

    public function afterDestroy($values)
    {
        $this->generateSipFile();
    }
}
