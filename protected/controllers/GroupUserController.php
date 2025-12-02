<?php

/**
 * Actions of module "GroupUser".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class GroupUserController extends Controller
{
    public $attributeOrder          = 't.id';
    public $titleReport             = 'GroupUser';
    public $subTitleReport          = 'GroupUser';
    public $nameModelRelated        = 'GroupModule';
    public $extraFieldsRelated      = ['show_menu', 'action', 'id_module', 'createShortCut', 'createQuickStart'];
    public $extraValuesOtherRelated = ['idModule' => 'text'];
    public $nameFkRelated           = 'id_group';
    public $nameOtherFkRelated      = 'id_module';
    public $extraValues             = ['idUserType' => 'name'];

    public $filterByUser = false;

    public function init()
    {
        $this->instanceModel        = new GroupUser;
        $this->abstractModel        = GroupUser::model();
        $this->abstractModelRelated = GroupModule::model();
        parent::init();
    }

    public function extraFilterCustomAdmin($filter)
    {

        $modelGroupUserGroup = GroupUserGroup::model()->find(
            'id_group_user = :key',
            [':key' => Yii::app()->session['id_group']]
        );

        if (isset($modelGroupUserGroup->id)) {
            $filter .= ' AND t.id IN (SELECT id_group FROM pkg_group_user_group WHERE id_group_user = ' . Yii::app()->session['id_group'] . ') ';
        }
        return $filter;
    }

    public function actionGetUserType()
    {
        $filter       = isset($_POST['filter']) ? $_POST['filter'] : null;
        $this->filter = $filter ? $this->createCondition(json_decode($filter)) : $this->defaultFilter;

        $modelGroupUser = $this->abstractModel->find([
            'condition' => $this->filter,
            'params'    => $this->paramsFilter,
        ]);

        echo json_encode([
            $this->nameRoot => isset($modelGroupUser->id_user_type) && $modelGroupUser->id_user_type == 1 ? true : false,
        ]);
    }

    public function actionIndex()
    {
        $filter       = isset($_POST['filter']) ? $_POST['filter'] : null;
        $this->filter = $filter ? $this->createCondition(json_decode($filter)) : $this->defaultFilter;
        //AND t.id_user_type = 2
        $modelGroupUser = $this->abstractModel->findAll([
            'condition' => $this->filter,
            'params'    => $this->paramsFilter,
        ]);
        $ids = [];

        foreach ($modelGroupUser as $value) {
            $ids[] = $value->id;
        }

        echo json_encode([
            $this->nameRoot => $ids,
        ]);
    }

    public function actionClone()
    {
        if (! Yii::app()->session['isAdmin']) {
            exit;
        }

        $success          = false;
        $this->msgSuccess = 'invalid group';
        if (isset($_POST['id'])) {
            $modelGroupUser = $this->abstractModel->findByPk((int) $_POST['id']);

            print_r($modelGroupUser->attributes);
            if (isset($modelGroupUser->id)) {
                $this->instanceModel->name         = $modelGroupUser->name . ' Cloned';
                $this->instanceModel->id_user_type = $modelGroupUser->id_user_type;
                $this->instanceModel->save();
                $newGroupId = $this->instanceModel->id;

                $modelGroupModule = $this->abstractModelRelated->findAll('id_group = :key', [':key' => $modelGroupUser->id]);
                foreach ($modelGroupModule as $groupModule) {
                    $modelGroupModuleNew             = new GroupModule();
                    $modelGroupModuleNew->attributes = $groupModule->getAttributes();
                    $modelGroupModuleNew->id_group   = $newGroupId;

                    try {
                        $success = $modelGroupModuleNew->save();
                        $this->msgSuccess = 'Success';
                    } catch (Exception $e) {
                        $this->msgSuccess = $this->getErrorMySql($e);
                    }
                }
            }

            if ($success) {
                $info = 'Group ' . $this->instanceModel->name;
                MagnusLog::insertLOG(4, $info);
            }
        }
        echo json_encode([
            $this->nameSuccess => $success,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }
}
