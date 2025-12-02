<?php
/**
 * Modelo para a tabela "Rate".
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
 * 30/07/2012
 */

class RateCallshop extends Model
{
    protected $_module = 'ratecallshop';
    /**
     * Retorna a classe estatica da model.
     * @return Rate classe estatica da model.
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
        return 'pkg_rate_callshop';
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
            //array('dialprefix', 'required'),
            ['id_user, minimo, block, minimal_time_charge', 'numerical', 'integerOnly' => true],
            ['dialprefix, destination', 'length', 'max' => 30],
            ['buyrate', 'length', 'max' => 15],
        ];
        return $this->getExtraField($rules);
    }

    public function createCallShopRates($model)
    {
        $table = $model->id_user > 1 ? 'pkg_rate_agent' : 'pkg_rate';

        $sql = "SELECT " . $model->id . ",prefix, destination, rateinitial, initblock, billingblock
                                    FROM " . $table . " JOIN pkg_prefix
                                    ON " . $table . ".id_prefix = pkg_prefix.id
                                    WHERE id_plan = :id_plan";

        $sql     = "INSERT INTO pkg_rate_callshop (id_user , dialprefix,  destination, buyrate, minimo , block) $sql";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":id_plan", $model->id_plan, PDO::PARAM_STR);
        $command->execute();
    }

    public function findCallShopRate($number, $id_user)
    {
        $sql = "SELECT * FROM pkg_rate_callshop WHERE dialprefix = SUBSTRING(:ndiscado,1,length(dialprefix))
                                AND id_user= :id_user   ORDER BY LENGTH(dialprefix) DESC LIMIT 1";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":id_user", $id_user, PDO::PARAM_INT);
        $command->bindValue(":ndiscado", $number, PDO::PARAM_STR);
        return $command->queryAll();
    }
}
