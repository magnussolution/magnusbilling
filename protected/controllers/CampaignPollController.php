<?php

/**
 * Acoes do modulo "CampaignPoll".
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

class CampaignPollController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idCampaign' => 'name', 'idUser' => 'username'];

    private $uploaddir;
    public $fieldsFkReport = [
        'id_campaign' => [
            'table'       => 'pkg_campaign',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
    ];

    public function init()
    {
        $this->uploaddir     = $this->magnusFilesDirectory . 'sounds/';
        $this->instanceModel = new CampaignPoll;
        $this->abstractModel = CampaignPoll::model();
        $this->titleReport   = Yii::t('zii', 'Poll');
        parent::init();
    }

    public function beforeSave($values)
    {
        if ($this->isNewRecord || isset($values['id_campaign'])) {
            $modelCampaign     = Campaign::model()->findByPk((int) $values['id_campaign']);
            $values['id_user'] = $modelCampaign->id_user;
        }

        if (isset($_FILES["arq_audio"]) && strlen($_FILES["arq_audio"]["name"]) > 1) {
            $data                = explode('.', $_FILES["arq_audio"]["name"]);
            $typefile            = array_pop($data);
            $values['arq_audio'] = "idPoll_" . $values['id'] . '.' . $typefile;
        }
        return $values;
    }

    public function afterSave($model, $values)
    {

        if (strlen($_FILES["arq_audio"]["name"]) > 1) {

            if (file_exists($this->uploaddir . 'idPoll_' . $model->id . '.wav')) {
                unlink($this->uploaddir . 'idPoll_' . $model->id . '.wav');
            }
            $typefile = Util::validExtension($_FILES['audio_path']['tmp_name'], $_FILES["arq_audio"]["name"], ['gsm', 'wav']);
            $uploadfile = $this->uploaddir . 'idPoll_' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["arq_audio"]["tmp_name"], $uploadfile);
        }

        return;
    }

    public function afterDestroy($values)
    {
        $namePk = $this->abstractModel->primaryKey();
        if (array_key_exists(0, $values)) {
            foreach ($values as $value) {
                $id = $value[$namePk];

                //deleta os audios da enquete

                $uploadfile = $this->uploaddir . 'idPoll_' . $id . '.gsm';
                if (file_exists($uploadfile)) {
                    unlink($uploadfile);
                }
            }
        } else {
            $id = $values[$namePk];
            //deleta os audios da enquete

            $uploadfile = $this->uploaddir . 'idPoll_' . $id . '.gsm';
            if (file_exists($uploadfile)) {
                unlink($uploadfile);
            }
        }
    }
}
