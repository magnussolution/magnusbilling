<?php
/**
 * Modelo para a tabela "Call".
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

class Api extends Model
{
    protected $_module = 'api';
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
        return 'pkg_api';
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
            ['api_key, api_secret', 'required'],
            ['api_key, api_secret', 'unique'],
            ['id_user, status', 'numerical', 'integerOnly' => true],
            ['api_key, api_secret, api_restriction_ips', 'length', 'max' => 150],
            ['api_key, api_secret', 'length', 'min' => 15],
            ['action', 'length', 'max' => 7],
            ['api_key', 'checksecret'],
        ];
        return $this->getExtraField($rules);
    }
    public function checksecret($attribute, $params)
    {
        if (preg_match('/ /', $this->api_key)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in api_key'));
        }
        if (preg_match('/ /', $this->api_secret)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in api_secret'));
        }

        if ($this->api_secret == $this->api_key) {
            $this->addError($attribute, Yii::t('zii', 'Key cannot be equal secret'));
        }

    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }
}
