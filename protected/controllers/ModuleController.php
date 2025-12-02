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
 * 17/05/2017
 */

class ModuleController extends Controller
{
    public $defaultSort    = null;
    public $defaultSortDir = null;
    public $fixedWhere     = null;
    public $extraValues    = ['idModule' => 'text'];

    public $attributeOrder = 't.id_module ASC, priority ASC';
    public $titleReport    = 'Module';
    public $subTitleReport = 'Module';
    public $rendererReport = [
        'id_module' => 'idModuletext',
    ];

    public function init()
    {
        $this->instanceModel = new Module;
        $this->abstractModel = Module::model();
        parent::init();
    }

    public function actionReadTree()
    {

        $res            = $this->actionRead(false);
        $modules        = $res['rows'];
        $result['rows'] = $this->getModuleTree($modules);
        echo CCJSON::encode($result);
    }

    private function getModuleTree($modules)
    {
        $result = [];

        foreach ($modules as $model) {

            if (empty($model['id_module'])) {
                $childs = $this->getSubModuleTree($modules, $model['id']);

                array_push($result, [
                    'id'        => $model['id'],
                    'text'      => $model['text'],
                    'iconCls'   => $model['icon_cls'],
                    'id_module' => $model['id_module'],
                    'rows'      => $childs,
                    'checked'   => false,
                    'expanded'  => $model['id'] == 1 ? true : false,
                    'leaf'      =>  ! count($childs),
                ]);
            }
        }

        return $result;
    }

    private function getSubModuleTree($modules, $idOwner)
    {
        $subModulesOwner = Util::arrayFindByProperty($modules, 'id_module', $idOwner);
        $result          = [];

        foreach ($subModulesOwner as $model) {
            if (! empty($model['id_module'])) {
                array_push($result, [
                    'id'        => $model['id'],
                    'text'      => $model['text'],
                    'iconCls'   => $model['icon_cls'],
                    'id_module' => $model['id_module'],
                    'module'    => $model['module'],
                    'checked'   => false,
                    'leaf'      => true,
                ]);
            } else {
                array_push($result, [
                    'id'        => $model['id'],
                    'text'      => $model['text'],
                    'iconCls'   => $model['icon_cls'],
                    'id_module' => $model['id_module'],
                    'rows'      => $this->getSubModuleTree($modules, $model['id']),
                    'checked'   => false,
                    'expanded'  => true,
                ]);
            }
        }

        return $result;
    }

    public function beforeSave($values)
    {

        if (isset($values['text'])) {

            $modelModel = Module::model()->findByPk((int) $values['id']);

            if ($modelModel->id_module == null) {
                $values['text'] = preg_replace('/^Menu |^Menú | Module/', '', $values['text']);
                $values['text'] = $values['text'] . ' Module';
            }
            if (substr($values['text'], 0, 3) != "t('") {
                $values['text'] = 't(\'' . $values['text'] . '\')';
            }
        }

        return $values;
    }

    public function setAttributesModels($attributes, $models)
    {

        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            if ($attributes[$i]['id_module'] < 1) {
                $attributes[$i]['text'] = preg_replace('/ Module\'\)/', '\')', $attributes[$i]['text']);
            } else {
                $attributes[$i]['idModuletext'] = preg_replace('/ Module\'\)/', '\')', $attributes[$i]['idModuletext']);
            }
        }

        return $attributes;
    }
}
