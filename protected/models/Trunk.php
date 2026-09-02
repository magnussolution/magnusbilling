<?php

/**
 * Modelo para a tabela "Trunk".
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
 * 25/06/2012
 */
class Trunk extends Model
{
    protected $_module = 'trunk';

    /**
     * Retorna a classe estatica da model.
     * @return Trunk classe estatica da model.
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
        return 'pkg_trunk';
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
        // NOTE: you should only define rules for those attributes that
        // will receive user inputs.
        $rules = [
            ['trunkcode, id_provider, allow, providertech, host', 'required'],
            ['allow_error, id_provider, failover_trunk, secondusedreal, register, call_answered,port, call_total, inuse, maxuse, status, if_max_use, cnl', 'numerical', 'integerOnly' => true],
            ['secret', 'length', 'max' => 50],
            ['nat, trunkcode, sms_res', 'length', 'max' => 50],
            ['trunkprefix, providertech, removeprefix, context, insecure, disallow', 'length', 'max' => 20],
            ['providerip, user,fromuser, allow, host, fromdomain', 'length', 'max' => 80],
            ['addparameter, block_cid', 'length', 'max' => 120],
            ['link_sms', 'length', 'max' => 250],
            ['dtmfmode, qualify', 'length', 'max' => 7],
            ['directmedia,sendrpid', 'length', 'max' => 10],
            ['cid_add,cid_remove', 'length', 'max' => 11],
            ['type, language', 'length', 'max' => 6],
            ['transport,encryption', 'length', 'max' => 3],
            ['port', 'length', 'max' => 5],
            ['register_string', 'length', 'max' => 300],
            ['sip_config', 'length', 'max' => 500],
            ['trunkcode', 'match', 'pattern' => '/^[a-zA-Z0-9-]+$/', 'message' => Yii::t('zii', 'The trunk name must contain only letters, numbers and hyphens.')],
            ['trunkcode', 'unique', 'caseSensitive' => false],
            ['trunkcode', 'checkTrunkCode'],
            ['trunkcode', 'uniquePeerName'],
            ['user', 'uniquePeerName'],
            ['register', 'checkRegister'],
            ['secret, nat, trunkcode, sms_res, trunkprefix, providertech, removeprefix,
                context, insecure, disallow, providerip, user, fromuser, allow, host,
                fromdomain, addparameter, block_cid, link_sms, dtmfmode, qualify,
                directmedia, sendrpid, cid_add, cid_remove, type, language, transport,
                encryption, register_string, sip_config', 'validateAsteriskConfigValue'],
        ];
        return $this->getExtraField($rules);
    }

    public function checkTrunkCode($attribute, $params)
    {
        if ($this->providertech == 'pjsip' && strtolower(trim((string) $this->host)) === 'dynamic') {
            // The gateway registers by user; trunkcode remains the outbound endpoint name.
            if (! preg_match('/\A[a-zA-Z0-9_.-]+\z/', (string) $this->user)) {
                $this->addError('user', Yii::t('zii', 'Dynamic trunks require a SIP username containing only letters, numbers, dots, underscores and hyphens.'));
            }
            if (! strlen((string) $this->secret)) {
                $this->addError('secret', Yii::t('zii', 'Dynamic trunks require a SIP password.'));
            }
        } elseif ($this->host == 'dynamic' && $this->trunkcode != $this->user) {
            $this->addError($attribute, Yii::t('zii', 'When host =dynamic the trunk name and username need be equal.'));
        }
    }

    public function checkRegister($attribute, $params)
    {
        if (strtolower(trim((string) $this->host)) === 'dynamic' && (int) $this->register !== 0) {
            $this->addError($attribute, Yii::t('zii', 'Register trunk must be disabled when host is dynamic.'));
            return;
        }
        if ((int) $this->register !== 1) {
            return;
        }

        if (! preg_match('/\A[a-zA-Z0-9_.+\-]{1,80}\z/', (string) $this->user)) {
            $this->addError('user', Yii::t('zii', 'Register requires a username of up to 80 letters, numbers, dots, underscores, plus signs or hyphens.'));
        }
        if (! strlen((string) $this->secret) || strlen((string) $this->secret) > 50
            || preg_match('/[\x00-\x20\x7f;\\\\]/', (string) $this->secret)
        ) {
            $this->addError('secret', Yii::t('zii', 'Register requires a password of up to 50 characters without whitespace, semicolons or backslashes.'));
        }
        $host = (string) $this->host;
        $validHost = filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)
            || (! preg_match('/\A[0-9.]+\z/', $host)
                && filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME));
        if (! strlen($host) || strlen($host) > 80 || ! $validHost) {
            $this->addError('host', Yii::t('zii', 'Register requires a valid IPv4 address or hostname, without a protocol, port or path.'));
        }
        if (! $this->hasErrors('user')) {
            if (Trunk::model()->exists(
                'id <> :id AND (LOWER(user) = :username OR LOWER(trunkcode) = :trunkname)',
                [':id' => (int) $this->id, ':username' => strtolower($this->user), ':trunkname' => strtolower($this->user)]
            )) {
                $this->addError('user', Yii::t('zii', 'This username is in use by a trunk'));
            }
            if (Sip::model()->exists(
                'LOWER(name) = :username OR LOWER(defaultuser) = :authuser',
                [':username' => strtolower($this->user), ':authuser' => strtolower($this->user)]
            )) {
                $this->addError('user', Yii::t('zii', 'This username is in use by a SIP user.'));
            }
        }
        if (! preg_match('/\A[^\s:]+:[^\s]+@[^\s\/]+\/[^\s]+\z/', (string) $this->register_string)) {
            $this->addError('register_string', Yii::t('zii', 'Invalid register string'));
        }
    }

    public function beforeValidate()
    {
        if (isset($this->trunkcode)) {
            $this->trunkcode = preg_replace('/ /', '-', $this->trunkcode);
        }

        return parent::beforeValidate();
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idProvider'    => [self::BELONGS_TO, 'Provider', 'id_provider'],
            'failoverTrunk' => [self::BELONGS_TO, 'trunk', 'failover_trunk'],
            'trunks'        => [self::HAS_MANY, 'trunk', 'failover_trunk'],
        ];
    }

    public function beforeSave()
    {
        $this->register_string = $this->register == 1 ? $this->register_string : '';
        $this->providerip      = $this->providertech != 'pjsip' && $this->providertech != 'iax2' ? $this->host : $this->trunkcode;
        return parent::beforeSave();
    }
}
