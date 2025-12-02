<?php

/**
 * Default Controll.
 *
 * MagnusBilling <info@magnusbilling.com>
 * 11/05/2017
 */
class BaseController extends CController
{
    public $success = true;
    public $msg;
    public $select = '*';
    public $join;
    public $nameRoot               = 'rows';
    public $nameCount              = 'count';
    public $nameSuccess            = 'success';
    public $nameMsg                = 'msg';
    public $nameMsgErrors          = 'errors';
    public $nameParamStart         = 'start';
    public $nameParamLimit         = 'limit';
    public $nameParamSort          = 'sort';
    public $nameParamDir           = 'dir';
    public $msgSuccess             = 'Operation successful.';
    public $msgSuccessLot          = 'Records updated successfully';
    public $msgRecordNotFound      = 'Record not found.';
    public $msgRecordAlreadyExists = 'Record already exists.';
    public $defaultFilter          = '1';
    public $fieldsFkReport;
    public $fieldsCurrencyReport;
    public $fieldsPercentReport;
    public $rendererReport;
    public $abstractModel;
    public $instanceModel;
    public $abstractModelRelated;
    public $nameModelRelated;
    public $nameFkRelated;
    public $nameOtherFkRelated;
    public $extraFieldsRelated = [];
    public $titleReport;
    public $subTitleReport;
    public $addAuthorizedNoSession;
    public $attributes     = [];
    public $extraValues    = [];
    public $mapErrorsMySql = [
        1451 => 'Record to be deleted is related to another. Technical information: ',
        1452 => 'Record to be related not found: <br>Technical Information:',
        0    => 'Technical Information: ',
    ];
    public $isNewRecord;
    public $isUpdateAll;
    public $filter;
    public $limit;
    public $group = 1;
    public $msgError;
    public $filterByUser        = true;
    public $defaultFilterByUser = 'id_user';
    public $is_ratecard_view;
    public $fieldCard;
    public $fieldsInvisibleOperator = [];
    public $fieldsInvisibleAgent    = [];
    public $nameSum                 = 'sum';
    public $recordsSum              = [];
    public $saveAttributes          = false;
    public $magnusFilesDirectory    = '/usr/local/src/magnus/';
    public $nameFileReport          = 'export';
    public $order;
    public $start;
    public $sort;
    public $modelName;
    public $actionName;
    public $controllerName;
    public $homeUrl;
    public $defaultSortDir = null;
    public $fixedWhere     = null;
    public $paramsFilter;
    public $nofilterPerAdminGroup    = [];
    public $controllerAllowUpdateAll = [];
    public $relationFilter           = [];
    public $fieldsInvisibleClient    = [];
    public $fieldsNotUpdateClient    = [];
    public $fieldsNotUpdateAgent     = [];
    public $config;
    public $addInCondition = [];
    public function init()
    {


        $modelLogUsers = LogUsers::model()->count(
            'ip = :key1 AND description LIKE :key2',
            [
                ':key1' => $_SERVER['REMOTE_ADDR'],
                ':key2' => 'Trying SQL inject%',
            ]
        );


        if ($modelLogUsers > 2) {
            Yii::log($this->controllerName, 'error');
            Yii::log(print_r($_SERVER, true), 'error');
            Yii::log(print_r($_REQUEST, true), 'error');
            Yii::log(Yii::app()->session['id_user'] . ' ' . Yii::app()->session['username'], 'error');
            Yii::app()->session->clear();
            Yii::app()->session->destroy();

            $info    = 'USER BANNED BECAUSE TRY Trying SQL inject, code:';
            MagnusLog::insertLOG(2, $info);


            $modelFirewall = new Firewall();
            $modelFirewall->ip = $_SERVER['REMOTE_ADDR'];
            $modelFirewall->action = 1;
            $modelFirewall->date = date('Y-m-d H:i:s');
            $modelFirewall->description = 'USER BANNED BECAUSE TRY Trying SQL inject';
            $modelFirewall->jail = 'ip-blacklist';
            try {
                $modelFirewall->save();
            } catch (Exception $e) {
            }
            exit;
        }

        $this->controllerName = Yii::app()->controller->id;

        Yii::app()->clientScript->registerCssFile(Yii::app()->baseUrl . '/resources/init.css');

        SqlInject::sanitize($this->getAttributesRequest());
        $this->config = LoadConfig::getConfig();

        $this->controllerName = Yii::app()->controller->id;

        if (isset($_SERVER['HTTP_SIGN']) && isset($_SERVER['HTTP_KEY'])) {
            $api = new ApiAccess();
            $api->checkAuthentication($this);
        }

        if (! Yii::app()->session['id_user']) {
            if (! $this->authorizedNoSession($this->addAuthorizedNoSession)) {
                exit("Access denied to All action in All modules");
            }
        }

        $this->modelName  = isset($this->abstractModel) ? get_class($this->abstractModel) : '';
        $this->homeUrl    = Yii::app()->getHomeUrl();
        $this->actionName = $this->getCurrentAction();

        if ($this->getOverrideModel()) {
            $model = explode("/", $this->controllerName);
            $model = ucfirst(isset($model[1]) ? $model[1] : $model[0] . 'OR');
            Yii::import('application.models.overrides.' . $model);
            $this->instanceModel = new $model;
            $this->abstractModel = $model::model();
        }

        if ($this->getOverride()) {
            $this->paramsToSession();
            $this->redirect(['overrides/' . $this->controllerName . 'OR/' . $this->actionName]);
        }

        $this->getSessionParams();

        $this->subTitleReport         = Yii::t('zii', 'Report');
        $this->msgSuccess             = Yii::t('zii', 'Operation was successful.');
        $this->msgSuccessLot          = Yii::t('zii', 'Records updated with success.');
        $this->msgRecordNotFound      = Yii::t('zii', 'Record not found.');
        $this->msgRecordAlreadyExists = Yii::t('zii', 'Record already exists.');
        $this->msgError               = Yii::t('zii', 'Disallowed action');
        $this->mapErrorsMySql         = [
            1451 => Yii::t('zii', 'Record to be deleted is related to another. Technical information: '),
            1452 => Yii::t('zii', 'Record to be listed there. Technical information: '),
            0    => Yii::t('zii', 'Technical information: '),
        ];
        $startSession = strlen(session_id()) < 1 ? session_start() : null;

        Yii::app()->language = Yii::app()->sourceLanguage = $this->config['global']['base_language'];

        if (
            $this->config['global']['session_timeout'] > 60 && isset(Yii::app()->session['session_start']) &&
            time() > Yii::app()->session['session_start'] + $this->config['global']['session_timeout']
        ) {
            Yii::app()->session->clear();
            Yii::app()->session->destroy();
            exit("Access denied to All action in All modules");
        }

        if (isset($_GET['display_errors'])) {
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
            error_reporting(E_ALL);
        }

        parent::init();
    }

    public function getMenu($modules)
    {
        $menu = [];

        foreach ($modules as $value) {
            if ($value['module'] != 'buycredit') {
                if (! $value['show_menu']) {
                    continue;
                }
            }

            if (empty($value['id_module'])) {
                array_push($menu, [
                    'text'    => preg_replace("/ Module/", "", $value['text']),
                    'iconCls' => $value['icon_cls'],
                    'rows'    => $this->getSubMenu($modules, $value['id']),
                ]);
            }
        }

        return $menu;
    }

    public function getSubMenu($modules, $idOwner)
    {
        $subModulesOwner = Util::arrayFindByProperty($modules, 'id_module', $idOwner);
        $subMenu         = [];

        foreach ($subModulesOwner as $value) {

            if ($value['module'] != 'buycredit') {
                if (! $value['show_menu']) {
                    continue;
                }
            }

            if (! empty($value['module'])) {
                array_push($subMenu, [
                    'text'             => $value['text'],
                    'iconCls'          => $value['icon_cls'],
                    'module'           => $value['module'],
                    'action'           => $value['action'],
                    'leaf'             => true,
                    'createShortCut'   => $value['createShortCut'],
                    'createQuickStart' => $value['createQuickStart'],
                ]);
            } else {
                array_push($subMenu, [
                    'text'    => $value['text'],
                    'iconCls' => $value['icon_cls'],
                    'rows'    => $this->getSubMenu($modules, $value['id']),
                ]);
            }
        }

        return $subMenu;
    }

    public function getActions($modules)
    {
        $actions = [];

        foreach ($modules as $key => $value) {
            if (! empty($value['action'])) {
                $actions[$value['module']] = $value['action'];
            }
        }

        return $actions;
    }

    private function getOverride()
    {
        if (! file_exists('protected/config/overrides.php')) {
            return false;
        }

        include_once 'protected/config/overrides.php';
        return isset($GLOBALS['overrides']['controllers'][$this->controllerName])
            && in_array($this->actionName, $GLOBALS['overrides']['controllers'][$this->controllerName]);
    }

    private function getOverrideModel()
    {
        if (! file_exists('protected/config/overrides.php')) {
            return false;
        }

        include_once 'protected/config/overrides.php';
        $uri = explode("/", Yii::app()->getRequest()->getPathInfo());

        $module_name = preg_match("/overrides/", Yii::app()->getRequest()->getPathInfo())
            ? substr($uri[1], 0, -2) : $uri[0];
        return in_array(ucfirst($module_name), $GLOBALS['overrides']['models']);
    }

    private function paramsToSession()
    {
        Yii::app()->session['paramsGet']  = isset($_GET) ? json_encode($_GET) : null;
        Yii::app()->session['paramsPost'] = isset($_POST) ? json_encode($_POST) : null;
    }

    private function getCurrentAction()
    {
        $uri = explode("/", Yii::app()->getRequest()->getPathInfo());
        return isset($uri[1]) ? $uri[1] : null;
    }

    private function getSessionParams()
    {
        if (isset(Yii::app()->session['paramsGet']) && Yii::app()->session['paramsGet'] != null) {
            $_GET = (array) json_decode(Yii::app()->session['paramsGet']);
        }

        if (isset(Yii::app()->session['paramsPost']) && Yii::app()->session['paramsPost'] != null) {
            $_POST = (array) json_decode(Yii::app()->session['paramsPost']);
        }

        Yii::app()->session['paramsGet'] = Yii::app()->session['paramsPost'] = null;
    }

    public function setStart($value)
    {
        $this->start = isset($value[$this->nameParamStart]) ? $value[$this->nameParamStart] : -1;
        SqlInject::sanitize($this->start);
    }

    public function setLimit($value)
    {
        $limit       = isset($value[$this->nameParamLimit]) ? $value[$this->nameParamLimit] : -1;
        $this->limit = (! is_null($this->limit) && strlen($this->filter) < 2 && isset($this->limit)) ? $this->limit : $limit;
        SqlInject::sanitize($this->limit);
    }

    public function setSort()
    {
        $this->sort = isset($_GET[$this->nameParamSort]) ? $_GET[$this->nameParamSort] : $this->attributeOrder;
        SqlInject::sanitize($this->sort);
    }

    public function setOrder()
    {
        $dir         = isset($_GET[$this->nameParamDir]) ? ' ' . $_GET[$this->nameParamDir] : null;
        $this->order =  ! $dir || (strstr($this->sort, ',') !== false)
            ? $this->sort
            : ($this->sort ? $this->sort . ' ' . $dir : null);

        return $this->replaceOrder();
    }

    public function setfilter($value)
    {

        if (isset($_GET['filter'])) {
            SqlInject::sanitize($_GET['filter']);
        }

        # recebe os parametros para o filtro
        $filter   = isset($_GET['filter']) ? json_decode($_GET['filter']) : null;
        $filterIn = isset($_GET['filterIn']) ? json_decode($_GET['filterIn']) : null;

        if ($filter && $filterIn) {
            $filter = array_merge($filter, $filterIn);
        } else if ($filterIn) {
            $filter = $filterIn;
        }

        $filter       = $filter ? $this->createCondition($filter) : $this->defaultFilter;
        $this->filter = $this->fixedWhere ? $filter . ' ' . $this->fixedWhere : $filter;
        $this->filter = $this->extraFilter($filter);
    }

    public function readModel()
    {
        if (isset($_GET['log2'])) {

            echo '$this->filter = ';
            print_r($this->filter);
            echo "<br><br>";
            echo '$this->paramsFilter = ';
            print_r($this->paramsFilter);
            echo "<br><br>";
            echo '$this->relationFilter = ';
            print_r($this->relationFilter);
            echo "<br><br>";
            print_r($this->limit);
            echo "<br><br>";
            print_r($this->start);
            echo "<br><br>";
            exit;
        }

        SqlInject::sanitize($this->select);
        SqlInject::sanitize($this->join);
        SqlInject::sanitize($this->filter);

        $criteria = new CDbCriteria();
        $criteria->addCondition($this->filter);

        $criteria->select = $this->select;
        $criteria->join   = $this->join;
        $criteria->params = $this->paramsFilter;
        $criteria->with   = $this->relationFilter;
        $criteria->order  = $this->order;
        $criteria->limit  = $this->limit;
        $criteria->offset = $this->start;

        if (count($this->addInCondition)) {
            $criteria->addInCondition($this->addInCondition[0], $this->addInCondition[1]);
        }

        if ($this->group != 1) {
            $criteria->group = $this->group;
        }

        return $criteria;
    }

    public function readCountRecord()
    {

        SqlInject::sanitize($this->select);
        SqlInject::sanitize($this->join);
        SqlInject::sanitize($this->filter);

        if (preg_match('/pkg_cdr/', $this->abstractModel->tableName()) && $this->config['global']['remove_count_cdr'] == 1) {
            $sql    = "SHOW TABLE STATUS LIKE  '" . $this->abstractModel->tableName() . "'";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            return $result[0]['Rows'];
        } else if ((! isset($_GET['filter']) || strlen($_GET['filter']) < 3) && preg_match('/^Call$|^CallFailed$|^CallArchive$/', $this->modelName) && Yii::app()->session['isAdmin'] == true) {
            $sql    = "SHOW TABLE STATUS LIKE  '" . $this->abstractModel->tableName() . "'";
            $result = Yii::app()->db->createCommand($sql)->queryAll();
            return $result[0]['Rows'];
        } else {
            $criteria = new CDbCriteria();
            $criteria->addCondition($this->filter);
            $criteria->select = "COUNT('*') AS " . $this->abstractModel->primaryKey();
            $criteria->join   = $this->join;
            $criteria->params = $this->paramsFilter;
            $criteria->with   = $this->relationFilter;

            if (count($this->addInCondition)) {
                $criteria->addInCondition($this->addInCondition[0], $this->addInCondition[1]);
            }

            $recordCont = $this->abstractModel->find($criteria);

            return isset($recordCont[$this->abstractModel->primaryKey()]) ? $recordCont[$this->abstractModel->primaryKey()] : [];
        }
    }
    /**
     * Lista os registros da model
     */
    public function actionRead($asJson = true, $condition = null)
    {
        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canRead');

        $this->beforeRead($_GET);

        $this->setLimit($_GET);

        $this->setStart($_GET);

        $this->setSort();

        $this->setOrder();

        if (! $condition) {
            $this->setfilter($_GET);
        } else {
            $this->filter = $condition;
        }

        $this->applyFilterToLimitedAdmin();
        $this->showAdminLog();

        $records = $this->abstractModel->findAll($this->readModel());

        $countRecords = $this->readCountRecord();

        $recordsSum = $this->recordsExtraSum($records);

        $this->afterRead($records);

        $return[$this->nameRoot]  = $records;
        $return[$this->nameCount] = $countRecords;

        if (! $asJson) {
            $return                   = [];
            $return[$this->nameRoot]  = $this->getAttributesModels($records, $this->extraValues);
            $return[$this->nameCount] = $countRecords;
            $return[$this->nameSum]   = $this->getAttributesModels($recordsSum);
            return $return;
        } else {
            echo json_encode([
                $this->nameRoot  => $this->getAttributesModels($records, $this->extraValues),
                $this->nameCount => $countRecords,
                $this->nameSum   => $this->getAttributesModels($recordsSum),
            ]);
        }
    }

    private function showAdminLog()
    {
        if (Yii::app()->session['isAdmin'] == true && isset($_GET['log'])) {

            SqlInject::sanitize($this->select);
            SqlInject::sanitize($this->join);
            SqlInject::sanitize($this->filter);
            SqlInject::sanitize($this->group);
            SqlInject::sanitize($this->limit);
            $sql = "SELECT $this->select FROM  " . $this->abstractModel->tableName() . " t $this->join WHERE $this->filter GROUP BY $this->group LIMIT $this->limit";
            try {
                $command = Yii::app()->db->createCommand($sql);
                if (is_array($this->paramsFilter)) {
                    foreach ($this->paramsFilter as $key => $value) {
                        $command->bindValue($key, $value, PDO::PARAM_STR);
                    }
                }

                $teste = $command->queryAll();
                print_r($teste);
            } catch (Exception $e) {

                print_r($e);
            }
        }
    }

    public function beforeRead($values)
    {
        return;
    }

    public function afterRead($records)
    {
        return;
    }
    public function hidenInvisibleField($values)
    {
        if (isset(Yii::app()->session['isClient']) && Yii::app()->session['isClient']) {
            foreach ($this->fieldsInvisibleOperator as $field) {
                unset($values[$field]);
            }
        }
    }

    public function checkActionAccess($values = [], $module, $action)
    {
        if ($action == 'canUpdate' || $action == 'canCreate') {
            if (isset($values['id']) && ! AccessManager::getInstance($module)->$action()) {
                header('HTTP/1.0 401 Unauthorized');
                die("Access denied to $action in module: $module");
            }
        } elseif ($action == 'canRead') {
            if (! AccessManager::getInstance($module)->canRead()) {
                header('HTTP/1.0 401 Unauthorized');
                die("Access denied to $action in module:" . $module);
            }
        }
    }

    public function applyFilterToLimitedAdmin()
    {
        if (
            ! in_array($this->controllerName, $this->nofilterPerAdminGroup)
            && Yii::app()->session['user_type'] == 1 && Yii::app()->session['adminLimitUsers'] == true
        ) {

            $this->filter .= " AND t.id_user IN ( SELECT id FROM pkg_user WHERE id_group IN ( SELECT gug.id_group FROM pkg_group_user_group gug WHERE gug.id_group_user = :idgA0 ) )";

            $this->paramsFilter['idgA0'] = Yii::app()->session['id_group'];
        }
    }

    /**
     * Cria/Atualiza um registro da model
     */
    public function actionSave()
    {
        $values = $this->getAttributesRequest();

        $namePk = $this->abstractModel->primaryKey();

        $module = $this->instanceModel->getModule();


        $this->isNewRecord =  ! isset($values[$namePk]) || (is_array($values[$namePk]) || $values[$namePk] > 0)
            ? false : true;

        $this->isUpdateAll =  ! $this->isNewRecord
            && isset($values[$namePk])
            && is_array($values[$namePk])
            || (isset($_POST['filter']) && strlen($_POST['filter']) > 0)
            ? true : false;


        if ($this->isUpdateAll && Yii::app()->session['isClient']) {
            echo json_encode([
                'rows'  => [],
                'count' => 0,
                'sum'   => ' ',
                'errors'   =>  CHtml::encode('You cant update all')
            ]);
            exit;
        }


        if (! $this->isUpdateAll) {
            $values = $this->beforeSave($values);
        }

        $this->checkActionAccess($values, $module, $this->isNewRecord == true ? 'canCreate' : 'canUpdate');

        $this->hidenInvisibleField($values);

        $subRecords = isset($values[$this->nameOtherFkRelated]) ? $values[$this->nameOtherFkRelated] : false;

        unset($values[$this->nameOtherFkRelated]);

        if (Yii::app()->session['isClient'] && $this->abstractModel->tableName() != 'pkg_user') {
            $values['id_user'] = Yii::app()->session['id_user'];
        }

        //updateAll
        if (isset($values[$namePk]) && is_array($values[$namePk])) {
            $ids = [];
            $ids = $values[$namePk];
        } elseif (isset($_POST['filter']) && strlen($_POST['filter']) > 0) {
            $ids             = [];
            $ids             = $this->updateGetIdsFromFilter($namePk, $_POST['filter']);
            $values[$namePk] = $ids;
        }

        if (isset($ids)) {
            $this->saveUpdateAll($ids, $values, $module, $namePk, $subRecords);
            return;
        }
        //end updateAll

        $id    = $values[$namePk];

        $model = $id ? $this->loadModel($id, $this->abstractModel) : $this->instanceModel;

        if ($model == $this->msgRecordNotFound) {
            $this->success = false;
            $this->nameMsg = $this->msgRecordNotFound;
        } else {
            if (! $this->isNewRecord && Yii::app()->session['isClient'] && preg_match('/pkg_phonenumber/', $this->abstractModel->tableName())) {
                $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);

                if ($modelCheck->idPhonebook->idUser->id != Yii::app()->session['id_user']) {
                    exit('try edit invalid id');
                }
            } elseif (! $this->isNewRecord && Yii::app()->session['isClient']) {
                if ($module == 'user') {
                    if ($model->id != Yii::app()->session['id_user']) {
                        exit('try edit invalid id');
                    }
                } else {
                    if ($model->id_user != Yii::app()->session['id_user']) {
                        exit('try edit invalid id');
                    }
                }
            } else if (Yii::app()->session['isAgent']) {
                $this->checkAgentPermission($values, $namePk);
            }

            $model->attributes = $values;
            try {
                $this->success = $model->save();
                $errors        = $model->getErrors();

                if (! count($errors)) {
                    $id = $id ? $id : $model->$namePk;
                    if ($subRecords !== false) {
                        $this->saveRelated($id, $subRecords);
                    }
                    $this->saveGetNewRecord($namePk, $id);
                }
            } catch (Exception $e) {
                $this->success = false;
                $errors        = $this->getErrorMySql($e);
            }

            if ($this->success) {
                //insert in log table
                MagnusLog::insertLOG($id && $id > 0 ? 2 : 4, 'Module: ' . $module . '  ' . json_encode($values));
            } else {
                $this->nameMsg = $this->nameMsgErrors;
            }

            $this->msg = $this->success ? $this->msgSuccess : $errors;

            if (! $this->isUpdateAll) {
                $this->afterSave($model, $values);
            }
        }

        # retorna o resultado da execucao
        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameRoot    => $this->attributes,
            $this->nameMsg     => $this->msg,
        ]);
    }

    public function beforeSave($values)
    {
        if (Yii::app()->session['isClient']) {
            $values['id_user'] = Yii::app()->session['id_user'];
        }

        return $values;
    }

    public function beforeUpdateAll($values, $ids)
    {
        return $values;
    }

    public function afterSave($model, $values)
    {
        return;
    }

    public function afterUpdateAll($strIds)
    {
        return;
    }
    public function saveUpdateAll($ids, $values, $module, $namePk, $subRecords)
    {

        if (Yii::app()->session['isClient'] && ! in_array($this->controllerName, $this->controllerAllowUpdateAll)) {
            $info = 'No admin user trying UPDATEALL';
            MagnusLog::insertLOG(6, $info);
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => $info,
            ]);
            exit;
        }
        $values = $this->beforeUpdateAll($values, $ids);

        try {
            unset($values[$namePk]);
            unset($values['password']);
            $setters = [];
            foreach ($values as $fieldName => $value) {
                if (isset($value['isPercent']) && is_bool($value['isPercent'])) {
                    $v            = $value['value'];
                    $percent      = $v / 100;
                    $valuePercent = $value['isPercent'] ? "($fieldName * $percent)" : $v;

                    if ($value['isAdd']) {
                        $valueUpdate = new CDbExpression("$fieldName + $valuePercent");
                    } else if ($value['isRemove']) {
                        $valueUpdate = new CDbExpression("$fieldName - $valuePercent");
                    } else {
                        $valueUpdate = new CDbExpression($valuePercent);
                    }
                } else {

                    if ($fieldName == 'allow' && is_array($value)) {
                        $value = implode(',', $value);
                    }

                    $valueUpdate = (gettype($value) == 'integer') ? $value : "$value";
                }

                $setters[$fieldName] = $valueUpdate;
            }

            $this->abstractModel->setScenario('update');
            $this->abstractModel->setIsNewRecord(false);

            $criteria = new CDbCriteria();
            $criteria->addInCondition($namePk, $ids);
            try {
                $this->success = true;
                $this->abstractModel->updateAll($setters, $criteria);
            } catch (Exception $e) {
                print_r($e);
                exit;
            }

            $this->msg = $this->msgSuccessLot;
            $info      = addslashes("Module: $this->modelName SET " . print_r($setters, true) . " WHERE $namePk IN(" . print_r($ids, true) . ")");
            MagnusLog::insertLOG(6, $info);

            $this->afterUpdateAll($ids);
        } catch (Exception $e) {
            $this->success = false;
            $this->msg     = $this->getErrorMySql($e);
        }

        # retorna o resultado da execucao
        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameMsg     => $this->msg,
        ]);

        if (array_key_exists('subRecords', $values)) {
            $this->saveRelated($values);
        }
    }

    public function updateGetIdsFromFilter($namePk, $filter)
    {
        $ids    = [];
        $filter = $this->createCondition(json_decode($_POST['filter']));

        $this->filter = $filter = $this->extraFilter($filter);

        //integra o filtro lookup no updateall
        if (isset($_POST['defaultFilter'])) {

            $defaultFilter = $_POST['defaultFilter'];
            $defaultFilter = $this->createCondition(json_decode($defaultFilter));
            $this->filter .= ' AND ' . $defaultFilter;
        }

        $records = $this->abstractModel->findAll([
            'join'      => $this->join,
            'condition' => $this->filter,
            'with'      => $this->relationFilter,
            'params'    => $this->paramsFilter,
        ]);

        foreach ($records as $record) {
            array_push($ids, $record[$namePk]);
        }

        return $ids;
    }

    public function saveGetNewRecord($namePk, $id, $filter = '')
    {

        if (!is_numeric($id)) {
            $info    = 'Trying SQL inject, saveGetNewRecord: ' . print_r($values, true) . '. Controller => ' . Yii::app()->controller->id;
            $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
            MagnusLog::insertLOG(2, $info);
            echo json_encode([
                'rows'  => [],
                'count' => 0,
                'sum'   => [],
                'errors'   =>  ''
            ]);
            exit;
        }

        $newRecord = $this->abstractModel->findAll([
            'select'    => $this->select,
            'join'      => $this->join,
            'condition' => "t.$namePk = $id $filter",
            'with'      => $this->relationFilter,
        ]);
        $this->attributes = $this->getAttributesModels($newRecord, $this->extraValues);
    }

    public function subscribeColunms($columns = '')
    {
        return $columns;
    }

    public function reportModel()
    {
        return new CDbCriteria([
            'select'    => $this->select,
            'join'      => $this->join,
            'condition' => $this->filter,
            'with'      => $this->relationFilter,
            'params'    => $this->paramsFilter,
            'order'     => $this->order,
            'limit'     => $this->limit == 1 ? $this->limit : -1,
        ]);
    }

    public function beforeReport($columns)
    {
        return $columns;
    }

    public function actionReport()
    {

        if (! AccessManager::getInstance($this->instanceModel->getModule())->canRead()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to read in module:" . $this->instanceModel->getModule());
        }

        $orientation = $_GET['orientation'];

        $columns = json_decode($_GET['columns'], true);

        $columns = $this->repaceColumns($columns);

        $columns = $this->removeColumns($columns);

        $columns = $this->subscribeColunms($columns);

        $this->setfilter($_GET);

        $this->applyFilterToLimitedAdmin();

        $fieldGroup = json_decode($_GET['group']);
        $sort       = json_decode($_GET['sort']);

        $arraySort = ($sort && $fieldGroup) ? explode(' ', implode(' ', $sort)) : null;
        $dirGroup  = $arraySort ? $arraySort[array_search($fieldGroup, $arraySort) + 1] : null;
        $firstSort = $fieldGroup ? $fieldGroup . ' ' . $dirGroup . ',' : null;
        $sort      = $sort ? $firstSort . implode(',', $sort) : null;

        $this->sort = $this->replaceOrder();
        if (! strlen($this->sort)) {
            $this->order = $this->attributeOrder;
        }

        $this->select = $this->getColumnsFromReport($columns, $fieldGroup, 'pdf');

        $columns = $this->beforeReport($columns);

        $records = $this->abstractModel->findAll($this->reportModel());

        $report                 = new Report();
        $report->orientation    = $orientation;
        $report->title          = $this->titleReport;
        $report->subTitle       = $this->subTitleReport;
        $report->columns        = $columns;
        $report->columnsTable   = $this->getColumnsTable();
        $report->fieldsCurrency = $this->fieldsCurrencyReport;
        $report->fieldsPercent  = $this->fieldsPercentReport;
        $report->fieldsFk       = $this->fieldsFkReport;
        $report->renderer       = $this->rendererReport;
        $report->fieldGroup     = $fieldGroup;
        $report->records        =  $records;
        $report->generate();
    }

    public function actionDestroyReport()
    {
        unlink($this->magnusFilesDirectory . 'report.pdf');
    }

    public function actionCsv()
    {

        if (! AccessManager::getInstance($this->instanceModel->getModule())->canRead()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to read in module:" . $this->instanceModel->getModule());
        }

        if (! isset(Yii::app()->session['id_user'])) {
            $info = 'User try export CSV without login';
            MagnusLog::insertLOG(7, $info);
            exit;
        } else {
            $info = 'User try export CSV ' . $this->abstractModel->tableName();
            MagnusLog::insertLOG(7, $info);
        }

        $columns = json_decode($_GET['columns'], true);

        if (json_last_error() !== 0) {
            exit;
        }

        $columns = $this->repaceColumns($columns);

        $columns = $this->removeColumns($columns);

        $columns = $this->subscribeColunms($columns);

        $this->setLimit($_GET);

        $this->setStart($_GET);

        $this->setSort();

        $this->order = 't.id ASC';

        $this->setfilter($_GET);

        $this->applyFilterToLimitedAdmin();
        $this->showAdminLog();

        $nameFileCsv = $this->nameFileReport . time();
        $this->convertRelationFilter();
        $header = '';
        foreach ($columns as $key => $value) {

            SqlInject::sanitize($value['header']);

            $header .= '"' . ($value['header']) . '",';
        }

        SqlInject::sanitize($this->join);
        SqlInject::sanitize($this->filter);
        SqlInject::sanitize($header);

        $sql = "SELECT " . substr($header, 0, -1) . " UNION ALL SELECT " . $this->getColumnsFromReport($columns) . " FROM " . $this->abstractModel->tableName() . " t $this->join WHERE $this->filter";


        $command = Yii::app()->db->createCommand($sql);
        if ((is_array($this->paramsFilter) || is_object($this->paramsFilter)) && count($this->paramsFilter)) {
            foreach ($this->paramsFilter as $key => $value) {
                $command->bindValue($key, $value, PDO::PARAM_STR);
            }
        }

        //create a file pointer
        $f = fopen('php://memory', 'w');

        foreach ($command->queryAll() as $key => $fields) {
            $fieldsCsv = [];
            foreach ($fields as $key => $value) {
                array_push($fieldsCsv, $value);
            }
            fputcsv($f, $fieldsCsv, ';');
        }

        fseek($f, 0);

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $this->modelName . '_' . date('Y-m-d') . '.csv"');

        fpassthru($f);
    }

    public function convertRelationFilter()
    {
        foreach ($this->relationFilter as $key => $relationFilter) {
            //convert $this->relationFilter to SQL text;
            $table     = strtolower(preg_replace("/^id/", 'pkg_', $key));
            $joinField = strtolower(preg_replace("/^id/", 'id_', $key));
            $this->join .= ' JOIN ' . $table . ' ' . $key . ' ON t.' . $joinField . ' = ' . $key . '.id';
            $this->filter .= ' AND ' . $relationFilter['condition'];
        }
    }

    /**
     * Exclui um registro da model
     */
    public function actionDestroy()
    {
        if (! AccessManager::getInstance($this->instanceModel->getModule())->canDelete()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to delete in module:" . $this->instanceModel->getModule());
        }

        # recebe os parametros da exclusao
        $values       = $this->getAttributesRequest();
        $namePk       = $this->abstractModel->primaryKey();
        $arrayPkAlias = explode('.', $this->abstractModel->primaryKey());
        $ids          = [];
        $values       = $this->beforeDestroy($values);

        if ((isset($_POST['filter']) && strlen($_POST['filter']) > 0)) {

            if (! Yii::app()->session['isAdmin']) {
                echo json_encode([
                    $this->nameSuccess   => false,
                    $this->nameMsgErrors => 'You only can delete one data per time',
                ]);
                exit();
            }
            $filter = isset($_POST['filter']) ? $_POST['filter'] : null;
            $filter = $filter ? $this->createCondition(json_decode($filter)) : $this->defaultFilter;

            $this->filter = $filter = $this->extraFilter($filter);
            //if have related filter
            if (count($this->relationFilter)) {

                $this->convertRelationFilter();
                SqlInject::sanitize($this->join);
                SqlInject::sanitize($this->filter);
                $sql     = 'DELETE t FROM ' . $this->abstractModel->tableName() . ' t ' . $this->join . ' WHERE ' . $this->filter;
                $command = Yii::app()->db->createCommand($sql);
                foreach ($this->paramsFilter as $key => $value) {
                    $key = preg_replace('/^\:/', '', $key);
                    $command->bindValue(':' . $key, $value, PDO::PARAM_STR);
                }

                try {
                    $this->success = $command->execute();
                    $errors        = true;

                    $info = 'Module ' . $this->instanceModel->getModule() . '  ' . json_encode($values);
                    MagnusLog::insertLOG(3, $info);
                } catch (Exception $e) {
                    $this->success = false;
                    $errors        = $this->getErrorMySql($e);
                }
            } else {

                SqlInject::sanitize($this->join);
                SqlInject::sanitize($this->filter);

                $criteria = new CDbCriteria([
                    'condition' => $this->filter,
                    'params'    => $this->paramsFilter,
                ]);

                # retorna o resultado da execucao
                try {
                    $this->success = $this->abstractModel->deleteAll($criteria);
                    $errors        = true;

                    $info = 'Module ' . $this->instanceModel->getModule() . '  ' . json_encode($values);
                    MagnusLog::insertLOG(3, $info);
                } catch (Exception $e) {
                    $this->success = false;
                    $errors        = $this->getErrorMySql($e);
                }
            }

            $this->msg = $this->success ? $this->msgSuccess : $errors;

            if ($this->success) {
                $nameMsg = $this->nameMsg;
            } else {
                $nameMsg = $this->nameMsgErrors;
            }

            $this->afterDestroy($values);

            # retorna o resultado da execucao
            echo json_encode([
                $this->nameSuccess => $this->success,
                $nameMsg           => $this->msg,
            ]);
            exit;
        } else {
            # Se existe a chave 0, indica que existe um array interno (mais de 1 registro selecionado)
            if (array_key_exists(0, $values)) {

                if (! Yii::app()->session['isAdmin']) {
                    echo json_encode([
                        $this->nameSuccess   => false,
                        $this->nameMsgErrors => 'You only can delete one data per time',
                    ]);
                    exit();
                }

                # percorre o array para excluir o(s) registro(s)
                foreach ($values as $value) {
                    array_push($ids, $value[$namePk]);
                }
            } else {

                if (! Yii::app()->session['isAdmin']) {

                    if (Yii::app()->session['isClient']) {

                        $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);

                        if (isset($modelCheck->id_user)) {
                            $modelUser = User::model()->findByPk((int) $modelCheck->id_user);
                            if (isset($modelUser->id) && $modelUser->id != Yii::app()->session['id_user']) {
                                echo json_encode([
                                    $this->nameSuccess   => false,
                                    $this->nameMsgErrors => 'try destroy invalid id',
                                ]);
                                exit();
                            }
                        }
                    } else if (Yii::app()->session['isAgent']) {

                        $this->checkAgentPermission($values, $namePk);
                    }
                }

                array_push($ids, $values[$namePk]);
            }
        }

        if ($this->controllerName == 'user') {
            foreach ($ids as $valueid) {
                if ($valueid == 1) {
                    $this->success = false;
                    $this->errors  = Yii::t('zii', 'Not allowed delete this user');
                }
            }
        }

        if ($this->nameModelRelated) {
            $this->destroyRelated($values);
        }

        if (! $this->success) {
            # retorna o resultado da execucao da ação anterior
            echo json_encode([
                $this->nameSuccess   => $this->success,
                $this->nameMsgErrors => $this->msg,
            ]);

            return;
        }

        try {
            $criteria = new CDbCriteria();
            $criteria->addInCondition($namePk, $ids);
            $this->success = $this->abstractModel->deleteAll($criteria);
        } catch (Exception $e) {
            $this->success = false;
            $errors        = $this->getErrorMySql($e);
        }

        $this->msg = $this->success ? $this->msgSuccess : $errors;

        if ($this->success) {
            $nameMsg = $this->nameMsg;

            $info = 'Module ' . $this->instanceModel->getModule() . '  ' . json_encode($values);
            MagnusLog::insertLOG(3, $info);
        } else {
            $nameMsg = $this->nameMsgErrors;
        }

        $this->afterDestroy($values);

        # retorna o resultado da execucao
        echo json_encode([
            $this->nameSuccess => $this->success,
            $nameMsg           => $this->msg,
        ]);
    }

    public function beforeDestroy($values)
    {
        return $values;
    }

    public function afterDestroy($values)
    {
        return;
    }

    /**
     * Retorna o modelo de dados baseado na chave primaria dada na variavel id.
     * @param integer a identificacao do modelo a ser carregado
     * @param object model a ser consultado
     * @return model encontrado
     */
    public function loadModel($id, $model)
    {
        if (is_array($id)) {
            $condition = null;
            foreach ($id as $field => $value) {
                $condition .= "$field = $value AND ";
            }

            $condition   = substr($condition, 0, -5);
            $resultModel = $model->findAll([
                'condition' => $condition,
            ]);

            $resultModel = array_key_exists(0, $resultModel) ? $resultModel[0] : null;
        } else {
            $resultModel = $model->findByPk((int) $id);
            if ($resultModel === null) {
                return $this->msgRecordNotFound;
            }
        }

        return $resultModel;
    }

    public function setAttributesModels($attributes, $models)
    {
        /*
        $pkCount       = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
        {
        if($attributes[$i]['queue_paused'] == 1 && $attributes[$i]['categorizing'] == 0){
        $attributes[$i]['timeInPause'] = 1;
        }
        }
         */
        return $attributes;
    }

    public function getAttributesModels($models, $itemsExtras = [])
    {
        $attributes = [];
        $namePk     = $this->abstractModel->primaryKey();
        foreach ($models as $key => $item) {
            $attributes[$key] = $item->attributes;

            if (isset(Yii::app()->session['isClient']) && Yii::app()->session['isClient']) {
                foreach ($this->fieldsInvisibleClient as $field) {
                    unset($attributes[$key][$field]);
                }
            }

            if (isset(Yii::app()->session['isAgent']) && Yii::app()->session['isAgent']) {
                foreach ($this->fieldsInvisibleAgent as $field) {
                    unset($attributes[$key][$field]);
                }
            }

            if (! is_array($namePk) && $this->nameOtherFkRelated && get_class($this->abstractModel) === get_class($item)) {
                if (count($this->extraFieldsRelated)) {
                    $resultSubRecords = $this->abstractModelRelated->findAll([
                        'select'    => implode(',', $this->extraFieldsRelated),
                        'condition' => $this->nameFkRelated . ' = ' . $attributes[$key][$namePk],
                    ]);

                    $subRecords = [];

                    if (count($this->extraValuesOtherRelated)) {
                        $attributesSubRecords = [];

                        foreach ($resultSubRecords as $itemModelSubRecords) {
                            $attributesSubRecords = $itemModelSubRecords->attributes;

                            foreach ($this->extraValuesOtherRelated as $relationSubRecord => $fieldsSubRecord) {
                                $arrFieldsSubRecord = explode(',', $fieldsSubRecord);
                                foreach ($arrFieldsSubRecord as $fieldSubRecord) {
                                    $attributesSubRecords[$relationSubRecord . $fieldSubRecord] = $itemModelSubRecords->$relationSubRecord ? $itemModelSubRecords->$relationSubRecord->$fieldSubRecord : null;
                                }
                            }

                            array_push($subRecords, $attributesSubRecords);
                        }
                    } else {
                        foreach ($resultSubRecords as $modelSubRecords) {
                            array_push($subRecords, $modelSubRecords->attributes);
                        }
                    }
                } else {
                    $resultSubRecords = $this->abstractModelRelated->findAll([
                        'select'    => $this->nameOtherFkRelated,
                        'condition' => $this->nameFkRelated . ' = ' . $attributes[$key][$namePk],
                    ]);

                    $subRecords = [];
                    foreach ($resultSubRecords as $keyModelSubRecords => $modelSubRecords) {
                        array_push($subRecords, (int) $modelSubRecords->attributes[$this->nameOtherFkRelated]);
                    }
                }

                $attributes[$key][$this->nameOtherFkRelated] = $subRecords;
            }

            foreach ($itemsExtras as $relation => $fields) {
                $arrFields = explode(',', $fields);
                foreach ($arrFields as $field) {
                    $attributes[$key][$relation . $field] = $item->$relation ? $item->$relation->$field : null;
                }
            }
        }
        $attributes = $this->setAttributesModels($attributes, $models);
        return $attributes;
    }

    /**
     * Obtem os atributos enviados na requisicao
     * Verifica se a requisicao e via json ou via POST
     * @return array dos atributos enviados na requisicao
     */
    public function getAttributesRequest()
    {
        $arrPost = array_key_exists($this->nameRoot, $_POST) ? json_decode($_POST[$this->nameRoot], true) : $_POST;
        if (isset(Yii::app()->session['isClient']) && Yii::app()->session['isClient']) {
            $fields = array_merge($this->fieldsInvisibleClient, $this->fieldsNotUpdateClient);
            foreach ($fields as $field) {
                unset($arrPost[$field]);
            }
        }
        if (isset(Yii::app()->session['isAgent']) && Yii::app()->session['isAgent']) {
            $fields = array_merge($this->fieldsInvisibleAgent, $this->fieldsNotUpdateAgent);
            foreach ($fields as $field) {
                unset($arrPost[$field]);
            }
        }
        if (isset($arrPost['sipshowpeer']))
            unset($arrPost['sipshowpeer']);
        return $arrPost;
    }

    /**
     * Obtem os erros vindos do SQL
     */
    public function getErrorMySql($e)
    {

        if (isset($e->errorInfo)) {
            $codeErro = array_key_exists($e->errorInfo[1], $this->mapErrorsMySql) ? $e->errorInfo[1] : 0;
        } else {
            return $e->getMessage();
        }

        if ($codeErro == 1451) {
            $error = explode("pkg", $e->getMessage());
            $table = explode("CONSTRAINT", $error[1]);

            $table = preg_replace("/(\_|\`,| )/i", "", $table[0]);

            switch ($table) {
                case "refill":
                    $erro = 'Refill';
                    break;
                case "sip":
                    $erro = 'Sipbuddies';
                    break;
                case "sipura":
                    $erro = 'Sipuras';
                    break;
                case "callerid":
                    $erro = 'Callerid';
                    break;
                case "did":
                    $erro = 'Did';
                    break;
                case "campaign":
                    $erro = 'Campaign';
                    break;
                case "campaign_phonebook":
                    $erro = 'Campaign';
                    break;
                case "phonenumber":
                    $erro = 'Phonenumber';
                    break;
                case "refill_provider":
                    $erro = 'Refill Provider';
                    break;
                case "trunk":
                    $erro = 'Trunk';
                    break;
                case "rate":
                    $erro = 'Ratecard';
                    break;
                case "user":
                    $erro = 'username';
                    break;

                default:
                    $erro = $table;
                    break;
            }

            return $this->mapErrorsMySql[$codeErro] . "<br> " . Yii::t('zii', 'Please, first delete all related records in the module') . ' ' . Yii::t('zii', $erro) . "<br><br><a target = '_blank' href='http://en.wikipedia.org/wiki/Foreign_key'>http://en.wikipedia.org/wiki/Foreign_key</a>";
        } else {
            return $this->mapErrorsMySql[$codeErro] . $e->getMessage();
        }
    }

    public function createCondition($filter)
    {
        $condition = '1';

        if (! is_array($filter)) {
            return $condition;
        }

        foreach ($filter as $key => $f) {
            $isSubSelect = false;

            if (! isset($f->type)) {
                continue;
            }

            $type  = $f->type;
            $field = trim($f->field);

            $cls = $this->abstractModel;
            $allowedCols = array_keys($cls::model()->getMetaData()->columns);

            $field = trim($field);

            if (preg_match("/^id[A-Z].*\./", $field)) {

                $dataCheck = explode('.', $field);
                $modelCheck = $this->abstractModel::model()->getMetaData()->relations[$dataCheck[0]]->className;
                $checkModel = new $modelCheck;
                $checkbstractModel = $checkModel::model();
                $allowedCols = array_keys($checkbstractModel::model()->getMetaData()->columns);
                if (!in_array($dataCheck[1], $allowedCols, true)) {
                    Yii::log($this->controllerName, 'error');
                    Yii::log(print_r($_SERVER, true), 'error');
                    Yii::log(print_r($_REQUEST, true), 'error');
                    Yii::log(Yii::app()->session['id_user'] . ' ' . Yii::app()->session['username'], 'error');

                    $info    = '1Trying SQL inject, code: Field - ' . $field . ' . Controller => ' . Yii::app()->controller->id;
                    $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
                    MagnusLog::insertLOG(2, $info);
                    echo json_encode([
                        'rows'  => [],
                        'count' => 0,
                        'sum'   => [],
                        'errors'   =>  ''
                    ]);
                    exit;
                }
            } else if (!in_array($field, $allowedCols, true)) {

                if (Yii::app()->controller->id == 'diddestination' && $this->actionName == 'bulkdestinatintion') {
                    //ok
                } else {


                    Yii::log($this->controllerName, 'error');
                    Yii::log(print_r($_SERVER, true), 'error');
                    Yii::log(print_r($_REQUEST, true), 'error');
                    Yii::log(Yii::app()->session['id_user'] . ' ' . Yii::app()->session['username'], 'error');

                    Yii::log(print_r($allowedCols, true), 'error');
                    Yii::log($field, 'error');



                    $info    = '2Trying SQL inject, code: Field - ' . $field . ' . Controller => ' . Yii::app()->controller->id . ' ' . $this->actionName;
                    $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
                    MagnusLog::insertLOG(2, $info);
                    echo json_encode([
                        'rows'  => [],
                        'count' => 0,
                        'sum'   => [],
                        'errors'   =>  ''
                    ]);
                    exit;
                }
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

            $value     = isset($f->value) ? $f->value : new CDbExpression('NULL');

            SqlInject::sanitize($value);
            SqlInject::sanitize($field);
            $paramName = "p$key";

            if (isset($f->data->comparison)) {
                $comparison = $f->data->comparison;
            } else if (isset($f->comparison)) {
                $comparison = $f->comparison;
            } else {
                $comparison = null;
            }

            if (strlen($comparison) > 3) {
                Yii::log($this->controllerName, 'error');
                Yii::log(print_r($_SERVER, true), 'error');
                Yii::log(print_r($_REQUEST, true), 'error');
                Yii::log(Yii::app()->session['id_user'] . ' ' . Yii::app()->session['username'], 'error');

                $info    = 'Trying SQL inject, comparison = ' . $comparison . '. Controller => ' . Yii::app()->controller->id;
                $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
                MagnusLog::insertLOG(2, $info);
                echo json_encode([
                    'rows'  => [],
                    'count' => 0,
                    'sum'   => [],
                    'errors'   =>  ''
                ]);
                exit;
            }

            static $allowed = ['date', 'string', 'boolean', 'numeric', 'list', 'notlist'];


            if (!in_array($type, $allowed, true)) {
                Yii::log($this->controllerName, 'error');
                Yii::log(print_r($_SERVER, true), 'error');
                Yii::log(print_r($_REQUEST, true), 'error');
                Yii::log(Yii::app()->session['id_user'] . ' ' . Yii::app()->session['username'], 'error');

                $info    = 'Trying SQL inject, code: type = ' . $type . '. Controller => ' . Yii::app()->controller->id;
                $id_user = isset(Yii::app()->session['id_user']) ? Yii::app()->session['id_user'] : 'NULL';
                MagnusLog::insertLOG(2, $info);
                echo json_encode([
                    'rows'  => [],
                    'count' => 0,
                    'sum'   => [],
                    'errors'   =>  ''
                ]);
                exit;
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
                                $modelUser = User::model()->findAll('username LIKE :key', [':key' => $value . '%']);
                                $in        = [];
                                foreach ($modelUser as $key => $user) {
                                    $in[] = $user->id;
                                }
                                $this->addInCondition = ['t.id_user', $in];
                                $filterDirect         = true;
                            }
                            if (! isset($filterDirect)) {
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
                            }

                            break;
                        case 'ed':
                            if ($field == 'idUser.username') {
                                $modelUser = User::model()->findAll('username LIKE :key', [':key' => '%' . $value]);
                                $in        = [];
                                foreach ($modelUser as $key => $user) {
                                    $in[] = $user->id;
                                }
                                $this->addInCondition = ['t.id_user', $in];
                                $filterDirect         = true;
                            }
                            if (! isset($filterDirect)) {
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
                            }

                            break;
                        case 'ct':
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

                            if (preg_match("/^id[A-Z].*\./", $field)) {
                                $filterDirect = false;
                                if ($field == 'idUser.username') {
                                    $modelUser = User::model()->find('username = :key', [':key' => $value]);
                                    if (isset($modelUser->id)) {
                                        $condition .= " AND t.id_user = :$paramName";
                                        $value        = $modelUser->id;
                                        $filterDirect = true;
                                    }
                                }

                                if (! isset($filterDirect)) {

                                    if (array_key_exists(strtok($field, '.'), $this->relationFilter)) {
                                        $this->relationFilter[strtok($field, '.')]['condition'] .= " AND $field = :$paramName";
                                    } else {
                                        $this->relationFilter[strtok($field, '.')] = [
                                            'condition' => "$field = :$paramName",
                                        ];
                                    }
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
                    break;
                case 'list':
                    $value = is_array($value) ? $value : [$value];

                    if (! isset($f->tableRelated)) {
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

                    if (! isset($f->tableRelated)) {
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

    public function saveRelated($id, $subRecords)
    {
        if (! $this->isNewRecord) {
            try {
                $this->abstractModelRelated->deleteAllByAttributes([
                    $this->nameFkRelated => $id,
                ]);
            } catch (Exception $e) {
                $this->success = false;
                $this->msg     = $this->getErrorMySql($e);
            }
        }

        if ($this->success && is_array($subRecords)) {
            foreach ($subRecords as $item) {
                $nameFkRelated        = $this->nameFkRelated;
                $nameOtherFkRelated   = $this->nameOtherFkRelated;
                $instanceModelRelated = new $this->nameModelRelated;

                $instanceModelRelated->$nameFkRelated = $id;

                if (count($this->extraFieldsRelated)) {
                    foreach ($this->extraFieldsRelated as $field) {
                        $instanceModelRelated->$field = $item[$field];
                    }

                    $valueOtherFkRelated = $item[$nameOtherFkRelated];
                } else {
                    $valueOtherFkRelated = $item;
                }

                $instanceModelRelated->$nameOtherFkRelated = $valueOtherFkRelated;

                try {
                    $this->success = $instanceModelRelated->save();
                } catch (Exception $e) {
                    $this->success = false;
                    $this->msg     = $this->getErrorMySql($e);
                }

                if (! $this->success) {
                    break;
                }
            }
        }

        if (! $this->success) {
            echo json_encode([
                $this->nameSuccess   => $this->success,
                $this->nameMsgErrors => $this->msg,
            ]);

            exit;
        }
    }

    public function destroyRelated($values)
    {
        $namePk = $this->abstractModel->primaryKey();
        if (array_key_exists(0, $values)) {
            foreach ($values as $value) {
                $id = $value[$namePk];

                try {
                    $this->abstractModelRelated->deleteAllByAttributes([
                        $this->nameFkRelated => $id,
                    ]);
                } catch (Exception $e) {
                    $this->success = false;
                    $this->msg     = $this->getErrorMySql($e);
                }

                if (! $this->success) {
                    break;
                }
            }
        } else {
            $id = $values[$namePk];

            try {
                $this->abstractModelRelated->deleteAllByAttributes([
                    $this->nameFkRelated => $id,
                ]);
            } catch (Exception $e) {
                $this->success = false;
                $this->msg     = $this->getErrorMySql($e);
            }
        }
    }

    public function getColumnsTable()
    {
        $command = Yii::app()->db->createCommand('SHOW COLUMNS FROM ' . $this->abstractModel->tableName());
        return $command->queryAll();
    }

    public function getColumnsFromReport($columns, $fieldGroup = null, $type = 'csv')
    {
        $arrayColumns = [];

        foreach ($columns as $column) {
            $fieldName = $column['dataIndex'];

            SqlInject::sanitize($fieldName);

            if (is_array($this->fieldsFkReport) && array_key_exists($fieldName, $this->fieldsFkReport)) {
                $fk          = $this->fieldsFkReport[$fieldName];
                $table       = $fk['table'];
                $pk          = $fk['pk'];
                $fieldReport = $fk['fieldReport'];

                if (($fieldName == 't.id' && $fieldReport == 'destination') ||
                    ($fieldName == 'id' && $fieldReport == 'destination') ||
                    ($fieldName == 'idPrefixprefix' && $fieldReport == 'destination')
                ) {
                    //altera as colunas para poder pegar o destino das tarifas
                    $subSelect = "(SELECT $fieldReport FROM $table WHERE $table.$pk = t.id_prefix) AS destination";
                } else {
                    if (isset($fk['where'])) {
                        $subSelect = "(SELECT $fieldReport FROM $table WHERE $table.$pk = t." . $fk['where'] . ") AS $fieldName";
                    } else {
                        $subSelect = "(SELECT $fieldReport FROM $table WHERE $table.$pk = t.$fieldName) AS $fieldName";
                    }
                }

                if ($fieldName === $fieldGroup) {
                    array_unshift($arrayColumns, $subSelect);
                } else {
                    array_push($arrayColumns, $subSelect);
                }
            } else {
                if ($type == 'csv') {
                    if ($fieldName === $fieldGroup) {
                        array_unshift($arrayColumns, $fieldName);
                    } elseif (strtoupper($this->config['global']['base_country']) == 'BRL' && preg_match('/sessionbill|buycost|lucro|buyrate|rateinitial/', $fieldName)) {
                        array_push($arrayColumns, " REPLACE( $fieldName,  '.',  ',' ) AS $fieldName ");
                    } elseif (strtoupper($this->config['global']['base_country']) == 'BRL' && preg_match('/credit/', $fieldName)) {
                        array_push($arrayColumns, " REPLACE( t.$fieldName,  '.',  ',' ) AS credit ");
                    } else {
                        array_push($arrayColumns, $fieldName);
                    }
                } else {
                    if ($fieldName === $fieldGroup) {
                        array_unshift($arrayColumns, $fieldName);
                    } else {
                        array_push($arrayColumns, $fieldName);
                    }
                }
            }
        }

        $arrayColumns = $this->columnsReplace($arrayColumns);

        $columns = implode(',', $arrayColumns);

        return $columns;
    }

    public function columnsReplace($arrayColumns)
    {
        $patterns = [
            '/,credit/',
            '/description/',
            '/,id_user/',
            '/^id_user/',
            '/^name/',
        ];
        $arrayReplace = [
            't.credit',
            't.description',
            ',t.id_user',
            't.id_user',
            't.name',
        ];

        $arrayColumns = preg_replace($patterns, $arrayReplace, $arrayColumns);
        return $arrayColumns;
    }

    public function replaceOrder()
    {
        if (preg_match('/idPrefixdestination/', $this->order)) {
            if (! preg_match("/JOIN pkg_prefix/", $this->join)) {
                $this->join .= ' LEFT JOIN pkg_prefix b ON t.id_prefix = b.id';
            }
        }
        //ajustar para ordenar corretamente no modulo rates
        $this->order = preg_replace("/idPrefixprefix/", 't.id_prefix', $this->order);
        $this->order = preg_replace("/idPrefixdestination/", 'b.destination', $this->order);
        $this->order = preg_replace("/idPhonebookname/", 'b.name', $this->order);
        $this->order = preg_replace("/idUserusername/", 't.id_user', $this->order);
        $this->order = preg_replace("/idDiddid/", 't.id_did', $this->order);
        $this->order = preg_replace("/^id /", 't.id ', $this->order);
    }

    public function extraFilter($filter)
    {
        if ($this->defaultFilter != 1) {
            $filter = $filter . ' AND ' . $this->defaultFilter;
        }

        return $this->extraFilterCustom($filter);
    }

    public function extraFilterCustom($filter)
    {
        if (Yii::app()->session['isAdmin']) {
            $filter = $this->extraFilterCustomAdmin($filter);
        } elseif (Yii::app()->session['isAgent']) {
            $filter = $this->extraFilterCustomAgent($filter);
        } else if (Yii::app()->session['isClient']) {
            $filter = $this->extraFilterCustomClient($filter);
        }

        return $filter;
    }

    public function extraFilterCustomAdmin($filter)
    {
        return $filter;
    }

    public function extraFilterCustomClient($filter)
    {

        //se for cliente filtrar pelo pkg_user.id
        $filter .= ' AND t.id_user = :clfby';
        $this->paramsFilter[':clfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function extraFilterCustomAgent($filter)
    {
        //se é agente filtrar pelo user.id_user
        if (array_key_exists('idUser', $this->relationFilter)) {
            $this->relationFilter['idUser']['condition'] .= " AND idUser.id_user = :agfby";
        } else {
            $this->relationFilter['idUser'] = [
                'condition' => "idUser.id_user = :agfby",
            ];
        }
        $this->paramsFilter[':agfby'] = Yii::app()->session['id_user'];

        return $filter;
    }

    public function recordsExtraSum($records)
    {
        return [];
    }

    public function repaceColumns($columns)
    {
        for ($i = 0; $i < count($columns); $i++) {

            if ($columns[$i]['dataIndex'] == 'idUserusername') {
                $columns[$i]['dataIndex'] = 'id_user';
            } else if ($columns[$i]['dataIndex'] == 'idPrefixdestination') {
                $columns[$i]['dataIndex'] = 'id';
            } else if ($columns[$i]['dataIndex'] == 'idPrefixprefix') {
                $columns[$i]['dataIndex'] = 'id_prefix';
            } else if ($columns[$i]['dataIndex'] == 'idPhonebookt.name') {
                $columns[$i]['dataIndex'] = 'id_phonebook';
            } else if ($columns[$i]['dataIndex'] == 'idDiddid') {
                $columns[$i]['dataIndex'] = 'id_did';
            } else if ($columns[$i]['dataIndex'] == 'idTrunktrunkcode') {
                $columns[$i]['dataIndex'] = 'id_trunk';
            } else if ($columns[$i]['dataIndex'] == 'idProviderprovider_name') {
                $columns[$i]['dataIndex'] = 't.id_provider';
            } else if ($columns[$i]['dataIndex'] == 'id') {
                $columns[$i]['dataIndex'] = 't.id';
            }
        }

        return $columns;
    }

    public function removeColumns($columns)
    {
        return $columns;
    }

    public function importCsvSetAdditionalParams()
    {
        return [];
    }

    public function actionImportFromCsv()
    {
        $module = $this->instanceModel->getModule();

        if (! AccessManager::getInstance($module)->canCreate()) {
            header('HTTP/1.0 401 Unauthorized');
            die("Access denied to save in module: $module");
            exit;
        }

        if (! Yii::app()->session['id_user']) {
            exit();
        }

        $values = $this->getAttributesRequest();

        $interpreter = new CSVInterpreter($_FILES['file']['tmp_name']);
        $array       = $interpreter->toArray();

        $additionalParams = $this->importCsvSetAdditionalParams();
        $errors           = [];
        if ($array) {
            $recorder = new CSVActiveRecorder($array, $this->instanceModel, $additionalParams);
            if ($recorder->save());
            $errors = $recorder->getErrors();
        } else {
            $errors = $interpreter->getErrors();
        }

        $this->nameMsg = count($errors) > 0 ? 'errors' : $this->nameMsg;
        echo json_encode([
            $this->nameSuccess => count($errors) > 0 ? false : true,
            $this->nameMsg     => count($errors) > 0 ? implode(',', $errors) : $this->msgSuccess,
        ]);
    }


    public function remoteLogin($username, $password)
    {
        //check remote login
        $filterUser = '((s.username COLLATE utf8_bin = :key OR s.email COLLATE utf8_bin LIKE :key) AND UPPER(MD5(s.password)) = :key1)';
        $filterSip  = '(t.name COLLATE utf8_bin = :key AND UPPER(MD5(t.secret)) = :key1 )';
        $modelSip   = Sip::model()->find(
            [
                'condition' => $filterUser . ' OR ' . $filterSip,
                'join'      => 'LEFT JOIN pkg_user s ON t.id_user = s.id',
                'params'    => [
                    ':key'  => $username,
                    ':key1' => strtoupper($password),
                ],
            ]
        );
        if (count($modelSip)) {

            $idUserType                          = $modelSip->idUser->idGroup->idUserType->id;
            Yii::app()->session['isAdmin']       = $idUserType == 1 ? true : false;
            Yii::app()->session['isAgent']       = $idUserType == 2 ? true : false;
            Yii::app()->session['isClient']      = $idUserType == 3 ? true : false;
            Yii::app()->session['isClientAgent'] = isset($modelSip->idUser->id_user) && $modelSip->idUser->id_user > 1 ? true : false;
            Yii::app()->session['id_plan']       = $modelSip->idUser->id_plan;
            Yii::app()->session['credit']        = isset($modelSip->idUser->credit) ? $modelSip->idUser->credit : 0;
            Yii::app()->session['username']      = $modelSip->idUser->username;
            Yii::app()->session['logged']        = true;
            Yii::app()->session['id_user']       = $modelSip->idUser->id;
            Yii::app()->session['id_agent']      = is_null($modelSip->idUser->id_user) ? 1 : $modelSip->idUser->id_user;
            Yii::app()->session['name_user']     = $modelSip->idUser->firstname . ' ' . $modelSip->idUser->lastname;
            Yii::app()->session['id_group']      = $modelSip->idUser->id_group;
            Yii::app()->session['user_type']     = $idUserType;
            Yii::app()->session['language']      = $modelSip->idUser->language;
            Yii::app()->session['currency']      = $this->config['global']['base_currency'];
        }
        return $modelSip;
    }
    public function checkAgentPermission($values, $namePk)
    {
        if ($this->isNewRecord) {

            if (isset($values['id_user'])) {
                $modelUser = User::model()->findByPk((int) $values['id_user']);


                if (preg_match('/pkg_plan|pkg_user/', $this->abstractModel->tableName())) {
                    if (isset($modelUser->id) && $modelUser->id != Yii::app()->session['id_user']) {
                        Yii::log('try create with id_user invalid', 'error');
                        exit('try create with id_user invalid id_user = ' . $values['id_user'] . ' modedel->id' . $modelUser->id);
                    }
                } else if (isset($modelUser->id) && $modelUser->id_user != Yii::app()->session['id_user']) {
                    Yii::log('try create with id_user invalid', 'error');
                    exit('try create with id_user invalid id_user = ' . $values['id_user']);
                }
            }
        } else {

            if ($this->abstractModel->tableName() == 'pkg_user') {
                $modelUser = User::model()->findByPk((int) $values['id']);
                $id_user   = $modelUser->id_user;
            } else if (preg_match('/pkg_plan/', $this->abstractModel->tableName())) {
                $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);
                $id_user    = $modelCheck->idUser->id;
            } else if (preg_match('/pkg_rate_agent/', $this->abstractModel->tableName())) {
                $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);
                $id_user    = $modelCheck->idPlan->idUser->id;
            } else if (preg_match('/pkg_offer/', $this->abstractModel->tableName())) {
                $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);
                $id_user    = $modelCheck->idUser->id;
            } else {
                $modelCheck = $this->abstractModel->findByPk((int) $values[$namePk]);

                Yii::log(print_r($modelCheck->getAttributes(), true), 'error');

                $id_user    = $modelCheck->idUser->id_user;
            }

            if ($id_user != Yii::app()->session['id_user']) {
                exit('try edit invalid id');
            }
        }
    }
}
