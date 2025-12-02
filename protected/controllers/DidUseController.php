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
 * 13/10/2012
 */

class DidUseController extends Controller
{
    public $attributeOrder = 'status DESC, DAY( reservationdate ) ASC';
    public $extraValues    = ['idDid' => 'did', 'idUser' => 'username'];

    public $fieldsInvisibleClient = [
        'id_user',
        'month_payed',
        'reminded',
        'idUserusername',
    ];
    public function init()
    {

        $this->instanceModel = new DidUse;
        $this->abstractModel = DidUse::model();
        $this->titleReport   = Yii::t('zii', 'DIDs Use');

        $sql = "UPDATE pkg_did_use SET next_due_date = date_add(`reservationdate`, interval`month_payed`month)";
        Yii::app()->db->createCommand($sql)->execute();
        $sql = "UPDATE pkg_did_use SET next_due_date = '' WHERE status = 0";
        Yii::app()->db->createCommand($sql)->execute();
        parent::init();
    }

}
