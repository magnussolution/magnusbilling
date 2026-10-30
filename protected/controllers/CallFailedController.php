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

                if (! is_object($f) || ! isset($f->type)
                    || ! in_array($f->type, ['date', 'string', 'boolean', 'numeric', 'list', 'notlist'], true)) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                }

                // Filter requests may select exposed fields, never supply SQL subqueries.
                foreach (['tableRelated', 'fieldSubSelect', 'fieldWhere', 'operatorSubSelect'] as $sqlPart) {
                    if (property_exists($f, $sqlPart)) {
                        $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                    }
                }

                $type  = $f->type;
                $field = isset($f->field) ? $f->field : null;

                if (! $this->isAllowedCallFailedFilterField($field)) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                }

                if ($this->actionName != 'destroy' && ! preg_match("/^id[A-Z]/", $field)) {

                    if (is_array($field)) {
                        foreach ($field as $key => $fieldOr) {
                            $field[$key] = strpos($fieldOr, '.') === false ? 't.' . $fieldOr : $fieldOr;
                        }
                    } else {
                        $field = strpos($field, '#') === 0 ? str_replace('#', '', $field) : (strpos($field, '.') === false ? 't.' . $field : $field);
                    }
                }

                $value = isset($f->value) ? $f->value : null;
                $values = is_array($value) ? $value : [$value];
                if (is_array($value) && ! in_array($type, ['list', 'notlist'], true)) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                }
                foreach ($values as $item) {
                    if ($item !== null && ! is_scalar($item)) {
                        $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                    }
                }
                $relationName = preg_match('/^(id[A-Z][a-zA-Z0-9_]*)\./', $field, $relationMatch)
                    ? $relationMatch[1] : null;
                $paramName = "p$key";

                if (isset($f->data->comparison)) {
                    $comparison = $f->data->comparison;
                } else if (isset($f->comparison)) {
                    $comparison = $f->comparison;
                } else {
                    $comparison = null;
                }
                $comparisons = [
                    'date' => ['eq', 'lt', 'gt'],
                    'string' => ['st', 'ed', 'ct', 'eq', 'df'],
                    'numeric' => ['eq', 'lt', 'gt'],
                ];
                if (isset($comparisons[$type]) && ! in_array($comparison, $comparisons[$type], true)) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
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

                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field LIKE :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
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

                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field LIKE :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
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

                                    if ($relationName !== null) {

                                        if (array_key_exists($relationName, $this->relationFilter)) {
                                            $this->relationFilter[$relationName]['condition'] .= " AND $field LIKE :$paramName";
                                        } else {
                                            $this->relationFilter[$relationName] = [
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

                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field = :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
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
                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field != :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
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
                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field = :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
                                            'condition' => "$field = :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field = :$paramName";
                                }

                                break;
                            case 'lt':
                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field < :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
                                            'condition' => "$field < :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field < :$paramName";
                                }

                                break;
                            case 'gt':
                                if ($relationName !== null) {
                                    if (array_key_exists($relationName, $this->relationFilter)) {
                                        $this->relationFilter[$relationName]['condition'] .= " AND $field > :$paramName";
                                    } else {
                                        $this->relationFilter[$relationName] = [
                                            'condition' => "$field > :$paramName",
                                        ];
                                    }
                                } else {
                                    $condition .= " AND $field > :$paramName";
                                }

                                break;
                        }

                        break;
                    case 'list':
                    case 'notlist':
                        $value = is_array($value) ? $value : [$value];
                        $placeholders = [];
                        foreach (array_values($value) as $index => $item) {
                            $name = "pList{$key}_{$index}";
                            $this->paramsFilter[$name] = $item;
                            $placeholders[] = ':' . $name;
                        }
                        if ($placeholders) {
                            $operator = $type === 'list' ? 'IN' : 'NOT IN';
                            $predicate = "$field $operator(" . implode(',', $placeholders) . ')';
                        } else {
                            $predicate = $type === 'list' ? '0=1' : '1=1';
                        }
                        if ($relationName !== null) {
                            if (isset($this->relationFilter[$relationName])) {
                                $this->relationFilter[$relationName]['condition'] .= ' AND ' . $predicate;
                            } else {
                                $this->relationFilter[$relationName] = ['condition' => $predicate];
                            }
                        } else {
                            $condition .= ' AND ' . $predicate;
                        }
                        break;
                }
            }

            return $condition;
        }

        public function convertRelationFilter()
        {
            $db = Yii::app()->db;
            $relations = $this->abstractModel->getMetaData()->relations;
            $joins = '';
            $conditions = '';
            foreach ($this->relationFilter as $name => $filter) {
                if (! is_string($name) || ! preg_match('/\Aid[A-Z][a-zA-Z0-9_]*\z/', $name)
                    || ! isset($this->extraValues[$name], $relations[$name])
                    || ! is_array($filter) || ! isset($filter['condition']) || ! is_string($filter['condition'])) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                }
                $relation = $relations[$name];
                $model = CActiveRecord::model($relation->className);
                $foreignKey = $relation->foreignKey;
                $primaryKey = $model->getTableSchema()->primaryKey;
                if (! $relation instanceof CBelongsToRelation || ! is_string($foreignKey)
                    || ! isset($this->abstractModel->getMetaData()->columns[$foreignKey])
                    || ! is_string($primaryKey)) {
                    $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                }
                foreach (explode(' AND ', $filter['condition']) as $predicate) {
                    if ($predicate === '0=1' || $predicate === '1=1') {
                        continue;
                    }
                    $pattern = '/\A(?:BINARY )?' . preg_quote($name, '/')
                        . '\.([a-zA-Z_][a-zA-Z0-9_]*) (?:LIKE|!=|=|<|>|IN|NOT IN) '
                        . '(:[a-zA-Z_][a-zA-Z0-9_]*|\(:[a-zA-Z_][a-zA-Z0-9_]*(?:,:[a-zA-Z_][a-zA-Z0-9_]*)*\))\z/';
                    // IN uses no space before its parenthesized parameter list.
                    $normalized = preg_replace('/ (NOT IN|IN)\(/', ' $1 (', $predicate);
                    if (! preg_match($pattern, $normalized, $matches)
                        || ! isset($model->getMetaData()->columns[$matches[1]])) {
                        $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                    }
                    preg_match_all('/:([a-zA-Z_][a-zA-Z0-9_]*)/', $matches[2], $parameters);
                    foreach ($parameters[1] as $parameter) {
                        if (! array_key_exists($parameter, (array) $this->paramsFilter)
                            && ! array_key_exists(':' . $parameter, (array) $this->paramsFilter)) {
                            $this->sendError('Invalid call filter. Check its field and value.', [], 400);
                        }
                    }
                }
                $joins .= ' JOIN ' . $db->quoteTableName($model->tableName()) . ' ' . $db->quoteTableName($name)
                    . ' ON t.' . $db->quoteColumnName($foreignKey) . ' = '
                    . $db->quoteTableName($name) . '.' . $db->quoteColumnName($primaryKey);
                $conditions .= ' AND (' . $filter['condition'] . ')';
            }
            $this->join .= $joins;
            $this->filter .= $conditions;
        }

        protected function isAllowedCallFailedFilterField($field)
        {
            if (! is_string($field) || $field === '') {
                return false;
            }

            $hasTableAlias = strpos($field, 't.') === 0;
            if ($hasTableAlias) {
                $field = substr($field, 2);
            }

            if (! preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?$/', $field)) {
                return false;
            }

            $fieldParts = explode('.', $field);
            if (count($fieldParts) === 1) {
                $columns = $this->abstractModel->getMetaData()->columns;
                return isset($columns[$field]);
            }

            if ($hasTableAlias) {
                return false;
            }

            list($relationName, $relatedField) = $fieldParts;
            if (! isset($this->extraValues[$relationName])) {
                return false;
            }

            $exposedFields = explode(',', $this->extraValues[$relationName]);
            return in_array($relatedField, $exposedFields, true);
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
