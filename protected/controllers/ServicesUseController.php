<?php
/**
 * Acoes do modulo "DidUse".
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
 * 13/10/2017
 */

class ServicesUseController extends Controller
{
    public $attributeOrder = 'status DESC, DAY( reservationdate ) DESC';
    public $extraValues    = ['idServices' => 'name,price,type', 'idUser' => 'username'];

    public $fieldsInvisibleClient = [
        'id_user',
        'reminded',
        'idUserusername',
    ];
    public function init()
    {
        $this->instanceModel = new ServicesUse;
        $this->abstractModel = ServicesUse::model();
        $this->titleReport   = Yii::t('zii', 'Services Use');

        $sql = "UPDATE pkg_services_use SET next_due_date = date_add(`reservationdate`, interval`month_payed`month)";
        Yii::app()->db->createCommand($sql)->execute();
        $sql = "UPDATE pkg_services_use SET next_due_date = '' WHERE status = 0";
        Yii::app()->db->createCommand($sql)->execute();

        parent::init();
    }

    public function actionCancelService()
    {
        ServicesProcess::release((int) $_REQUEST['id']);
    }

}
