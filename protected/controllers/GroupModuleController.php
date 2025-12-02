<?php
/**
 * Actions of module "GroupModule".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class GroupModuleController extends Controller
{
    public $titleReport    = 'GroupModule';
    public $subTitleReport = 'GroupModule';
    public $extraValues    = array('idGroup' => 'name', 'idModule' => 'text');
    public $filterByUser   = false;
    public $fieldsFkReport = array(
        'id_group'  => array(
            'table'       => 'group_user',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ),
        'id_module' => array(
            'table'       => 'module',
            'pk'          => 'id',
            'fieldReport' => 'text',
        ),
    );

    public function init()
    {
        $this->instanceModel = new GroupModule;
        $this->abstractModel = GroupModule::model();
        parent::init();
    }
}
