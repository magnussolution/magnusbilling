<?php

/**
 * Acoes do modulo "Diddestination".
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
 * 24/09/2012
 */

class DiddestinationController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = [
        'idUser'  => 'username',
        'idDid'   => 'did',
        'idIvr'   => 'name',
        'idQueue' => 'name',
        'idSip'   => 'name',
    ];

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
        'id_ivr'  => [
            'table'       => 'pkg_ivr',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
        'id_queue' => [
            'table'       => 'pkg_queue',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
        'id_sip'  => [
            'table'       => 'pkg_sip',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],

    ];

    public $fieldsInvisibleClient = [
        'id_user',
        'idUserusername',
    ];

    public function init()
    {
        $this->instanceModel = new Diddestination;
        $this->abstractModel = Diddestination::model();
        $this->titleReport   = Yii::t('zii', 'DID Destination');
        parent::init();
    }

    public function beforeSave($values)
    {

        $this->checkRelation($values);

        if ($this->isNewRecord) {

            $values['voip_call'] = isset($values['voip_call']) ? $values['voip_call'] : 1;

            $did       = Did::model()->findByPk((int) $values['id_did']);
            $modelUser = User::model()->findByPk((int) $values['id_user']);

            if (isset($modelUser->idGroup->idUserType->id) && $modelUser->idGroup->idUserType->id != 3) {
                echo json_encode([
                    'success' => false,
                    'rows'    => '[]',
                    'errors'  => Yii::t('zii', 'You only can set DID to CLIENTS'),
                ]);
                exit;
            }

            if ($did->reserved == 0) {
                $priceDid = $did->connection_charge + $did->fixrate;

                $modelUser->credit = $modelUser->credit + $modelUser->creditlimit;
                if ($modelUser->credit < $priceDid) {
                    echo json_encode([
                        'success' => false,
                        'rows'    => '[]',
                        'errors'  => Yii::t('zii', 'Customer not have credit for buy DID') . ' - ' . $did->did,
                    ]);
                    exit;
                }
            }
        }

        return $values;
    }

    public function checkRelation($values)
    {
        if ($this->isNewRecord) {

            switch ($values['voip_call']) {
                case '1':
                    $model = Sip::model()->findByPk((int) $values['id_sip']);
                    $name  = 'SIP ACCOUNT';
                    break;
                case '2':
                    $model = Ivr::model()->findByPk((int) $values['id_ivr']);
                    $name  = 'IVR';
                    break;
                case '7':
                    $model = Queue::model()->findByPk((int) $values['id_queue']);
                    $name  = 'QUEUE';
                    break;
            }

            if (isset($name) && $values['id_user'] != $model->id_user) {
                echo json_encode([
                    'success' => false,
                    'rows'    => [],
                    'errors'  => ['voip_call' => ['The ' . $name . ' must belong to the DID owner']],
                ]);
                exit;
            }
        } else {

            $modelDiddestination = Diddestination::model()->findByPk((int) $values['id']);

            $id_user = $modelDiddestination->id_user;

            $voip_call = isset($values['voip_call']) ? $values['voip_call'] : $modelDiddestination->voip_call;

            switch ($voip_call) {
                case '1':
                    $id_sip = isset($values['id_sip']) ? $values['id_sip'] : $modelDiddestination->id_sip;
                    $model  = Sip::model()->findByPk((int) $id_sip);
                    $name   = 'SIP ACCOUNT';
                    break;
                case '2':
                    $id_ivr = isset($values['id_ivr']) ? $values['id_ivr'] : $modelDiddestination->id_ivr;
                    $model  = Ivr::model()->findByPk((int) $id_ivr);
                    $name   = 'IVR';
                    break;
                case '7':
                    $id_queue = isset($values['id_queue']) ? $values['id_queue'] : $modelDiddestination->id_queue;
                    $model    = Queue::model()->findByPk((int) $id_queue);
                    $name     = 'QUEUE';
                    break;
            }

            if (isset($name) && isset($model->id_user) && $id_user != $model->id_user) {
                echo json_encode([
                    'success' => false,
                    'rows'    => [],
                    'errors'  => ['voip_call' => ['The ' . $name . ' must belong to the DID owner']],
                ]);
                exit;
            }
        }
    }

    public function actionbulkdestinatintion()
    {
        $this->isNewRecord = true;
        $values            = $this->getAttributesRequest();

        $_GET['filter'] = $values['filters'];

        $id_user = $values['id_user'];

        $this->setfilter($_GET);

        $modelDid = Did::model()->findAll($this->filter, $this->paramsFilter);

        foreach ($modelDid as $key => $did) {

            $values['id_did'] = $did->id;
            $destination      = preg_replace('/\{DID\}/', $did->did, $values['destination']);

            if ($did->id_user == null && $did->reserved == 0) {

                //isnewDID

                $modelDiddestination            = new Diddestination();
                $modelDiddestination->id_did    = $did->id;
                $modelDiddestination->id_user   = $id_user;
                $modelDiddestination->voip_call = $values['voip_call'];
                $modelDiddestination->priority  = 1;
                if (strlen($values['destination']) && $values['destination'] != 'undefined') {
                    $modelDiddestination->destination = $destination;
                }
                if (strlen($values['id_ivr']) && $values['id_ivr'] != 'undefined') {
                    $modelDiddestination->id_ivr = $values['id_ivr'];
                }

                if (strlen($values['id_queue']) && $values['id_queue'] != 'undefined') {
                    $modelDiddestination->id_queue = $values['id_queue'];
                }

                if (strlen($values['id_sip']) && $values['id_sip'] != 'undefined') {
                    $modelDiddestination->id_sip = $values['id_sip'];
                }

                if (strlen($values['context']) && $values['context'] != 'undefined') {
                    $modelDiddestination->context = $values['context'];
                }
                if (! strlen($values['destination'])) {
                    $modelDiddestination->destination = '';
                }

                $values = $this->beforeSave($values);

                $modelDiddestination->save();

                $this->afterSave($modelDiddestination, $values);
            } else {
                //update destination

                $modelDiddestination = Diddestination::model()->find('id_did = :key', [':key' => $did->id]);

                if (isset($modelDiddestination)) {
                    if ($modelDiddestination->id_user == $id_user) {
                        //update destination
                        $modelDiddestination->voip_call = $values['voip_call'];
                        if (strlen($values['destination']) && $values['destination'] != 'undefined') {
                            $modelDiddestination->destination = $destination;
                        }
                        if (strlen($values['id_ivr']) && $values['id_ivr'] != 'undefined') {
                            $modelDiddestination->id_ivr = $values['id_ivr'];
                        }

                        if (strlen($values['id_queue']) && $values['id_queue'] != 'undefined') {
                            $modelDiddestination->id_queue = $values['id_queue'];
                        }

                        if (strlen($values['id_sip']) && $values['id_sip'] != 'undefined') {
                            $modelDiddestination->id_sip = $values['id_sip'];
                        }

                        if (strlen($values['context']) && $values['context'] != 'undefined') {
                            $modelDiddestination->context = $values['context'];
                        }

                        if (! strlen($values['destination'])) {
                            $modelDiddestination->destination = '';
                        }

                        $values = $this->beforeSave($values);
                        $modelDiddestination->save();
                    } else {
                        continue;
                    }
                }
            }
        }

        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameMsg     => $this->msg,
        ]);
    }

    public function afterSave($model, $values)
    {
        AsteriskAccess::instance()->writeDidContext();

        if ($this->isNewRecord) {
            $modelDid = Did::model()->findByPk((int) $model->id_did);

            if ($modelDid->id_user == null && $modelDid->reserved == 0) //se for ativaçao adicionar o pagamento e cobrar
            {
                $modelDid->reserved = 1;
                $modelDid->id_user  = $model->id_user;
                $modelDid->save();

                //discount credit of customer
                $priceDid = $modelDid->connection_charge + $modelDid->fixrate;

                if ($priceDid > 0) // se tiver custo
                {

                    $modelUser = User::model()->findByPk((int) $model->id_user);

                    if ($modelUser->id_user == 1) //se for cliente do master
                    {
                        //adiciona a recarga e pagamento do custo de ativaçao
                        if ($modelDid->connection_charge > 0) {
                            UserCreditManager::releaseUserCredit(
                                $model->id_user,
                                $modelDid->connection_charge,
                                Yii::t('zii', 'Activation DID') . '' . $modelDid->did,
                                0
                            );
                        }

                        UserCreditManager::releaseUserCredit(
                            $model->id_user,
                            $modelDid->fixrate,
                            Yii::t('zii', 'Monthly payment DID') . '' . $modelDid->did,
                            0
                        );

                        $mail = new Mail(Mail::$TYPE_DID_CONFIRMATION, $model->id_user);
                        $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $modelUser->credit);
                        $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $modelDid->did);
                        $mail->replaceInEmail(Mail::$DID_COST_KEY, '-' . $modelDid->fixrate);
                        $mail->send();
                    } else {
                        //charge the agent
                        $modelUser         = User::model()->findByPk((int) $modelUser->id_user);
                        $modelUser->credit = $modelUser->credit - $priceDid;
                        $modelUser->save();
                    }
                }

                //adiciona a recarga e pagamento
                $use              = new DidUse;
                $use->id_user     = $model->id_user;
                $use->id_did      = $model->id_did;
                $use->status      = 1;
                $use->month_payed = 1;
                $use->save();

                if (isset($mail)) {
                    $sendAdmin = $this->config['global ']['admin_received_email'] == 1 ? $mail->send($this->config['global ']['admin_email']) : null;
                }
            }
        }
        return;
    }

    public function afterDestroy($values)
    {
        return;
    }
}
