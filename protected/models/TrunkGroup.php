<?php
/**
 * Modelo para a tabela "Provider".
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
 * 25/06/2012
 */

class TrunkGroup extends Model
{
    protected $_module = 'trunkgroup';
    public $id_trunk;
    /**
     * Retorna a classe estatica da model.
     * @return Provider classe estatica da model.
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
        return 'pkg_trunk_group';
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
            ['name', 'required'],
            ['type', 'numerical', 'integerOnly' => true],
            ['description', 'length', 'max' => 500],
            ['weight', 'match', 'pattern' => '/^[0-9\,]*$|^$/', 'message' => Yii::t('zii', 'Allowed format int,int,int. Ex: 1,2,1,5,3')],
        ];
        return $this->getExtraField($rules);
    }

}
