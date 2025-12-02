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
 * 19/09/2012
 */

class RateProviderController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = [
        'idProvider' => 'provider_name',
        'idPrefix'   => 'destination,prefix',
    ];

    public $fieldsFkReport = [
        'id_provider' => [
            'table'       => 'pkg_provider',
            'pk'          => 'id',
            'fieldReport' => 'provider_name',
        ],
        'id_prefix' => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ],
        't.id' => [
            'table'       => 'pkg_prefix',
            'pk'          => 'id',
            'fieldReport' => 'destination',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new RateProvider;
        $this->abstractModel = RateProvider::model();
        $this->titleReport   = Yii::t('zii', 'Provider rate');
        parent::init();
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

    public function replaceToExport()
    {

        //altera as colunas para poder pegar o destino das tarifas
        $destino    = '{"header":"Prefixo","dataIndex":"idPrefixprefix"},';
        $destinoNew = '{"header":"Prefixo","dataIndex":"id_prefix"},';
        if (preg_match("/$destino/", $_GET['columns'])) {
            $_GET['columns'] = preg_replace("/$destino/", $destinoNew, $_GET['columns']);
        }

        $destino    = '{"header":"Prefix","dataIndex":"idPrefixprefix"},';
        $destinoNew = '{"header":"Prefix","dataIndex":"id_prefix"},';
        if (preg_match("/$destino/", $_GET['columns'])) {
            $_GET['columns'] = preg_replace("/$destino/", $destinoNew, $_GET['columns']);
        }

        $destino    = '{"header":"Destino","dataIndex":"idPrefixdestination"},';
        $destinoNew = '{"header":"Destino","dataIndex":"id"},';
        if (preg_match("/$destino/", $_GET['columns'])) {
            $_GET['columns'] = preg_replace("/$destino/", $destinoNew, $_GET['columns']);
        }

        $destino    = '{"header":"Destination","dataIndex":"idPrefixdestination"},';
        $destinoNew = '{"header":"Destination","dataIndex":"id"},';
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
    }

    public function importRates($values)
    {

        Util::validExtension($_FILES['file']['tmp_name'], $_FILES["file"]["name"], ['csv']);
        if (! isset($_FILES['file']['tmp_name']) || strlen($_FILES['file']['tmp_name']) < 10) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'Please select a CSV file'),
            ]);
            exit;
        }

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

        Prefix::model()->deleteAll('prefix REGEXP "[a-z]"');

        $sql = "LOAD DATA LOCAL INFILE '" . $_FILES['file']['tmp_name'] . "'" .
            " IGNORE INTO TABLE pkg_rate_provider" .
            " CHARACTER SET UTF8 " .
            " FIELDS TERMINATED BY '" . $values['delimiter'] . "'" .
            " LINES TERMINATED BY '\\r\\n' (dialprefix,destination,buyrate,buyrateinitblock,buyrateincrement,minimal_time_buy)" .
            " SET id_provider = " . $values['id_provider'] . "";

        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
            ]);
            exit;
        }

        $sql = "DELETE FROM pkg_prefix WHERE prefix < 1";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
        }

        $sql = "UPDATE pkg_rate_provider t JOIN pkg_prefix p ON t.dialprefix = p.prefix SET t.id_prefix = p.id, t.dialprefix = NULL, t.destination = NULL WHERE dialprefix IS NOT NULL AND p.prefix > 0";
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
            ]);
            exit;
        }

        $modelRate = RateProvider::model()->findAll('dialprefix IS NOT NULL');
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

            $sql = "UPDATE pkg_rate_provider t JOIN pkg_prefix p ON t.dialprefix = p.prefix SET t.id_prefix = p.id, t.dialprefix = NULL, t.destination = NULL WHERE dialprefix IS NOT NULL";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }

            RateProvider::model()->updateAll(['dialprefix' => null, 'destination' => null], 'dialprefix IS NOT NULL');
        }

        $sql = "UPDATE pkg_rate_provider SET buyrateinitblock = 1 WHERE buyrateinitblock = 0; UPDATE pkg_rate_provider SET buyrateincrement = 1 WHERE buyrateincrement = 0;";
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
