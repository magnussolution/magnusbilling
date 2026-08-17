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
        $channel = AsteriskAccess::getCoreShowChannel($_POST['channel'], null, $_POST['server']);
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
            die("Access denied to delete in module:" . $this->instanceModel->getModule());
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
        if (isset($_POST['sipuser'])) {
            $dialstr = 'PJSIP/' . $_POST['sipuser'];
        } elseif (! isset($_POST['id_sip'])) {
            $dialstr = 'PJSIP/' . $this->config['global']['channel_spy'];
        } else {
            $modelSip = Sip::model()->findByPk((int) $_POST['id_sip']);
            $dialstr  = 'PJSIP/' . $modelSip->name;
        }

        $call = AsteriskAccess::buildCallFile([
            'Channel'   => $dialstr,
            'Context'   => 'billing',
            'Extension' => 5555,
            'Priority'  => 1,
        ], [
            'SPY'        => 1,
            'SPYTYPE'    => $_POST['type'],
            'CHANNELSPY' => $_POST['channel'],
        ]);

        AsteriskAccess::generateCallFile($call);

        echo json_encode([
            'success' => true,
            'msg'     => 'Start Spy',

        ]);
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
