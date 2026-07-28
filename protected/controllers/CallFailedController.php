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
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(410);
            echo json_encode([
                'success' => false,
                'msg' => Yii::t(
                    'zii',
                    'This legacy call detail action is disabled. Use Diagnose call.'
                ),
            ]);
            Yii::app()->end();
        }
    }
