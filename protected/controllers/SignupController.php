<?php

/**
 * Url for customer register http://ip/billing/index.php/user/add .
 */
class SignupController extends Controller
{
    public $attributeOrder = 't.id';
    public function actions()
    {
        return array(
            'captcha' => array(
                'class'     => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),
        );
    }
    public function actionView($id)
    {
        if (isset($_GET['loginkey']) && strlen($_GET['loginkey']) > 5 and strlen($_GET['loginkey']) < 30) {
            $modelUser = User::model()->find('active = 2 AND loginkey = :key AND id = :key1', array(':key' => $_GET['loginkey'], ':key1' => $_GET['id']));
            if (!isset($modelUser->id)) {
                if (!isset($modelUser->id)) {
                    $this->redirect('/');
                }
            }

            if (isset($_GET['loginkey']) && $_GET['loginkey'] == $modelUser->loginkey) {
                $modelUser->active   = 1;
                $modelUser->loginkey = '';
                $modelUser->save();

                AsteriskAccess::instance()->generateSipPeers();

                $idUserType                                     = $modelUser->idGroup->idUserType->id;
                Yii::app()->session['isAdmin']                  = $idUserType == 1 ? true : false;
                Yii::app()->session['isAgent']                  = $idUserType == 2 ? true : false;
                Yii::app()->session['isClient']                 = $idUserType == 3 ? true : false;
                Yii::app()->session['isClientAgent']            = isset($modelUser->id_user) && $modelUser->id_user > 1 ? true : false;
                Yii::app()->session['id_plan']                  = $modelUser->id_plan;
                Yii::app()->session['credit']                   = isset($modelUser->credit) ? $modelUser->credit : 0;
                Yii::app()->session['username']                 = $modelUser->username;
                Yii::app()->session['logged']                   = true;
                Yii::app()->session['id_user']                  = $modelUser->id;
                Yii::app()->session['id_agent']                 = is_null($modelUser->id_user) ? 1 : $modelUser->id_user;
                Yii::app()->session['name_user']                = $modelUser->firstname . ' ' . $modelUser->lastname;
                Yii::app()->session['id_group']                 = $modelUser->id_group;
                Yii::app()->session['user_type']                = $idUserType;
                Yii::app()->session['language']                 = $modelUser->language;
                Yii::app()->session['currency']                 = $this->config['global']['base_currency'];
                Yii::app()->session['showGoogleCode']           = false;
                Yii::app()->session['newGoogleAuthenticator']   = false;
                Yii::app()->session['checkGoogleAuthenticator'] = false;
                Yii::app()->session['googleAuthenticatorKey']   = false;

                $mail = new Mail(Mail::$TYPE_SIGNUPCONFIRM, $id);
                try {
                    $mail->send();
                } catch (Exception $e) {
                }
            }
            $this->redirect('/');
        } else if (isset($_GET['username']) && strlen($_GET['username']) > 3 && isset($_GET['password']) && isset($_GET['id'])) {

            $signup = Signup::model()->find('username = :key AND password = :key1 AND id = :key2', array(
                ':key'  => $_GET['username'],
                ':key1' => $_GET['password'],
                ':key2' => (int) $_GET['id'],

            ));

            $mail = new Mail(Mail::$TYPE_SIGNUP, $id);
            try {
                $mail->send();
            } catch (Exception $e) {
            }

            if ($this->config['global']['signup_admin_email'] == 1) {
                $mail->setTitle('NEW USER SIGNUP FROM MAGNUSBILLING SIGNUP FORM. USERNAME ');
                $mail->send($this->config['global']['admin_email']);
            }

            $this->render('view', array('signup' => $signup));
        } else {
            exit('Error');
        }
    }

    public function actionAdd()
    {

        if ($this->config['global']['enable_signup'] == 0) {
            echo 'Signup disable';
            exit;
        }
        $signup = new Signup();
        if (isset($_POST['extjs'])) {
            $_POST['Signup'] = $_POST;
            $signup->captcha = false;
        }
        if (isset($_POST['Signup'])) {

            $result = GroupUser::model()->findAllByAttributes(array("id_user_type" => 3));

            $signup->id_group = $result[0]['id'];
            $signup->active   = isset($_POST['Signup']['active']) ? $_POST['Signup']['active'] : 2;

            if ($this->config['global']['base_language'] == 'pt_BR') {
                $phone = $_POST['Signup']['phone'];
                if (substr($phone, 0, 2) == 55 && strlen($phone) > 11) {
                    $ddd = substr($phone, 2, 2);
                } elseif (substr($phone, 0, 1) == 0) {
                    $ddd = substr($phone, 1, 2);
                } elseif (strlen($phone) == 10 || (strlen($phone) == 11 && substr($phone, 2, 1) == 9)) {
                    $ddd = substr($phone, 0, 2);
                } else {
                    $ddd = 11;
                }
                $signup->prefix_local = '0/55/11,0/55/12,*/55' . $ddd . '/8,*/55' . $ddd . '/9';
            }
            if (strlen($this->config['global']['default_prefix_rule']) < 3 && $this->config['global']['base_language'] == 'pt_BR') {
                $signup->prefix_local = '0/55/11,0/55/12,*/5511/8,*/5511/9';
            } else {
                $signup->prefix_local = $this->config['global']['default_prefix_rule'];
            }

            if (!isset($_POST['Signup']['username']) || strlen($_POST['Signup']['username']) == 0) {
                $signup->username = Util::getNewUsername();
                unset($_POST['Signup']['username']);
            }
            if (!isset($_POST['Signup']['password']) || strlen($_POST['Signup']['password']) == 0) {
                $signup->password = trim(Util::generatePassword($this->config['global']['signup_auto_pass'], true, true, true, false));
                unset($_POST['Signup']['password']);
            } else {
                if ($_POST['Signup']['password'] != $_POST['Signup']['password2']) {
                    $signup->addError('id_plan', Yii::t('zii', 'Password'));
                }
            }

            $signup->callingcard_pin = Util::getNewLock_pin();
            $signup->loginkey        = trim(Util::generatePassword(20, true, true, true, false));

            $signup->calllimit = $this->config['global']['start_user_call_limit'];
            unset($_POST['Signup']['ini_credit']);

            $signup->typepaid = 0;
            $signup->language = $this->config['global']['base_language'] == 'pt_BR'
                ? 'br'
                : $this->config['global']['base_language'];

            $signup->attributes   = $_POST['Signup'];
            $signup->company_name = isset($_POST['Signup']['company_name']) ? $_POST['Signup']['company_name'] : '';

            $modelPlan = Plan::model()->findByPk((int) $_POST['Signup']['id_plan']);

            $signup->credit = $modelPlan->ini_credit;

            if ($modelPlan->signup != 1) {
                //error if invalid plan(tampered data)
                $signup->addError('id_plan', Yii::t('zii', 'Invalid plan used to signup'));
            } else {
                $success = $signup->save();

                Yii::log(print_r($signup->getErrors(), true), 'error');
                if ($success) {

                    $modelSip              = new Sip();
                    $modelSip->id_user     = $signup->id;
                    $modelSip->name        = $signup->username;
                    $modelSip->allow       = $this->config['global']['default_codeds'];
                    $modelSip->host        = 'dynamic';
                    $modelSip->insecure    = 'no';
                    $modelSip->defaultuser = $signup->username;
                    $modelSip->secret      = $signup->password;
                    if (strlen($this->config['global']['fixed_callerid_signup']) > 1) {
                        $modelSip->callerid   = $this->config['global']['fixed_callerid_signup'];
                        $modelSip->cid_number = $this->config['global']['fixed_callerid_signup'];
                    } else {
                        $modelSip->callerid   = $signup->phone;
                        $modelSip->cid_number = $signup->phone;
                    }
                    $modelSip->save();

                    AsteriskAccess::instance()->generateSipPeers();

                    if (isset($_POST['extjs'])) {
                        echo json_encode(array(
                            'success'  => 'true',
                            'username' => $signup->username,
                            'msg'      => Yii::t('zii', 'Your account was created. Please check your email'),
                        ));

                        $mail = new Mail(Mail::$TYPE_SIGNUP, $signup->id);
                        try {
                            $mail->send();
                        } catch (Exception $e) {
                        }

                        if ($this->config['global']['signup_admin_email'] == 1) {
                            $mail->setTitle('NEW USER SIGNUP FROM MAGNUSBILLING SIGNUP FORM. USERNAME ');
                            $mail->send($this->config['global']['admin_email']);
                        }

                        exit;
                    }

                    $this->redirect(array('view', 'id' => $signup->id, 'username' => $signup->username, 'password' => $signup->password, 'id_user' => $_POST['Signup']['id_user']));
                } elseif (isset($_POST['extjs'])) {
                    echo json_encode(array(
                        'success' => false,
                        'rows'    => [],
                        'errors'  => $signup->getErrors()
                    ));
                    exit;
                }
            }
        }
        //if exist get id, find agent plans else get admin plans
        if (isset($_GET['id'])) {
            $filter = "AND username = :id";
            $params = array(":id" => $_GET['id']);
        } else {
            $filter = "AND t.id_user = :id";
            $params = array(":id" => 1);
        }

        $modelPlan = Plan::model()->findAll(array(
            'condition' => 'signup = 1 ' . $filter,
            'join'      => 'JOIN pkg_user ON t.id_user = pkg_user.id',
            'params'    => $params,
        ));

        if ($this->config['global']['signup_auto_pass'] > 5) {
            $pass = Util::generatePassword($this->config['global']['signup_auto_pass'], true, true, true, false);
        } else {
            $pass = 0;
        }

        //render to ADD form
        $this->render('add', array(
            'signup'       => $signup,
            'plan'         => $modelPlan,
            'autoPassword' => $pass,
            'autoUser'     => $this->config['global']['auto_generate_user_signup'],
            'language'     => $this->config['global']['base_language'],
            'termsLink'    => $this->config['global']['accept_terms_link'],
        ));
    }


    public function actionGetPlans()
    {
        $this->abstractModel = Plan::model();

        $modelPlans = $this->abstractModel->findAll('signup = 1');
        echo json_encode(array(
            $this->nameRoot => $this->getAttributesModels($modelPlans, array()),
        ));
        exit;
    }

    public function actionGetSignupStates()
    {
        $this->abstractModel = Estados::model();

        $modelStates = $this->abstractModel->findAll();
        echo json_encode(array(
            $this->nameRoot => $this->getAttributesModels($modelStates, array()),
        ));
        exit;
    }
}
