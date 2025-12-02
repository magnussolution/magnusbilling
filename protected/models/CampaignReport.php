<?php
/**
 * Modelo para a tabela "CampaignPollInfo".
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/10/2012
 */

class CampaignReport extends Model
{
    protected $_module = 'campaignreport';

    public $totalDialed     = 0;
    public $totalAmd        = 0;
    public $totalAnswered   = 0;
    public $transfered      = 0;
    public $totalFailed     = 0;
    public $totalPressDigit = 0;

    /**
     * Retorna a classe estatica da model.
     * @return Prefix classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return nome da tabela.
     */
    public function tableName()
    {
        return 'pkg_campaign_report';
    }

    /**
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['id_campaign, id_phonenumber, id_user, id_trunk, unix_timestamp,status', 'numerical', 'integerOnly' => true],
        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idCampaign'    => [self::BELONGS_TO, 'Campaign', 'id_campaign'],
            'idPhonenumber' => [self::BELONGS_TO, 'Phonenumber', 'id_phonenumber'],
            'idUser'        => [self::BELONGS_TO, 'User', 'id_user'],
            'idTrunk'       => [self::BELONGS_TO, 'Trunk', 'id_trunk'],
        ];
    }

    public static function insertReport($data)
    {
        $sql = 'INSERT INTO pkg_campaign_report (id_campaign, id_phonenumber, id_user, id_trunk, unix_timestamp) VALUES ' . $data;
        Yii::app()->db->createCommand($sql)->execute();
    }
}
