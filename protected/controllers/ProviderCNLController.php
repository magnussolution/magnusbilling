<?php
/**
 * Acoes do modulo "ProviderCNL".
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
 * 23/06/2022
 */

class ProviderCNLController extends Controller
{
    public $attributeOrder = 'id';
    public $filterByUser   = false;
    public $extraValues    = ['idProvider' => 'provider_name'];

    public $fieldsFkReport = [
        'id_provider' => [
            'table'       => 'pkg_provider',
            'pk'          => 'id',
            'fieldReport' => 'provider_name',
        ],
    ];
    public function init()
    {
        $this->instanceModel = new ProviderCNL;
        $this->abstractModel = ProviderCNL::model();
        $this->titleReport   = Yii::t('zii', 'Provider CNL');
        parent::init();
    }

    public function importCsvSetAdditionalParams()
    {
        $values = $this->getAttributesRequest();
        return [['key' => 'id_provider', 'value' => $values['id_provider']]];
    }
}
