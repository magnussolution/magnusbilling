<?php
/**
 * Modelo para a tabela "Refillprovider".
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
 * 18/07/2012
 */

class Refillprovider extends Model
{
    protected $_module = 'refillprovider';
    /**
     * Retorna a classe estatica da model.
     * @return Refilltrunk classe estatica da model.
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
        return 'pkg_refill_provider';
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
            ['credit, id_provider', 'required'],
            ['id_provider, payment', 'numerical', 'integerOnly' => true],
            ['description', 'length', 'max' => 500],

        ];
        return $this->getExtraField($rules);
    }
    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idProvider' => [self::BELONGS_TO, 'Provider', 'id_provider'],
        ];
    }
}
