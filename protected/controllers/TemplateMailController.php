<?php
/**
 * Acoes do modulo "TemplateMail".
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
 * 10/08/2012
 * https://www.google.com/settings/security/lesssecureapps
 */

class TemplateMailController extends Controller
{
    public $attributeOrder = 't.language, t.mailtype';

    public function init()
    {

        $this->instanceModel = new TemplateMail;
        $this->abstractModel = TemplateMail::model();
        $this->titleReport   = Yii::t('zii', 'Emails');

        if (Yii::app()->session['isAdmin']) {
            $this->relationFilter['idUser'] = [
                'condition' => "idUser.id  = 1",
            ];

            parent::init();

        }

    }

    public function extraFilterCustomAgent($filter)
    {
        //se é agente filtrar pelo user.id_user

        $this->relationFilter['idUser'] = [
            'condition' => "idUser.id LIKE :agfby",
        ];

        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

}
