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
 * 19/09/2012
 */

class CalleridController extends Controller
{
    public $attributeOrder        = 't.id';
    public $extraValues           = ['idUser' => 'username'];
    public $fieldsInvisibleClient = [
        'tipo',
        'tmp',
        'idUserusername',
    ];

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new Callerid;
        $this->abstractModel = Callerid::model();
        $this->titleReport   = Yii::t('zii', 'CallerID');
        parent::init();
    }

    public function importCsvSetAdditionalParams()
    {
        $values = $this->getAttributesRequest();
        return [
            [
                'key'   => 'id_user',
                'value' => $values['id_user'],
            ], [
                'key'   => 'activated',
                'value' => 1,
            ],
        ];
    }

}
