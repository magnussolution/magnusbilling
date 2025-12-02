<?php
/**
 * Modelo para a tabela "Plan".
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 24/07/2012
 */

class Plan extends Model
{
    protected $_module = 'plan';
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
        return 'pkg_plan';
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
            ['id_user, tariff_limit, play_audio,techprefix, lcrtype, signup, portabilidadeMobile, portabilidadeFixed', 'numerical', 'integerOnly' => true],
            ['name, ini_credit', 'length', 'max' => 50],
            ['techprefix', 'length', 'max' => 5],
            ['name', 'unique', 'caseSensitive' => 'false'],
            ['creationdate', 'safe'],
        ];
        return $this->getExtraField($rules);
    }

    /*
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }

    public function searchTariff($id_plan, $destination)
    {

        $max_len_prefix = strlen($destination);
        $prefixclause   = '(';
        while ($max_len_prefix >= 1) {
            $prefixclause .= "prefix='" . substr($destination, 0, $max_len_prefix) . "' OR ";
            $max_len_prefix--;
        }

        $prefixclause = substr($prefixclause, 0, -3) . ")";

        $sql = "SELECT pkg_plan.id AS id_plan, pkg_prefix.prefix AS dialprefix,pkg_plan.name, pkg_rate.id_prefix, pkg_rate.id AS id_rate, minimal_time_charge,rateinitial, initblock, billingblock, connectcharge, disconnectcharge disconnectcharge,pkg_rate.additional_grace AS additional_grace, package_offer, id_trunk_group, pkg_trunk_group.type AS trunk_group_type
                FROM pkg_plan
                LEFT JOIN pkg_rate ON pkg_plan.id = pkg_rate.id_plan
                LEFT JOIN pkg_prefix ON pkg_rate.id_prefix = pkg_prefix.id
                LEFT JOIN pkg_trunk_group ON pkg_trunk_group.id = pkg_rate.id_trunk_group
                WHERE pkg_plan.id=$id_plan AND pkg_rate.status = 1 AND $prefixclause
                ORDER BY LENGTH( prefix ) DESC  LIMIT 1";
        return [$sql, Yii::app()->db->createCommand($sql)->queryAll(), $prefixclause];
    }
}
