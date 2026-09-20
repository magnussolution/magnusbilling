<?php

/**
 * Acoes do modulo "CallOnLine".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class CallOnLineController extends Controller
{
    public $attributeOrder = 'status DESC, t.duration DESC';
    public $extraValues    = ['idUser' => 'username,credit'];

    public $fieldsInvisibleClient = [
        'tronco',
    ];

    public $fieldsInvisibleAgent = [
        'tronco',
    ];

    public function init()
    {
        $this->instanceModel = new CallOnLine;
        $this->abstractModel = CallOnLine::model();
        $this->titleReport   = Yii::t('zii', 'Calls Online');

        parent::init();

        if (Yii::app()->getSession()->get('isAgent')) {
            $this->filterByUser        = true;
            $this->defaultFilterByUser = 'b.id_user';
            $this->join                = 'JOIN pkg_user b ON t.id_user = b.id';
        }
    }

    public function actionRead($asJson = true, $condition = null)
    {

        //altera o sort se for a coluna idUsercredit.
        if (isset($_GET['sort']) && $_GET['sort'] === 'idUsercredit') {
            $_GET['sort'] = '';
        }
        return parent::actionRead($asJson = true, $condition = null);
    }

    public function actionGetChannelDetails()
    {
        $call = $this->authorizedOnlineCall();
        $channel = AsteriskAccess::getCoreShowChannel($call->canal, null, $call->server);
        $channel = is_array($channel) ? $channel : [];

        // Asterisk 20/PJSIP does not expose every legacy chan_sip field.
        // Keep the details panel available when those fields are absent.
        $value = function ($key, $default = '') use ($channel) {
            return isset($channel[$key]) && ! is_array($channel[$key]) ? $channel[$key] : $default;
        };
        $sipCallId = isset($channel['SIPCALLID']['data']) ? $channel['SIPCALLID']['data'] : '';
        $sipcallid = explode("\n", $sipCallId);
        $from_ip = '';
        $reinvite = '';

        foreach ($sipcallid as $key => $line) {
            if (preg_match("/Received Address/", $line)) {
                $from_ip = explode(" ", $line);
                $from_ip = end($from_ip);
            }
            if (preg_match("/Audio IP/", $line)) {

                $reinvite = explode(" ", $line);
                $reinvite = end($reinvite);
            }
        }

        $accountcode = $value('Accountcode', $value('accountcode'));
        $callerId = $value('Caller ID', $value('CallerID'));
        $dialedNumber = $value('DNID Digits', $value('dnid', $value('Extension')));
        $codec = $value('WriteFormat', $value('ReadFormat'));
        $billsec = $value('billsec', $value('Billsec'));
        $reinviteValue = $reinvite === '' || preg_match("/local/", $reinvite) ? 'no' : 'yes';

        if (preg_match('/^MC\!/', $accountcode)) {

            $modelPhonenumber = PhoneNumber::model()->find('number = :key', [':key' => $callerId]);
            $callerName = $modelPhonenumber ? $modelPhonenumber->name . ' ' . $modelPhonenumber->city : $callerId;

            echo json_encode([
                'success'     => true,
                'msg'         => 'success',
                'description' => Yii::app()->session['isAdmin'] ? print_r($channel, true) : '',
                'codec'       => $codec,
                'billsec'     => $billsec,
                'callerid'    => $callerName,
                'from_ip'     => $from_ip,
                'reinvite'    => $reinviteValue,
                'ndiscado'    => $callerId,
            ]);
        } else {
            echo json_encode([
                'success'     => true,
                'msg'         => 'success',
                'description' => Yii::app()->session['isAdmin'] ? print_r($channel, true) : '',
                'codec'       => $codec,
                'billsec'     => $billsec,
                'callerid'    => $callerId,
                'from_ip'     => $from_ip,
                'reinvite'    => $reinviteValue,
                'ndiscado'    => $dialedNumber,
            ]);
        }
    }

    public function actionDestroy()
    {
        if (! AccessManager::getInstance($this->instanceModel->getModule())->canDelete()) {
            header('HTTP/1.0 401 Unauthorized');
            $this->sendError('Access denied for module "{module}".', ['{module}' => $this->instanceModel->getModule()]);
        }

        # recebe os parametros da exclusao
        $values       = $this->getAttributesRequest();
        $namePk       = $this->abstractModel->primaryKey();
        $arrayPkAlias = explode('.', $this->abstractModel->primaryKey());
        $ids          = [];

        foreach ($values as $key => $channel) {

            $modelChannel = $this->abstractModel->find('canal = :key', [':key' => $channel['channel']]);
            if (isset($modelChannel->canal)) {
                AsteriskAccess::instance()->hangupRequest($modelChannel->canal, $modelChannel->server);
            }
        }

        # retorna o resultado da execucao
        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => $this->success,
        ]);
    }

    public function actionSpyCall()
    {
        $this->checkActionAccess([], 'callonline', 'canRead');
        if (! Yii::app()->session['isAdmin'] || ! AccessManager::getInstance('callonline')->canDelete()) {
            $this->sendError('Access denied.', [], 403);
        }
        $channel = $this->authorizedOnlineCall();
        $type = isset($_POST['type']) ? $_POST['type'] : null;
        if (! is_string($type) || ! in_array($type, ['b', 'w', 'W'], true)) {
            $this->sendError('Invalid request parameters. Check the submitted values.', [], 400);
        }
        // Call files are consumed locally: never select a remote call by a matching prefix.
        if ($channel->server !== 'localhost') {
            $this->sendError('Invalid or unauthorized record.', [], 403);
        }
        if (isset($_POST['sipuser'])) {
            $name = $_POST['sipuser'];
        } elseif (isset($_POST['id_sip'])) {
            if (! is_scalar($_POST['id_sip']) || ! preg_match('/\A[1-9][0-9]*\z/', (string) $_POST['id_sip'])) {
                $this->sendError('Invalid or unauthorized record.', [], 400);
            }
            $sip = Sip::model()->findByPk($_POST['id_sip']);
            $name = $sip ? $sip->name : null;
        } else {
            $name = $this->config['global']['channel_spy'];
        }
        if (! is_string($name) || ! preg_match('/\A[A-Za-z0-9_.+-]+\z/', $name)) {
            $this->sendError('Invalid or unauthorized record.', [], 400);
        }
        $sip = Sip::model()->find('name = :name', [':name' => $name]);
        if (! $sip) {
            $this->sendError('Invalid or unauthorized record.', [], 403);
        }
        $this->checkOnlineUserScope($sip->id_user);
        $dialstr = 'PJSIP/' . $sip->name;

        $call = AsteriskAccess::buildCallFile([
            'Channel'   => $dialstr,
            'Context'   => 'billing',
            'Extension' => 5555,
            'Priority'  => 1,
        ], [
            'SPY'        => 1,
            'SPYTYPE'    => $type,
            'CHANNELSPY' => $channel->canal,
        ]);

        AsteriskAccess::generateCallFile($call);

        echo json_encode([
            'success' => true,
            'msg'     => Yii::t('zii', 'Operation was successful.'),

        ]);
    }

    /** Resolve request selectors to a live call before any AMI or call-file operation. */
    protected function authorizedOnlineCall()
    {
        $this->checkActionAccess([], 'callonline', 'canRead');
        if (! isset($_POST['channel']) || ! is_string($_POST['channel'])
            || ! preg_match('/\A[A-Za-z0-9_]+\/[A-Za-z0-9_.@;:+\/-]+\z/', $_POST['channel'])
        ) {
            $this->sendError('Invalid or unauthorized record.', [], 400);
        }
        $criteria = new CDbCriteria();
        $criteria->addCondition('canal = :channel');
        $criteria->params[':channel'] = $_POST['channel'];
        foreach (['server' => 'server', 'id' => 'uniqueid'] as $input => $column) {
            if (isset($_POST[$input])) {
                if (! is_string($_POST[$input]) || $_POST[$input] === '') {
                    $this->sendError('Invalid or unauthorized record.', [], 400);
                }
                // The host is only a database selector, never an AMI connection argument.
                $criteria->addCondition($column . ' = :' . $input);
                $criteria->params[':' . $input] = $_POST[$input];
            }
        }
        $criteria->limit = 2;
        $calls = CallOnLine::model()->findAll($criteria);
        if (count($calls) !== 1) {
            $this->sendError('Invalid or unauthorized record.', [], 403);
        }
        $this->checkOnlineUserScope($calls[0]->id_user);
        return $calls[0];
    }

    protected function checkOnlineUserScope($id)
    {
        $user = User::model()->findByPk($id);
        $session = Yii::app()->session;
        $allowed = false;
        if ($user && $session['isAdmin']) {
            $allowed = ! $session['adminLimitUsers'] || GroupUserGroup::model()->exists(
                'id_group_user = :admin AND id_group = :group',
                [':admin' => $session['id_group'], ':group' => $user->id_group]
            );
        } elseif ($user && $session['isAgent']) {
            $allowed = (string) $user->id_user === (string) $session['id_user'];
        } elseif ($user && $session['isClient']) {
            $allowed = (string) $user->id === (string) $session['id_user'];
        }
        if (! $allowed) {
            $this->sendError('Invalid or unauthorized record.', [], 403);
        }
    }

    public function setAttributesModels($attributes, $models)
    {

        if (isset($attributes[0])) {
            $modelSip     = Sip::model()->findAll();
            $modelServers = Servers::model()->findAll('type != :key1 AND status IN (1,4) AND host != :key', [':key' => 'localhost', ':key1' => 'sipproxy']);

            if (! isset($modelServers[0])) {
                array_push($modelServers, [
                    'name'     => 'Master',
                    'host'     => 'localhost',
                    'type'     => 'mbilling',
                    'username' => 'magnus',
                    'password' => 'magnussolution',
                ]);
            }

            $array   = '';
            $totalUP = 0;
            $i       = 1;
            foreach ($modelServers as $key => $server) {
                if ($server['type'] == 'mbilling') {
                    $server['host'] = 'localhost';
                }

                $modelCallOnLine = CallOnLine::model()->count('server = :key', ['key' => $server['host']]);

                $modelCallOnLineUp = CallOnLine::model()->count('server = :key AND status = :key1', ['key' => $server['host'], ':key1' => 'Up']);
                $totalUP += $modelCallOnLineUp;
                $array .= '<font color="black">' . strtoupper($server['name']) . '</font> <font color="blue">T:' . $modelCallOnLine . '</font> <font color="green">A:' . $modelCallOnLineUp . '</font>&ensp;|&ensp;';

                if ($i % 13 == 0) {
                    $array .= "<br>";
                }
                $i++;
            }

            $attributes[0]['serverSum'] = $array;

            if ($totalUP > 0) {
                $attributes[0]['serverSum'] .= "<font color=green> TOTAL UP: " . $totalUP . "</font>";
            }
        }

        return $attributes;
    }
}
