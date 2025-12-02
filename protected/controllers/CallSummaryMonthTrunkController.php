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

class CallSummaryMonthTrunkController extends Controller
{
    public $attributeOrder = 'month DESC';

    public $extraValues = array('idTrunk' => 'trunkcode');
    public $join        = 'JOIN pkg_trunk c ON t.id_trunk = c.id';

    public $fieldsFkReport = array(
        'id_trunk' => array(
            'table'       => 'pkg_trunk',
            'pk'          => 'id',
            'fieldReport' => 'trunkcode',
        ),
    );

    public function init()
    {

        $this->instanceModel = new CallSummaryMonthTrunk;
        $this->abstractModel = CallSummaryMonthTrunk::model();
        $this->titleReport   = Yii::t('zii', 'Summary Month Trunk');
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
            $records[0]->sumsessionbill += $value['sessionbill'];
            $records[0]->sumbuycost += $value['buycost'];
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
            $attributes[$key]['aloc_all_calls']    = $item->aloc_all_calls;
            $attributes[$key]['lucro']             = $item->sessionbill - $item->buycost;
            $attributes[$key]['month']             = substr($item->month, 0, 4) . '-' . substr($item->month, 4);
            $attributes[$key]['sessiontime']       = $item->sessiontime / 60;
            $attributes[$key]['sumsessiontime']    = $item->sumsessiontime;
            $attributes[$key]['sumsessionbill']    = $item->sumsessionbill;
            $attributes[$key]['sumbuycost']        = $item->sumbuycost;
            $attributes[$key]['sumlucro']          = $item->sumsessionbill - $item->sumbuycost;
            $attributes[$key]['sumaloc_all_calls'] = $item->sumaloc_all_calls;
            $attributes[$key]['sumnbcall']         = $item->sumnbcall;

            if (isset(Yii::app()->session['isClient']) && Yii::app()->session['isClient']) {
                foreach ($this->fieldsInvisibleClient as $field) {
                    unset($attributes[$key][$field]);
                }
            }

            if (isset(Yii::app()->session['isAgent']) && Yii::app()->session['isAgent']) {
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
