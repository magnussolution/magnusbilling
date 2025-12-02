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

class CampaignRestrictPhoneController extends Controller
{
    public $attributeOrder = 't.id';

    public function init()
    {
        $this->instanceModel = new CampaignRestrictPhone;
        $this->abstractModel = CampaignRestrictPhone::model();
        $this->titleReport   = Yii::t('zii', 'Campaign Restrict Phone');
        parent::init();
    }

    public function actionDeleteDuplicados()
    {

        $this->abstractModel->deleteDuplicatedrows();
        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => 'Números duplicado deletados com successo',
        ]);
    }

    public function actionImportFromCsv()
    {
        if (! Yii::app()->session['id_user'] || Yii::app()->session['isClient'] == true) {
            exit();
        }

        Util::validExtension($_FILES['file']['tmp_name'], $_FILES["file"]["name"], ['csv']);

        $handle = fopen($_FILES['file']['tmp_name'], "r");
        $line   = fgets($handle);

        if (preg_match('/Cadastrado|bloqueado/', $line)) {

            ini_set("upload_max_filesize", "3M");
            ini_set("max_execution_time", "120");
            $values = $this->getAttributesRequest();

            $values['delimiter'] = preg_match("/;/", $line) ? ';' : ',';

            $this->importNumbers($handle, $values);
            fclose($handle);

            echo json_encode([
                $this->nameSuccess => true,
                'msg'              => $this->msgSuccess,
            ]);
        } else {
            parent::actionImportFromCsv();
        }
    }

    public function importNumbers($handle, $values)
    {
        $sqlNumbersInsert = [];
        $sqlNumbersDelete = '';
        while (($row = fgetcsv($handle, 32768, $values['delimiter'])) !== false) {

            if (isset($row[1])) {
                if (! isset($row[0]) || $row[0] == '') {
                    echo json_encode([
                        $this->nameSuccess => false,
                        'errors'           => 'Prefix not exit in the CSV file . Line: ' . print_r($row, true),
                    ]);
                    exit;
                }
                $number = preg_replace('/-/', '', trim($row[0]));

                if (strlen($number) < 12) {
                    $number = '55' . $number;
                }
                if ($row[2] == 'bloqueado') {
                    $sqlNumbersInsert[] = "('$number')";
                }
                if ($row[2] == 'desbloqueado') {
                    $sqlNumbersDelete .= "'$number', ";
                }
            }
        }

        if (count($sqlNumbersInsert) > 0) {
            SqlInject::sanitize($sqlNumbersInsert);
            if (count($sqlNumbersInsert) > 0) {
                $result = CampaignRestrictPhone::model()->insertNumbers($sqlNumbersInsert);

                if (isset($result->errorInfo)) {
                    echo json_encode([
                        $this->nameSuccess => false,
                        'errors'           => $this->getErrorMySql($result),
                    ]);
                    exit;
                }
            }
        }

        if (count($sqlNumbersDelete) > 0) {
            if (strlen($sqlNumbersDelete) > 1) {
                $result = CampaignRestrictPhone::model()->deleteNumbers($sqlNumbersDelete);

                if (isset($result->errorInfo)) {
                    echo json_encode([
                        $this->nameSuccess => false,
                        'errors'           => $this->getErrorMySql($result),
                    ]);
                    exit;
                }
            }
        }
    }
}
