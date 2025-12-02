<?php
/**
 * Acoes do modulo "Rate".
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
 * 30/07/2012
 */

class RateCallshopController extends Controller
{
    public $attributeOrder = 't.id';

    public function init()
    {
        $this->instanceModel = new RateCallshop;
        $this->abstractModel = RateCallshop::model();
        $this->titleReport   = Yii::t('zii', 'Rates') . ' ' . Yii::t('zii', 'CallShop');
        parent::init();
    }

    public function actionSave()
    {
        $values = $this->getAttributesRequest();
        if (Yii::app()->session['isAdmin'] && (isset($values['id']) && $values['id'] == 0)) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => $this->msgError,
            ]);
            exit;
        }
        parent::actionSave();
    }

    public function extraFilterCustomClient($filter)
    {

        //se for cliente filtrar pelo pkg_user.id
        $filter .= ' AND id_user = :clfby';
        $this->paramsFilter[':clfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function importCsvSetAdditionalParams()
    {
        $values = $this->getAttributesRequest();
        return [['key' => 'id_user', 'value' => Yii::app()->session['id_user']]];
    }
}
