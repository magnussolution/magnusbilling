<?php
/**
 * Acoes do modulo "CallOnLine".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class StatusSystemController extends Controller
{
    public $attributeOrder = 't.id DESC';

    public function init()
    {
        $this->instanceModel = new StatusSystem;
        $this->abstractModel = StatusSystem::model();
        $this->titleReport   = Yii::t('zii', 'Status system');
        parent::init();

        if (!Yii::app()->session['isAdmin']) {
            $this->extraValues = array(
                'idUser'   => 'username',
                'idPlan'   => 'name',
                'idPrefix' => 'destination',
            );
        }
    }

    public function setAttributesModels($attributes, $models)
    {

        $attributes[0]['totalActiveUsers'] = User::model()->count('active = 1');
        $modelCallSummaryPerMonth          = CallSummaryPerMonth::model()->find('month = :key', [':key' => date('Ym')]);

        $attributes[0]['monthprofit'] = isset($modelCallSummaryPerMonth->lucro) ? number_format($modelCallSummaryPerMonth->lucro, 2) : 0;

        $modelCallOnlineChart = CallOnlineChart::model()->find([
            'condition' => 'date > :key',
            'params'    => [':key' => date('Y-m-d')],
            'order'     => 'total DESC',
        ]);

        $totalCPS = StatusSystem::model()->find([
            'condition' => 'date > :key',
            'params'    => [':key' => date('Y-m-d 00:00:00')],
            'order'     => 'cps DESC',
        ]);

        $attributes[0]['maximumcc'] = isset($modelCallOnlineChart->total) ? 'CC ' . $modelCallOnlineChart->total . ' | CPS ' . $totalCPS->cps : 'CC 0 | CPS ' . $totalCPS->cps;

        $modelRefill = Refill::model()->find([
            'select'    => 'sum(credit) as credit',
            'condition' => 'date > :key',
            'params'    => [':key' => date('Y-m') . '-01'],
        ]);
        $attributes[0]['monthRefill'] = isset($modelRefill->credit) ? number_format($modelRefill->credit, 2) : 0;

        return $attributes;
    }
}
