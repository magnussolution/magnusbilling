<?php
/**
 * Modelo para a tabela "UserRate".
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
 * 19/09/2012
 */

class UserRate extends Model
{
    protected $_module     = 'userrate';
    protected $newPassword = null;
    /**
     * Return the static class of model.
     * @return User classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return name of table.
     */
    public function tableName()
    {
        return 'pkg_user_rate';
    }

    /**
     * @return name of primary key(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     * @return array validation of fields of model.
     */
    public function rules()
    {
        $rules = [
            ['id_user, id_prefix', 'required'],
            ['id_user, id_prefix, initblock, billingblock', 'numerical', 'integerOnly' => true],
            ['rateinitial', 'length', 'max' => 10],

        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array roles of relationship.
     */
    public function relations()
    {
        return [
            'idPrefix' => [self::BELONGS_TO, 'Prefix', 'id_prefix'],
            'idUser'   => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }
}
