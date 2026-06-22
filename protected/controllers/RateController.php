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

            $sql = "LOAD DATA  INFILE '" . $_FILES['file']['tmp_name'] . "'" .
                " IGNORE INTO TABLE pkg_prefix" .
                " CHARACTER SET UTF8 " .
                " FIELDS TERMINATED BY '" . $values['delimiter'] . "'" .
                " LINES TERMINATED BY '\\r\\n' (prefix,destination)";
            try {
                Yii::app()->db->createCommand($sql)->execute();
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . $e->getMessage(),
                ]);
                exit;
            }
            $info = 'Module: prefix  {}';
            MagnusLog::insertLOG(5, $info);
        }
    }
    public function importRates($values)
    {

        if (! isset($_FILES['file']['tmp_name'], $_FILES['file']['name']) || ! is_file($_FILES['file']['tmp_name'])) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'Please select a CSV file'),
            ]);
            exit;
        }

        Util::validExtension($_FILES['file']['tmp_name'], $_FILES['file']['name'], ['csv']);

        $delimiter = isset($values['delimiter']) ? $values['delimiter'] : ',';
        if (! in_array($delimiter, [',', ';'], true)) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => 'Invalid CSV delimiter.',
            ]);
            exit;
        }

        $sample = file_get_contents($_FILES['file']['tmp_name'], false, null, 0, 65536);
        $firstCr = strpos($sample, "\r");
        $firstLf = strpos($sample, "\n");

        if ($firstCr !== false && $firstLf === $firstCr + 1) {
            $lineTerminator = "\r\n";
        } else if ($firstLf !== false && ($firstCr === false || $firstLf < $firstCr)) {
            $lineTerminator = "\n";
        } else if ($firstCr !== false) {
            $lineTerminator = "\r";
        } else {
            // A one-line CSV has no line terminator, but LOAD DATA still reads it.
            $lineTerminator = "\n";
        }

        $firstLineEnd = strpos($sample, $lineTerminator);
        $firstLineRaw = $firstLineEnd === false ? $sample : substr($sample, 0, $firstLineEnd);
        $firstLine    = str_getcsv($firstLineRaw, $delimiter);

        if (! is_array($firstLine) || count($firstLine) < 3) {
            $firstValue = is_array($firstLine) && isset($firstLine[0]) ? $firstLine[0] : '';
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'CSV format invalid, please check your CSV file and than try again.') . "\n\n" . $firstValue,
            ]);
            exit;
        }

        $firstPrefix = preg_replace('/^\xEF\xBB\xBF/', '', trim((string) $firstLine[0]));
        $hasHeader   = ! preg_match('/^[0-9]{1,18}$/', $firstPrefix);
        $ignoreLines = $hasHeader ? ' IGNORE 1 LINES' : '';

        if (Yii::app()->session['isAgent']) {

            $modelPrefix = Prefix::model()->find(1);

            if (! isset($modelPrefix->id)) {
                $this->importPrefixs($values);
            }

            $sql = "LOAD DATA LOCAL INFILE '" . $_FILES['file']['tmp_name'] . "'" .
                " IGNORE INTO TABLE pkg_rate_agent" .
                " CHARACTER SET UTF8 " .
                " FIELDS TERMINATED BY '" . $delimiter . "'" .
                " LINES TERMINATED BY " . $this->quoteLineTerminator($lineTerminator) . $ignoreLines .
                " (@dialprefix,@destination,rateinitial,initblock,billingblock,minimal_time_charge)" .
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
            try {
                $this->importAdminRatesFromCsv(
                    $values,
                    $_FILES['file']['tmp_name'],
                    $delimiter,
                    $hasHeader,
                    $lineTerminator
                );
            } catch (Exception $e) {
                echo json_encode([
                    $this->nameSuccess => false,
                    'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . print_r($e, true),
                ]);
                exit;
            }
        }
    }

    private function quoteLineTerminator($lineTerminator)
    {
        if ($lineTerminator === "\r\n") {
            return "'\\r\\n'";
        }

        return $lineTerminator === "\r" ? "'\\r'" : "'\\n'";
    }

    private function importAdminRatesFromCsv(
        $values,
        $fileName,
        $delimiter,
        $hasHeader = false,
        $lineTerminator = "\n"
    )
    {
        $idPlan       = isset($values['id_plan']) ? (int) $values['id_plan'] : 0;
        $idTrunkGroup = isset($values['id_trunk_group']) ? (int) $values['id_trunk_group'] : 0;

        if ($idPlan < 1 || $idTrunkGroup < 1) {
            throw new Exception('Plan and trunk group are required.');
        }

        $db             = Yii::app()->db;
        $lockName       = 'mbilling-rate-import-plan-' . $idPlan;
        $lockAcquired   = false;
        $transaction    = null;
        $loadedRows     = 0;
        $duplicateRows  = 0;
        $updatedRows    = 0;
        $insertedRows   = 0;

        try {
            $command = $db->createCommand('SELECT GET_LOCK(:lockName, 30)');
            $command->bindValue(':lockName', $lockName, PDO::PARAM_STR);
            $lockAcquired = (int) $command->queryScalar() === 1;

            if (! $lockAcquired) {
                throw new Exception('Another tariff import is already running for this plan.');
            }

            if ((int) $db->createCommand('SELECT @@GLOBAL.local_infile')->queryScalar() !== 1) {
                throw new Exception(
                    'MariaDB local_infile is disabled. Enable local_infile=1 in the server configuration and restart MariaDB.'
                );
            }

            $db->createCommand('DROP TEMPORARY TABLE IF EXISTS tmp_rate_import')->execute();
            $db->createCommand(
                "CREATE TEMPORARY TABLE tmp_rate_import (
                    row_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    prefix VARCHAR(64) NOT NULL,
                    destination VARCHAR(255) NOT NULL DEFAULT '',
                    rateinitial VARCHAR(30) NOT NULL DEFAULT '0',
                    initblock VARCHAR(20) NOT NULL DEFAULT '1',
                    billingblock VARCHAR(20) NOT NULL DEFAULT '1',
                    minimal_time_charge VARCHAR(20) NOT NULL DEFAULT '0',
                    connectcharge VARCHAR(30) NOT NULL DEFAULT '0',
                    disconnectcharge VARCHAR(30) NOT NULL DEFAULT '0',
                    package_offer VARCHAR(10) NOT NULL DEFAULT '0',
                    PRIMARY KEY (row_id),
                    KEY idx_tmp_rate_prefix (prefix, row_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8"
            )->execute();

            $quotedFile      = $db->quoteValue($fileName);
            $quotedDelimiter = $db->quoteValue($delimiter);
            $ignoreLines     = $hasHeader ? ' IGNORE 1 LINES' : '';
            $sql = "LOAD DATA LOCAL INFILE $quotedFile
                INTO TABLE tmp_rate_import
                CHARACTER SET UTF8
                FIELDS TERMINATED BY $quotedDelimiter OPTIONALLY ENCLOSED BY '\"'
                LINES TERMINATED BY " . $this->quoteLineTerminator($lineTerminator) . "$ignoreLines
                (@prefix,@destination,@rateinitial,@initblock,@billingblock,@minimal_time_charge,@connectcharge,@disconnectcharge,@package_offer)
                SET prefix = REPLACE(REPLACE(TRIM(@prefix), '\\r', ''), CONVERT(0xEFBBBF USING utf8), ''),
                    destination = REPLACE(TRIM(COALESCE(@destination, '')), '\\r', ''),
                    rateinitial = COALESCE(NULLIF(REPLACE(TRIM(@rateinitial), '\\r', ''), ''), '0'),
                    initblock = COALESCE(NULLIF(REPLACE(TRIM(@initblock), '\\r', ''), ''), '1'),
                    billingblock = COALESCE(NULLIF(REPLACE(TRIM(@billingblock), '\\r', ''), ''), '1'),
                    minimal_time_charge = COALESCE(NULLIF(REPLACE(TRIM(@minimal_time_charge), '\\r', ''), ''), '0'),
                    connectcharge = COALESCE(NULLIF(REPLACE(TRIM(@connectcharge), '\\r', ''), ''), '0'),
                    disconnectcharge = COALESCE(NULLIF(REPLACE(TRIM(@disconnectcharge), '\\r', ''), ''), '0'),
                    package_offer = COALESCE(NULLIF(REPLACE(TRIM(@package_offer), '\\r', ''), ''), '0')";
            $loadedRows = $db->createCommand($sql)->execute();

            if ($loadedRows < 1) {
                throw new Exception('The CSV file does not contain tariff rows.');
            }

            $invalidCondition = "prefix NOT REGEXP '^[0-9]{1,18}$'
                OR CHAR_LENGTH(destination) > 60
                OR rateinitial NOT REGEXP '^[0-9]{1,9}([.][0-9]{1,6})?$'
                OR initblock NOT REGEXP '^[0-9]{1,10}$' OR CAST(initblock AS UNSIGNED) > 2147483647
                OR billingblock NOT REGEXP '^[0-9]{1,10}$' OR CAST(billingblock AS UNSIGNED) > 2147483647
                OR minimal_time_charge NOT REGEXP '^[0-9]{1,10}$' OR CAST(minimal_time_charge AS UNSIGNED) > 2147483647
                OR connectcharge NOT REGEXP '^[0-9]{1,10}([.][0-9]{1,5})?$'
                OR disconnectcharge NOT REGEXP '^[0-9]{1,10}([.][0-9]{1,5})?$'
                OR package_offer NOT IN ('0', '1')";

            $invalidRows = (int) $db->createCommand(
                "SELECT COUNT(*) FROM tmp_rate_import WHERE $invalidCondition"
            )->queryScalar();

            if ($invalidRows > 0) {
                $examples = $db->createCommand(
                    "SELECT row_id, prefix FROM tmp_rate_import WHERE $invalidCondition ORDER BY row_id LIMIT 20"
                )->queryAll();
                $exampleRows = [];
                foreach ($examples as $example) {
                    $exampleRows[] = $example['row_id'] . ':' . $example['prefix'];
                }
                throw new Exception(
                    'CSV contains ' . $invalidRows . ' invalid row(s). Row/prefix examples: ' . implode(', ', $exampleRows)
                );
            }

            $duplicateRows = (int) $db->createCommand(
                'SELECT COUNT(*) - COUNT(DISTINCT prefix) FROM tmp_rate_import'
            )->queryScalar();

            // A repeated prefix in the same CSV is deterministic: the last row wins.
            // A second temporary table avoids MySQL's "Can't reopen table" limitation.
            $db->createCommand(
                'CREATE TEMPORARY TABLE tmp_rate_import_final ENGINE=InnoDB AS
                 SELECT prefix, destination, rateinitial, initblock, billingblock,
                        minimal_time_charge, connectcharge, disconnectcharge, package_offer
                 FROM (
                    SELECT t.*,
                           ROW_NUMBER() OVER (PARTITION BY prefix ORDER BY row_id DESC) AS row_position
                    FROM tmp_rate_import t
                 ) ranked
                 WHERE row_position = 1'
            )->execute();
            $db->createCommand(
                'ALTER TABLE tmp_rate_import_final ADD PRIMARY KEY (prefix)'
            )->execute();

            $transaction = $db->beginTransaction();

            $db->createCommand(
                'INSERT IGNORE INTO pkg_prefix (prefix, destination)
                 SELECT prefix, destination FROM tmp_rate_import_final'
            )->execute();

            $db->createCommand(
                'UPDATE pkg_prefix p
                 INNER JOIN tmp_rate_import_final s ON s.prefix = p.prefix
                 SET p.destination = s.destination
                 WHERE s.destination <> "" AND p.destination <> s.destination'
            )->execute();

            $command = $db->createCommand(
                'UPDATE pkg_rate r
                 INNER JOIN pkg_prefix p ON p.id = r.id_prefix
                 INNER JOIN tmp_rate_import_final s ON s.prefix = p.prefix
                 SET r.id_trunk_group = :idTrunkGroup,
                     r.rateinitial = CAST(s.rateinitial AS DECIMAL(15,6)),
                     r.initblock = GREATEST(CAST(s.initblock AS UNSIGNED), 1),
                     r.billingblock = GREATEST(CAST(s.billingblock AS UNSIGNED), 1),
                     r.minimal_time_charge = CAST(s.minimal_time_charge AS UNSIGNED),
                     r.connectcharge = CAST(s.connectcharge AS DECIMAL(15,5)),
                     r.disconnectcharge = CAST(s.disconnectcharge AS DECIMAL(15,5)),
                     r.package_offer = CAST(s.package_offer AS UNSIGNED),
                     r.status = 1,
                     r.dialprefix = NULL,
                     r.destination = NULL
                 WHERE r.id_plan = :idPlan'
            );
            $command->bindValue(':idTrunkGroup', $idTrunkGroup, PDO::PARAM_INT);
            $command->bindValue(':idPlan', $idPlan, PDO::PARAM_INT);
            $updatedRows = $command->execute();

            $command = $db->createCommand(
                'INSERT INTO pkg_rate (
                    id_plan, id_trunk_group, id_prefix, rateinitial, initblock,
                    billingblock, minimal_time_charge, connectcharge,
                    disconnectcharge, package_offer, status
                 )
                 SELECT :idPlan, :idTrunkGroup, p.id,
                    CAST(s.rateinitial AS DECIMAL(15,6)),
                    GREATEST(CAST(s.initblock AS UNSIGNED), 1),
                    GREATEST(CAST(s.billingblock AS UNSIGNED), 1),
                    CAST(s.minimal_time_charge AS UNSIGNED),
                    CAST(s.connectcharge AS DECIMAL(15,5)),
                    CAST(s.disconnectcharge AS DECIMAL(15,5)),
                    CAST(s.package_offer AS UNSIGNED), 1
                 FROM tmp_rate_import_final s
                 INNER JOIN pkg_prefix p ON p.prefix = s.prefix
                 LEFT JOIN pkg_rate r ON r.id_plan = :idPlanExisting AND r.id_prefix = p.id
                 WHERE r.id IS NULL'
            );
            $command->bindValue(':idPlan', $idPlan, PDO::PARAM_INT);
            $command->bindValue(':idTrunkGroup', $idTrunkGroup, PDO::PARAM_INT);
            $command->bindValue(':idPlanExisting', $idPlan, PDO::PARAM_INT);
            $insertedRows = $command->execute();

            $transaction->commit();

            $importResult = [
                'loaded'     => $loadedRows,
                'duplicates' => $duplicateRows,
                'updated'    => $updatedRows,
                'inserted'   => $insertedRows,
            ];

            $this->msgSuccess = Yii::t('zii', 'Operation was successful.') . '</br>' .
                Yii::t('zii', 'Loaded') . ': ' . $importResult['loaded'] . '</br>' .
                Yii::t('zii', 'Duplicates') . ': ' . $importResult['duplicates'] . '</br>' .
                Yii::t('zii', 'Updated') . ': ' . $importResult['updated'] . '</br>' .
                Yii::t('zii', 'Inserted') . ': ' . $importResult['inserted'];

            MagnusLog::insertLOG(5, 'Module: rate  ' . json_encode($importResult));
        } catch (Exception $e) {
            if ($transaction !== null && $transaction->getActive()) {
                $transaction->rollback();
            }
            throw $e;
        } finally {
            try {
                $db->createCommand(
                    'DROP TEMPORARY TABLE IF EXISTS tmp_rate_import_final, tmp_rate_import'
                )->execute();
            } catch (Exception $e) {
            }

            if ($lockAcquired) {
                try {
                    $command = $db->createCommand('SELECT RELEASE_LOCK(:lockName)');
                    $command->bindValue(':lockName', $lockName, PDO::PARAM_STR);
                    $command->queryScalar();
                } catch (Exception $e) {
                }
            }
        }
    }
}
