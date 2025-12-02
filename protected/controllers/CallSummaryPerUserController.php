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

class CallSummaryPerUserController extends Controller
{
    public $config;
    public $attributeOrder = 't.id_user DESC';
    public $extraValues    = array('idUser' => 'username');
    public $join           = 'JOIN pkg_user c ON t.id_user = c.id';
    public $fieldsFkReport = array(
        'id_user' => array(
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ),
    );

    public $fieldsInvisibleClient = array(
        'buycost',
        'sumbuycost',
    );

    public $fieldsInvisibleAgent = array(
        'buycost',
        'sumbuycost',
    );

    public function init()
    {
        if (Yii::app()->session['isAdmin'] == true) {
            $this->defaultFilter = 'isAgent = 0';
        } elseif (Yii::app()->session['isAgent'] == true) {
            $this->defaultFilter = 'isAgent = 1';
        }
        $this->instanceModel = new CallSummaryPerUser;
        $this->abstractModel = CallSummaryPerUser::model();
        $this->titleReport   = Yii::t('zii', 'Summary Day User');
        parent::init();
    }

    public function recordsExtraSum($records = array())
    {
        foreach ($records as $key => $value) {
            $records[0]->sumsessiontime += $value['sessiontime'] / 60;
            $records[0]->sumsessionbill += $value['sessionbill'];
            $records[0]->sumagent_bill += $value['agent_bill'];
            $records[0]->sumbuycost += $value['buycost'];
            $records[0]->sumaloc_all_calls += $value['sessiontime'] / $value['nbcall'];
            $records[0]->sumnbcall += $value['nbcall'];
            $records[0]->sumnbcallfail += $value['nbcall_fail'];
        }

        $this->nameSum = 'sum';

        return $records;
    }

    public function getAttributesModels($models, $itemsExtras = array())
    {
        $attributes = false;
        foreach ($models as $key => $item) {
            $attributes[$key]                   = $item->attributes;
            $attributes[$key]['nbcall']         = $item->nbcall;
            $attributes[$key]['sessiontime']    = $item->sessiontime / 60;
            $attributes[$key]['aloc_all_calls'] = $item->aloc_all_calls;
            $attributes[$key]['sumsessionbill'] = $item->sumsessionbill;
            $attributes[$key]['sumagent_bill']  = $item->sumagent_bill;
            $attributes[$key]['sumbuycost']     = $item->sumbuycost;
            $attributes[$key]['sumlucro']       = $item->sumsessionbill - $item->sumbuycost;
            $attributes[$key]['sumnbcall']      = $item->sumnbcall;
            $attributes[$key]['sumsessiontime'] = $item->sumsessiontime;
            $attributes[$key]['sumnbcallfail']  = $item->sumnbcallfail;
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

    public function actionExportCsvCalls()
    {

        if (!Yii::app()->session['isAdmin']) {
            exit;
        }

        $this->setfilter($_GET);

        $this->filter .= ' AND username = :keyusername';

        $this->paramsFilter[':keyusername'] = $_GET['id'];

        $this->convertRelationFilter();
        $this->filter = preg_replace('/\isAgent \= 0 AND| isAgent \= 1 AND/', '', $this->filter);
        $columns      = 'u.username,CONCAT(firstname, " ",lastname),starttime,calledstation,sessiontime,real_sessiontime,buycost,sessionbill,trunkcode ';
        $this->join   = 'JOIN pkg_user u ON t.id_user = u.id ';
        $this->join .= 'LEFT JOIN pkg_trunk r ON t.id_trunk = r.id ';
        $sql = "SELECT " . $columns . " FROM pkg_cdr t $this->join WHERE $this->filter";

        $command = Yii::app()->db->createCommand($sql);

        foreach ($this->paramsFilter as $key => $value) {
            $command->bindValue($key, $value, PDO::PARAM_STR);
        }

        //create a file pointer
        $f = fopen('php://memory', 'w');

        foreach ($command->queryAll() as $key => $fields) {
            $fieldsCsv = array();
            foreach ($fields as $key => $value) {
                array_push($fieldsCsv, $value);
            }
            fputcsv($f, $fieldsCsv, ';');
        }

        fseek($f, 0);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . Yii::t('zii', 'Summary Day User') . '_' . date('Y-m-d') . '.csv"');

        fpassthru($f);
    }
}
