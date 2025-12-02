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
class UpdateMysqlCommand extends CConsoleCommand
{

    public $debug = 0;
    public $config;

    public function run($args)
    {

        $this->config = LoadConfig::getConfig();

        if (file_exists('/var/spool/cron/root')) {
            $CRONPATH = '/var/spool/cron/root';
        } elseif (file_exists('/var/spool/cron/crontabs/root')) {
            $CRONPATH = '/var/spool/cron/crontabs/root';
        }

        $version  = $this->config['global']['version'];
        $language = $this->config['global']['base_language'];

        echo $version;

        if (preg_match('/^7/', $version)) {

            $sql = "UPDATE pkg_trunk SET providertech = 'pjsip' WHERE providertech = 'sip' ";
            $this->executeDB($sql);

            $version = '8.0.0';
            $sql     = "UPDATE pkg_configuration SET config_value = '" . $version . "'WHERE config_key = 'version'";
            $this->executeDB($sql);
        }
    }

    public function executeDB($sql)
    {
        try {
            Yii::app()->db->createCommand($sql)->execute();
        } catch (Exception $e) {
            //print_r($e);
        }
    }

    public function update($version = '')
    {
        $sql = "UPDATE pkg_configuration SET config_value = '" . $version . "' WHERE config_key = 'version' ";
        $this->executeDB($sql);
    }
}
