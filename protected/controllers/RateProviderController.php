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
                'errors'           => Yii::t('zii', 'Invalid CSV delimiter.'),
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

        try {
            $this->importProviderRatesFromCsv(
                $values,
                $_FILES['file']['tmp_name'],
                $delimiter,
                $hasHeader,
                $lineTerminator
            );
        } catch (Exception $e) {
            echo json_encode([
                $this->nameSuccess => false,
                'errors'           => Yii::t('zii', 'MYSQL message.') . "\n\n" . $e->getMessage(),
            ]);
            exit;
        }
    }

    private function quoteLineTerminator($lineTerminator)
    {
        if ($lineTerminator === "\r\n") {
            return "'\\r\\n'";
        }

        return $lineTerminator === "\r" ? "'\\r'" : "'\\n'";
    }

    private function importProviderRatesFromCsv(
        $values,
        $fileName,
        $delimiter,
        $hasHeader = false,
        $lineTerminator = "\n"
    )
    {
        $idProvider = isset($values['id_provider']) ? (int) $values['id_provider'] : 0;

        if ($idProvider < 1) {
            throw new Exception(Yii::t('zii', 'Provider is required.'));
        }

        $db            = Yii::app()->db;
        $lockName      = 'mbilling-rate-provider-import-' . $idProvider;
        $lockAcquired  = false;
        $transaction   = null;
        $loadedRows    = 0;
        $duplicateRows = 0;
        $updatedRows   = 0;
        $insertedRows  = 0;

        try {
            $command = $db->createCommand('SELECT GET_LOCK(:lockName, 30)');
            $command->bindValue(':lockName', $lockName, PDO::PARAM_STR);
            $lockAcquired = (int) $command->queryScalar() === 1;

            if (! $lockAcquired) {
                throw new Exception(Yii::t('zii', 'Another tariff import is already running for this provider.'));
            }

            if ((int) $db->createCommand('SELECT @@GLOBAL.local_infile')->queryScalar() !== 1) {
                throw new Exception(Yii::t(
                    'zii',
                    'MariaDB local_infile is disabled. Enable local_infile=1 in the server configuration and restart MariaDB.'
                ));
            }

            $command = $db->createCommand('SELECT COUNT(*) FROM pkg_provider WHERE id = :idProvider');
            $command->bindValue(':idProvider', $idProvider, PDO::PARAM_INT);
            if ((int) $command->queryScalar() !== 1) {
                throw new Exception(Yii::t('zii', 'Provider is required.'));
            }

            $db->createCommand('DROP TEMPORARY TABLE IF EXISTS tmp_rate_provider_import')->execute();
            $db->createCommand(
                "CREATE TEMPORARY TABLE tmp_rate_provider_import (
                    row_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    prefix VARCHAR(64) NOT NULL,
                    destination VARCHAR(255) NOT NULL DEFAULT '',
                    buyrate VARCHAR(30) NOT NULL DEFAULT '0',
                    buyrateinitblock VARCHAR(20) NOT NULL DEFAULT '1',
                    buyrateincrement VARCHAR(20) NOT NULL DEFAULT '1',
                    minimal_time_buy VARCHAR(20) NOT NULL DEFAULT '0',
                    PRIMARY KEY (row_id),
                    KEY idx_tmp_rate_provider_prefix (prefix, row_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8"
            )->execute();

            $quotedFile      = $db->quoteValue($fileName);
            $quotedDelimiter = $db->quoteValue($delimiter);
            $ignoreLines     = $hasHeader ? ' IGNORE 1 LINES' : '';
            $sql = "LOAD DATA LOCAL INFILE $quotedFile
                INTO TABLE tmp_rate_provider_import
                CHARACTER SET UTF8
                FIELDS TERMINATED BY $quotedDelimiter OPTIONALLY ENCLOSED BY '\"'
                LINES TERMINATED BY " . $this->quoteLineTerminator($lineTerminator) . "$ignoreLines
                (@prefix,@destination,@buyrate,@buyrateinitblock,@buyrateincrement,@minimal_time_buy)
                SET prefix = REPLACE(REPLACE(TRIM(@prefix), '\\r', ''), CONVERT(0xEFBBBF USING utf8), ''),
                    destination = REPLACE(TRIM(COALESCE(@destination, '')), '\\r', ''),
                    buyrate = COALESCE(NULLIF(REPLACE(TRIM(@buyrate), '\\r', ''), ''), '0'),
                    buyrateinitblock = COALESCE(NULLIF(REPLACE(TRIM(@buyrateinitblock), '\\r', ''), ''), '1'),
                    buyrateincrement = COALESCE(NULLIF(REPLACE(TRIM(@buyrateincrement), '\\r', ''), ''), '1'),
                    minimal_time_buy = COALESCE(NULLIF(REPLACE(TRIM(@minimal_time_buy), '\\r', ''), ''), '0')";
            $loadedRows = $db->createCommand($sql)->execute();

            if ($loadedRows < 1) {
                throw new Exception(Yii::t('zii', 'The CSV file does not contain tariff rows.'));
            }

            $invalidCondition = "prefix NOT REGEXP '^[0-9]{1,18}$'
                OR CHAR_LENGTH(destination) > 60
                OR buyrate NOT REGEXP '^[0-9]{1,9}([.][0-9]{1,6})?$'
                OR buyrateinitblock NOT REGEXP '^[0-9]{1,10}$'
                OR CAST(buyrateinitblock AS UNSIGNED) > 2147483647
                OR buyrateincrement NOT REGEXP '^[0-9]{1,10}$'
                OR CAST(buyrateincrement AS UNSIGNED) > 2147483647
                OR minimal_time_buy NOT REGEXP '^[0-9]{1,10}$'
                OR CAST(minimal_time_buy AS UNSIGNED) > 2147483647";

            $invalidRows = (int) $db->createCommand(
                "SELECT COUNT(*) FROM tmp_rate_provider_import WHERE $invalidCondition"
            )->queryScalar();

            if ($invalidRows > 0) {
                $examples = $db->createCommand(
                    "SELECT row_id, prefix FROM tmp_rate_provider_import
                     WHERE $invalidCondition ORDER BY row_id LIMIT 20"
                )->queryAll();
                $exampleRows = [];
                foreach ($examples as $example) {
                    $exampleRows[] = $example['row_id'] . ':' . $example['prefix'];
                }
                throw new Exception(Yii::t(
                    'zii',
                    'CSV contains {count} invalid row(s). Row/prefix examples: {examples}',
                    [
                        '{count}'    => $invalidRows,
                        '{examples}' => implode(', ', $exampleRows),
                    ]
                ));
            }

            $duplicateRows = (int) $db->createCommand(
                'SELECT COUNT(*) - COUNT(DISTINCT prefix) FROM tmp_rate_provider_import'
            )->queryScalar();

            // A repeated prefix in the same CSV is deterministic: the last row wins.
            $db->createCommand(
                'CREATE TEMPORARY TABLE tmp_rate_provider_import_final ENGINE=InnoDB AS
                 SELECT prefix, destination, buyrate, buyrateinitblock,
                        buyrateincrement, minimal_time_buy
                 FROM (
                    SELECT t.*,
                           ROW_NUMBER() OVER (PARTITION BY prefix ORDER BY row_id DESC) AS row_position
                    FROM tmp_rate_provider_import t
                 ) ranked
                 WHERE row_position = 1'
            )->execute();
            $db->createCommand(
                'ALTER TABLE tmp_rate_provider_import_final ADD PRIMARY KEY (prefix)'
            )->execute();

            $transaction = $db->beginTransaction();

            $db->createCommand(
                'INSERT IGNORE INTO pkg_prefix (prefix, destination)
                 SELECT prefix, destination FROM tmp_rate_provider_import_final'
            )->execute();

            $db->createCommand(
                'UPDATE pkg_prefix p
                 INNER JOIN tmp_rate_provider_import_final s ON s.prefix = p.prefix
                 SET p.destination = s.destination
                 WHERE s.destination <> "" AND p.destination <> s.destination'
            )->execute();

            $command = $db->createCommand(
                'UPDATE pkg_rate_provider r
                 INNER JOIN pkg_prefix p ON p.id = r.id_prefix
                 INNER JOIN tmp_rate_provider_import_final s ON s.prefix = p.prefix
                 SET r.buyrate = CAST(s.buyrate AS DECIMAL(15,6)),
                     r.buyrateinitblock = GREATEST(CAST(s.buyrateinitblock AS UNSIGNED), 1),
                     r.buyrateincrement = GREATEST(CAST(s.buyrateincrement AS UNSIGNED), 1),
                     r.minimal_time_buy = CAST(s.minimal_time_buy AS UNSIGNED),
                     r.dialprefix = NULL,
                     r.destination = NULL
                 WHERE r.id_provider = :idProvider'
            );
            $command->bindValue(':idProvider', $idProvider, PDO::PARAM_INT);
            $updatedRows = $command->execute();

            $command = $db->createCommand(
                'INSERT INTO pkg_rate_provider (
                    id_provider, id_prefix, buyrate, buyrateinitblock,
                    buyrateincrement, minimal_time_buy
                 )
                 SELECT :idProvider, p.id,
                    CAST(s.buyrate AS DECIMAL(15,6)),
                    GREATEST(CAST(s.buyrateinitblock AS UNSIGNED), 1),
                    GREATEST(CAST(s.buyrateincrement AS UNSIGNED), 1),
                    CAST(s.minimal_time_buy AS UNSIGNED)
                 FROM tmp_rate_provider_import_final s
                 INNER JOIN pkg_prefix p ON p.prefix = s.prefix
                 LEFT JOIN pkg_rate_provider r
                    ON r.id_provider = :idProviderExisting AND r.id_prefix = p.id
                 WHERE r.id IS NULL'
            );
            $command->bindValue(':idProvider', $idProvider, PDO::PARAM_INT);
            $command->bindValue(':idProviderExisting', $idProvider, PDO::PARAM_INT);
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

            MagnusLog::insertLOG(5, 'Module: rateprovider  ' . json_encode($importResult));
        } catch (Exception $e) {
            if ($transaction !== null && $transaction->getActive()) {
                $transaction->rollback();
            }
            throw $e;
        } finally {
            try {
                $db->createCommand(
                    'DROP TEMPORARY TABLE IF EXISTS tmp_rate_provider_import_final, tmp_rate_provider_import'
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
