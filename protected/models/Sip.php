<?php

/**
 * Modelo para a tabela "Sip".
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

class Sip extends Model
{
    protected $_module = 'sip';
    private $lineStatus;
    private $sipshowpeer;
    /**
     * Retorna a classe estatica da model.
     *
     * @return Sip classe estatica da model.
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
        return 'pkg_sip';
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
            ['id_user, calllimit, ringfalse, record_call, voicemail,dial_timeout,trace,amd, voicemail_password,
                id_trunk_group', 'numerical', 'integerOnly' => true],
            ['name, callerid, context, fromuser, fromdomain, md5secret, secret, fullcontact', 'length', 'max' => 80],
            ['regexten, insecure, regserver, vmexten, callingpres, mohsuggest, allowtransfer', 'length', 'max' => 20],
            ['amaflags, dtmfmode, qualify', 'length', 'max' => 7],
            ['callgroup, pickupgroup, auth, subscribemwi, usereqphone, autoframing', 'length', 'max' => 10],
            ['DEFAULTip, ipaddr, maxcallbitrate, rtpkeepalive', 'length', 'max' => 15],
            ['nat, host', 'length', 'max' => 31],
            ['language', 'length', 'max' => 2],
            ['mailbox,addparameter', 'length', 'max' => 50],
            ['sip_group', 'length', 'max' => 20],
            ['rtptimeout, rtpholdtimeout,videosupport', 'length', 'max' => 3],
            ['deny, permit', 'length', 'max' => 95],
            ['type', 'length', 'max' => 6],
            ['url_events, description', 'length', 'max' => 150],
            ['disallow,forward, allow, setvar, useragent,block_call_reg, voicemail_email', 'length', 'max' => 100],
            ['lastms', 'length', 'max' => 11],
            ['directmedia,alias', 'length', 'max' => 10],
            ['defaultuser, cid_number, outboundproxy, sippasswd', 'length', 'max' => 40],
            ['defaultuser', 'checkusername'],
            ['secret', 'checksecret'],
            ['secret', 'length', 'min' => 4, 'max' => 30],
            ['defaultuser', 'unique', 'caseSensitive' => 'false'],
            ['techprefix, cnl', 'length', 'max' => 6],
            ['techprefix', 'checktechprefix'],
            ['host', 'checkHost'],
            ['sip_config', 'length', 'max' => 500],
            ['defaultuser', 'uniquePeerName'],

        ];
        return $this->getExtraField($rules);
    }

    public function checktechprefix($attribute, $params)
    {
        if (strlen($this->techprefix) > 2) {

            $config = LoadConfig::getConfig();
            $length = $config['global']['ip_tech_length'];

            if (strlen($this->techprefix) != $length) {
                $this->addError($attribute, Yii::t('zii', 'Tech Prefix have a invalid length'));
            }
            if (strlen($this->techprefix) > 6) {
                $this->addError($attribute, Yii::t('zii', 'Tech Prefix maximum length is 6'));
            }
        }
    }

    public function checkHost($attribute, $params)
    {

        if ($this->host == 'dynamic' && $this->secret == '') {
            $this->addError($attribute, Yii::t('zii', 'You host is dynamic, please set a password'));
        }
        if (strlen($this->techprefix) > 2) {
            if ($this->host == 'dynamic' && preg_match('/invite/', $this->insecure)) {
                $this->addError($attribute, Yii::t('zii', 'Never use host=dynamic and insecure=invite'));
            }
        }
    }

    public function beforeSave()
    {

        $this->cnl = strtoupper($this->cnl);
        if ($this->techprefix == 0) {
            $this->techprefix = null;
        }
        if ($this->host == 'dynamic') {
            $this->insecure = 'no';
        }

        $this->name        = trim($this->name);
        $this->defaultuser = trim($this->defaultuser);
        $this->fromuser    = trim($this->fromuser);

        return parent::beforeSave();
    }

    public function afterSave()
    {
        $sql = "UPDATE pkg_sip SET accountcode = ( SELECT username FROM pkg_user WHERE pkg_user.id = pkg_sip.id_user)";
        Yii::app()->db->createCommand($sql)->execute();

        return parent::afterSave();
    }

    public function checkusername($attribute, $params)
    {
        if (preg_match('/ /', $this->defaultuser)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in defaultuser'));
        }
    }
    public function checksecret($attribute, $params)
    {
        if (preg_match('/ /', $this->secret)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in password'));
        }

        if (preg_match('/\'|\"/', $this->secret)) {
            $this->addError($attribute, Yii::t('zii', 'Not use \' or \" in password'));
        }

        if ($this->secret == '123456' || $this->secret == '12345678' || $this->secret == '012345') {
            $this->addError($attribute, Yii::t('zii', 'No use sequence in the password'));
        }

        if ($this->secret == $this->defaultuser) {
            $this->addError($attribute, Yii::t('zii', 'Password cannot be equal username'));
        }
    }
    /*
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idUser'       => [self::BELONGS_TO, 'User', 'id_user'],
            'idTrunkGroup' => [self::BELONGS_TO, 'TrunkGroup', 'id_trunk_group'],
        ];
    }
}
