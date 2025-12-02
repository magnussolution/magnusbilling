<?php
/**
 * Acoes do modulo "WHMCS".
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
 * 23/06/2012
 */

class WHMCSController extends Controller
{

    public $attributeOrder = 'id';
    public $extraValues    = ['idUser' => 'username'];
    public function init()
    {
        $this->instanceModel = new WHMCS;
        $this->abstractModel = WHMCS::model();
        $this->titleReport   = Yii::t('zii', 'WHMCS');

        parent::init();
    }
}
