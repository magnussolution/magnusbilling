<?php
/**
 * Acoes do modulo "Refillprovider".
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
 * 18/07/2012
 */

class RefillproviderController extends Controller
{
    public $attributeOrder = 'id';
    public $extraValues    = ['idProvider' => 'provider_name'];
    public $filterByUser   = false;
    public $fieldsFkReport = [
        'id_provider' => [
            'table'       => 'pkg_provider',
            'pk'          => 'id',
            'fieldReport' => 'provider_name',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new Refillprovider;
        $this->abstractModel = Refillprovider::model();
        $this->titleReport   = Yii::t('zii', 'Refill Providers');

        parent::init();
    }

    public function afterSave($model, $values)
    {
        if ($this->isNewRecord) {
            $resultProvider     = Provider::model()->findByPk((int) $model->id_provider);
            $creditOld          = $resultProvider->credit;
            $model->description = $model->description . ', ' . Yii::t('zii', 'Old credit') . ' ' . round($creditOld, 2);

            //add credit
            $resultProvider->credit = $model->credit > 0 ? $resultProvider->credit + $model->credit : $resultProvider->credit - ($model->credit * -1);
            $resultProvider->saveAttributes(['credit' => $resultProvider->credit]);

        }
        return;
    }

}
