<?php
/**
 * Acoes do modulo "Campaign".
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
 * 28/10/2012
 */

class OfferController extends Controller
{
    public $attributeOrder = 't.id';
    public $filterByUser   = false;
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
        $this->instanceModel = new Offer;
        $this->abstractModel = Offer::model();
        $this->titleReport   = Yii::t('zii', 'Offer');
        if (Yii::app()->session['isAdmin']) {
            $this->defaultFilter = '(t.id_user < 2 || t.id_user IS NULL)';
        }
        parent::init();
    }

    public function extraFilterCustomAgent($filter)
    {
        $filter                       = 't.id_user = :agfby';
        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }
    public function beforeSave($values)
    {
        if (Yii::app()->session['isAgent']) {
            $values['id_user'] = Yii::app()->session['id_user'];
        }
        return $values;
    }

}
