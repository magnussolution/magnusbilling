<?php
/**
 * Acoes do modulo "Alarm".
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
 * 03/01/2021
 */

class AlarmController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idPlan' => 'name'];

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_plan',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new Alarm;
        $this->abstractModel = Alarm::model();
        $this->titleReport   = Yii::t('zii', 'Alarm');
        parent::init();
    }
}
