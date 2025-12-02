<?php

/**
 * Acoes do modulo "Call".
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

class ServicesController extends Controller
{
    public $attributeOrder = 't.id';

    public $nameModelRelated        = 'ServicesModule';
    public $extraFieldsRelated      = ['show_menu', 'action', 'id_module', 'createShortCut', 'createQuickStart'];
    public $extraValuesOtherRelated = ['idModule' => 'text'];
    public $nameFkRelated           = 'id_services';
    public $nameOtherFkRelated      = 'id_module';

    public function init()
    {
        $this->instanceModel        = new Services;
        $this->abstractModel        = Services::model();
        $this->titleReport          = Yii::t('zii', 'Services');
        $this->abstractModelRelated = ServicesModule::model();
        parent::init();
    }

    public function extraFilterCustom($filter)
    {
        if (Yii::app()->session['user_type'] == 2) {
            $filter .= ' AND id_user = :dfby';
            $this->paramsFilter[':dfby'] = Yii::app()->session['id_user'];
            $this->paramsFilter[':dfby1'] = Yii::app()->session['id_plan'];
        } else if (Yii::app()->session['user_type'] == 3) {
            $filter .= " AND id IN (SELECT id_services FROM pkg_services_plan WHERE id_plan = :dfby1)";
            $this->paramsFilter[':dfby1'] = Yii::app()->session['id_plan'];
        }



        return $filter;
    }
}
