<?php
/**
 * Modelo para a tabela "CampaignPhonebook".
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
 * 29/10/2012
 */

class CampaignPhonebook extends Model
{
    protected $_module = 'campaignphonebook';
    /**
     * Retorna a classe estatica da model.
     * @return SubModule classe estatica da model.
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
        return 'pkg_campaign_phonebook';
    }

    /**
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return ['id_campaign', 'id_phonebook'];
    }

    /**
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['id_campaign, id_phonebook', 'required'],
            ['id_campaign, id_phonebook', 'numerical', 'integerOnly' => true],
        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idCampaign'  => [self::BELONGS_TO, 'Campaign', 'id_campaign'],
            'idPhoneBook' => [self::BELONGS_TO, 'PhoneBook', 'id_phonebook'],
        ];
    }
}
