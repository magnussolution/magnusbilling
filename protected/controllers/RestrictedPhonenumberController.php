<?php
/**
 * Acoes do modulo "RestrictedPhonenumber".
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

class RestrictedPhonenumberController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idUser' => 'username'];

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new RestrictedPhonenumber;
        $this->abstractModel = RestrictedPhonenumber::model();
        $this->titleReport   = Yii::t('zii', 'Config');
        parent::init();
    }

    public function importCsvSetAdditionalParams()
    {
        $values = $this->getAttributesRequest();
        return [['key' => 'id_user', 'value' => $values['id_user']]];
    }
}
