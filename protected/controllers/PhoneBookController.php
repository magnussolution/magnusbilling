<?php
/**
 * Acoes do modulo "PhoneBook".
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

class PhoneBookController extends Controller
{
    public $attributeOrder      = 't.name ASC';
    public $extraValues         = ['idUser' => 'username'];
    public $filterByUser        = true;
    public $defaultFilterByUser = 'b.id_user';
    public $join                = 'JOIN pkg_user b ON t.id_user = b.id';

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];
    public $fieldsInvisibleClient = [
        'id_user',
        'idCardusername',
    ];

    public function init()
    {
        $this->instanceModel = new PhoneBook;
        $this->abstractModel = PhoneBook::model();
        $this->titleReport   = Yii::t('zii', 'Phonenumbers');

        parent::init();
    }

    public function extraFilterCustom($filter)
    {
        if (Yii::app()->session['user_type'] > 1 && $this->filterByUser) {
            $filter .= ' AND (' . $this->defaultFilterByUser . ' = :dfby';
            $filter .= ' OR t.id_user = :dfby)';
            $this->paramsFilter[':dfby'] = Yii::app()->session['id_user'];
        }
        return $filter;
    }

    public function actionRead($asJson = true, $condition = null)
    {
        $filter       = isset($_REQUEST['filter']) ? $_REQUEST['filter'] : null;
        $filter       = $this->createCondition(json_decode($filter));
        $this->filter =  ! preg_match("/status/", $filter) ? ' AND status = 1' : '';
        parent::actionRead($asJson = true, $condition = null);
    }

}
