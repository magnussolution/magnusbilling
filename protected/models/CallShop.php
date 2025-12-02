<?php
/**
 * Modelo para a tabela "Alarm".
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
 * 17/08/2012
 */

class CallShop extends Model
{
    protected $_module = 'callshop';
    public $priceSum;
    public $callshopdestination;
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
        return 'pkg_sip';
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
            ['id_user', 'required'],
            ['id_user, calllimit', 'numerical', 'integerOnly' => true],
            ['name, callerid, context, fromuser, fromdomain, md5secret, secret, fullcontact', 'length', 'max' => 80],
            ['regexten, insecure, regserver, vmexten, callingpres, mohsuggest, allowtransfer, callshoptime', 'length', 'max' => 20],
            ['amaflags, dtmfmode, qualify', 'length', 'max' => 7],
            ['callgroup, pickupgroup, auth, subscribemwi, usereqphone, autoframing', 'length', 'max' => 10],
            ['DEFAULTip, accountcode, ipaddr, maxcallbitrate, rtpkeepalive', 'length', 'max' => 15],
            ['host', 'length', 'max' => 31],
            ['language', 'length', 'max' => 2],
            ['mailbox', 'length', 'max' => 50],
            ['nat, rtptimeout, rtpholdtimeout', 'length', 'max' => 3],
            ['deny, permit', 'length', 'max' => 95],
            ['port', 'length', 'max' => 5],
            ['type', 'length', 'max' => 6],
            ['disallow, allow, setvar, useragent', 'length', 'max' => 100],
            ['lastms', 'length', 'max' => 11],
            ['defaultuser, cid_number, outboundproxy', 'length', 'max' => 40],
        ];

        $rules = $this->getExtraField($rules);

        return $rules;
    }
    /**
     * @return array relational rules.
     */
    public function relations()
    {
        // NOTE: you may need to adjust the relation name and the related
        // class name for the relations automatically generated below.
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }
}
