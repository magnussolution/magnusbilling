<?php
/**
 * Acoes do modulo "Did".
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
 * 24/09/2012
 */

class GroupUserGroupController extends Controller
{
    public $attributeOrder = 't.id';
    public $config;
    public $nameModelRelated   = 'GroupUserGroup';
    public $nameFkRelated      = 'id_group_user';
    public $nameOtherFkRelated = 'id_group';

    public function init()
    {
        if (Yii::app()->session['user_type'] != 1) {
            exit;
        }
        $this->instanceModel        = new GroupUser;
        $this->abstractModel        = GroupUser::model();
        $this->abstractModelRelated = GroupUserGroup::model();
        $this->titleReport          = Yii::t('zii', 'GroupUserGroup');
        parent::init();
    }

    public function extraFilterCustom($filter)
    {
        $filter .= ' AND t.id_user_type = :d32d';
        $this->paramsFilter[':d32d'] = 1;

        return $filter;
    }

}
