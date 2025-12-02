<?php
/**
 * Actions of module "Authentication".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class JoomlaController extends Controller
{
    private $menu = [];

    public function actionEdit()
    {

        if (isset($_POST['key'])) {

            $modelUser = User::model()->find('username = :key', ['key' => $_POST['user']]);
            if (isset($modelUser->id)) {
                $key = sha1($modelUser->username . $modelUser->password);

                if ($key == $_POST['key']) {
                    if (strlen($_POST['password'])) {
                        $modelUser->password = $_POST['password'];
                    }
                    $modelUser->email = $_POST['email'];
                    $modelUser->save();
                } else {
                    print_r($_POST);
                    echo "<br>" . $key;
                }
            }
        }

        exit;
    }

    public function actionSignup()
    {

        if (isset($_GET['user']) && $_GET['user'] == 'roud') {
            $is_android           = true;
            $_REQUEST['user']     = Util::getNewUsername();
            $_REQUEST['password'] = trim(Util::generatePassword(20, true, true, true, false));
            $_REQUEST['active']   = 0;
        }
        $modelUser = User::model()->find('email = :key', [':key' => $_REQUEST['email']]);

        if (isset($modelUser->id)) {
            if (isset($is_android)) {
                exit(Yii::t('zii', 'Email already in use'));
            } else {
                exit('COM_USERS_PROFILE_EMAIL1_MESSAGE');
            }

        }
        $modelUser = User::model()->find('username = :key', [':key' => $_REQUEST['user']]);

        if (isset($modelUser->id)) {
            exit('COM_USERS_PROFILE_USERNAME_MESSAGE');
        }

        $modelPlan = Plan::model()->find('signup = 1');

        if (isset($modelPlan->id)) {
            $id_plan = $modelPlan->id;
        } else {
            exit('No plan active');
        }

        $credit = $modelPlan->ini_credit;

        if (isset($_REQUEST['id_group'])) {
            $id_group = $_REQUEST['id_group'];

        } else {

            $modelGroupUser = GroupUser::model()->findAllByAttributes(["id_user_type" => 3]);
            if (isset($modelGroupUser[0]->id)) {
                $id_group = $modelGroupUser[0]->id;
            } else {
                exit('No plan group for user');
            }
        }

        $callingcard_pin = Util::getNewLock_pin();

        $modelUser                  = new User();
        $modelUser->username        = $_REQUEST['user'];
        $modelUser->password        = $_REQUEST['password'];
        $modelUser->email           = $_REQUEST['email'];
        $modelUser->firstname       = substr($_REQUEST['firstname'], 0, strrpos($_REQUEST['firstname'], ' '));
        $modelUser->lastname        = substr($_REQUEST['firstname'], strrpos($_REQUEST['firstname'], ' '));
        $modelUser->id_group        = $id_group;
        $modelUser->id_plan         = $id_plan;
        $modelUser->active          = $_REQUEST['active'];
        $modelUser->callingcard_pin = $callingcard_pin;
        $modelUser->id_user         = 1;
        $modelUser->credit          = $credit;
        $modelUser->language        = $this->config['global']['base_language'];

        if (isset($_REQUEST['phone']) && strlen($_REQUEST['phone']) > 5) {
            $modelUser->phone = $_REQUEST['phone'];
        }

        if ($this->config['global']['base_language'] == 'pt_BR') {
            $phone = $_REQUEST['phone'];
            if (substr($phone, 0, 2) == 55 && strlen($phone) > 11) {
                $ddd = substr($phone, 2, 2);
            } elseif (substr($phone, 0, 1) == 0) {
                $ddd = substr($phone, 1, 2);
            } elseif (strlen($phone) == 10 || (strlen($phone) == 11 && substr($phone, 2, 1) == 9)) {
                $ddd = substr($phone, 0, 2);
            } else {
                $ddd = 11;
            }
            $modelUser->prefix_local = '0/55/11,0/55/12,*/55' . $ddd . '/8,*/55' . $ddd . '/9';
        } else {
            $modelUser->prefix_local = '';
        }

        $success = $modelUser->save();

        if ($success) {

            $modelSip              = new Sip();
            $modelSip->id_user     = $modelUser->id;
            $modelSip->name        = $modelUser->username;
            $modelSip->allow       = $this->config['global']['default_codeds'];
            $modelSip->host        = 'dynamic';
            $modelSip->insecure    = 'no';
            $modelSip->defaultuser = $modelUser->username;
            $modelSip->secret      = $modelUser->password;

            if (strlen($this->config['global']['fixed_callerid_signup']) > 1) {
                $modelSip->callerid   = $this->config['global']['fixed_callerid_signup'];
                $modelSip->cid_number = $this->config['global']['fixed_callerid_signup'];
            } else {
                $modelSip->callerid   = $modelUser->phone;
                $modelSip->cid_number = $modelUser->phone;
            }

            $modelSip->save();

        }

        if (isset($is_android)) {

            AsteriskAccess::instance()->generateSipPeers();

            $mail = new Mail(Mail::$TYPE_SIGNUP, $modelUser->id);
            $mail->send();

            exit('Success:' . $modelUser->username . ":" . $modelUser->password);
        }
    }

    public function actionJoomlaMenu()
    {

        $user      = trim($_POST['user']);
        $password  = trim($_POST['password']);
        $condition = "(username LIKE :user OR email LIKE :user)";

        $sql     = "SELECT * FROM pkg_user WHERE $condition";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":user", $user, PDO::PARAM_STR);
        $result = $command->queryAll();

        if ( ! isset($result[0]['username']) || sha1($result[0]['password']) != $password) {
            exit;
        }

        $sql = "SELECT m.id, action, show_menu, text, module, icon_cls, m.id_module, gm.createShortCut, gm.createQuickStart FROM
                            pkg_group_module gm INNER JOIN pkg_module m ON gm.id_module = m.id WHERE
                            id_group = :id_group";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":id_group", $result[0]['id_group'], PDO::PARAM_STR);
        $result = $command->queryAll();

        Yii::app()->session['action']   = $this->getActions($result);
        Yii::app()->session['menu']     = $this->getMenu($result);
        Yii::app()->session['currency'] = $this->config['global']['base_currency'];
        Yii::app()->session['language'] = $this->config['global']['base_language'];
        Yii::app()->session['decimal']  = $this->config['global']['decimal_precision'];

        echo json_encode([
            'id'       => Yii::app()->session['menu'],
            'currency' => Yii::app()->session['currency'],
            'language' => Yii::app()->session['language'],
            'decimal'  => Yii::app()->session['decimal'],
        ]);
    }

    public function actionUpdatePassword()
    {

        $modelUser = User::model()->find('username = :key', [':key' => $_POST['username']]);
        if (strtoupper($_POST['data']) == strtoupper(MD5($modelUser->username . ':' . $modelUser->password))) {
            $modelUser->password = trim($_POST['new_password']);
            $modelUser->save();
        }
    }

}
