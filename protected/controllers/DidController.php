<?php

/**
 * Acoes do modulo "Did".
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

class DidController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idUser' => 'username', 'idServer' => 'name'];
    public $config;

    private $uploaddir;

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];
    public $fieldsInvisibleAgent = [
        'id_user',
        'id_didgroup',
        'connection_sell',
        'minimal_time_buy',
        'buyrateinitblock',
        'buyrateincrement',
        'minimal_time_charge',
        'initblock',
        'increment',
        'charge_of',
        'id_server',
        'block_expression_1',
        'block_expression_2',
        'block_expression_3',
        'send_to_callback_1',
        'send_to_callback_2',
        'send_to_callback_3',
        'cbr',
        'cbr_ua',
        'cbr_total_try',
        'cbr_time_try',
        'cbr_em',
        'TimeOfDay_monFri',
        'TimeOfDay_sat',
        'TimeOfDay_sun',
        'workaudio',
        'noworkaudio',
        'fixrate',
        'buy_rate_1',
        'buy_rate_2',
        'buy_rate_3',
        'calllimit',
        'expression_1',
        'expression_2',
        'expression_3',
        'buy_rate_1',
        'buy_rate_2',
        'buy_rate_3',
        'selling_rate_1',
        'selling_rate_2',
        'selling_rate_3',
    ];

    public $fieldsInvisibleClient = [
        'id_user',
        'id_didgroup',
        'connection_sell',
        'minimal_time_buy',
        'buyrateinitblock',
        'buyrateincrement',
        'minimal_time_charge',
        'initblock',
        'increment',
        'charge_of',
        'id_server',
        'block_expression_1',
        'block_expression_2',
        'block_expression_3',
        'send_to_callback_1',
        'send_to_callback_2',
        'send_to_callback_3',
        'cbr',
        'cbr_ua',
        'cbr_total_try',
        'cbr_time_try',
        'cbr_em',
        'TimeOfDay_monFri',
        'TimeOfDay_sat',
        'TimeOfDay_sun',
        'workaudio',
        'noworkaudio',
        'fixrate',
        'buy_rate_1',
        'buy_rate_2',
        'buy_rate_3',
        'calllimit',
        'expression_1',
        'expression_2',
        'expression_3',
        'buy_rate_1',
        'buy_rate_2',
        'buy_rate_3',
        'selling_rate_1',
        'selling_rate_2',
        'selling_rate_3',
        'agent_client_rate_1',
        'agent_client_rate_2',
        'agent_client_rate_3',
    ];

    public $fieldsNotUpdateClient = [

        'did',
        'activated',
    ];

    public $fieldsNotUpdateAgent = [

        'did',
        'activated',
    ];

    public function init()
    {
        $this->uploaddir     = $this->magnusFilesDirectory . 'sounds/';
        $this->instanceModel = new Did;
        $this->abstractModel = Did::model();
        $this->titleReport   = Yii::t('zii', 'DID');

        if (Yii::app()->session['isClient']) {
            $this->attributeOrder = 't.id_user DESC';
        }
        parent::init();
    }

    public function extraFilterCustomAgent($filter)
    {

        //for agents add filter for show only numbers free
        $filter .= ' AND activated = 1 AND (reserved = 0  OR id_user IN (SELECT id FROM pkg_user WHERE id_user = ' . Yii::app()->session['id_user'] . '))';
        return $filter;
    }

    public function extraFilterCustomClient($filter)
    {

        //for agents add filter for show only numbers free
        $filter .= ' AND (id_user = ' . Yii::app()->session['id_user'] . ')';
        return $filter;
    }

    public function actionReadBuy()
    {
        $condition = 'reserved = 0 AND activated = 1';
        parent::actionRead($asJson = true, $condition);
    }

    public function actionBuyBulk()
    {
        $ids = isset($_POST['ids']) ? json_decode($_POST['ids']) : null;

        $modelUser = User::model()->findByPK(Yii::app()->session['id_user']);

        if ($modelUser->id_user > 1) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Not allowed',
            ]);
            exit;
        }
        if ($modelUser->typepaid == 1) {
            $modelUser->credit = $modelUser->credit + $modelUser->creditlimit;
        }
        $priceDidTotal = 0;
        foreach ($ids as $key => $id) {
            $modelDid = Did::model()->findByPk((int) $id);

            if ($modelDid->reserved == 1) {
                echo json_encode([
                    $this->nameSuccess => false,
                    $this->nameMsg     => 'You select one or more DID that is reserved',
                ]);
                exit;
            }
            if ($modelDid->activated == 0) {
                echo json_encode([
                    $this->nameSuccess => false,
                    $this->nameMsg     => 'You select one or more DID that is not activated',
                ]);
                exit;
            }
            $priceDidTotal += $modelDid->connection_charge + $modelDid->fixrate;
        }

        if ($priceDidTotal > $modelUser->credit) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'You not have enough credit to buy the DID',
            ]);
            exit;
        }

        $id_user = $modelUser->id;

        foreach ($ids as $key => $id) {
            $modelDid  = Did::model()->findByPk((int) $id);
            $id_did    = $modelDid->id;
            $modelUser = $modelDid->idUser;
            $totalDid  = $modelDid->fixrate + $modelDid->connection_charge;

            $modelDid->id_user  = $id_user;
            $modelDid->reserved = 1;
            $modelDid->save();

            //discount credit of customer
            $priceDid = $modelDid->connection_charge + $modelDid->fixrate;

            $modelDidUse              = new DidUse();
            $modelDidUse->id_user     = $id_user;
            $modelDidUse->id_did      = $id_did;
            $modelDidUse->status      = 1;
            $modelDidUse->month_payed = 1;
            $modelDidUse->save();

            $modelSip = Sip::model()->find('id_user = :key', [':key' => $id_user]);

            $modelDiddestination              = new Diddestination();
            $modelDiddestination->id_user     = $id_user;
            $modelDiddestination->id_did      = $id_did;
            $modelDiddestination->id_sip      = $modelSip->id;
            $modelDiddestination->destination = '';
            $modelDiddestination->priority    = 1;
            $modelDiddestination->voip_call   = 1;
            $modelDiddestination->save();

            if ($priceDid > 0) // se tiver custo
            {
                //adiciona a recarga e pagamento do 1º mes
                $credit      = $modelDid->fixrate;
                $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $modelDid->did;

                UserCreditManager::releaseUserCredit($id_user, $credit, $description, 0);

                //adiciona a recarga e pagamento do custo de ativaçao
                if ($modelDid->connection_charge > 0) {
                    $credit      = $modelDid->connection_charge;
                    $description = Yii::t('zii', 'Activation DID') . ' ' . $modelDid->did;
                    UserCreditManager::releaseUserCredit($id_user, $credit, $description, 0);
                }

                $mail = new Mail(Mail::$TYPE_DID_CONFIRMATION, $id_user);
                $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $modelUser->credit);
                $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $modelDid->did);
                $mail->replaceInEmail(Mail::$DID_COST_KEY, '-' . $modelDid->fixrate);
                $mail->send();
            }
        }
        $success          = true;
        $this->msgSuccess = Yii::t('zii', 'The DID has been activated for you.');

        echo json_encode([
            $this->nameSuccess => $success,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }
    public function actionBuy()
    {
        $success = false;

        $id_did  = isset($_POST['id']) ? json_decode($_POST['id']) : null;
        $id_user = isset($_POST['id_user']) ? json_decode($_POST['id_user']) : Yii::app()->session['id_user'];

        $modelDid = Did::model()->findByPk((int) $id_did);

        $modelUser = User::model()->findByPk((int) $id_user);

        $totalDid = $modelDid->fixrate + $modelDid->connection_charge;

        if ($modelUser->credit < $totalDid) {
            $this->msgSuccess = Yii::t('zii', 'You not have enough credit to buy the DID');
        } elseif ($modelDid->reserved == 1) {
            $this->msgSuccess = Yii::t('zii', 'The DID has already been activated for another user.');
        } else {
            if ($modelUser->id_user == 1) //se for cliente do master
            {
                $modelDid->id_user  = $id_user;
                $modelDid->reserved = 1;
                $modelDid->save();

                //discount credit of customer
                $priceDid = $modelDid->connection_charge + $modelDid->fixrate;

                $modelDidUse              = new DidUse();
                $modelDidUse->id_user     = $id_user;
                $modelDidUse->id_did      = $id_did;
                $modelDidUse->status      = 1;
                $modelDidUse->month_payed = 1;
                $modelDidUse->save();

                $modelSip = Sip::model()->find('id_user = :key', [':key' => $id_user]);

                $modelDiddestination              = new Diddestination();
                $modelDiddestination->id_user     = $id_user;
                $modelDiddestination->id_did      = $id_did;
                $modelDiddestination->id_sip      = $modelSip->id;
                $modelDiddestination->destination = '';
                $modelDiddestination->priority    = 1;
                $modelDiddestination->voip_call   = 1;
                $modelDiddestination->save();

                if ($priceDid > 0) // se tiver custo
                {
                    //adiciona a recarga e pagamento do 1º mes
                    $credit      = $modelDid->fixrate;
                    $description = Yii::t('zii', 'Monthly payment DID') . ' ' . $modelDid->did;

                    UserCreditManager::releaseUserCredit($id_user, $credit, $description, 0);

                    //adiciona a recarga e pagamento do custo de ativaçao
                    if ($modelDid->connection_charge > 0) {
                        $credit      = $modelDid->connection_charge;
                        $description = Yii::t('zii', 'Activation DID') . ' ' . $modelDid->did;

                        UserCreditManager::releaseUserCredit($id_user, $credit, $description, 0);
                    }

                    $mail = new Mail(Mail::$TYPE_DID_CONFIRMATION, $id_user);
                    $mail->replaceInEmail(Mail::$BALANCE_REMAINING_KEY, $modelUser->credit);
                    $mail->replaceInEmail(Mail::$DID_NUMBER_KEY, $modelDid->did);
                    $mail->replaceInEmail(Mail::$DID_COST_KEY, '-' . $modelDid->fixrate);
                    $mail->send();
                }

                $success          = true;
                $this->msgSuccess = Yii::t('zii', 'The DID has been activated for you.');
            } else {
                $this->msgSuccess = Yii::t('zii', 'Not allowed');
            }
        }

        echo json_encode([
            $this->nameSuccess => $success,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }

    public function actionRead($asJson = true, $condition = null)
    {
        //altera o sort se for a coluna username.
        if (isset($_GET['sort']) && $_GET['sort'] === 'username') {
            $_GET['sort'] = 'id_user';
        }

        parent::actionRead($asJson = true, $condition = null);
    }

    public function beforeSave($values)
    {
        if (isset($_FILES["workaudio"]) && strlen($_FILES["workaudio"]["name"]) > 1) {
            $data                = explode('.', $_FILES["workaudio"]["name"]);
            $typefile            = array_pop($data);
            $values['workaudio'] = "idDidAudioProWork_" . $values['id'] . '.' . $typefile;
        }

        if (isset($_FILES["noworkaudio"]) && strlen($_FILES["noworkaudio"]["name"]) > 1) {
            $data                  = explode('.', $_FILES["noworkaudio"]["name"]);
            $typefile              = array_pop($data);
            $values['noworkaudio'] = "idDidAudioProNoWork_" . $values['id'] . '.' . $typefile;
        }

        return $values;
    }

    public function afterSave($model, $values)
    {

        if (isset($_FILES["workaudio"]) && strlen($_FILES["workaudio"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idDidAudioProWork_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idDidAudioProWork_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['workaudio']['tmp_name'], $_FILES["workaudio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idDidAudioProWork_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["workaudio"]["tmp_name"], $uploadfile);
        }
        if (isset($_FILES["noworkaudio"]) && strlen($_FILES["noworkaudio"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idDidAudioProNoWork_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idDidAudioProNoWork_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['noworkaudio']['tmp_name'], $_FILES["noworkaudio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idDidAudioProNoWork_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["noworkaudio"]["tmp_name"], $uploadfile);
        }

        if ($this->isNewRecord && preg_match('/\-/', $model->did)) {
            $interval = preg_split('/\-/', $model->did);
            if (strlen($interval[0]) == strlen($interval[1]) && $interval[1] > $interval[0]) {
                for ($i = $interval[0]; $i <= $interval[1]; $i++) {
                    if ($i == $interval[0]) {
                        $model->did = $interval[0];
                        try {
                            $model->save();
                        } catch (Exception $e) {
                            Did::model()->deleteByPk((int) $model->id);
                        }
                    } else {
                        $modelDid             = new Did;
                        $modelDid->attributes = $values;
                        $modelDid->did        = $i;
                        try {
                            $modelDid->save();
                        } catch (Exception $e) {
                            //
                        }
                    }
                }
            }
        }
    }

    public function actionLiberar()
    {
        if (isset($_POST['ids'])) {

            $ids = json_decode($_POST['ids']);

            foreach ($ids as $key => $id) {
                $modelDid = Did::model()->findByPk((int) $id);

                if (isset($modelDid->id) && isset($modelDid->idUser->did_days) && $modelDid->idUser->did_days > 0) {
                    $didUse = DidUse::model()->find('id_did = :key AND releasedate = :key1 AND status = 1', [
                        'key'   => $id,
                        ':key1' => '0000-00-00 00:00:00',
                    ]);

                    $date = date('Y-m-d', strtotime($didUse->reservationdate . " + " . $modelDid->idUser->did_days . " day"));

                    if ($date > date('Y-m-d')) {
                        echo json_encode([
                            $this->nameSuccess => false,
                            $this->nameMsg     => 'DID ' . $modelDid->did . '. Clients are requested to hold the DID for at least ' . $modelDid->idUser->did_days . ' days before deleting the DID as per carrier policy to avoid spamming fresh DIDs. Thank you',
                        ]);
                        exit;
                    }
                }
            }

            foreach ($ids as $key => $id) {
                $modelDid = Did::model()->findByPk((int) $id);
                if ($modelDid->reserved == 1 && $modelDid->id_user > 0) {
                    Did::model()->updateByPk(
                        $id,
                        [
                            'reserved' => 0,
                            'id_user'  => null,
                        ]
                    );

                    Diddestination::model()->deleteAll("id_did = :key", [':key' => $id]);

                    $didUse = DidUse::model()->find('id_did = :key AND releasedate = :key1 AND status = 1', [
                        'key'   => $id,
                        ':key1' => '0000-00-00 00:00:00',
                    ]);

                    if (isset($didUse->id)) {

                        $modelDidHistory                  = new DidHistory();
                        $modelDidHistory->username        = $didUse->idUser->username;
                        $modelDidHistory->did             = $modelDid->did;
                        $modelDidHistory->releasedate     = date('Y-m-d H:i:s');
                        $modelDidHistory->reservationdate = $didUse->reservationdate;
                        $modelDidHistory->month_payed     = $didUse->month_payed;
                        $modelDidHistory->description     = $didUse->idDid->description;
                        try {
                            $modelDidHistory->save();
                        } catch (Exception $e) {
                        }
                    }

                    DidUse::model()->updateAll(
                        [
                            'releasedate' => date('Y-m-d H:i:s'),
                            'status'      => 0,
                        ],
                        'id_did = :key AND releasedate = :key1 AND status = 1',
                        [
                            ':key'  => $id,
                            ':key1' => '0000-00-00 00:00:00',
                        ]
                    );

                    $info    = 'DID ' . $modelDid->did . ' was released User: ' . Yii::app()->session['username'] . ' IP: ' . $_SERVER['REMOTE_ADDR'];
                    Yii::log($info, 'error');
                    MagnusLog::insertLOG(1, $info);
                }
            }

            echo json_encode([
                $this->nameSuccess => true,
                $this->nameMsg     => $this->msgSuccess,
            ]);
        } else {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Did not selected',
            ]);
        }
    }

    public function beforeDestroy($values)
    {

        if (is_array($values) && count($values) > 1) {
            foreach ($values as $key => $value) {
                $modelDid = Did::model()->findByPk((int) $value['id']);
                if ($modelDid->reserved == 0) {
                    CallSummaryMonthDid::model()->deleteAll("id_did = :key", [':key' => $modelDid->id]);
                    DidUse::model()->deleteAll("id_did = :key", [':key' => $modelDid->id]);
                }
            }
        } else {
            $modelDid = Did::model()->findByPk((int) $values['id']);
            if ($modelDid->reserved == 0) {
                CallSummaryMonthDid::model()->deleteAll("id_did = :key", [':key' => $modelDid->id]);
                DidUse::model()->deleteAll("id_did = :key", [':key' => $modelDid->id]);
            }
        }

        return $values;
    }
}
