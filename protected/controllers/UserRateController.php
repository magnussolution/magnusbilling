<?php
/**
 * Actions of module "User".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class UserRateController extends Controller
{
    public $attributeOrder = 't.id DESC';
    public $titleReport    = 'User Rate';
    public $subTitleReport = 'User Rate';

    public $extraValues = array('idUser' => 'username', 'idPrefix' => 'destination,prefix');

    public $fieldsFkReport = array(
        'id_user'   => array(
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ),
        'id_prefix' => array(
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ),
    );

    public function init()
    {
        $this->instanceModel = new UserRate;
        $this->abstractModel = UserRate::model();
        parent::init();
    }
}
