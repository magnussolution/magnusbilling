<?php
/**
 * Modelo para a tabela "Prefix".
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
 * 01/08/2012
 */

class Prefix extends Model
{
    protected $_module = 'prefix';
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
        return 'pkg_prefix';
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
            ['destination, prefix', 'required'],
            ['prefix', 'unique'],
        ];
        return $this->getExtraField($rules);
    }

    public function afterSave()
    {
        $this->prefixLength();

        return parent::afterSave();
    }

    public function insertPrefixs($sqlPrefix)
    {

        $sqlInsertPrefix = 'INSERT IGNORE INTO pkg_prefix (prefix, destination)
                            VALUES ' . implode(',', $sqlPrefix) . ';';
        try {
            Yii::app()->db->createCommand($sqlInsertPrefix)->execute();
            return true;
        } catch (Exception $e) {
            return $e;
        }
        $this->prefixLength();
    }

    public function getPrefix($prefix)
    {
        $sql     = 'SELECT id, destination FROM pkg_prefix WHERE prefix = :prefix LIMIT 1';
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":prefix", $prefix, PDO::PARAM_STR);
        try {
            return $command->queryAll();
        } catch (Exception $e) {
            return $e;
        }
    }

    public function updateDestination($prefix, $destination)
    {
        $sql = "UPDATE pkg_prefix SET destination = :destination  WHERE prefix = :prefix";
        try {
            $command = Yii::app()->db->createCommand($sql);
            $command->bindValue(":prefix", $prefix, PDO::PARAM_STR);
            $command->bindValue(":destination", $destination, PDO::PARAM_STR);
            $command->execute();
        } catch (Exception $e) {

        }
    }

    public function prefixLength()
    {

        $modelPrefix = Prefix::model()->findAll([
            'select'    => 'SUBSTRING( prefix, 1, 2 ) AS destination, length(prefix) AS prefix',
            'condition' => 'prefix > 0',
            'order'     => 'LENGTH( prefix ) DESC',
        ]);

        $modelPrefix = Util::unique_multidim_obj($modelPrefix, 'destination');

        $insert = [];
        foreach ($modelPrefix as $key => $value) {
            $insert[] = '(' . $value->destination . ',' . $value->prefix . ')';
        }

        PrefixLength::model()->deleteAll();

        $sql = 'INSERT IGNORE INTO pkg_prefix_length (code,length) VALUES ' . implode(',', $insert) . ';';
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {

        }
    }
}
