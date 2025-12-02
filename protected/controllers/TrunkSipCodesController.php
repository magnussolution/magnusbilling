<?php
/**
 * Acoes do modulo "TrunkSipCodes".
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
 * 23/03/2021
 */

class TrunkSipCodesController extends Controller
{

    public $attributeOrder = 'ip, code';

    public function init()
    {
        $this->instanceModel = new TrunkSipCodes;
        $this->abstractModel = TrunkSipCodes::model();
        $this->titleReport   = Yii::t('zii', 'Trunk erros');

        parent::init();
    }

    public function setAttributesModels($attributes, $models)
    {

        $modelTrunkSipCodes = TrunkSipCodes::model()->findAll([
            'select' => 'ip, sum(total) total',
            'group'  => 'ip',
        ]);
        $total = [];
        foreach ($modelTrunkSipCodes as $key => $value) {
            $total[$value->ip] = $value['total'];
        }

        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {

            $attributes[$i]['percentage'] = number_format(($attributes[$i]['total'] / $total[$attributes[$i]['ip']]) * 100, 2) . '%';

        }

        return $attributes;
    }

}
