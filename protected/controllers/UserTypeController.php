<?php
/**
 * Actions of module "UserType".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class UserTypeController extends Controller
{
    public $attributeOrder = 't.id';

    public function init()
    {
        $this->instanceModel = new UserType;
        $this->abstractModel = UserType::model();
        parent::init();
    }
}
