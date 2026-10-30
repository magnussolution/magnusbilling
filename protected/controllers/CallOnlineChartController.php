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
            $this->sendError('Access denied for module "{module}".', ['{module}' => 'CallOnlineChart']);
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

        $hoursValue = isset($filter[0]) && isset($filter[0]->value) ? $filter[0]->value : 1;
        $isPositiveInteger = is_int($hoursValue)
            || (is_string($hoursValue) && preg_match('/^[1-9][0-9]*$/D', $hoursValue));
        $hours = $isPositiveInteger
            ? filter_var($hoursValue, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])
            : false;

        if ($hours === false) {
            header('HTTP/1.0 400 Bad Request');
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Invalid hours filter',
            ]);
            return;
        }

        $filter = 't.date >= date_sub(NOW(), interval :hours hour)';

        $dateFormat = 'DATE_FORMAT( t.date, \'%D %H:%i\' ) date';
        $select     = 'MAX(t.id) id, ' . $dateFormat . ', MAX(t.total) total, MAX(t.answer) answer, MAX(status.cps) cps';

        if ($hours == 6) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 120";
        } elseif ($hours == 12) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 180";
        } elseif ($hours == 24) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 300";
        } elseif ($hours == 48) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 600";
        } elseif ($hours == 72) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 900";
        } else if ($hours > 12) {
            $group = "UNIX_TIMESTAMP(t.date) DIV 720";
        } else {
            $dateFormat = 'DATE_FORMAT( t.date, \'%H:%i\' ) date';
            $select     = 't.id, ' . $dateFormat . ', t.total, t.answer, status.cps';
            $group      = 1;
        }

        $modelCallOnlineChart = CallOnlineChart::model()->findAll([
            'select'    => $select,
            'join'      => 'LEFT JOIN pkg_status_system status ON status.date = t.date',
            'order'     => 'id DESC',
            'group'     => $group,
            'condition' => $filter,
            'params'    => [':hours' => $hours],
        ]);

        $rows = $this->getAttributesModels($modelCallOnlineChart, $this->extraValues);
        foreach ($modelCallOnlineChart as $index => $point) {
            $rows[$index]['cps'] = $point->cps === null ? null : (int) $point->cps;
        }

        # envia o json requisitado
        echo json_encode([
            $this->nameRoot  => $rows,
            $this->nameCount => 0,
        ]);

    }

}
