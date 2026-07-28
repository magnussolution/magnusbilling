<?php

/**
 * Acoes do modulo "Campaign".
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
 * 28/10/2012
 */

class CampaignController extends Controller
{
    public $attributeOrder     = 't.id DESC';
    public $nameModelRelated   = 'CampaignPhonebook';
    public $nameFkRelated      = 'id_campaign';
    public $nameOtherFkRelated = 'id_phonebook';
    public $extraValues        = ['idUser' => 'username', 'idPlan' => 'name'];
    private $uploaddir;

    public $fieldsInvisibleClient = [
        'id_user',
        'idCardusername',
        'enable_max_call',
        'nb_callmade',
        'secondusedreal',
    ];

    public function init()
    {

        $this->uploaddir = $this->magnusFilesDirectory . 'sounds/';

        $this->instanceModel        = new Campaign;
        $this->abstractModel        = Campaign::model();
        $this->abstractModelRelated = CampaignPhonebook::model();
        $this->titleReport          = Yii::t('zii', 'Campaign');
        parent::init();
    }

    public function beforeSave($values)
    {

        if (
            isset($values['type']) && (int) $values['type'] === 2 &&
            (! isset($values['whatsapp_template_name']) || trim($values['whatsapp_template_name']) === '')
        ) {
            echo json_encode([
                'success' => false,
                'rows'    => [],
                'errors'  => ['whatsapp_template_name' => [Yii::t('zii', 'WhatsApp template name is required')]],
            ]);
            exit;
        }

        if (Yii::app()->session['isClient']) {
            $values['id_plan'] = Yii::app()->session['id_plan'];

            if ($this->isNewRecord) {

                if ($values['frequency'] > $this->config['global']['campaign_user_limit']) {

                    echo json_encode([
                        'success' => false,
                        'rows'    => [],
                        'errors'  => ['frequency' => [Yii::t('zii', 'The call limit need be less than') . ' ', $this->config['global']['campaign_user_limit']]],
                    ]);
                    exit;
                }
            } else {
                $modelCampaign = Campaign::model()->findByPk((int) $values['id']);

                if ($values['frequency'] > $modelCampaign->max_frequency) {

                    echo json_encode([
                        'success' => false,
                        'rows'    => [],
                        'errors'  => ['frequency' => [Yii::t('zii', 'The call limit need be less than') . ' ', $modelCampaign->max_frequency]],
                    ]);
                    exit;
                }
            }
        }

        if (isset($values['type_0'])) {

            if ($values['type_0'] == 'undefined' || $values['type_0'] == '') {
                $values['forward_number'] = '';
            } elseif (preg_match("/group|number|custom|hangup/", $values['type_0'])) {

                $values['forward_number'] = $values['type_0'] . '|' . $values['extension_0'];
            } else {
                $values['forward_number'] = $values['type_0'] . '|' . $values['id_' . $values['type_0'] . '_0'];
            }
        }

        //only allow edit max complet call, if campaign is inactive
        if ($values['status'] == 1 && ! $this->isNewRecord) {
            unset($values['secondusedreal']);
        }

        if (isset($_FILES["audio"]) && strlen($_FILES["audio"]["name"]) > 1) {
            $data            = explode('.', $_FILES["audio"]["name"]);
            $typefile        = array_pop($data);
            $values['audio'] = "idCampaign_" . $values['id'] . '.' . $typefile;
        }

        if (isset($_FILES["audio_2"]) && strlen($_FILES["audio_2"]["name"]) > 1) {
            $data              = explode('.', $_FILES["audio_2"]["name"]);
            $typefile          = array_pop($data);
            $values['audio_2'] = "idCampaign_" . $values['id'] . '_2.' . $typefile;
        }

        return $values;
    }

    public function afterSave($model, $values)
    {
        if (isset($_FILES["audio"]) && strlen($_FILES["audio"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idCampaign_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idCampaign_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['audio']['tmp_name'], $_FILES["audio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idCampaign_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["audio"]["tmp_name"], $uploadfile);
        }
        if (isset($_FILES["audio_2"]) && strlen($_FILES["audio_2"]["name"]) > 1) {
            if (file_exists($this->uploaddir . 'idCampaign_' . $model->id . '_2.wav')) {
                unlink($this->uploaddir . 'idCampaign_' . $model->id . '_2.wav');
            }
            $typefile = Util::validExtension($_FILES['audio']['tmp_name'], $_FILES["audio_2"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idCampaign_' . $model->id . '_2.' . $typefile;
            move_uploaded_file($_FILES["audio_2"]["tmp_name"], $uploadfile);
        }
    }

    public function setAttributesModels($attributes, $models)
    {

        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            if (preg_match("/|/", $attributes[$i]['forward_number'])) {
                $itemOption               = explode("|", $attributes[$i]['forward_number']);
                $attributes[$i]['type_0'] = $itemOption[0];

                if (! isset($itemOption[1])) {
                    continue;
                }
                $type = $itemOption[0];

                if ($type == 'ivr' || $type == 'queue' || $type == 'pjsip') {
                    $attributes[$i]['id_' . $type . '_0'] = $itemOption[1];
                    $modelType                            = ucfirst($type);
                    if ($modelType == 'Pjsip') {
                        $modelType = 'Sip';
                    }
                    $model                                = $modelType::model()->findByPk((int) $itemOption[1]);
                    if (isset($model->name)) {
                        $attributes[$i]['id_' . $type . '_0' . '_name'] = $model->name;
                    }
                } elseif (preg_match("/number|group|custom|hangup/", $itemOption[0])) {
                    $attributes[$i]['extension_0'] = $itemOption[1];
                }
            }
        }
        return $attributes;
    }

    public function getAttributesRequest()
    {
        $arrPost = array_key_exists($this->nameRoot, $_POST) ? json_decode($_POST[$this->nameRoot], true) : $_POST;

        /*permite salvar quando tem audio e extrafield*/
        $id_phonebook = [];
        foreach ($arrPost as $key => $value) {
            if ($key == 'id_phonebook_array') {
                if (isset($_POST['id_phonebook_array']) && strlen($value) > 0) {
                    $arrPost['id_phonebook'] = explode(",", $_POST['id_phonebook_array']);
                }
            }
        }

        return $arrPost;
    }

    public function afterDestroy($values)
    {
        $namePk = $this->abstractModel->primaryKey();
        if (array_key_exists(0, $values)) {
            foreach ($values as $value) {
                $id = $value[$namePk];

                //deleta os audios da enquete

                $uploadfile = $this->uploaddir . 'idCampaign_' . $id . '.gsm';
                if (file_exists($uploadfile)) {
                    unlink($uploadfile);
                }
            }
        } else {
            $id = $values[$namePk];
            //deleta os audios da enquete

            $uploadfile = $this->uploaddir . 'idCampaign_' . $id . '.gsm';
            if (file_exists($uploadfile)) {
                unlink($uploadfile);
            }
        }
    }

    public function actionQuick()
    {

        $creationdate = $_POST['startingdate'] . ' ' . $_POST['startingtime'];

        $modelUser = User::model()->findByPk((int) Yii::app()->session['id_user']);

        $name        = $modelUser->username . '_' . $creationdate;
        $description = isset($_POST['sms_text']) ? $_POST['sms_text'] : false;

        $type = $_POST['type'] == 'CALL' ? 1 : 0;

        $modelCampaign                   = $this->instanceModel;
        $modelCampaign->name             = $name;
        $modelCampaign->startingdate     = $creationdate;
        $modelCampaign->expirationdate   = '2030-01-01 00:00:00';
        $modelCampaign->id_user          = $modelUser->id;
        $modelCampaign->id_plan          = $modelUser->id_plan;
        $modelCampaign->type             = $type;
        $modelCampaign->description      = $description;
        $modelCampaign->frequency        = 10;
        $modelCampaign->max_frequency    = 10;
        $modelCampaign->daily_start_time = $_POST['startingtime'];
        $modelCampaign->save();

        if (count($modelCampaign->getErrors())) {
            echo json_encode([
                $this->nameSuccess => true,
                $this->nameMsg     => print_r($modelCampaign->getErrors(), true),
            ]);
            exit;
        }

        $id_campaign = $modelCampaign->id;

        $modelPhoneBook          = new PhoneBook();
        $modelPhoneBook->id_user = $modelUser->id;
        $modelPhoneBook->name    = $name;
        $modelPhoneBook->status  = 1;
        $modelPhoneBook->save();
        $id_phonebook = $modelPhoneBook->id;

        $modelCampaignPhonebook               = new CampaignPhonebook();
        $modelCampaignPhonebook->id_campaign  = $id_campaign;
        $modelCampaignPhonebook->id_phonebook = $id_phonebook;
        $modelCampaignPhonebook->save();

        if ($type == 1) {
            $audio                = $this->uploaddir . "idCampaign_" . $id_campaign;
            $modelCampaign->audio = $audio;
            $modelCampaign->save();
        }

        if (isset($_FILES['audio_path']['tmp_name']) && strlen($_FILES['audio_path']['tmp_name']) > 3) {

            //import audio torpedo
            if (file_exists($this->uploaddir . 'idCampaign_' . $id_campaign . '.wav')) {
                unlink($this->uploaddir . 'idCampaign_' . $id_campaign . '.wav');
            }
            $typefile = Util::validExtension($_FILES['audio_path']['tmp_name'], $_FILES["audio_path"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idCampaign_' . $id_campaign . '.' . $typefile;
            move_uploaded_file($_FILES["audio_path"]["tmp_name"], $uploadfile);
        }

        if (isset($_FILES['csv_path']['tmp_name']) && strlen($_FILES['csv_path']['tmp_name']) > 3) {
            $interpreter      = new CSVInterpreter($_FILES['csv_path']['tmp_name']);
            $array            = $interpreter->toArray();
            $additionalParams = [['key' => 'id_phonebook', 'value' => $id_phonebook], ['key' => 'creationdate', 'value' => $creationdate]];
            $errors           = [];
            if ($array) {
                $instanceModel = new PhoneNumber;
                $recorder      = new CSVActiveRecorder($array, $instanceModel, $additionalParams);
                if ($recorder->save());
                $errors = $recorder->getErrors();
            } else {
                $errors = $interpreter->getErrors();
            }

            echo json_encode([
                $this->nameSuccess => count($errors) > 0 ? false : true,
                $this->nameMsg     => count($errors) > 0 ? implode(',', $errors) : $this->msgSuccess,
            ]);

            exit;
        }

        if (isset($_POST['numbers']) && $_POST['numbers'] != '') {
            $numbers = explode("\n", $_POST['numbers']);

            foreach ($numbers as $key => $number) {

                $modelPhoneNumber               = new PhoneNumber();
                $modelPhoneNumber->id_phonebook = $id_phonebook;
                $modelPhoneNumber->number       = $number;
                $modelPhoneNumber->creationdate = $creationdate;
                $modelPhoneNumber->save();
            }
        }
        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameMsg     => $this->msg,
        ]);
    }

    public function actionTestCampaign()
    {
        $idCampaign = isset($_POST['id']) ? (int) $_POST['id'] : 0;
        $campaign   = $idCampaign > 0 ? $this->abstractModel->findByPk($idCampaign) : null;

        if (! isset($campaign->id)) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Please Select one campaign',
            ]);
            return;
        }

        Yii::import('application.commands.MassiveCallCommand');

        ob_start();
        $massiveCall = new MassiveCallCommand('massivecall', new CConsoleCommandRunner());
        $result      = $massiveCall->run([$idCampaign]);
        $message     = trim(ob_get_clean());
        $exitCode    = is_int($result) ? $result : 0;

        echo json_encode([
            $this->nameSuccess => $exitCode === 0,
            $this->nameMsg     => $exitCode === 0
            ? ($message !== '' ? $message : 'Campaign processed by massivecall')
            : ($message !== '' ? $message : 'Error processing campaign'),
        ]);
    }
}
