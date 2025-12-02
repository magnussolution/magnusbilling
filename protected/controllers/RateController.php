<?php

/**
 * Acoes do modulo "Rate".
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
 * 30/07/2012
 */

class RateController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = [
        'idTrunkGroup' => 'name',
        'idPlan'       => 'name',
        'idPrefix'     => 'destination,prefix',
    ];

    public $fieldsFkReport = [
        'id_plan'        => [
            'table'       => 'pkg_plan',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
        'id_trunk_group' => [
            'table'       => 'pkg_trunk_group',
            'pk'          => 'id',
            'fieldReport' => 'name',
        ],
        'id_prefix'      => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'prefix',
        ],
        't.id'           => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ],
    ];

    public $fieldsInvisibleClient = [
        'additional_grace',
        'id_trunk_group',
        'idTrunktrunkcode',
        'connectcharge',
        'disconnectcharge',
        'minimal_time_charge',
        'package_offer',
    ];

    public $fieldsInvisibleAgent = [
        'additional_grace',
        'id_trunk_group',
        'idTrunktrunkcode',
        'connectcharge',
        'disconnectcharge',
    ];

    public $FilterByUser;

    public function init()
    {

        if (isset($_SERVER['HTTP_SIGN']) && isset($_SERVER['HTTP_KEY'])) {
            $api = new ApiAccess();
            $api->checkAuthentication($this);
        }

        if (Yii::app()->session['isAgent'] || Yii::app()->session['id_agent'] > 1) {
            $this->instanceModel = new RateAgent;
            $this->abstractModel = RateAgent::model();
        } else {
            $this->instanceModel = new Rate;
            $this->abstractModel = Rate::model();
        }

        $this->titleReport = Yii::t('zii', 'Tariffs');

        parent::init();
        if (! Yii::app()->session['isAdmin']) {
            $this->extraValues = [
                'idPlan'   => 'name',
                'idPrefix' => 'destination,prefix',
            ];
        }
    }

    public function extraFilterCustomClient($filter)
    {
        //se for cliente filtrar pelo plano do cliente
        $filter .= ' AND t.id_plan = :dfby0';
        $this->paramsFilter[':dfby0'] = Yii::app()->session['id_plan'];

        return $filter;
    }

    public function extraFilterCustomAgent($filter)
    {
        $modelPlan = Plan::model()->findAll('id_user = :key', [':key' => Yii::app()->session['id_user']]);
        $ids_plan  = '';
        foreach ($modelPlan as $key => $plan) {
            $ids_plan .= $plan->id . ',';
        }
        $filter .= ' AND t.id_plan IN( ' . substr($ids_plan, 0, -1) . ' )';
        return $filter;
    }

    public function actionReport()
    {
        $this->replaceToExport();
        parent::actionReport();
    }

    public function actionCsv()
    {

        $this->replaceToExport();
        parent::actionCsv();
    }

    public function afterSave($model, $values)
    {
        if (Yii::app()->session['isAgent'] || Yii::app()->session['id_agent'] > 1) {
            $info = 'Module: rateagent  ' . json_encode($values);
            LogUsers::model()->updateByPk(Yii::app()->db->getLastInsertID(), ['description' => $info]);
        }
    }

    public function replaceToExport()
    {

        //altera as colunas para poder pegar o destino das tarifas
        $destino    = '{"header":"Prefixo","dataIndex":"idPrefixprefix"},';
        $destinoNew = '{"header":"Prefixo","dataIndex":"id_prefix"},';
        if (preg_match("/$destino/", $_GET['columns'])) {
            $_GET['columns'] = preg_replace("/$destino/", $destinoNew, $_GET['columns']);
        }

        $destino    = '{"header":"Destino","dataIndex":"idPrefixdestination"},';
        $destinoNew = '{"header":"Destino","dataIndex":"id"},';
        if (preg_match("/$destino/", $_GET['columns'])) {
            $_GET['columns'] = preg_replace("/$destino/", $destinoNew, $_GET['columns']);
        }
    }

    public function actionImportFromCsv()
    {

        if (! Yii::app()->session['id_user'] || Yii::app()->session['isClient'] == true) {
            exit();
        }
        $values = $this->getAttributesRequest();

        $this->importRates($values);

        echo json_encode([
            $this->nameSuccess => true,
            'msg'              => $this->msgSuccess,
        ]);
    }

    public function importPrefixs($values)
    {

        Util::validExtension($_FILES['file']['tmp_name'], $_FILES["file"]["name"], ['csv']);

        if (Yii::app()->session['isAdmin']) {

            $sql = "LOAD DATA LOCAL INFILE '" . $_FILES['file']['tmp_name'] . "'" .
                " IGNORE INTO TABLE pkg_prefix" .
                " CHARACTER SET UTF8 " .
                " FIELDS TERMINATED BY '" . $values['delimiter'] . "'" .
                " LINES TERMINATED BY '\\r\\n' (prefix,destination)";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }
            $info = 'Module: prefix  {}';
            MagnusLog::insertLOG(5, $info);
        }
    }
    public function importRates($values)
    {

        Util::validExtension($_FILES['file']['tmp_name'], $_FILES["file"]["name"], ['csv']);

        $fn        = fopen($_FILES['file']['tmp_name'], "r");
        $firstLine = fgets($fn, 1000);
        fclose($fn);
        $firstLine = trim(preg_replace('/\s+/', ' ', $firstLine));

        $firstLine = explode($values['delimiter'], $firstLine);

        if (count($firstLine) < 3) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'CSV format invalid, please check your CSV file and than try again.') . "\n\n" . $firstLine[0],
            ]);
            exit;
        }

        $modelPrefix = Prefix::model()->find(1);

        if (! isset($modelPrefix->id)) {
            $this->importPrefixs($values);
            $modelPrefix = Prefix::model()->find(1);
        }

        if (Yii::app()->session['isAgent']) {

            $sql = "LOAD DATA LOCAL INFILE '" . $_FILES['file']['tmp_name'] . "'" .
                " IGNORE INTO TABLE pkg_rate_agent" .
                " CHARACTER SET UTF8 " .
                " FIELDS TERMINATED BY '" . $values['delimiter'] . "'" .
                " LINES TERMINATED BY '\\r\\n' (@dialprefix,@destination,rateinitial,initblock,billingblock,minimal_time_charge)" .
                " SET id_plan = " . $values['id_plan'] . ", id_prefix = (SELECT id FROM pkg_prefix WHERE prefix = @dialprefix)";

            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }

            $info = 'Module: rateagent  {}';
            MagnusLog::insertLOG(5, $info);
        } else if (Yii::app()->session['isAdmin']) {

            $sql = "LOAD DATA LOCAL INFILE '" . $_FILES['file']['tmp_name'] . "'" .
                " IGNORE INTO TABLE pkg_rate" .
                " CHARACTER SET UTF8 " .
                " FIELDS TERMINATED BY '" . $values['delimiter'] . "'" .
                " LINES TERMINATED BY '\\r\\n' (dialprefix,destination,rateinitial,initblock,billingblock,minimal_time_charge,connectcharge,disconnectcharge,package_offer)" .
                " SET id_plan = " . $values['id_plan'] . ", id_trunk_group = " . $values['id_trunk_group'] . ", id_prefix = " . $modelPrefix->id . "";

            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }

            $info = 'Module: rate  {}';
            MagnusLog::insertLOG(5, $info);

            $sql = "DELETE FROM pkg_prefix WHERE prefix < 1";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
            }

            $sql = "UPDATE pkg_rate t JOIN pkg_prefix p ON t.dialprefix = p.prefix SET t.id_prefix = p.id, t.dialprefix = NULL, t.destination = NULL WHERE dialprefix > 0 AND p.prefix > 0";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                $sql = "DELETE FROM pkg_rate WHERE dialprefix > 0";
                Yii::app()->db->createCommand($sql)->execute();

                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }

            $modelRate = Rate::model()->findAll('dialprefix > 0');
            if (isset($modelRate[0]->id)) {
                //check if there are more than 2000 new prefix, if yes, import using LOAD DATA.
                if (count($modelRate) > 2000) {
                    $this->importPrefixs($values);
                } else {
                    $prefix = '';
                    foreach ($modelRate as $key => $rate) {
                        $prefix .= '("' . $rate->dialprefix . '","' . $rate->destination . '"),';
                    }
                    $sql = "INSERT IGNORE INTO pkg_prefix (prefix,destination) VALUES " . substr($prefix, 0, -1);
                    try {
                        Yii::app()->db->createCommand($sql)->execute();
                    } catch (Exception $e) {
                        echo json_encode([
                            $this->nameSuccess => false,
                            'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                        ]);
                        exit;
                    }
                }

                $sql = "UPDATE pkg_rate t JOIN pkg_prefix p ON t.dialprefix = p.prefix SET t.id_prefix = p.id, t.dialprefix = NULL, t.destination = NULL WHERE dialprefix > 0";
                try {
                    Yii::app()->db->createCommand($sql)->execute();
                } catch (Exception $e) {
                    $sql = "DELETE FROM pkg_rate WHERE dialprefix > 0";
                    Yii::app()->db->createCommand($sql)->execute();
                    echo json_encode([
                        $this->nameSuccess => false,
                        'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                    ]);
                    exit;
                }
            }

            $sql = "UPDATE pkg_rate SET initblock = 1 WHERE initblock = 0; UPDATE pkg_rate SET billingblock = 1 WHERE billingblock = 0;";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }
        }
    }
}
