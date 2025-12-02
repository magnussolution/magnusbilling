<?php
/**
 * Acoes do modulo "Call".
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
 * 17/08/2012
 */

class CallSummaryPerMonthController extends Controller
{
    public $attributeOrder = 'month DESC';

    public function init()
    {
        $this->instanceModel = new CallSummaryPerMonth;
        $this->abstractModel = CallSummaryPerMonth::model();
        $this->titleReport   = Yii::t('zii', 'Summary per Month');

        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (!Yii::app()->session['isAdmin']) {
            echo json_encode(array(
                $this->nameRoot  => [],
                $this->nameCount => 0,
                $this->nameSum   => [],
            ));
            exit;
        }
        parent::actionRead();
    }

    public function recordsExtraSum($records = array())
    {
        foreach ($records as $key => $value) {
            $records[0]->sumsessiontime += $value['sessiontime'] / 60;
            $records[0]->sumsessionbill += Yii::app()->session['isAgent'] ? $value['agent_bill'] : $value['sessionbill'];
            $records[0]->sumbuycost += Yii::app()->session['isAgent'] ? $value['sessionbill'] : $value['buycost'];
            $records[0]->sumlucro += $value['sessionbill'] - $value['buycost'];
            $records[0]->sumaloc_all_calls += $value['sessiontime'] / $value['nbcall'];
            $records[0]->sumnbcall += $value['nbcall'];
        }

        $this->nameSum = 'sum';

        return $records;
    }

    public function getAttributesModels($models, $itemsExtras = array())
    {
        $attributes = false;
        foreach ($models as $key => $item) {
            $attributes[$key]                      = $item->attributes;
            $attributes[$key]['nbcall']            = $item->nbcall;
            $attributes[$key]['lucro']             = $item->sessionbill - $item->buycost;
            $attributes[$key]['aloc_all_calls']    = $item->aloc_all_calls;
            $attributes[$key]['sessiontime']       = $item->sessiontime / 60;
            $attributes[$key]['month']             = substr($item->month, 0, 4) . '-' . substr($item->month, 4);
            $attributes[$key]['sumsessiontime']    = $item->sumsessiontime;
            $attributes[$key]['sumsessionbill']    = $item->sumsessionbill;
            $attributes[$key]['sumbuycost']        = $item->sumbuycost;
            $attributes[$key]['sumlucro']          = $item->sumsessionbill - $item->sumbuycost;
            $attributes[$key]['sumaloc_all_calls'] = $item->sumaloc_all_calls;
            $attributes[$key]['sumnbcall']         = $item->sumnbcall;

            if (isset(Yii::app()->session['idClient']) && Yii::app()->session['idClient']) {
                foreach ($this->fieldsInvisibleClient as $field) {
                    unset($attributes[$key][$field]);
                }
            }

            if (isset(Yii::app()->session['idAgent']) && Yii::app()->session['idAgent']) {
                foreach ($this->fieldsInvisibleAgent as $field) {
                    unset($attributes[$key][$field]);
                }
            }

            foreach ($itemsExtras as $relation => $fields) {
                $arrFields = explode(',', $fields);
                foreach ($arrFields as $field) {
                    $attributes[$key][$relation . $field] = $item->$relation->$field;
                    if (Yii::app()->session['idClient']) {
                        foreach ($this->fieldsInvisibleClient as $field) {
                            unset($attributes[$key][$field]);
                        }
                    }

                    if (Yii::app()->session['idAgent']) {
                        foreach ($this->fieldsInvisibleAgent as $field) {
                            unset($attributes[$key][$field]);
                        }
                    }
                }
            }
        }

        return $attributes;
    }

}
