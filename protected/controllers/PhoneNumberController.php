<?php
/**
 * Acoes do modulo "PhoneNumber".
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
 * 28/10/2012
 */

class PhoneNumberController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idPhonebook' => 'name'];

    public $fieldsFkReport = [
        'id_phonebook' => [
            'table'       => 'pkg_phonebook',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new PhoneNumber;
        $this->abstractModel = PhoneNumber::model();
        $this->titleReport   = Yii::t('zii', 'Phonenumber');
        parent::init();
    }

    public function applyFilterToLimitedAdmin()
    {
        if (Yii::app()->session['user_type'] == 1 && Yii::app()->session['adminLimitUsers'] == true) {
            $this->join .= ' JOIN pkg_user b ON g.id_user = b.id';
            $this->filter .= " AND b.id_group IN (SELECT gug.id_group
                                FROM pkg_group_user_group gug
                                WHERE gug.id_group_user = :idgA0)";
            $this->paramsFilter['idgA0'] = Yii::app()->session['id_group'];
        }
    }

    public function extraFilterCustomAgent($filter)
    {
        //se é agente filtrar pelo user.id_user
        if (array_key_exists('idPhonebook', $this->relationFilter)) {
            $this->relationFilter['idPhonebook']['condition'] .= " AND idPhonebook.id_user IN (SELECT id FROM pkg_user WHERE id_user = :agfby )";
        } else {
            $this->relationFilter['idPhonebook'] = [
                'condition' => "idPhonebook.id_user IN (SELECT id FROM pkg_user WHERE id_user = :agfby )",
            ];
        }
        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function extraFilterCustomClient($filter)
    {

        if (array_key_exists('idPhonebook', $this->relationFilter)) {
            $this->relationFilter['idPhonebook']['condition'] .= " AND idPhonebook.id_user LIKE :agfby";
        } else {
            $this->relationFilter['idPhonebook'] = [
                'condition' => "idPhonebook.id_user LIKE :agfby",
            ];
        }

        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function actionCsv()
    {
        $_GET['columns'] = preg_replace('/status/', 't.status', $_GET['columns']);
        $_GET['columns'] = preg_replace('/name/', 't.name', $_GET['columns']);

        if ( ! AccessManager::getInstance($this->instanceModel->getModule())->canRead()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to read in module:" . $this->instanceModel->getModule());
        }

        if ( ! isset(Yii::app()->session['id_user'])) {
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

        $columns = $this->subscribeColunms($columns);

        $this->setLimit($_GET);

        $this->setStart($_GET);

        $this->setSort();

        $this->order = 't.id ASC';

        $this->setfilter($_GET);

        $this->applyFilterToLimitedAdmin();

        $nameFileCsv = $this->nameFileReport . time();
        $this->convertRelationFilter();
        $header = '';
        foreach ($columns as $key => $value) {
            $header .= '"' . ($value['header']) . '",';
        }

        $sql = "SELECT " . substr($header, 0, -1) . " UNION ALL SELECT " . $this->getColumnsFromReport($columns) . " FROM " . $this->abstractModel->tableName() . " t $this->join WHERE $this->filter";

        $command = Yii::app()->db->createCommand($sql);
        if ((is_array($this->paramsFilter) || is_object($this->paramsFilter)) && count($this->paramsFilter)) {
            foreach ($this->paramsFilter as $key => $value) {
                $command->bindValue($key, $value, PDO::PARAM_STR);
            }

        }

        //create a file pointer
        $f = fopen('php://memory', 'w');

        foreach ($command->queryAll() as $key => $fields) {
            $fieldsCsv = [];

            foreach ($fields as $key => $value) {

                if ($key == 'Description' && preg_match('/DTMF/', $value)) {
                    preg_match_all('/.* at (.*)/', $value, $date);
                    $date = isset($date[1][0]) ? $date[1][0] : '';
                    array_push($fieldsCsv, $date);

                    $data = explode('|', $value);
                    foreach ($data as $key => $line) {
                        $line    = preg_replace('/DTMF/', 'press', $line);
                        $details = explode('at', $line);
                        array_push($fieldsCsv, $details[0]);
                    }

                } else {
                    array_push($fieldsCsv, $value);
                }

            }
            fputcsv($f, $fieldsCsv, ';');
        }

        fseek($f, 0);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $this->modelName . '_' . date('Y-m-d') . '.csv"');

        fpassthru($f);
    }
    public function actionReport($value = '')
    {
        $_POST['columns'] = preg_replace('/status/', 't.status', $_POST['columns']);
        $_POST['columns'] = preg_replace('/name/', 't.name', $_POST['columns']);

        parent::actionReport();
    }

    public function getAttributesRequest()
    {
        $arrPost = array_key_exists($this->nameRoot, $_POST) ? json_decode($_POST[$this->nameRoot], true) : $_POST;

        //alterar para try = 0 se activar os numeros
        if ($this->abstractModel->tableName() == 'pkg_phonenumber') {
            if (isset($arrPost['status']) && $arrPost['status'] == 1) {
                $arrPost['try'] = '0';
            }
        }

        return $arrPost;
    }

    public function importCsvSetAdditionalParams()
    {
        $values = $this->getAttributesRequest();
        return [['key' => 'id_phonebook', 'value' => $values['id_phonebook']]];
    }

    public function actionReprocesar()
    {
        $module = $this->instanceModel->getModule();

        if ( ! AccessManager::getInstance($module)->canUpdate()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to save in module: $module");
        }

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

        if ( ! isset($this->relationFilter['idPhonebook'])) {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Por favor filtre uma agenda para reprocesar',
            ]);
            exit;
        }

        $this->abstractModel->reprocess($this->relationFilter, $this->paramsFilter);

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => 'Números atualizados com successo',
        ]);

    }
}
