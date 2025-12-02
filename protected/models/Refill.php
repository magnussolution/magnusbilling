<?php

/**
 * Modelo para a tabela "pkg_ui_authen".
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

class Refill extends Model
{
    protected $_module = 'refill';
    public $sumCredit;
    public $sumCreditMonth;
    public $CreditMonth;
    /**
     * Retorna a classe estatica da model.
     * @return Admin classe estatica da model.
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
        return 'pkg_refill';
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
            ['payment', 'numerical', 'integerOnly' => true],
            ['credit', 'numerical', 'integerOnly' => false],
            ['description, invoice_number, image, date', 'length', 'max' => 500],

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
    public function beforeSave()
    {
        if ($this->getIsNewRecord()) {
            $modelUser         = User::model()->findByPk((int) $this->id_user);
            $creditOld         = $modelUser->credit;
            $this->description = $this->description . ', ' . Yii::t('zii', 'Old credit') . ' ' . round($creditOld, 2);
        }

        return parent::beforeSave();
    }

    public function getRefillChart($filter)
    {
        if (isset($filter) && $filter[0]->value == 'day') {
            $sql = "SELECT id, DATE_FORMAT( DATE,  '%Y-%m-%d' ) AS CreditMonth , SUM( credit ) AS sumCreditMonth
                    FROM pkg_refill WHERE 1 GROUP BY DATE_FORMAT( DATE,  '%Y%m%d' ) ORDER BY id DESC LIMIT 30";
        } else {
            $sql = "SELECT id, DATE_FORMAT( DATE,  '%Y-%m' ) AS CreditMonth , SUM(credit) AS sumCreditMonth
                    FROM pkg_refill WHERE 1 GROUP BY EXTRACT(YEAR_MONTH FROM date)  ORDER BY id DESC LIMIT 20 ";
        }
        return Yii::app()->db->createCommand($sql)->queryAll();
    }

    public function countRefill($code, $id_user)
    {
        return Refill::model()->count('description LIKE :key AND id_user = :key1', [':key' => '%' . $code . '%', ':key1' => (int) $id_user]);
    }
}
