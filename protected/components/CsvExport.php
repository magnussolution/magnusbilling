<?php
/**
 * CsvExport
 *
 * helper class to output an CSV from a CActiveRecord array.
 * Modelo para a tabela "Call".
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
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 17/08/2017
 */
class CsvExport
{
    /*
    export a data set to CSV output.

    Please refer to CFormatter about column definitions, this class will use CFormatter.

    @rows    CModel array. (you can use a CActiveRecord array because it extends from CModel)
    @coldefs    example: 'colname'=>array('number') (See also CFormatter about this string)
    @boolPrintRows    boolean, true print col headers taken from coldefs array key
    @csvFileName if set (defaults null) it echoes the output to browser using binary transfer headers
    @separator if set (defaults to ';') specifies the separator for each CSV field
     */
    public static function export($model, $columns, $boolPrintRows = true, $csvFileName = null, $separator = ';')
    {
        $endLine   = "\r\n";
        $returnVal = '';

        if ($csvFileName != null) {
            header("Cache-Control: public");
            header("Content-Description: File Transfer");
            header("Content-Disposition: attachment; filename=" . $csvFileName);
            header("Content-Type: application/octet-stream");
            header("Content-Transfer-Encoding: binary");
        }

        if ($boolPrintRows == true) {
            foreach ($columns as $col => $config) {
                echo $config['header'] . $separator;
            }
            echo $endLine;

        }

        $controllerName = Yii::app()->controller->id;

        foreach ($model as $row) {
            $r = '';

            foreach ($columns as $col => $config) {

                if (isset($row[$config['dataIndex']])) {

                    if ($config['dataIndex'] == 'id_user') {
                        $val = $row['idUser']['username'];
                    } elseif ($config['dataIndex'] == 'id_trunk') {
                        $val = $row['idTrunk']['trunkcode'];
                    } elseif ($config['dataIndex'] == 'id_plan') {
                        $val = $row['idPlan']['name'];
                    } elseif ($config['dataIndex'] == 'id_group') {
                        $val = $row['idGroup']['name'];
                    } elseif ($config['dataIndex'] == 'id_did') {
                        $val = $row['idDid']['did'];
                    } elseif ($config['dataIndex'] == 'id_phonebook') {
                        $val = $row['idPhonebook']['name'];
                    } elseif ($config['dataIndex'] == 'active') {
                        $val = $row[$config['dataIndex']] == 1 ? 'Active' : 'Inactive';
                    }
                    //get prefix destination call module
                    elseif ($config['dataIndex'] == 'id' && $controllerName == 'call') {
                        $val = $row['idPrefix']['destination'];
                    }
                    //get prefix destination call rate
                    elseif ($config['dataIndex'] == 'id' && $controllerName == 'rate') {
                        $val = $row['idPrefix']['destination'];
                    }
                    //get prefix destination call rate
                    elseif ($config['dataIndex'] == 'id_prefix' && $controllerName == 'rate') {
                        $val = $row['idPrefix']['prefix'];
                    } else {
                        $val = $row[$config['dataIndex']];
                    }

                    $r .= $val . $separator;
                }
            }
            $item = trim(rtrim($r, $separator)) . $endLine;

            if ($csvFileName != null) {
                echo $item;
            } else {
                $returnVal .= $item;
            }
        }

        return $returnVal;
    }
}
