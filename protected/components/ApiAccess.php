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
class ApiAccess
{
    public function checkAuthentication($baseController)
    {

        $config = $baseController->config;

        $modelApi = Api::model()->find('api_key = :key AND status = 1', [
            ':key' => $_SERVER['HTTP_KEY'],
        ]);

        if ( ! isset($modelApi->id)) {
            exit('invalid API access');
        }
        $api_key         = $modelApi->api_key;
        $api_secret      = $modelApi->api_secret;
        $ips_restriction = trim($modelApi->api_restriction_ips);

        $req = $_POST;

        $req['nonce'] = $_POST['nonce'];

        $post_data = http_build_query($req, '', '&');
        $sign      = hash_hmac('sha512', $post_data, $api_secret);

        if ($_SERVER['HTTP_SIGN'] === $sign && $_SERVER['HTTP_KEY'] == $api_key) {

            if (strlen($ips_restriction)) {
                $allowed = false;
                $ips     = explode(',', $ips_restriction);

                foreach ($ips as $ip) {

                    if ($_SERVER['REMOTE_ADDR'] == $ip) {
                        $allowed = true;
                        break;
                    }
                }

                if ($allowed === false) {
                    exit('invalid IP');
                }

            }

            if (isset($_POST['getFields']) || isset($_POST['getModules']) || isset($_POST['getMenu'])) {
                $_POST['action'] = 'read';
            } else if (isset($_POST['createUser'])) {
                $_POST['action'] = 'save';
            }

            $modelUser = $modelApi->idUser;
            if (isset($modelUser->id)) {

                $this->checkPermissions($modelApi);

                if (isset($_POST['createUser'])) {
                    $this->createUser($baseController);
                    exit;
                }
                if ($_POST['action'] == 'save') {

                    if ((isset($_POST['id']) && is_array($_POST['id'])) || ($_POST['action'] == 'save' && isset($_POST['filter']) && strlen($_POST['filter']) > 0)) {
                        exit('You only can edit one data per time');
                    }
                }

                $_GET['page']  = isset($_POST['page']) ? $_POST['page'] : 1;
                $_GET['start'] = isset($_POST['start']) ? $_POST['start'] : 0;
                $_GET['limit'] = isset($_POST['limit']) ? $_POST['limit'] : 25;

                $_GET['filter'] = isset($_POST['filter']) ? $_POST['filter'] : '';

                $idUserType                          = $modelUser->idGroup->idUserType->id;
                Yii::app()->session['isAdmin']       = $idUserType == 1 ? true : false;
                Yii::app()->session['isAgent']       = $idUserType == 2 ? true : false;
                Yii::app()->session['isClient']      = $idUserType == 3 ? true : false;
                Yii::app()->session['isClientAgent'] = isset($modelUser->id_user) && $modelUser->id_user > 1 ? true : false;
                Yii::app()->session['id_plan']       = $modelUser->id_plan;
                Yii::app()->session['credit']        = isset($modelUser->credit) ? $modelUser->idUser->credit : 0;
                Yii::app()->session['username']      = $modelUser->username;
                Yii::app()->session['logged']        = true;
                Yii::app()->session['id_user']       = $modelUser->id;
                Yii::app()->session['id_agent']      = is_null($modelUser->id_user) ? 1 : $modelUser->id_user;
                Yii::app()->session['name_user']     = $modelUser->firstname . ' ' . $modelUser->lastname;
                Yii::app()->session['id_group']      = $modelUser->id_group;
                Yii::app()->session['user_type']     = $idUserType;
                Yii::app()->session['language']      = $modelUser->language;
                Yii::app()->session['currency']      = $config['global']['base_currency'];

                $modelGroupModule             = GroupModule::model()->getGroupModule(Yii::app()->session['id_group'], Yii::app()->session['isClient'], Yii::app()->session['id_user']);
                Yii::app()->session['action'] = $baseController->getActions($modelGroupModule);

                if (isset($_POST['getMenu']) && isset($_POST['username'])) {

                    $modelUser = User::model()->find('username = :key', [':key' => $_POST['username']]);

                    if (isset($modelUser->id)) {

                        $modelGroupModule = GroupModule::model()->getGroupModule($modelUser->id_group, $idUserType == 3 ? true : false, $modelUser->id);
                        echo json_encode([
                            'menu'    => $baseController->getMenu($modelGroupModule),
                            'actions' => $baseController->getActions($modelGroupModule),
                        ]);
                    } else {
                        echo 'not found user';
                    }
                    exit;
                }

                if (isset($_POST['getFields'])) {
                    if ( ! AccessManager::getInstance($_POST['module'])->canRead()) {
                        header('HTTP/1.0 401 Unauthorized');
                        die("Access denied in module:" . $_POST['module']);
                    }
                    $module = $_POST['module'];
                    $rules  = $module::model()->rules();

                    echo json_encode($rules);
                    exit;

                } else if (isset($_POST['getModules'])) {

                    $dir         = '/var/www/html/mbilling/protected/controllers/';
                    $controllers = [];
                    foreach (scandir($dir) as $file) {
                        $controllers[strtolower(preg_replace('/Controller\.php/', '', $file))] = lcfirst(preg_replace('/Controller\.php/', '', $file));
                    }

                    $modelGroupModule = GroupModule::model()->findAll('id_group = :key', [':key' => Yii::app()->session['id_group']]);
                    $modules          = [];
                    foreach ($modelGroupModule as $values) {
                        if ($values->idModule->module != "") {

                            if (isset($controllers[$values->idModule->module])) {
                                $modules[] = ['Menu name' => substr($values->idModule->text, 3, -2), 'Module name' => $controllers[$values->idModule->module]];
                            }

                        }
                    }
                    exit(json_encode($modules));
                }

                return true;
            } else {
                exit('invalid user');
            }
        } else {
            exit('invalid API access');
        }

    }

    private function checkPermissions($modelApi)
    {

        if ($_POST['action'] == 'save' && $_POST['id'] == 0) {
            $action = 'c';
        } else if ($_POST['action'] == 'read') {
            $action = 'r';
        } else if ($_POST['action'] == 'save' && $_POST['id'] > 0) {
            $action = 'u';
        } else if ($_POST['action'] == 'destroy') {
            $action = 'd';
        } else if ($_POST['action'] == 'buy') {
            $action = 'r';
        } else if ($_POST['action'] == 'liberar') {
            $action = 'u';
        } else if ($_POST['action'] == 'getNewUsername') {
            $action = 'r';
        } else if ($_POST['action'] == 'getNewPassword') {
            $action = 'r';
        } else if ($_POST['action'] == 'getNewPinCallingcard') {
            $action = 'r';
        } else if ($_POST['action'] == 'resendActivationEmail') {
            $action = 'r';
        } else if ($_POST['action'] == 'spyCall') {
            $action = 'r';
        }

        if ( ! preg_match('/' . $action . '/', $modelApi->action)) {
            exit('invalid API action');
        }

    }

    private function createUser($baseController)
    {

        $values = $_POST;

        if ($baseController->config['global']['api_allow_same_ip'] == 0) {
            $modelUser = User::model()->find('email = :key', [':key' => $values['email']]);

            if (isset($modelUser->id)) {

                echo json_encode([
                    'success' => false,
                    'errors'  => 'This email already in use',
                ]);

                exit;

            }
        }

        if (isset($values['username'])) {
            $modelUser = User::model()->find('username = :key', [':key' => $values['username']]);

            if (isset($modelUser->id)) {
                echo json_encode([
                    'success' => false,
                    'errors'  => 'This username already in use',
                ]);
                exit;
            }
        }

        $values['username']        = isset($values['username']) ? $values['username'] : Util::getNewUsername();
        $values['password']        = isset($values['password']) ? $values['password'] : trim(Util::generatePassword(10, true, true, true, false));
        $values['callingcard_pin'] = isset($values['callingcard_pin']) ? $values['callingcard_pin'] : Util::getNewLock_pin();
        $values['id_user']         = isset($values['id_user']) ? $values['id_user'] : 1;

        if (isset($values['id_plan'])) {
            $values['id_plan'] = $values['id_plan'];
        } else {
            $modelPlan = Plan::model()->find('signup = 1');
            if (isset($modelPlan->id)) {
                $values['id_plan'] = $modelPlan->id;
            } else {
                if (isset($modelUser->id)) {
                    echo json_encode([
                        'success' => false,
                        'errors'  => 'No plan active',
                    ]);
                    exit;
                }
            }
        }

        if ( ! isset($values['credit'])) {
            $values['credit'] = isset($modelPlan->ini_credit) ? $modelPlan->ini_credit : 0;
        }

        if (isset($values['id_group'])) {
            $values['id_group'] = $values['id_group'];
        } else {
            $modelGroupUser = GroupUser::model()->findAllByAttributes(["id_user_type" => 3]);
            if (isset($modelGroupUser[0]->id)) {
                $values['id_group'] = $modelGroupUser[0]->id;
            } else {
                echo json_encode([
                    'success' => false,
                    'errors'  => 'No plan group for user',
                ]);
                exit;
            }
        }

        $modelUser             = new User();
        $modelUser->attributes = $values;
        $success               = $modelUser->save();

        if ($success) {

            $modelSip              = new Sip();
            $modelSip->id_user     = $modelUser->id;
            $modelSip->name        = $modelUser->username;
            $modelSip->allow       = 'g729,gsm,alaw,ulaw';
            $modelSip->host        = 'dynamic';
            $modelSip->insecure    = 'no';
            $modelSip->defaultuser = $modelUser->username;
            $modelSip->secret      = $modelUser->password;
            if (strlen($modelUser->phone) > 5) {
                $modelSip->callerid   = $modelUser->phone;
                $modelSip->cid_number = $modelUser->phone;
            }
            $modelSip->save();

            AsteriskAccess::instance()->generateSipPeers();

            $attributes = false;
            foreach ($modelUser as $key => $item) {

                if ( ! strlen($item)) {
                    continue;
                }
                $attributes[$key] = $item;

                if (isset(Yii::app()->session['isClient']) && Yii::app()->session['isClient']) {
                    foreach ($baseController->fieldsInvisibleClient as $field) {
                        unset($attributes[$key][$field]);
                    }
                }

                if (isset(Yii::app()->session['isAgent']) && Yii::app()->session['isAgent']) {
                    foreach ($baseController->fieldsInvisibleAgent as $field) {
                        unset($attributes[$key][$field]);
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'data'    => $attributes,
            ]);

        } else {
            echo json_encode([
                'success' => false,
                'errors'  => $modelUser->getErrors(),
            ]);
        }

    }
}
