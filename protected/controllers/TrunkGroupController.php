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
 * 17/08/2012
 */

class TrunkGroupController extends Controller
{
    public $attributeOrder     = 't.name ASC';
    public $nameModelRelated   = 'TrunkGroupTrunk';
    public $nameFkRelated      = 'id_trunk_group';
    public $nameOtherFkRelated = 'id_trunk';

    public function init()
    {
        $this->instanceModel        = new TrunkGroup;
        $this->abstractModel        = TrunkGroup::model();
        $this->abstractModelRelated = TrunkGroupTrunk::model();
        $this->titleReport          = Yii::t('zii', 'Trunk Groups');

        parent::init();
    }

    public function afterSave($model, $values)
    {

        $weight = explode(',', $model->weight);

        $modelTrunkGroupTrunk = TrunkGroupTrunk::model()->findAll('id_trunk_group = :key', [':key' => $model->id]);

        for ($i = 0; $i < count($modelTrunkGroupTrunk); $i++) {

            $modelTrunkGroupTrunk[$i]->weight = isset($weight[$i]) && $weight[$i] > 0 ? intval($weight[$i]) : '1';
            $modelTrunkGroupTrunk[$i]->save();
        }
    }
    public function saveUpdateAll($ids, $values, $module, $namePk, $subRecords)
    {
        if (Yii::app()->session['isClient']) {
            # retorna o resultado da execucao
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Only admins can batch update this menu',
            ]);
            exit;
        }

        $values = $this->getAttributesRequest();

        $criteria = new CDbCriteria();
        $criteria->addInCondition($this->nameFkRelated, $ids);
        $this->success = $this->abstractModelRelated->deleteAll($criteria);

        foreach ($ids as $key => $id_trunk_group) {
            foreach ($values['id_trunk'] as $key => $value) {

                $model                 = new TrunkGroupTrunk;
                $model->id_trunk_group = $id_trunk_group;
                $model->id_trunk       = $value;

                $id_trunk_group . ' ' . $value;
                $this->success = $model->save();
            }
        }

        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameMsg     => 'Success',
        ]);
        exit;
    }

    public function beforeSave($values)
    {

        if (count($values['id_trunk']) > 17) {
            echo json_encode([
                'success' => false,
                'rows'    => [],
                'errors'  => 'Maximum trunks is 17',
            ]);
            exit;
        }

        return $values;
    }
}
