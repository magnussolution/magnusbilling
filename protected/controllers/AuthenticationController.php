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

class AuthenticationController extends Controller
{
    private $menu = [];

    public function actionLogin()
    {
        $user     = $_REQUEST['user'];
        $password = $_REQUEST['password'];

        $this->verifyLogin();

        if (isset($_REQUEST['remote'])) {
            $modelSip = AccessManager::checkAccessLogin($user, $password);
            if (isset($modelSip->id)) {
                $user     = $modelSip->idUser->username;
                $password = $modelSip->idUser->password;
            }
        }

        $modelUser = User::model()->find("username = :user", [':user' => $user]);

        if (isset($modelUser->idGroup->idUserType->id) && $modelUser->idGroup->idUserType->id == 1) {
            $condition = "username COLLATE utf8_bin = :user AND UPPER(password) COLLATE utf8_bin = :pass ";
        } else {
            $condition = "((username COLLATE utf8_bin = :user OR email LIKE :user) AND (password COLLATE utf8_bin = :pass OR UPPER(SHA1(password)) COLLATE utf8_bin = :pass))  ";
            if ($this->config['global']['sipuser_login'] == 1) {
                $condition .= " OR (id = (SELECT id_user FROM pkg_sip WHERE name COLLATE utf8_bin = :user AND UPPER(SHA1(secret)) COLLATE utf8_bin = :pass) )";
            }
        }

        $modelUser = User::model()->find(
            [
                'condition' => $condition,
                'params'    => [':user' => $user, ':pass' => $password],
            ]
        );

        $loginkey = isset($_POST['loginkey']) ? $_POST['loginkey'] : false;

        if (strlen($loginkey) > 5 && $loginkey == $modelUser->loginkey) {
            $modelUser->active   = 1;
            $modelUser->loginkey = '';
            $modelUser->save();

            $mail = new Mail(Mail::$TYPE_SIGNUPCONFIRM, $modelUser->id);
            $mail->send();
        }

        if (! isset($modelUser->id)) {
            Yii::app()->session['logged'] = false;
            echo json_encode([
                'success' => false,
                'msg'     => 'Username and password combination is invalid',
            ]);
            $nameMsg = $this->nameMsg;
            $info    = 'Username and password combination is invalid - User: ' . $user . ' IP: ' . $_SERVER['REMOTE_ADDR'];
            Yii::log($info, 'error');
            MagnusLog::insertLOG(1, $info);

            return;
        }

        $this->checkCaptcha();

        if ($modelUser->active == 0) {
            Yii::app()->session['logged'] = false;
            echo json_encode([
                'success' => false,
                'msg'     => 'Username is disabled',
            ]);

            $info = 'Username ' . $user . ' is disabled';
            MagnusLog::insertLOG(1, $info);

            return;
        }

        $idUserType = $modelUser->idGroup->idUserType->id;

        Yii::app()->session['isAdmin']             = $idUserType == 1 ? true : false;
        Yii::app()->session['isAgent']             = $idUserType == 2 ? true : false;
        Yii::app()->session['isClient']            = $idUserType == 3 ? true : false;
        Yii::app()->session['isClientAgent']       = isset($modelUser->id_user) && $modelUser->id_user > 1 ? true : false;
        Yii::app()->session['id_plan']             = $modelUser->id_plan;
        Yii::app()->session['credit']              = isset($modelUser->credit) ? $modelUser->credit : 0;
        Yii::app()->session['username']            = $modelUser->username;
        Yii::app()->session['logged']              = true;
        Yii::app()->session['id_user']             = $modelUser->id;
        Yii::app()->session['id_agent']            = is_null($modelUser->id_user) ? 1 : $modelUser->id_user;
        Yii::app()->session['name_user']           = $modelUser->firstname . ' ' . $modelUser->lastname;
        Yii::app()->session['id_group']            = $modelUser->id_group;
        Yii::app()->session['user_type']           = $idUserType;
        Yii::app()->session['systemName']          = $_SERVER['SCRIPT_FILENAME'];
        Yii::app()->session['session_start']       = time();
        Yii::app()->session['userCount']           = User::model()->count("credit != 0");
        Yii::app()->session['hidden_prices']       = $modelUser->idGroup->hidden_prices;
        Yii::app()->session['hidden_batch_update'] = $modelUser->idGroup->hidden_batch_update;

        if ($modelUser->googleAuthenticator_enable > 0) {

            require_once 'lib/GoogleAuthenticator/GoogleAuthenticator.php';
            $ga = new PHPGangsta_GoogleAuthenticator();

            if (strlen($modelUser->google_authenticator_key) < 5 || $modelUser->googleAuthenticator_enable == 3) {

                if ($modelUser->googleAuthenticator_enable == 3) {
                    $secret = $modelUser->google_authenticator_key;
                } else {
                    $secret = $ga->createSecret();
                }

                $modelUser->google_authenticator_key   = $secret;
                $modelUser->googleAuthenticator_enable = 3;
                $modelUser->save();
                Yii::app()->session['newGoogleAuthenticator']   = true;
                Yii::app()->session['googleAuthenticatorKey']   = $ga->getQRCodeGoogleUrl('VoIP-' . $modelUser->username . '-' . $modelUser->id, $secret);
                Yii::app()->session['checkGoogleAuthenticator'] = true;
                Yii::app()->session['showGoogleCode']           = true;
            } else {
                $secret                                       = $modelUser->google_authenticator_key;
                Yii::app()->session['newGoogleAuthenticator'] = false;
                if ($modelUser->googleAuthenticator_enable == 2) {
                    Yii::app()->session['showGoogleCode'] = true;
                } else {
                    Yii::app()->session['showGoogleCode'] = false;
                }
                Yii::app()->session['googleAuthenticatorKey'] = $ga->getQRCodeGoogleUrl('VoIP-' . $modelUser->username . '-' . $modelUser->id, $secret);

                $modelLogUsers = LogUsers::model()->count(
                    'id_user = :key AND ip = :key1 AND description = :key2 AND date > :key3',
                    [
                        ':key'  => $modelUser->id,
                        ':key1' => $_SERVER['REMOTE_ADDR'],
                        ':key2' => 'Username Login on the panel - User ' . $modelUser->username,
                        ':key3' => date('Y-m-d'),
                    ]
                );
                if ($modelLogUsers > 0) {
                    Yii::app()->session['checkGoogleAuthenticator'] = false;
                } else {
                    Yii::app()->session['checkGoogleAuthenticator'] = true;
                }
            }
        } else {
            Yii::app()->session['showGoogleCode']           = false;
            Yii::app()->session['newGoogleAuthenticator']   = false;
            Yii::app()->session['checkGoogleAuthenticator'] = false;
            MagnusLog::insertLOG(1, 'Username Login on the panel - User ' . Yii::app()->session['username']);
        }

        if (isset($_REQUEST['securityLogin'])) {
            header("Location: ../../../");
        }

        if (isset($_REQUEST['remote'])) {
            header("Location: ../..");
        }
        echo json_encode([
            'success' => Yii::app()->session['username'],
            'msg'     => Yii::app()->session['name_user'],
        ]);
    }

    private function mountMenu()
    {
        $modelGroupModule = GroupModule::model()->getGroupModule(Yii::app()->session['id_group'], Yii::app()->session['isClient'], Yii::app()->session['id_user']);

        Yii::app()->session['action'] = $this->getActions($modelGroupModule);
        Yii::app()->session['menu']   = $this->getMenu($modelGroupModule);
    }

    public function actionLogoff()
    {
        Yii::app()->session['logged']              = false;
        Yii::app()->session['id_user']             = false;
        Yii::app()->session['id_agent']            = false;
        Yii::app()->session['name_user']           = false;
        Yii::app()->session['menu']                = [];
        Yii::app()->session['action']              = [];
        Yii::app()->session['currency']            = false;
        Yii::app()->session['language']            = false;
        Yii::app()->session['isAdmin']             = true;
        Yii::app()->session['isClient']            = false;
        Yii::app()->session['isAgent']             = false;
        Yii::app()->session['isClientAgent']       = false;
        Yii::app()->session['id_plan']             = false;
        Yii::app()->session['credit']              = false;
        Yii::app()->session['username']            = false;
        Yii::app()->session['id_group']            = false;
        Yii::app()->session['user_type']           = false;
        Yii::app()->session['decimal']             = false;
        Yii::app()->session['licence']             = false;
        Yii::app()->session['email']               = false;
        Yii::app()->session['userCount']           = false;
        Yii::app()->session['systemName']          = false;
        Yii::app()->session['base_country']        = false;
        Yii::app()->session['version']             = false;
        Yii::app()->session['hidden_prices']       = false;
        Yii::app()->session['hidden_batch_update'] = false;
        Yii::app()->session->clear();
        Yii::app()->session->destroy();

        echo json_encode([
            'success' => true,
        ]);
    }

    public function actionCheck()
    {
        if (Yii::app()->session['logged']) {

            $this->mountMenu();
            $modelGroupUserGroup = GroupUserGroup::model()->count(
                'id_group_user = :key',
                [':key' => Yii::app()->session['id_group']]
            );

            $modelGroupUser = GroupUser::model()->findByPk(Yii::app()->session['id_group']);

            Yii::app()->session['adminLimitUsers']      = $modelGroupUserGroup;
            Yii::app()->session['licence']              = $this->config['global']['licence'];
            Yii::app()->session['email']                = $this->config['global']['admin_email'];
            Yii::app()->session['currency']             = $this->config['global']['base_currency'];
            Yii::app()->session['language']             = $this->config['global']['base_language'];
            Yii::app()->session['decimal']              = $this->config['global']['decimal_precision'];
            Yii::app()->session['base_country']         = $this->config['global']['base_country'];
            Yii::app()->session['version']              = $this->config['global']['version'];
            Yii::app()->session['asterisk_version']     = $this->config['global']['asterisk_version'];
            Yii::app()->session['social_media_network'] = $this->config['global']['social_media_network'];
            Yii::app()->session['show_playicon_cdr']    = $this->config['global']['show_playicon_cdr'];

            $id_user                  = Yii::app()->session['id_user'];
            $id_agent                 = Yii::app()->session['id_agent'];
            $nameUser                 = Yii::app()->session['name_user'];
            $logged                   = Yii::app()->session['logged'];
            $menu                     = Yii::app()->session['menu'];
            $currency                 = Yii::app()->session['currency'];
            $language                 = Yii::app()->session['language'];
            $isAdmin                  = Yii::app()->session['isAdmin'];
            $isClient                 = Yii::app()->session['isClient'];
            $isAgent                  = Yii::app()->session['isAgent'];
            $isClientAgent            = Yii::app()->session['isClientAgent'];
            $id_plan                  = Yii::app()->session['id_plan'];
            $credit                   = Yii::app()->session['credit'];
            $username                 = Yii::app()->session['username'];
            $id_group                 = Yii::app()->session['id_group'];
            $user_type                = Yii::app()->session['user_type'];
            $decimal                  = Yii::app()->session['decimal'];
            $licence                  = Yii::app()->session['licence'];
            $email                    = Yii::app()->session['email'];
            $userCount                = Yii::app()->session['userCount'];
            $base_country             = Yii::app()->session['base_country'];
            $version                  = Yii::app()->session['version'];
            $show_playicon_cdr        = Yii::app()->session['show_playicon_cdr'];
            $social_media_network     = Yii::app()->session['social_media_network'];
            $checkGoogleAuthenticator = Yii::app()->session['checkGoogleAuthenticator'];
            $googleAuthenticatorKey   = Yii::app()->session['googleAuthenticatorKey'];
            $newGoogleAuthenticator   = Yii::app()->session['newGoogleAuthenticator'];
            $showGoogleCode           = Yii::app()->session['showGoogleCode'];
            $hidden_prices            = Yii::app()->session['hidden_prices']            = $modelGroupUser->hidden_prices;
            $hidden_batch_update      = Yii::app()->session['hidden_batch_update']      = $modelGroupUser->hidden_batch_update;
        } else {
            $id_user                  = false;
            $id_agent                 = false;
            $nameUser                 = false;
            $logged                   = false;
            $menu                     = [];
            $currency                 = false;
            $language                 = false;
            $isAdmin                  = false;
            $isClient                 = false;
            $isAgent                  = false;
            $isClientAgent            = false;
            $id_plan                  = false;
            $credit                   = false;
            $username                 = false;
            $id_group                 = false;
            $user_type                = false;
            $decimal                  = false;
            $licence                  = false;
            $email                    = false;
            $userCount                = false;
            $base_country             = false;
            $version                  = false;
            $checkGoogleAuthenticator = false;
            $googleAuthenticatorKey   = false;
            $newGoogleAuthenticator   = false;
            $showGoogleCode           = false;
            $social_media_network     = false;
            $show_playicon_cdr        = false;
            $hidden_prices            = false;
            $hidden_batch_update      = false;
        }
        $language = isset(Yii::app()->session['language']) ? Yii::app()->session['language'] : Yii::app()->sourceLanguage;
        $theme    = isset(Yii::app()->session['theme']) ? Yii::app()->session['theme'] : 'blue-neptune';

        if (file_exists('resources/images/logo_custom.png')) {
            Yii::log('file existe', 'info');
        }

        if (Yii::app()->session['isClientAgent']) {

            if (file_exists('resources/images/logo_custom_' . Yii::app()->session['id_agent'] . '.png')) {
                $logo = 'resources/images/logo_custom_' . Yii::app()->session['id_agent'] . '.png';
            } else {
                if (file_exists('resources/images/logo_custom.png')) {
                    $logo = 'resources/images/logo_custom.png';
                } else {
                    $logo = 'resources/images/logo.png';
                }
            }
        } else if (Yii::app()->session['isAgent']) {

            if (file_exists('resources/images/logo_custom_' . Yii::app()->session['id_user'] . '.png')) {
                $logo = 'resources/images/logo_custom_' . Yii::app()->session['id_user'] . '.png';
            } else {
                if (file_exists('resources/images/logo_custom.png')) {
                    $logo = 'resources/images/logo_custom.png';
                } else {
                    $logo = 'resources/images/logo.png';
                }
            }
        } else {
            $logo = file_exists('resources/images/logo_custom.png') ? 'resources/images/logo_custom.png' : 'resources/images/logo.png';
        }

        echo json_encode([
            'id'                       => $id_user,
            'id_agent'                 => $id_agent,
            'name'                     => $nameUser,
            'success'                  => $logged,
            'menu'                     => $menu,
            'language'                 => $language,
            'theme'                    => $theme,
            'currency'                 => $currency,
            'language'                 => $language,
            'isAdmin'                  => $isAdmin,
            'isClient'                 => $isClient,
            'isAgent'                  => $isAgent,
            'isClientAgent'            => $isClientAgent,
            'id_plan'                  => $id_plan,
            'credit'                   => $credit,
            'username'                 => $username,
            'id_group'                 => $id_group,
            'user_type'                => $user_type,
            'decimal'                  => $decimal,
            'licence'                  => $licence,
            'email'                    => $email,
            'userCount'                => $userCount,
            'base_country'             => $base_country,
            'version'                  => $version,
            'show_playicon_cdr'        => $show_playicon_cdr,
            'social_media_network'     => $social_media_network,
            'asterisk_version'         => Yii::app()->session['asterisk_version'],
            'checkGoogleAuthenticator' => $checkGoogleAuthenticator,
            'googleAuthenticatorKey'   => $googleAuthenticatorKey,
            'newGoogleAuthenticator'   => $newGoogleAuthenticator,
            'showGoogleCode'           => $showGoogleCode,
            'logo'                     => $logo,
            'show_filed_help'          => $this->config['global']['show_filed_help'],
            'campaign_user_limit'      => $this->config['global']['campaign_user_limit'],
            'showMCDashBoard'          => $this->config['global']['showMCDashBoard'],
            'hidden_prices'            => $hidden_prices,
            'hidden_batch_update'      => $hidden_batch_update,
        ]);
    }

    public function actionGoogleAuthenticator()
    {
        require_once 'lib/GoogleAuthenticator/GoogleAuthenticator.php';

        $ga = new PHPGangsta_GoogleAuthenticator();

        $modelUser = User::model()->findByPk((int) Yii::app()->session['id_user']);

        //Yii::log(print_r($sql,true),'info');
        $secret      = $modelUser->google_authenticator_key;
        $oneCodePost = $_POST['oneCode'];

        $checkResult = $ga->verifyCode($secret, $oneCodePost, 2);

        if ($checkResult) {
            $sussess                                        = true;
            Yii::app()->session['checkGoogleAuthenticator'] = false;
            $modelUser->googleAuthenticator_enable          = 1;
            $modelUser->save();
            MagnusLog::insertLOG(1, 'Username Login on the panel - User ' . Yii::app()->session['username']);
        } else {
            $sussess = false;
        }
        //$sussess = true;
        echo json_encode([
            'success' => $sussess,
            'msg'     => Yii::app()->session['name_user'],
        ]);
    }

    public function actionChangePassword()
    {
        $passwordChanged = false;
        $id_user         = Yii::app()->session['id_user'];
        $currentPassword = $_POST['current_password'];
        $newPassword     = $_POST['password'];
        $isClient        = Yii::app()->session['isClient'];
        $errors          = '';

        $modelUser = User::model()->find(
            "id LIKE :id_user AND password LIKE :currentPassword",
            [
                ":id_user"         => $id_user,
                ":currentPassword" => $currentPassword,
            ]
        );

        if (isset($modelUser->id)) {
            try {
                $modelUser->password = $newPassword;
                $passwordChanged     = $modelUser->save();
            } catch (Exception $e) {
                $errors = $this->getErrorMySql($e);
            }

            $msg = $passwordChanged ? yii::t('yii', 'Password change success!') : $errors;
        } else {
            $msg = yii::t('yii', 'Current Password incorrect.');
        }

        echo json_encode([
            'success' => $passwordChanged,
            'msg'     => $msg,
        ]);
    }

    public function actionImportLogo()
    {
        if (isset($_FILES['logo']['tmp_name']) && strlen($_FILES['logo']['tmp_name']) > 3) {

            $uploaddir = "resources/images/";

            if (Yii::app()->session['isAgent']) {
                $uploadfile = $uploaddir . 'logo_custom_' . Yii::app()->session['id_user'] . '.png';
            } else {
                $uploadfile = $uploaddir . 'logo_custom.png';
            }
            Util::validExtension($_FILES['logo']['tmp_name'], $_FILES["logo"]["name"], ['png']);

            move_uploaded_file($_FILES["logo"]["tmp_name"], $uploadfile);
        }

        echo json_encode([
            'success' => true,
            'msg'     => 'Refresh the system to see the new logo',
        ]);
    }

    public function actionImportWallpapers()
    {
        if (isset($_FILES['wallpaper']['tmp_name']) && strlen($_FILES['wallpaper']['tmp_name']) > 3) {

            $uploaddir = "resources/images/wallpapers/";
            Util::validExtension($_FILES['wallpaper']['tmp_name'], $_FILES["wallpaper"]["name"], ['jpg']);

            $uploadfile = $uploaddir . 'Customization.jpg';
            move_uploaded_file($_FILES["wallpaper"]["tmp_name"], $uploadfile);
        }

        $modelConfiguration               = Configuration::model()->find("config_key LIKE 'wallpaper'");
        $modelConfiguration->config_value = 'Customization';
        try {
            $success = $modelConfiguration->save();
            $msg     = Yii::t('yii', 'Refresh the system to see the new logo');
        } catch (Exception $e) {
            $success = false;
            $msg     = $this->getErrorMySql($e);
        }
        echo json_encode([
            'success' => $success,
            'msg'     => $msg,
        ]);
    }

    public function actionImportLoginBackground()
    {
        $success = false;
        $msg     = 'error';

        if (isset($_FILES['loginbackground']['tmp_name']) && strlen($_FILES['loginbackground']['tmp_name']) > 3) {

            Util::validExtension($_FILES['loginbackground']['tmp_name'], $_FILES["loginbackground"]["name"], ['jpg']);

            $uploadfile = 'resources/images/lock-screen-background.jpg';
            try {
                move_uploaded_file($_FILES["loginbackground"]["tmp_name"], $uploadfile);
                $success = true;
                $msg     = 'Refresh the system to see the new wallpaper';
            } catch (Exception $e) {
            }
        }
        echo json_encode([
            'success' => $success,
            'msg'     => $msg,
        ]);
    }

    public function actionForgetPassword()
    {
        if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {

            $modelUser = User::model()->findAll('email =:key', [':key' => $_POST['email']]);
            if (is_array($modelUser) && count($modelUser) > 1) {
                $success = false;
                $msg     = "Email in use more than 1 account, contact administrator";
            } else if (is_array($modelUser) && count($modelUser)) {

                if ($modelUser[0]->idGroup->idUserType->id == 1) {

                    $success = false;
                    $msg     = "You can't request admin password";
                } else {

                    $mail = new Mail(Mail::$TYPE_FORGETPASSWORD, $modelUser[0]->id);
                    try {
                        $mail->send();
                    } catch (Exception $e) {
                        //
                    }
                    $success = true;
                    $msg     = "Your password was sent to your email";
                }
            } else {
                $success = false;
                $msg     = "Email not found";
            }
        } else {
            $success = false;
            $msg     = "Email not found";
        }

        echo json_encode([
            'success' => $success,
            'msg'     => $msg,
        ]);
    }

    public function actionCancelCreditNotification()
    {
        if (isset($_GET['key']) && isset($_GET['id'])) {

            $modelUser = User::model()->findByPk((int) $_GET['id']);

            if (isset($modelUser->id)) {

                $key = sha1($modelUser->id . $modelUser->username . $modelUser->password);
                if ($key == $_GET['key']) {
                    $modelUser->credit_notification = '-1';
                    $modelUser->save();
                    echo '<br><center><font color=green>' . Yii::t('zii', "Success") . '</font></center>';
                }
            }
        }
    }

    public function verifyLogin()
    {
        $modelLogUsers = LogUsers::model()->findAll([
            'condition' => 'ip = :key AND date > date_sub(now(), interval 5 minute)',
            'params'    => [
                ':key' => $_SERVER['REMOTE_ADDR'],
            ],
            'order'     => 'id DESC',
            'limit'     => 3,
        ]);

        if (is_array($modelLogUsers) && count($modelLogUsers) < 3) {
            return;
        }

        if (preg_match('/IP blocked after 3 failing attempts. IP: /', $modelLogUsers[0]->description)) {
            Yii::app()->session['logged'] = false;
            echo json_encode([
                'success' => false,
                'msg'     => "IP blocked after 3 failing attempts. Wait 5 minutes and try again.",
                'ip'      => $_SERVER['REMOTE_ADDR'],
            ]);
            exit;
        }

        $invalid = 0;
        for ($i = 0; $i < 3; $i++) {
            if (preg_match('/Username and password combination is invalid/', $modelLogUsers[$i]->description)) {
                $invalid++;
            }
        }

        if ($invalid >= 3) {
            Yii::app()->session['logged'] = false;
            echo json_encode([
                'success' => false,
                'msg'     => Yii::t('zii', "IP blocked after 3 failing attempts.") . "<br><b>" . Yii::t('zii', "Wait 5 minutes and try again.") . "</b>" . "<br> IP: " . $_SERVER['REMOTE_ADDR'],
            ]);
            $nameMsg = $this->nameMsg;

            $info = 'IP blocked after 3 failing attempts. IP: ' . $_SERVER['REMOTE_ADDR'];
            Yii::log($info, 'error');
            MagnusLog::insertLOG(1, $info);

            exit;
        }
    }

    public function checkCaptcha()
    {
        if (strlen($this->config['global']['reCaptchaSecret']) > 10 && strlen($this->config['global']['reCaptchaKey']) > 10) {
            $post_data = http_build_query(
                [
                    'secret'   => $this->config['global']['reCaptchaSecret'],
                    'response' => $_POST['key'],
                ]
            );

            $opts = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => 'Content-type: application/x-www-form-urlencoded',
                    'content' => $post_data,
                ],
            ];

            $context  = stream_context_create($opts);
            $response = file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
            try {
                $response = json_decode($response);
            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'msg'     => 'Invalid captcha json' . print_r($response, true),
                ]);
                exi;
            }
            if ($response->success != true || $response->hostname != $_SERVER['HTTP_HOST']) {
                echo json_encode([
                    'success' => false,
                    'msg'     => 'Invalid captcha. Refresh the page to generate new code',
                ]);
                exit;
            }
        }
    }
}
