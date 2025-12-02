<?php
/**
 * Acoes do modulo "Plan".
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
 * 27/07/2012
 */

class PlanController extends Controller
{
    public $attributeOrder = 't.name';
    public $extraValues    = ['idUser' => 'username'];

    public $nameModelRelated   = 'ServicesPlan';
    public $nameFkRelated      = 'id_plan';
    public $nameOtherFkRelated = 'id_services';

    public function init()
    {
        $this->instanceModel = new Plan;
        $this->abstractModel = Plan::model();
        $this->titleReport   = Yii::t('zii', 'Plan');

        $this->abstractModelRelated = ServicesPlan::model();
        if (Yii::app()->session['isAdmin']) {
            $this->defaultFilter = 't.id_user = 1';
        }
        parent::init();
    }

    public function beforeSave($values)
    {

        if (Yii::app()->session['user_type'] == 2) {
            $values['id_user'] = Yii::app()->session['id_user'];
        } else {
            $values['id_user'] = 1;
        }

        return $values;
    }

    public function afterSave($model, $values)
    {

        if ($this->isNewRecord && Yii::app()->session['isAgent']) {
            //Create rates of Reseller
            RateAgent::model()->createAgentRates($model, Yii::app()->session['id_plan']);
        }
        if (isset($model->id)) {

            if ($model->portabilidadeMobile == 1) {

                $this->importPortabilidade($model->id, 'mobile');
            }
            if ($model->portabilidadeFixed == 1) {

                $this->importPortabilidade($model->id, 'fixed');
            }
        }

        return;
    }

    public function importPortabilidade($idPlan, $type)
    {
        if ($type == 'mobile') {
            $filter_name  = 'Celular';
            $filterPrefix = '11113';
        } else {
            $filter_name  = 'Fixo';
            $filterPrefix = '11111';
        }
        $filter = "id_plan = $idPlan AND t.status = 1 AND id_prefix IN (SELECT id FROM pkg_prefix WHERE prefix LIKE '" . $filterPrefix . "%')";

        $modelRate = Rate::model()->findAll($filter);

        if ( ! isset($modelRate[0]->id)) {
            $url = "https://www.magnusbilling.com/download/cod_operadora.csv";
            if ( ! $file = @file_get_contents($url, false)) {
                return;
            }

            $file    = explode("\n", $file);
            $prefixs = [];

            //adiciona o codigo para qualquer operarado
            $file[] = preg_replace("/1111/", '55', $filterPrefix) . ",Brasil $filter_name Outras Operadoras";

            $rates = [];

            $price            = '0.1000';
            $initblock        = 30;
            $billingblock     = 6;
            $buyrateinitblock = 30;
            $buyrateincrement = 6;

            $modelTrunkGroup = TrunkGroup::model()->find("id > 0");

            foreach ($file as $key => $value) {

                $collum = explode(',', $value);

                $prefix      = '1111' . substr($collum[0], 2);
                $destination = trim($collum[1]);

                if ( ! strlen($destination)) {
                    continue;
                }
                if (preg_match("/$filter_name/", $destination)) {

                    $modelPrefix = Prefix::model()->find("prefix = '" . $prefix . "'");

                    if (isset($modelPrefix->id)) {
                        if ($modelPrefix->destination != $destination) {
                            $modelPrefix->destination = $destination;
                            $modelPrefix->save();
                        }
                    } else {
                        $prefixs[] = "($prefix, '$destination')";
                    }

                }
            }
            Prefix::model()->insertPrefixs($prefixs);

            foreach ($file as $key => $value) {
                $collum      = explode(',', $value);
                $prefix      = '1111' . substr($collum[0], 2);
                $destination = trim($collum[1]);
                if (preg_match("/$filter_name/", $destination)) {

                    $rates[] = "((SELECT id FROM pkg_prefix WHERE prefix = '$prefix' LIMIT 1), $idPlan, $price, " . $modelTrunkGroup->id . ",
                                $initblock, $billingblock, 1)";
                }
            }
            Rate::model()->insertPortabilidadeRates($rates);
        }
    }

    public function extraFilterCustomAgent($filter)
    {
        $filter .= ' AND t.id_user = :clfby';
        $this->paramsFilter[':clfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (Yii::app()->session['isAdmin']) {
            $this->filter = ' AND id_user = 1';
        }

        parent::actionRead($asJson = true, $condition = null);
    }

    public function getAttributesRequest()
    {
        $arrPost = array_key_exists($this->nameRoot, $_POST) ? json_decode($_POST[$this->nameRoot], true) : $_POST;

        /*permite salvar quando tem audio e extrafield*/
        $id_service = [];
        foreach ($arrPost as $key => $value) {
            if ($key == 'id_services_array') {
                if (isset($_POST['id_services_array']) && strlen($value) > 0) {
                    $arrPost['id_services'] = explode(",", $_POST['id_services_array']);
                }

            }
        }

        return $arrPost;
    }

}
