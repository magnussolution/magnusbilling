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

class CallSummaryPerTrunkController extends Controller
{
    public $config;
    public $attributeOrder = 't.id_trunk DESC';
    public $extraValues    = ['idTrunk' => 'trunkcode'];
    public $join           = 'JOIN pkg_trunk c ON t.id_trunk = c.id';

    public $fieldsFkReport = [
        'id_trunk' => [
            'table'       => 'pkg_trunk',
            'pk'          => 'id',
            'fieldReport' => 'trunkcode',
        ],
    ];

    public function init()
    {

        $this->instanceModel = new CallSummaryPerTrunk;
        $this->abstractModel = CallSummaryPerTrunk::model();
        $this->titleReport   = Yii::t('zii', 'Summary per Trunk');
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (! Yii::app()->session['isAdmin']) {
            echo json_encode([
                $this->nameRoot  => [],
                $this->nameCount => 0,
                $this->nameSum   => [],
            ]);
            exit;
        }
        parent::actionRead();
    }

    public function recordsExtraSum($records = [])
    {
        foreach ($records as $key => $value) {
            $records[0]->sumsessiontime += $value['sessiontime'] / 60;
            $records[0]->sumsessionbill += $value['sessionbill'];
            $records[0]->sumbuycost += $value['buycost'];
            $records[0]->sumaloc_all_calls += $value['sessiontime'] / $value['nbcall'];
            $records[0]->sumnbcall += $value['nbcall'];
            $records[0]->sumnbcallfail += $value['nbcall_fail'];
        }

        $this->nameSum = 'sum';

        return $records;
    }

    public function getAttributesModels($models, $itemsExtras = [])
    {
        $attributes = false;
        foreach ($models as $key => $item) {
            $attributes[$key]                   = $item->attributes;
            $attributes[$key]['nbcall']         = $item->nbcall;
            $attributes[$key]['lucro']          = $item->sessionbill - $item->buycost;
            $attributes[$key]['sessiontime']    = $item->sessiontime / 60;
            $attributes[$key]['aloc_all_calls'] = $item->aloc_all_calls;
            $attributes[$key]['sumsessionbill'] = $item->sumsessionbill;
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

    public function actionCsv()
    {

        if (! AccessManager::getInstance($this->instanceModel->getModule())->canRead()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to read in module:" . $this->instanceModel->getModule());
        }

        if (! isset(Yii::app()->session['id_user'])) {
            $info = 'User try export CSV without login';
            MagnusLog::insertLOG(7, $info);
            exit;
        } else {
            $info = 'User try export CSV ' . $this->abstractModel->tableName();
            MagnusLog::insertLOG(7, $info);
        }

        $columns = json_decode($_GET['columns'], true);

        if (json_last_error() !== 0) {
            exit;
        }

        $columns = $this->repaceColumns($columns);

        $columns = $this->removeColumns($columns);

        $this->setLimit($_GET);

        $this->setStart($_GET);

        $this->setSort();

        $this->order = 't.id ASC';

        $this->setfilter($_GET);

        $this->applyFilterToLimitedAdmin();


        $this->convertRelationFilter();

        $sql = "SELECT SQL_CACHE c.trunkcode AS idTrunktrunkcode,  count(*) as nbcall,
            sum(buycost) AS buycost, sum(sessionbill) AS sessionbill FROM pkg_cdr t $this->join WHERE $this->filter GROUP BY id_trunk";
        $command = Yii::app()->db->createCommand($sql);
        if (count($this->paramsFilter)) {
            foreach ($this->paramsFilter as $key => $value) {
                $command->bindValue($key, $value, PDO::PARAM_STR);
            }
        }

        //create a file pointer
        $f = fopen('php://memory', 'w');

        foreach ($command->queryAll() as $key => $fields) {
            $fieldsCsv = [];
            foreach ($fields as $key => $value) {
                array_push($fieldsCsv, $value);
            }
            fputcsv($f, $fieldsCsv, ';');
        }

        fseek($f, 0);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $this->modelName . '_' . date('Y-m-d') . '.csv"');

        fpassthru($f);
    }
    public function actionExportCsvCalls()
    {

        if (! Yii::app()->session['isAdmin']) {
            exit;
        }

        $this->setfilter($_GET);

        $trunkcode = explode(' - ', $_GET['id'])[0];
        $this->filter .= ' AND trunkcode = :keytrunkcode';

        $this->paramsFilter[':keytrunkcode'] = $trunkcode;



        $this->convertRelationFilter();
        $this->filter = preg_replace('/\isAgent \= 0 AND| isAgent \= 1 AND/', '', $this->filter);
        $columns      = 'u.username,CONCAT(firstname, " ",lastname),starttime,calledstation,sessiontime,real_sessiontime,buycost,sessionbill,trunkcode ';
        $this->join   = 'JOIN pkg_user u ON t.id_user = u.id ';
        $this->join .= 'LEFT JOIN pkg_trunk r ON t.id_trunk = r.id ';
        $sql = "SELECT " . $columns . " FROM pkg_cdr t $this->join WHERE $this->filter";

        $command = Yii::app()->db->createCommand($sql);
        if (count($this->paramsFilter)) {
            foreach ($this->paramsFilter as $key => $value) {
                $command->bindValue($key, $value, PDO::PARAM_STR);
            }
        }

        //create a file pointer
        $f = fopen('php://memory', 'w');

        foreach ($command->queryAll() as $key => $fields) {
            $fieldsCsv = [];
            foreach ($fields as $key => $value) {
                array_push($fieldsCsv, $value);
            }
            fputcsv($f, $fieldsCsv, ';');
        }

        fseek($f, 0);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $this->modelName . '_' . date('Y-m-d') . '.csv"');

        fpassthru($f);
    }

    public function actionClear()
    {
        # recebe os parametros para o filtro
        if (isset($_POST['filter']) && strlen($_POST['filter']) > 5) {
            $filter = $_POST['filter'];
        } else {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Por favor realizar um filtro para reprocesar',
            ]);
            exit;
        }
        $filter = $filter ? $this->createCondition(json_decode($filter)) : '';

        $filter = preg_replace("/t\./", '', $filter);

        Trunk::model()->updateAll([
            'call_answered'  => 0,
            'call_total'     => 0,
            'secondusedreal' => 0,

        ], $filter, $this->paramsFilter);

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }
}
