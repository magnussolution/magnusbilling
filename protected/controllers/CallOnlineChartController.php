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

class CallOnlineChartController extends Controller
{

    public function init()
    {
        if ( ! Yii::app()->session['id_user']) {
            die("Access denied to save in module: CallOnlineChart");
            exit;
        }

        $this->instanceModel = new CallOnlineChart;
        $this->abstractModel = CallOnlineChart::model();
        $this->titleReport   = Yii::t('zii', 'CallOnlineChart');
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        $filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : null;

        $hours = isset($filter[0]) ? $filter[0]->value : 1;

        $filter = 'date >= date_sub(NOW(), interval ' . $hours . ' hour)';

        $dateFormat = 'DATE_FORMAT( date, \'%D %H:%i\' ) date';
        $select     = 'id, ' . $dateFormat . ', MAX(total) total, MAX(answer) answer';

        if ($hours == 6) {
            $group = "UNIX_TIMESTAMP(date) DIV 120";
        } elseif ($hours == 12) {
            $group = "UNIX_TIMESTAMP(date) DIV 180";
        } elseif ($hours == 24) {
            $group = "UNIX_TIMESTAMP(date) DIV 300";
        } elseif ($hours == 48) {
            $group = "UNIX_TIMESTAMP(date) DIV 600";
        } elseif ($hours == 72) {
            $group = "UNIX_TIMESTAMP(date) DIV 900";
        } else if ($hours > 12) {
            $group = "UNIX_TIMESTAMP(date) DIV 720";
        } else {
            $dateFormat = 'DATE_FORMAT( date, \'%H:%i\' ) date';
            $select     = 'id, ' . $dateFormat . ', total, answer';
            $group      = 1;
        }

        $modelCallOnlineChart = CallOnlineChart::model()->findAll([
            'select'    => $select,
            'order'     => 'id DESC',
            'group'     => $group,
            'condition' => $filter,
        ]);

        # envia o json requisitado
        echo json_encode([
            $this->nameRoot  => $this->getAttributesModels($modelCallOnlineChart, $this->extraValues),
            $this->nameCount => 0,
        ]);

    }

}
