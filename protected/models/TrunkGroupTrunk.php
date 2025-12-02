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

class TrunkGroupTrunk extends Model
{
    protected $_module = 'trunkgrouptrunk';
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
        return 'pkg_trunk_group_trunk';
    }

    /**
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return ['id', 'id_trunk_group', 'id_trunk'];
    }

    /**
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['id_trunk_group, id_trunk', 'required'],
            ['id_trunk_group, id_trunk', 'numerical', 'integerOnly' => true],
        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idTrunk'      => [self::BELONGS_TO, 'Trunk', 'id_trunk'],
            'idTrunkGroup' => [self::BELONGS_TO, 'TrunkGroup', 'id_trunk_group'],
        ];
    }
}
