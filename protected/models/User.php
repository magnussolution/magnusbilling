<?php

/**
 * Modelo para a tabela "User".
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

class User extends Model
{
    protected $_module     = 'user';
    protected $newPassword = null;
    /**
     * Return the static class of model.
     *
     * @return User classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     *
     *
     * @return name of table.
     */
    public function tableName()
    {
        return 'pkg_user';
    }

    /**
     *
     *
     * @return name of primary key(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     *
     *
     * @return array validation of fields of model.
     */
    public function rules()
    {

        $rules = [
            ['username, password', 'required'],
            ['id_user, id_group, id_plan, id_offer, active, enableexpire, expiredays,
                    typepaid, creditlimit, credit_notification,sipaccountlimit, restriction,
                    callingcard_pin, callshop, plan_day, active_paypal, boleto,
                    boleto_day, calllimit, disk_space,id_group_agent,cpslimit,
                    restriction_use,credit_notification_daily,email_services,email_did, inbound_call_limit', 'numerical', 'integerOnly' => true],
            ['language,mix_monitor_format,calllimit_error', 'length', 'max' => 5],
            ['zipcode, phone, mobile, vat', 'length', 'max' => 20],
            ['city, state, country, loginkey', 'length', 'max' => 40],
            ['lastname, firstname, redial,neighborhood', 'length', 'max' => 50],
            ['company_website, dist', 'length', 'max' => 100],
            ['address, email,email2, doc', 'length', 'max' => 100],
            ['username', 'length', 'min' => 4, 'max' => 20],
            ['description, prefix_local', 'length', 'max' => 500],
            ['credit, contract_value', 'type', 'type' => 'double'],
            ['expirationdate, password, lastuse,company_name, commercial_name', 'length', 'max' => 100],
            ['username', 'checkusername'],
            ['password', 'checksecret'],
            ['username', 'unique', 'caseSensitive' => 'false'],
        ];

        return $this->getExtraField($rules);
    }

    public function checkusername($attribute, $params)
    {
        if (preg_match('/ /', $this->username)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in username'));
        }

        if (! preg_match('/^[0-9]|^[A-Z]|^[a-z]/', $this->username)) {
            $this->addError($attribute, Yii::t('zii', 'Username need start with numbers or letters'));
        }
    }

    public function checksecret($attribute, $params)
    {
        if (preg_match('/ /', $this->password)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in password'));
        }

        if ($this->password == '123456' || $this->password == '12345678' || $this->password == '012345') {
            $this->addError($attribute, Yii::t('zii', 'No use sequence in the password'));
        }

        if ($this->password == $this->username) {
            $this->addError($attribute, Yii::t('zii', 'Password cannot be equal username'));
        }
    }

    public function beforeSave()
    {
        if ($this->getIsNewRecord()) {
            $this->creationdate = date('Y-m-d H:i:s');
        }

        $this->contract_value = $this->contract_value == '' ? 0 : $this->contract_value;

        return parent::beforeSave();
    }

    public function relations()
    {
        return [
            'idGroup' => [self::BELONGS_TO, 'GroupUser', 'id_group'],
            'idPlan'  => [self::BELONGS_TO, 'Plan', 'id_plan'],
            'idUser'  => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }
}
