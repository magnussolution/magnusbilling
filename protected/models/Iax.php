<?php
/**
 * Modelo para a tabela "Iax".
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
 * 19/06/2016
 */

class Iax extends Model
{
    protected $_module = 'iax';
    /**
     * Retorna a classe estatica da model.
     *
     * @return Iax classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     *
     *
     * @return nome da tabela.
     */
    public function tableName()
    {
        return 'pkg_iax';
    }

    /**
     *
     *
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     *
     *
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['id_user', 'required'],
            ['id_user,calllimit ', 'numerical', 'integerOnly' => true],
            ['name, callerid, context, fromuser, fromdomain, md5secret, secret', 'length', 'max' => 80],
            ['regexten, insecure, accountcode', 'length', 'max' => 20],
            ['amaflags, dtmfmode, qualify', 'length', 'max' => 7],
            ['callgroup, pickupgroup', 'length', 'max' => 10],
            ['DEFAULTip, ipaddr', 'length', 'max' => 15],
            ['nat, host', 'length', 'max' => 31],
            ['language', 'length', 'max' => 2],
            ['mailbox', 'length', 'max' => 50],
            ['rtpholdtimeout', 'length', 'max' => 3],
            ['deny, permit', 'length', 'max' => 95],
            ['port', 'length', 'max' => 5],
            ['type', 'length', 'max' => 6],
            ['disallow, allow, useragent', 'length', 'max' => 100],
            ['username', 'checkusername'],
            ['username', 'unique', 'caseSensitive' => 'false'],
        ];
        return $this->getExtraField($rules);
    }

    public function checkusername($attribute, $params)
    {
        if (preg_match('/ /', $this->username)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in username'));
        }

    }

    public function afterSave()
    {
        $sql = "UPDATE pkg_iax SET accountcode = ( SELECT username FROM pkg_user WHERE pkg_user.id = pkg_iax.id_user)";
        Yii::app()->db->createCommand($sql)->execute();

        return parent::afterSave();
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

}
