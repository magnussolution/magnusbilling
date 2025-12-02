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
class ConsoleCommand extends CConsoleCommand
{
    public $debug = 0;
    public $config;
    public function init()
    {
        $this->config        = LoadConfig::getConfig();
        Yii::app()->language = Yii::app()->sourceLanguage = isset($this->config['global']['base_language'])
        ? $this->config['global']['base_language']
        : Yii::app()->language;

        define('LOGFILE', 'protected/runtime/' . $this->getName() . '.log');

        if ( ! defined('PID')) {
            define("PID", '/var/run/magnus/' . $this->getName() . 'Pid.php');
        }

        if (isset($_SERVER['argv'][2])) {
            if ($_SERVER['argv'][2] == 'log') {
                $this->debug = 1;
            } elseif ($_SERVER['argv'][2] == 'logAll') {
                $this->debug = 2;
            }

        }
        if ($this->debug > 0) {
            Process::activate();
        } else {
            if (Process::isActive()) {
                $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " PROCESS IS ACTIVE ") : null;
                die();
            } else {
                Process::activate();
            }
        }

        $this->debug >= 1 ? MagnusLog::writeLog(LOGFILE, ' line:' . __LINE__ . " START " . strtoupper($this->getName()) . " COMMAND ") : null;

        parent::init();
    }
}
