<?php
/**
 * Modelo para a tabela "PhoneNumber".
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

class PhoneNumber extends Model
{
    protected $_module = 'phonenumber';
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
        return 'pkg_phonenumber';
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
            ['id_phonebook, status, try', 'numerical', 'integerOnly' => true],
            ['name, city', 'length', 'max' => 40],
            ['number', 'length', 'max' => 30],
            ['info, doc, email', 'length', 'max' => 200],
        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idPhonebook' => [self::BELONGS_TO, 'PhoneBook', 'id_phonebook'],
        ];
    }

    public function beforeSave()
    {
        if ($this->status == 1) {
            $this->try = 0;
        }

        return parent::beforeSave();
    }

    public function reprocess($relationFilter, $paramsFilter)
    {
        $sql     = "UPDATE pkg_phonenumber t  JOIN pkg_phonebook idPhonebook ON t.id_phonebook = idPhonebook.id SET t.status = 1, t.try = 0 WHERE t.status = 2 AND " . $relationFilter['idPhonebook']['condition'];
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":p0", $paramsFilter['p0'], PDO::PARAM_STR);
        $command->execute();
    }
}
