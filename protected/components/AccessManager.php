<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Heitor Gianastasio Pipet de Oliveira.
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

class AccessManager
{

    private static $instance;
    private static $config;

    private $module;
    private $action;

    private function __construct($module)
    {
        $this->setModule($module);
    }

    public static function getInstance($module)
    {
        if (is_null(self::$instance)) {
            self::$instance = new AccessManager($module);
            self::$config   = require 'protected/config/permissions.php';
        } else {
            self::$instance->setModule($module);
        }
        return self::$instance;
    }

    private function getResult($canDoIt)
    {
        if (in_array($this->module, self::$config['only_admin']) && ! Yii::app()->session['isAdmin']) {
            return false;
        }

        return $canDoIt;
    }

    public function canRead()
    {

        return $this->getResult(strpos($this->action, 'r') !== false);
    }

    public function canCreate()
    {

        return $this->getResult(strpos($this->action, 'c') !== false);
    }

    public function canUpdate()
    {

        return $this->getResult(strpos($this->action, 'u') !== false);
    }

    public function canDelete()
    {
        return $this->getResult(strpos($this->action, 'd') !== false);
    }

    private function setModule($module)
    {
        $this->module = $module;
        $this->action = isset(Yii::app()->session['action'][$module]) ? Yii::app()->session['action'][$module] : '';
    }

    public function checkAccess($user, $pass)
    {
        $filterUser = '((s.username COLLATE utf8_bin = :key OR s.email COLLATE utf8_bin LIKE :key) AND UPPER(MD5(s.password)) = :key1)';
        $filterSip  = '(t.name COLLATE utf8_bin = :key AND UPPER(MD5(t.secret)) = :key1 )';
        $modelSip   = Sip::model()->find(
            [
                'condition' => $filterUser . ' OR ' . $filterSip,
                'join'      => 'LEFT JOIN pkg_user s ON t.id_user = s.id',
                'params'    => [
                    ':key'  => trim($user),
                    ':key1' => trim(strtoupper($pass)),
                ],
            ]);
        return $modelSip;
    }

    public function checkAccessLogin($user, $pass)
    {
        $filterUser = '((s.username COLLATE utf8_bin = :key OR s.email COLLATE utf8_bin LIKE :key) AND UPPER(SHA1(s.password)) = :key1)';
        $filterSip  = '(t.name COLLATE utf8_bin = :key AND UPPER(SHA1(t.secret)) = :key1 )';
        $modelSip   = Sip::model()->find(
            [
                'condition' => $filterUser . ' OR ' . $filterSip,
                'join'      => 'LEFT JOIN pkg_user s ON t.id_user = s.id',
                'params'    => [
                    ':key'  => trim($user),
                    ':key1' => trim(strtoupper($pass)),
                ],
            ]);
        return $modelSip;
    }
}
