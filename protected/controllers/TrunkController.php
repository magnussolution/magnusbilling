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

        if ((isset($values['register']) && $values['register'] == 1 && isset($values['register_string']))
            && ! preg_match("/^.{3}.*:.{3}.*@.{5}.*\/.{3}.*/", $values['register_string'])
        ) {
            echo json_encode([
                'success' => false,
                'rows'    => [],
                'errors'  => [
                    'register'        => Yii::t('zii', 'Invalid register string. Only use register option to Trunk authentication via user and password.'),
                    'register_string' => Yii::t('zii', 'Invalid register string'),
                ],
            ]);
            exit();
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
