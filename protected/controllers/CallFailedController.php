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

    class CallFailedController extends Controller
    {
        public $attributeOrder = 't.id DESC';
        public $extraValues    = [
            'idUser'   => 'username',
            'idPlan'   => 'name',
            'idTrunk'  => 'trunkcode',
            'idPrefix' => 'destination',
            'idServer' => 'name',
        ];

        public $fieldsInvisibleClient = [
            'username',
            'trunk',
            'id_user',
            'provider_name',
        ];

        public $fieldsInvisibleAgent = [
            'trunk',
            'id_user',
            'provider_name',
        ];

        public $fieldsFkReport = [
            'id_user'   => [
                'table'       => 'pkg_user',
                'pk'          => 'id',
                'fieldReport' => "username ",
            ],
            'id_trunk'  => [
                'table'       => 'pkg_trunk',
                'pk'          => 'id',
                'fieldReport' => 'trunkcode',
            ],
            'id_prefix' => [
                'table'       => 'pkg_prefix',
                'pk'          => 'id',
                'fieldReport' => 'destination',
            ],
            'id'        => [
                'table'       => 'pkg_prefix',
                'pk'          => 'id',
                'fieldReport' => 'destination',
            ],
            'id_server' => [
                'table'       => 'pkg_servers',
                'pk'          => 'id',
                'fieldReport' => 'name',
            ],
        ];

        public function init()
        {
            $this->instanceModel = new CallFailed;
            $this->abstractModel = CallFailed::model();
            $this->titleReport   = Yii::t('zii', 'Call Failed');

            parent::init();

            if ( ! Yii::app()->session['isAdmin']) {
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
            unset($arrPost['idPrefixdestination']);

            return $arrPost;
        }

        public function createCondition($filter)
        {
            $condition = '1';

            if ( ! is_array($filter)) {
                return $condition;
            }

            foreach ($filter as $key => $f) {
                $isSubSelect = false;

                if ( ! isset($f->type)) {
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

                $value     = isset($f->value) ? $f->value : new CDbExpression('NULL');
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
                        switch ($comparison) {
                            case 'eq':
                                $this->paramsFilter[$paramName] = strtok($value, ' ') . "%";
                                $condition .= " AND $field LIKE :$paramName";
                                break;
                            case 'lt':
                                $this->paramsFilter[$paramName] = $value;
                                $condition .= " AND $field < :$paramName";
                                break;
                            case 'gt':
                                $this->paramsFilter[$paramName] = $value;
                                $condition .= " AND $field > :$paramName";
                                break;
                        }
                        break;
                    case 'string':
                        $field = isset($f->caseSensitive) && $f->caseSensitive && ! is_array($field) ? "BINARY $field" : $field;

                        switch ($comparison) {
                            case 'st':

                                if ($field == 'idUser.username') {
                                    $modelUser = User::model()->find('username LIKE :key', [':key' => $value . '%']);
                                    if (isset($modelUser->id)) {
                                        $condition .= ' AND id_user = :id_user_username';
                                        $this->paramsFilter['id_user_username'] = $modelUser->id;
                                        break;
                                    }
                                }

                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field LIKE :$paramName",
                                        ];
                                    }

                                } else {
                                    $condition .= " AND $field LIKE :$paramName";
                                }

                                $this->paramsFilter[$paramName] = "$value%";

                                break;
                            case 'ed':

                                if ($field == 'idUser.username') {
                                    $modelUser = User::model()->find('username LIKE :key', [':key' => '%' . $value]);
                                    if (isset($modelUser->id)) {
                                        $condition .= ' AND id_user = :id_user_username';
                                        $this->paramsFilter['id_user_username'] = $modelUser->id;
                                        break;
                                    }
                                }

                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field LIKE :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field LIKE :$paramName";
                                }

                                $this->paramsFilter[$paramName] = "%$value";

                                break;
                            case 'ct':

                                if ($field == 'idUser.username') {
                                    $modelUser = User::model()->find('username LIKE :key', [':key' => '%' . $value . '%']);
                                    if (isset($modelUser->id)) {
                                        $condition .= ' AND id_user = :id_user_username';
                                        $this->paramsFilter['id_user_username'] = $modelUser->id;
                                        break;
                                    }
                                }

                                if (is_array($field)) {
                                    $conditionsOr = [];

                                    foreach ($field as $keyOr => $fieldOr) {
                                        $this->paramsFilter["pOr$keyOr"] = "%$value%";
                                        $fieldOr                         = isset($f->caseSensitive) && $f->caseSensitive ? "BINARY $fieldOr" : $fieldOr;
                                        array_push($conditionsOr, "$fieldOr LIKE :pOr$keyOr");
                                    }

                                    $conditionsOr = implode(' OR ', $conditionsOr);
                                    $condition .= " AND ($conditionsOr)";
                                } else {

                                    if (preg_match("/^id[A-Z].*\./", $field)) {

                                        if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                            $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field LIKE :$paramName";
                                        } else {
                                            $this->relationFilter[strtok($field, '.')] = [
                                                'condition' => "$field LIKE :$paramName",
                                            ];
                                        }
                                        $this->paramsFilter[$paramName] = "%" . $value . "%";
                                    } else {
                                        $condition .= " AND LOWER($field) LIKE :$paramName";
                                        $this->paramsFilter[$paramName] = "%" . strtolower($value) . "%";
                                    }

                                }
                                break;
                            case 'eq':

                                if ($field == 'idUser.username') {
                                    $modelUser = User::model()->find('username = :key', [':key' => $value]);
                                    if (isset($modelUser->id)) {
                                        $condition .= ' AND id_user = :id_user_username';
                                        $this->paramsFilter['id_user_username'] = $modelUser->id;
                                        break;
                                    }
                                }

                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field = :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field = :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field = :$paramName";
                                }

                                $this->paramsFilter[$paramName] = $value;
                                break;
                            case 'df':
                                $this->paramsFilter[$paramName] = $value;
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field != :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field != :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field != :$paramName";
                                }

                                break;
                        }

                        break;
                    case 'boolean':
                        $this->paramsFilter[$paramName] = (int) $value;
                        $condition .= " AND $field = :$paramName";
                        break;
                    case 'numeric':
                        $this->paramsFilter[$paramName] = $value;
                        switch ($comparison) {
                            case 'eq':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field = :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field = :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field = :$paramName";
                                }

                                break;
                            case 'lt':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field < :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field < :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field < :$paramName";
                                }

                                break;
                            case 'gt':
                                if (preg_match("/^id[A-Z].*\./", $field)) {
                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field > :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field > :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field > :$paramName";
                                }

                                break;
                        }

                    case 'list':
                        $value = is_array($value) ? $value : [$value];

                        if ( ! isset($f->tableRelated)) {
                            $paramsIn = [];

                            foreach ($value as $keyIn => $v) {
                                $this->paramsFilter["pIn$key$keyIn"] = $v;
                                array_push($paramsIn, ":pIn$key$keyIn");
                            }

                            $paramsIn = implode(',', $paramsIn);
                            $condition .= " AND $field IN($paramsIn)";
                        } else {
                            $value             = $value[0];
                            $operatorSubSelect = isset($f->operatorSubSelect) ? $f->operatorSubSelect : '=';
                            $subSelect         = "SELECT DISTINCT $f->fieldSubSelect FROM $f->tableRelated WHERE $f->fieldWhere $operatorSubSelect $value";
                            $condition .= " AND $field IN($subSelect)";
                        }
                        break;
                    case 'notlist':
                        $value = is_array($value) ? $value : [$value];

                        if ( ! isset($f->tableRelated)) {
                            $paramsNotIn = [];

                            if (count($value)) {
                                foreach ($value as $keyNotIn => $v) {
                                    $this->paramsFilter["pNotIn$keyNotIn"] = $v;
                                    array_push($paramsNotIn, ":pNotIn$keyNotIn");
                                }

                                $paramsNotIn = implode(',', $paramsNotIn);
                                $condition .= " AND $field NOT IN($paramsNotIn)";
                            }
                        } else {
                            $value                          = $value[0];
                            $operatorSubSelect              = isset($f->operatorSubSelect) ? $f->operatorSubSelect : '=';
                            $this->paramsFilter[$paramName] = $value;
                            $subSelect                      = "SELECT DISTINCT $f->fieldSubSelect FROM $f->tableRelated WHERE $f->fieldWhere $operatorSubSelect :$paramName";
                            $condition .= " AND $field NOT IN($subSelect)";
                        }
                        break;
                }
            }

            return $condition;
        }

        public function actionCallInfo()
        {
        ?>

<style type="text/css">

#border {
border: 5px solid #1C6EA4;
border-radius: 9px;
}

table.blueTable {
  border: 1px solid #1C6EA4;

  width: 100%;
  text-align: left;
  border-collapse: collapse;
}
table.blueTable td, table.blueTable th {
  border: 1px solid #AAAAAA;
  padding: 3px 2px;
}
table.blueTable tbody td {
  font-size: 13px;
}
table.blueTable tr:nth-child(even) {
  background: #D0E4F5;
}
table.blueTable thead {
  background: #1C6EA4;
  background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
  border-bottom: 2px solid #444444;
}
table.blueTable thead th {
  font-size: 15px;
  font-weight: bold;
  color: #FFFFFF;
  border-left: 2px solid #D0E4F5;
}
table.blueTable thead th:first-child {
  border-left: none;
}

table.blueTable tfoot {
  font-size: 14px;
  font-weight: bold;
  color: #FFFFFF;
  background: #D0E4F5;
  background: -moz-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
  background: -webkit-linear-gradient(top, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
  background: linear-gradient(to bottom, #dcebf7 0%, #d4e6f6 66%, #D0E4F5 100%);
  border-top: 2px solid #444444;
}
table.blueTable tfoot td {
  font-size: 14px;
}
table.blueTable tfoot .links {
  text-align: right;
}
table.blueTable tfoot .links a{
  display: inline-block;
  background: #1C6EA4;
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 5px;
}

</style>


    <?php
        $model = CallFailed::model()->findByPk((int) $_GET['id']);

                if ( ! isset($model->idServer->id) || $model->idServer->type == 'mbilling') {

                    $log_file       = '/var/log/asterisk/magnus';
                    $called_station = $model->calledstation;

                    // Read the log file
                    $lines = file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

                    //$lines = htmlentities($lines[0]);

                    // Filter lines that contain the $called_station value
                    $matched_lines = array_filter($lines, function ($line) use ($called_station) {
                        return strpos($line, $called_station) !== false;
                    });

                    if ( ! count($matched_lines)) {
                        echo "Log not found";
                        exit;
                    }

                    echo '<br>';
                    echo '<table class="blueTable" width=100%><tr>';
                    echo '<tr>';
                    echo '<th  colspan=4>Below data is the last SIP sinalization from trunk to the number ' . $model->calledstation . ' ' . $model->starttime . '</th>';

                    echo '</tr>';
                    echo '<th>Date</th>';
                    echo '<th>To tag</th>';
                    echo '<th>Sip Code</th>';
                    echo '<th>Reason</th>';
                    foreach ($matched_lines as $key => $value) {

                        $value = htmlentities($value);

                        $line = explode('|', $value);
                        if ( ! isset($line[1])) {
                            continue;
                        }
                        $data = explode('] ', $line[0]);
                        echo '<tr>';
                        echo '<td>' . substr($data[0], 1) . '</td>';
                        echo '<td>' . $line[1] . '</td>';
                        echo '<td>' . $line[2] . '</td>';
                        echo '<td>' . $line[3] . '</td>';
                        echo '</tr>';

                    }
                    echo '</tr></table>';

                } else {

                    if (filter_var($model->idServer->host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                        $ip = $model->idServer->host;
                    } else {
                        $ip = $model->idServer->public_ip;
                    }
                    header('Location: http://' . $ip . '/mbilling?id=' . $model->id);

                }
            }
    }
