<?php
/**
 * Acoes do modulo "Sms".
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
 * 17/08/2017
 */

class SmsController extends Controller
{
    public $attributeOrder = 'date DESC';
    public $extraValues    = ['idUser' => 'username'];

    public function init()
    {
        $this->instanceModel = new Sms;
        $this->abstractModel = Sms::model();
        $this->titleReport   = 'SMS';
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (isset($_POST['referencia']) && Yii::app()->session['username'] == $_POST['username']) {
            $this->actionSendPost();
        }
        parent::actionRead();
    }

    /*
    Url for Send SMSr http://ip/mbilling/index.php/sms/send?username=user&password=MD5(pass)&number=55dddn&text=sms-text.
     */
    public function actionSend()
    {
        SqlInject::sanitize($_GET);
        if ( ! isset($_GET['number']) || ! isset($_GET['text']) || ! isset($_GET['username']) || ! isset($_GET['password'])) {
            exit('invalid data');
        } elseif ( ! is_numeric($_GET['number'])) {
            exit('invalid non-numeric number');
        } else if (strlen($_GET['number']) > 15) {
            exit('invalid number');
        } else if (strlen($_GET['username']) < 4) {
            exit('invalid user');
        } else if (strlen($_GET['password']) < 5) {
            exit('invalid user');
        }

        $modelSip = AccessManager::checkAccess($_GET['username'], $_GET['password']);

        if ( ! isset($modelSip->id)) {
            exit('invalid user');
        }

        $result = SmsSend::send($modelSip->idUser, $_GET['number'], $_GET['text'], 0, '', true);

        echo $result['success'] ? 'Sent' : 'Error' . ' ' . $result['errors'];

    }

    public function actionSendPost()
    {
        /*
        <?php
        $magnusBilling             = new MagnusBilling('eef4d9186132d9f79002ba87975ba915', 'e62659fa9494e98bf43d721b6c17d040');
        $magnusBilling->public_url = "https://sip2.voziphone.com/voziphone/"; // Your MagnusBilling URL

        //read data from user module
        $data = array(
        'module'     => 'sms',
        'action'     => 'read',
        'id'         => 0,
        'username'   => '28999', //Numero de cliente
        'number'     => '573117178962,573117196293', //numero o numeros telefonicos a enviar el SMS (separados por una coma ,)
        'text'       => 'SMS API de prueba voziphone', //Mensaje de texto a enviar
        'referencia' => 'Referenca Envio voziphone', //(campo opcional) Numero de referencio ó nombre de campaña
        );

        $result = $magnusBilling->query($data);

         */

        SqlInject::sanitize($_POST);
        if ( ! isset($_POST['number']) || ! isset($_POST['text']) || ! isset($_POST['username'])) {
            exit('invalid data');
        } else if (strlen($_POST['text']) > 200) {
            exit('invalid number');
        } else if (strlen($_POST['username']) < 4) {
            exit('invalid user');
        }

        $modelUser = User::model()->find('username = :key', [':key' => $_POST['username']]);
        if ( ! isset($modelUser->id)) {
            exit('invalid data');
        }
        $numbers = explode(',', $_POST['number']);
        $i       = 0;
        foreach ($numbers as $key => $number) {
            $result = SmsSend::send($modelUser, $number, $_POST['text']);
            if ($result['success'] != 'Sent') {
                $result['errornumber'] = $number;
                break;
            } else {
                $i++;
            }
        }

        $result['totalSmsSent'] = $i;
        echo json_encode($result);

        exit;
    }

    public function actionSave()
    {
        $values = $this->getAttributesRequest();

        if (Yii::app()->session['isClient']) {
            $values['id_user'] = Yii::app()->session['id_user'];
        }

        $modelUser = User::model()->findByPk((int) $values['id_user']);

        $res = SmsSend::send($modelUser, $values['telephone'], $values['sms'], 0, $values['sms_from']);

        echo json_encode($res);
    }
}
