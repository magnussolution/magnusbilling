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
 * 17/08/2012
 */

class CallController extends Controller
{
    public $attributeOrder = 't.id DESC';
    public $extraValues    = [
        'idUser'     => 'username',
        'idPlan'     => 'name',
        'idTrunk'    => 'trunkcode',
        'idPrefix'   => 'destination',
        'idCampaign' => 'name',
        'idServer'   => 'name',
    ];

    public $fieldsInvisibleClient = [
        'username',
        'trunk',
        'buycost',
        'agent',
        'lucro',
        'id_user',
        'id_user',
        'provider_name',
        'id_server',
    ];

    public $fieldsInvisibleAgent = [
        'trunk',
        'buycost',
        'agent',
        'lucro',
        'id_user',
        'id_user',
        'provider_name',
    ];

    public $fieldsFkReport = [
        'id_user'     => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => "username ",
        ],
        'id_trunk'    => [
            'table'       => 'pkg_trunk',
            'pk'          => 'id',
            'fieldReport' => 'trunkcode',
        ],
        'id_prefix'   => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ],
        'id'          => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ],
        'id_campaign' => [
            'table'       => 'pkg_campaign',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
        'id_server'   => [
            'table'       => 'pkg_servers',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new Call;
        $this->abstractModel = Call::model();
        $this->titleReport   = Yii::t('zii', 'Calls');

        parent::init();

        if (! Yii::app()->session['isAdmin']) {
            $this->extraValues = [
                'idUser'   => 'username',
                'idPlan'   => 'name',
                'idPrefix' => 'destination',
            ];
        }
    }

    /**
     * Cria/Atualiza um registro da model
     */
    public function actionSave()
    {
        $values = $this->getAttributesRequest();

        if (isset($values['id']) && ! $values['id']) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameRoot    => 'error',
                $this->nameMsg     => 'Operation no allow',
            ]);
            exit;
        }
        parent::actionSave();
    }

    public function getAttributesRequest()
    {
        $arrPost = array_key_exists($this->nameRoot, $_POST) ? json_decode($_POST[$this->nameRoot], true) : $_POST;
        //retira capos antes de salvar
        unset($arrPost['starttime']);
        unset($arrPost['callerid']);
        unset($arrPost['id_prefix']);
        unset($arrPost['username']);
        unset($arrPost['trunk']);
        unset($arrPost['terminatecauseid']);
        unset($arrPost['calltype']);
        unset($arrPost['agent']);
        unset($arrPost['lucro']);
        unset($arrPost['agent_bill']);
        unset($arrPost['idPrefixdestination']);

        return $arrPost;
    }

    public function actionDownloadRecord()
    {

        $filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : [];
        $ids    = isset($_GET['ids']) ? json_decode($_GET['ids']) : [];

        //if try download only one audio  via button Download RED.
        if (count($filter) == 0 && count($ids) == 1) {
            $_GET['id'] = $ids[0];
        }

        if (count($ids) == 1) {
            $_GET['id'] = $ids[0];
        } else if (count($ids) > 1) {
            exit('<center><font color=red>To download more than 1 record, please use filters.</font></center>');
        }

        if (isset($_GET['id'])) {

            if (Yii::app()->session['isClient']) {
                $modelCall = Call::model()->find('id = :key AND id_user = :key1', [':key' => $_GET['id'], ':key1' => Yii::app()->session['id_user']]);
            } else {
                $modelCall = Call::model()->findByPk((int) $_GET['id']);
            }

            if (! isset($modelCall->id)) {
                echo yii::t('zii', 'Audio no found');
                exit;
            }

            $day      = $modelCall->starttime;
            $uniqueid = $modelCall->uniqueid;
            $day      = explode(' ', $day);
            $day      = explode('-', $day[0]);

            $day = $day[2] . $day[1] . $day[0];

            if ($modelCall->id_server > 0 && $modelCall->idServer->type == 'asterisk') {

                $host = $modelCall->idServer->public_ip > 0 ? $modelCall->idServer->public_ip : $modelCall->idServer->host;
                $url  = 'http://' . $host . '/mbilling/record.php?id=' . $uniqueid . '&u=' . $modelCall->idUser->username;

                $fileContent = file_get_contents($url);

                if ($fileContent === false) {
                    die('Failed to download the file.');
                }
                // Save the content in the specified directory
                $savedSuccessfully = file_put_contents("/var/www/html/mbilling/tmp/" . trim($uniqueid) . ".gsm", $fileContent);

                // Check if the file was saved correctly
                if ($savedSuccessfully === false) {
                    die('Failed to save the file.');
                }

                header("Cache-Control: public");
                header("Content-Description: File Transfer");
                header("Content-Disposition: attachment; filename=" . $uniqueid . '.gsm');
                header("Content-Type: audio/x-gsm");
                header("Content-Transfer-Encoding: binary");
                readfile('/var/www/html/mbilling/tmp/' . $uniqueid . '.gsm');
                unlink('/var/www/html/mbilling/tmp/' . $uniqueid . '.gsm');
                exit;
            }

            $directory       = "/var/spool/asterisk/monitor/" . $modelCall->idUser->username;
            $uniqueidPattern = trim($uniqueid);

            if ($handle = opendir($directory)) {
                while (false !== ($file = readdir($handle))) {

                    if ($file != "." && $file != "..") {

                        if (preg_match("/\." . $uniqueidPattern . "\./", $file)) {

                            $filePath = $directory . "/" . $file;

                            if (file_exists($filePath)) {
                                $filefound = true;
                                header('Content-Description: File Transfer');
                                header('Content-Type: application/octet-stream');
                                header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
                                header('Expires: 0');
                                header('Cache-Control: must-revalidate');
                                header('Pragma: public');
                                header('Content-Length: ' . filesize($filePath));
                                readfile($filePath);
                                exit;
                            }
                        }
                    }
                }
                closedir($handle);
            }
            if (! isset($filefound)) {

                if (strlen($this->config['global']['external_record_link']) > 20) {
                    $url = $this->config['global']['external_record_link'];

                    $url = preg_replace("/\%user\%/", $modelCall->idUser->username, $url);
                    $url = preg_replace("/\%number\%/", $modelCall->calledstation, $url);
                    $url = preg_replace("/\%uniqueid\%/", $uniqueid, $url);
                    $url = preg_replace("/\%audio_exten\%/", preg_replace('/49/', '', $this->config['global']['MixMonitor_format']), $url);

                    header('Location: ' . $url);
                } else {
                    echo yii::t('zii', 'Audio no found');
                }
            }
            exit;
        } else {

            $filter = $this->createCondition($filter);

            $this->filter = $this->extraFilter($filter);

            $criteria = new CDbCriteria([
                'condition' => $this->filter,
                'params'    => $this->paramsFilter,
                'with'      => $this->relationFilter,
            ]);
            if (count($ids)) {
                $criteria->addInCondition('t.id', $ids);
            }
            $modelCdr = Call::model()->findAll($criteria);

            $folder = $this->magnusFilesDirectory . 'monitor';


            array_map('unlink', glob("$folder/*"));

            if (isset($modelCdr[0]->id)) {

                $tarFile = '/var/www/html/mbilling/tmp/records_' . Yii::app()->session['username'] . '.tar';
                unlink($tarFile . '.gz');
                // Cria um arquivo tar
                $tar = new PharData($tarFile);

                foreach ($modelCdr as $records) {
                    $number   = $records->calledstation;
                    $day      = $records->starttime;
                    $uniqueid = $records->uniqueid;
                    $username = $records->idUser->username;

                    $file = glob('/var/spool/asterisk/monitor/' . $username . '/*.' . trim($uniqueid) . '* ');
                    if (isset($file[0])) {

                        $tar->addFile($file[0], basename($file[0]));
                    }
                }

                $tar->compress(Phar::GZ);
                unlink($tarFile);

                echo json_encode([
                    $this->nameSuccess => true,
                    $this->nameMsg     => 'success',
                ]);

                header('Content-Description: File Transfer');
                header("Content-Type: application/x-tar");
                header('Content-Disposition: attachment; filename=' . basename($tarFile . '.gz'));
                header("Content-Transfer-Encoding: binary");
                header('Accept-Ranges: bytes');
                header('Content-type: application/force-download');
                ob_clean();
                flush();
                readfile($tarFile . '.gz');
                unlink($tarFile . '.gz');
            } else {
                echo json_encode([
                    $this->nameSuccess => false,
                    $this->nameMsg     => 'Audio no found',
                ]);
                exit;
            }
        }
    }

    public function beforeReport($columns)
    {

        if (preg_match("/id_campaign/", $this->filter)) {

            $filterCampaign = json_decode($_GET['filter']);

            foreach ($filterCampaign as $f) {
                if (! isset($f->type) || $f->field != 'id_campaign') {
                    continue;
                }
                if (count($f->value) > 1) {
                    echo json_encode([
                        $this->nameSuccess => false,
                        $this->nameRoot    => 'error',
                        $this->nameMsg     => 'Please select one campaign',
                    ]);
                    exit;
                }

                $id = $f->value[0];
            }

            $modelCampaign = Campaign::model()->findByPk((int) $id);
            $nameCampaign  = $modelCampaign->name;
            $timeCampaign  = $modelCampaign->nb_callmade;

            if ($timeCampaign > 0) {

                $columns = [
                    ['header' => "100%", 'dataIndex' => 'real_sessiontime'],
                    ['header' => "80% a 99% ", 'dataIndex' => 'uniqueid'],
                    ['header' => "60% a 79%", 'dataIndex' => 'id_plan'],
                    ['header' => "40% a 59% ", 'dataIndex' => 'id_did'],
                    ['header' => "20% a 39% ", 'dataIndex' => 'id_prefix'],
                    ['header' => "Menos que 20% ", 'dataIndex' => 'id_offer'],
                ];

                $timeCampaign80 = $timeCampaign * 0.8;
                $timeCampaign60 = $timeCampaign * 0.6;
                $timeCampaign40 = $timeCampaign * 0.4;
                $timeCampaign20 = $timeCampaign * 0.2;

                $this->select = "
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime >= $timeCampaign  ) AS real_sessiontime,
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime >= $timeCampaign80 AND sessiontime < $timeCampaign ) AS uniqueid,
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime >= $timeCampaign60 AND sessiontime < $timeCampaign80) AS id_plan,
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime >= $timeCampaign40 AND sessiontime < $timeCampaign60 ) AS id_did,
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime >= $timeCampaign20 AND sessiontime < $timeCampaign40 ) AS id_prefix,
                ( SELECT COUNT(sessiontime) FROM pkg_cdr t $this->join WHERE $this->filter AND sessiontime <= $timeCampaign20   ) AS id_offer
                ";
                $count = $this->abstractModel->count([
                    'join'      => $this->join,
                    'condition' => $this->filter,
                    'params'    => $this->paramsFilter,
                ]);
                $this->limit          = 1;
                $this->titleReport    = "Estatistica da campanha $nameCampaign";
                $this->subTitleReport = "Total de chamadas $count";
            }
        }

        return $columns;
    }

    public function actionGetTotal()
    {
        $filter   = isset($_POST['filter']) ? json_decode($_POST['filter']) : null;
        $filterIn = isset($_POST['filterIn']) ? json_decode($_POST['filterIn']) : null;

        if ($filter && $filterIn) {
            $filter = array_merge($filter, $filterIn);
        } else if ($filterIn) {
            $filter = $filterIn;
        }

        $filter       = $filter ? $this->createCondition($filter) : $this->defaultFilter;
        $this->filter = $this->fixedWhere ? $filter . ' ' . $this->fixedWhere : $filter;
        $this->filter = $this->extraFilter($filter);

        $modelCall = $this->abstractModel->find([
            'select'    => 'SUM(t.buycost) AS buycost, SUM(t.sessionbill) AS sessionbill ',
            'condition' => $this->filter,
            'params'    => $this->paramsFilter,
            'with'      => $this->relationFilter,
        ]);

        $modelCall->sumbuycost     = number_format($modelCall->buycost, 4);
        $modelCall->sumsessionbill = number_format($modelCall->sessionbill, 4);
        $modelCall->totalCall      = number_format($modelCall->sessionbill - $modelCall->buycost, 4);

        echo json_encode($modelCall);
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
        $nameFileCsv = $this->nameFileReport . time();
        $this->convertRelationFilter();
        $header = [];
        foreach ($columns as $key => $value) {

            if ($value['dataIndex'] == 't.id' && $value['header'] == '') {
                $value['header'] = 'ID';
            }
            if (strlen($value['header']) > 40) {
                MagnusLog::insertLOG('EDIT', $id_user, $_SERVER['REMOTE_ADDR'], 'CDR export columns have more than 40 char.' . print_r($columns, true));
                exit;
            }
            $header[] =  $value['header'];
        }

        if (is_array('header') && preg_match('/echo|system|exec|touch|pass|cd |rm |curl|wget|assets|resources|mbilling|protected/', $header)) {
            $info    = 'Trying SQL inject, code: ' . $value . '. Controller => ' . Yii::app()->controller->id;
            $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
            MagnusLog::insertLOG('EDIT', $id_user, $_SERVER['REMOTE_ADDR'], $info);
            echo json_encode([
                'rows'  => [],
                'count' => 0,
                'sum'   => [],
                'msg'   => 'SQL INJECT FOUND',
            ]);
        }

        $fileName = 'cdr_' . time();
        $output = fopen('php://output', 'w');
        fputcsv($output, $header, ',');
        $limit  = 10000;
        $offset = 0;

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $fileName . '_' . date('Y-m-d') . '.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');


        for (;;) {
            $sql     = "SELECT " . $this->getColumnsFromReport($columns) . " FROM " . $this->abstractModel->tableName() . " t $this->join WHERE $this->filter LIMIT :limit OFFSET :offset";
            $command = Yii::app()->db->createCommand($sql);
            $command->bindValue(":limit", $limit, PDO::PARAM_INT);
            $command->bindValue(":offset", $offset, PDO::PARAM_INT);
            if ((is_array($this->paramsFilter) || is_object($this->paramsFilter)) && count($this->paramsFilter)) {
                foreach ($this->paramsFilter as $key => $value) {
                    $command->bindValue($key, $value, PDO::PARAM_STR);
                }
            }
            try {
                $rows = $command->queryAll();
            } catch (Exception $e) {
                print_r($e);
                exit;
            }

            if (count($rows) > 0) {
                foreach ($rows as $row) {
                    fputcsv($output, $row, ',');
                }
                $offset += $limit;
            } else {
                break;
            }
        }
    }

    public function createCondition($filter)
    {
        if ($this->actionName == 'csv') {

            $condition = '1';

            if (! is_array($filter)) {
                return $condition;
            }

            foreach ($filter as $key => $f) {
                $isSubSelect = false;

                if (! isset($f->type)) {
                    continue;
                }

                $type  = $f->type;
                $field = $f->field;

                if ($this->actionName != 'destroy' && ! preg_match("/^id[A-Z]/", $field)) {

                    if (is_array($field)) {
                        foreach ($field as $key => $fieldOr) {
                            $field[$key] = strpos($fieldOr, '.') === false ? 't.' . $fieldOr : $fieldOr;
                        }
                    } else {
                        $field = strpos($field, '#') === 0 ? str_replace('#', '', $field) : (strpos($field, '.') === false ? 't.' . $field : $field);
                    }
                }

                $value = isset($f->value) ? $f->value : new CDbExpression('NULL');

                $paramName = "p$key";

                if (isset($f->data->comparison)) {
                    $comparison = $f->data->comparison;
                } else if (isset($f->comparison)) {
                    $comparison = $f->comparison;
                } else {
                    $comparison = null;
                }
                switch ($type) {
                    case 'date':
                        if ((bool) strtotime($value) == false) {
                            echo 'Invalid Filter';
                            exit;
                        }

                        switch ($comparison) {
                            case 'eq':

                                $condition .= " AND $field LIKE '" . strtok($value, ' ') . "%'";
                                break;
                            case 'lt':
                                $condition .= " AND $field < '" . $value . "' ";
                                break;
                            case 'gt':
                                $condition .= " AND $field > '" . $value . "'";
                                break;
                        }
                        break;
                    case 'string':

                        if (strlen($value) > 25) {
                            echo 'Invalid Filter';
                            exit;
                        }

                        $field = isset($f->caseSensitive) && $f->caseSensitive && ! is_array($field) ? "BINARY $field" : $field;

                        switch ($comparison) {
                            case 'st':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE '" . $value . "%'";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field LIKE '" . $value . "%'",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field LIKE '" . $value . "%'";
                                }

                                break;
                            case 'ed':

                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE '%" . $value . "'";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field LIKE '%" . $value . "'",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field LIKE '%" . $value . "'";
                                }

                                break;
                            case 'ct':
                                if (is_array($field)) {
                                    $conditionsOr = [];

                                    foreach ($field as $keyOr => $fieldOr) {
                                        $fieldOr = isset($f->caseSensitive) && $f->caseSensitive ? "BINARY $fieldOr" : $fieldOr;
                                        array_push($conditionsOr, "$fieldOr LIKE '%" . $value . "%'");
                                    }

                                    $conditionsOr = implode(' OR ', $conditionsOr);
                                    $condition .= " AND ($conditionsOr)";
                                } else {

                                    if (preg_match("/^id[A-Z].*\./", $field)) {

                                        if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                            $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE '%" . $value . "%'";
                                        } else {
                                            $this->relationFilter[strtok($field, '.')] = [
                                                'condition' => "$field LIKE '%" . $value . "%'",
                                            ];
                                        }
                                    } else {
                                        $condition .= " AND LOWER($field) LIKE '%" . strtolower($value) . "%'";
                                    }
                                }
                                break;
                            case 'eq':

                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field = '" . $value . "'";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field = '" . $value . "'",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field = '" . $value . "'";
                                }

                                break;
                        }

                        break;
                    case 'boolean':
                        if (! is_numeric($value)) {
                            echo 'Invalid Filter';
                            exit;
                        }
                        $condition .= " AND $field = " . (int) $value . " ";
                        break;
                    case 'numeric':
                        if (! is_numeric($value)) {
                            echo 'Invalid Filter';
                            exit;
                        }
                        switch ($comparison) {
                            case 'eq':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field = " . $value . "";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field = " . $value . "",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field = " . $value . "";
                                }

                                break;
                            case 'lt':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field < " . $value . "";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field < " . $value . "",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field < " . $value . "";
                                }

                                break;
                            case 'gt':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field >" . $value . "";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field > " . $value . "",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field > " . $value . "";
                                }

                                break;
                        }
                        break;
                    case 'list':
                        $value = is_array($value) ? $value : [$value];

                        $paramsIn = [];

                        foreach ($value as $keyIn => $v) {

                            if (! is_numeric($v)) {
                                echo 'Invalid Filter';
                                exit;
                            }

                            array_push($paramsIn, $v);
                        }

                        $paramsIn = implode(',', $paramsIn);
                        $condition .= " AND $field IN($paramsIn)";

                        break;
                }
            }

            return $condition;
        } else {
            return parent::createCondition($filter);
        }
    }
}
