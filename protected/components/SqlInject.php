<?php

/**
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
 *
 */
class sqlInject
{

    public static function sanitize($src)
    {
        $codes = [
            'UPDATE ',
            'SELECT ',
            ' SET ',
            ' TABLE ',
            'DELETE FROM',
            ' DATABASE ',
            'DROP TABLE',
            'DROP DATABASE',
            'SCHEMA',
            'CONCAT',
            'foreign_key',
            'TRUNCATE ',
            'CREATE ',
            'print',
            'echo ',
            'while',
            'shell_exec',
            'popen',
            'proc_open',
            'passthru',
            'eval',
            'assert',
            'fopen',
            'file_get_contents',
            'file_put_contents',
            'unlink',
            'mkdir',
            'rmdir',
            'copy',
            'rename',
            'curl_exec',
            'curl_init',
            'fsockopen',
            'socket_connect',
            'mysql_query',
            'mysqli_query',
            'pg_query',
            'sqlite_query',
            'prepare',
            'alert',
            'src=',
            '<img',
            'console',
            'EXTRACTVALUE'
        ];

        if (is_array($src)) {
            foreach ($src as $key => $value) {

                if ($key == 'key' && Yii::app()->controller->id == 'authentication') {
                    continue;
                }
                foreach ($codes as $code) {

                    $code = strtolower($code);
                    if (Util::isJson($value)) {
                        $value = json_decode($value);
                        $value = (array) $value;
                    }

                    if (is_array($value)) {
                        foreach ($value as $key => $valuearray) {

                            if (is_object($valuearray)) {
                                $valuearray = (array) $valuearray;
                            }

                            if (is_array($valuearray)) {
                                foreach ($valuearray as $key => $value) {

                                    if (is_object($value)) {
                                        $value = (array) $value;
                                    }

                                    $value = is_string($value) ?  @strtolower($value) : NULL;

                                    if (strlen($value) > 250) {
                                        $info    = 'Variable to long: ' . $value . '. Controller => ' . Yii::app()->controller->id;
                                        MagnusLog::insertLOG(2, $info);
                                        echo json_encode([
                                            'rows'  => [],
                                            'count' => 0,
                                            'sum'   => [],
                                            'msg'   => CHtml::encode($info)
                                        ]);
                                        exit;
                                    }


                                    if (preg_match("/$code/", $value)) {


                                        $info    = 'Trying SQL inject, code: ' . $value . '. Controller => ' . Yii::app()->controller->id . '. Code ' . $code;
                                        MagnusLog::insertLOG(2, $info);
                                        echo json_encode([
                                            'rows'  => [],
                                            'count' => 0,
                                            'sum'   => [],
                                            'msg'   =>  CHtml::encode($info)
                                        ]);
                                        exit;
                                    }
                                }
                            } else {
                                $value = is_string($valuearray) ?  @strtolower($valuearray) : NULL;
                                if (strlen($value) > 250) {
                                    $info    = 'Variable to long: ' . $valuearray . '. Controller => ' . Yii::app()->controller->id;
                                    MagnusLog::insertLOG(2, $info);
                                    echo json_encode([
                                        'rows'  => [],
                                        'count' => 0,
                                        'sum'   => [],
                                        'msg'   =>  CHtml::encode($info)
                                    ]);
                                    exit;
                                }

                                if (isset($valuearray->data->type) && $valuearray->data->type == 'list') {
                                    return;
                                } else  if (isset($valuearray->type) && $valuearray->type == 'numeric') {
                                    return;
                                }



                                if (preg_match("/$code/", $valuearray)) {


                                    $info    = 'Trying SQL inject, code: ' . $valuearray . '. Controller => ' . Yii::app()->controller->id . '. Code ' . $code;
                                    $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
                                    MagnusLog::insertLOG(2, $info);
                                    echo json_encode([
                                        'rows'  => [],
                                        'count' => 0,
                                        'sum'   => [],
                                        'msg'   => CHtml::encode($info)
                                    ]);
                                    exit;
                                }
                            }
                        }
                    } else {

                        if (strlen($value) > 1000) {
                            $info    = 'Variable to long2: ' . $value . '. Controller => ' . Yii::app()->controller->id;
                            MagnusLog::insertLOG(2, $info);
                            echo json_encode([
                                'rows'  => [],
                                'count' => 0,
                                'sum'   => [],
                                'msg'   => CHtml::encode($info)
                            ]);
                            exit;
                        }
                        $value = strtolower($value);
                        if (preg_match("/$code/", $value)) {
                            $info    = 'Trying SQL inject, code: ' . $value . '. Controller => ' . Yii::app()->controller->id . '. Code ' . $code;
                            MagnusLog::insertLOG(2, $info);
                            echo json_encode([
                                'rows'  => [],
                                'count' => 0,
                                'sum'   => [],
                                'msg'   => CHtml::encode($info)
                            ]);
                            exit;
                        }
                    }
                }
            }
        } else {


            foreach ($codes as $code) {

                $code = strtolower($code);
                if (strlen($src) > 1000) {
                    $info    = 'Trying SQL inject, code. Variable to long2: ' . $src . '. Controller => ' . Yii::app()->controller->id;
                    MagnusLog::insertLOG(2, $info);
                    echo json_encode([
                        'rows'  => [],
                        'count' => 0,
                        'sum'   => [],
                        'msg'   => CHtml::encode($info)
                    ]);
                    exit;
                }
                $src = strtolower($src);
                if (preg_match("/$code/", $src)) {
                    $info    = 'Trying SQL inject, code: 2' . $src . '. Controller => ' . Yii::app()->controller->id . '. Code ' . $code;
                    MagnusLog::insertLOG(2, $info);
                    echo json_encode([
                        'rows'  => [],
                        'count' => 0,
                        'sum'   => [],
                        'msg'   => CHtml::encode($info)
                    ]);
                    exit;
                }
            }
        }
    }
}
