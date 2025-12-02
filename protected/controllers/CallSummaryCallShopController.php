<?php
/**
 * Acoes do modulo "CallSummaryCallShop".
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
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */

class CallSummaryCallShopController extends Controller
{
    public $attributeOrder = 'day DESC';
    public $extraValues    = array('idUser' => 'username');
    public $limit          = 7;
    public $group          = 'day';
    public $select         = 't.id, t.id_user, DATE(date) AS day, date as starttime, cabina,
            sum(sessiontime) AS sessiontime,
            sum(price) AS price,
            count(*) as nbcall,
            sum(buycost) AS buycost,
            sum(price) - sum(buycost) AS lucro';

    public $fieldsInvisibleClient = array(
        'id',
        'id_user_package_offer',
        'id_did',
        'id_prefix',
        'real_sessiontime',
        'root_cost',
        'sipiax',
        'src',
        'markup',
        'calledstation',
        'idUserusername',
        'id_user',
        'sumasr',
    );

    public $fieldsInvisibleAgent = array(
        'uniqueid',
        'id',
        'id_user_package_offer',
        'id_did',
        'id_prefix',
        'real_sessiontime',
        'root_cost',
        'sipiax',
        'src',
        'markup',
        'buycost',
        'calledstation',
        'idUserusername',
        'id_user',
        'sumlucro',
        'sumbuycost',
        'sumasr',
        'asr',
    );

    public function init()
    {
        $this->instanceModel = new CallSummaryCallShop;
        $this->abstractModel = CallSummaryCallShop::model();
        $this->titleReport   = Yii::t('zii', 'Summary per Day');

        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        # recebe os parametros para o filtro
        $filter = isset($_GET['filter']) ? $_GET['filter'] : null;
        $filter = $filter ? $this->createCondition(json_decode($filter)) : $this->defaultFilter;

        $limit = strlen($filter) > 2 && preg_match("/date/", $filter) ? $_GET[$this->nameParamLimit] : $this->limit;

        //nao permite mais de 31 registros
        $limit                       = $limit > 31 ? $limit                       = 31 : $limit;
        $_GET[$this->nameParamLimit] = $limit;

        parent::actionRead($asJson = true, $condition = null);

    }
    public function recordsExtraSum($records = array())
    {
        foreach ($records as $key => $value) {
            $records[0]->sumsessiontime += $value['sessiontime'] / 60;
            $records[0]->sumprice += $value['price'];
            $records[0]->sumbuycost += $value['buycost'];

            $records[0]->sumlucro += $value['price'] - $value['buycost'];
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
            $attributes[$key]['day']               = $item->day;
            $attributes[$key]['lucro']             = $item->lucro;
            $attributes[$key]['sessiontime']       = $item->sessiontime / 60;
            $attributes[$key]['aloc_all_calls']    = $item->aloc_all_calls;
            $attributes[$key]['sumsessiontime']    = $item->sumsessiontime;
            $attributes[$key]['sumprice']          = $item->sumprice;
            $attributes[$key]['sumbuycost']        = $item->sumbuycost;
            $attributes[$key]['sumlucro']          = $item->sumlucro;
            $attributes[$key]['sumaloc_all_calls'] = $item->sumaloc_all_calls;
            $attributes[$key]['sumnbcall']         = $item->sumnbcall;
            $attributes[$key]['sumasr']            = $item->sumasr;

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
