<?php
/**
 * Acoes do modulo "CallShopCdr".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class CallShopCdrController extends Controller
{
    public $attributeOrder = 't.date DESC';
    public $select         = 't.id, t.price_min, t.sessionid, t.destination, t.status, buycost, price, calledstation,
                    t.date, sessiontime, cabina, (((t.price - t.buycost) / t.buycost) * 100) markup';

    public $config;

    public function init()
    {

        if (isset($_GET['filters'])) {
            $_GET['filter'] = $_GET['filters'];
        }

        if ( ! Yii::app()->session['id_user']) {
            exit;
        }

        $this->instanceModel = new CallShopCdr;
        $this->abstractModel = CallShopCdr::model();
        $this->titleReport   = Yii::t('zii', 'CallShop');
        parent::init();
    }

    public function applyFilterToLimitedAdmi2()
    {
        if (Yii::app()->session['user_type'] == 1 && Yii::app()->session['adminLimitUsers'] == true) {
            $this->relationFilter = [
                'idUser' => [
                    'condition' => "id_group IN (SELECT gug.id_group FROM pkg_group_user_group gug WHERE gug.id_group_user = :idgA0) ",
                ],
            ];
            $this->paramsFilter['idgA0'] = Yii::app()->session['id_group'];
        }
    }

    public function getSumPrice()
    {
        return $this->abstractModel->find([
            'select'    => "SUM(price) price",
            'join'      => $this->join,
            'condition' => $this->filter,
            'params'    => $this->paramsFilter,
        ]
        );
    }

    public function beforeReport($columns)
    {
        //gerar total a pagar no pdf

        $modelCallShop = $this->getSumPrice();

        $this->titleReport    = $this->config['global']['base_currency'] . ' ' . round($modelCallShop->price, 2);
        $this->subTitleReport = Yii::t('zii', 'Price SUM');

        $this->join          = '';
        $this->defaultFilter = 1;

        return $columns;
    }

    public function setAttributesModels($attributes, $models)
    {
        $modelCallShop = $this->getSumPrice();
        $pkCount       = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            $attributes[$i]['priceSum'] = round($modelCallShop->price, 2);
        }
        return $attributes;
    }
}
