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
class Loadconfig
{
    public static function getConfig()
    {
        $modelConfiguration = Configuration::model()->findAll();

        $config = [];
        foreach ($modelConfiguration as $conf) {
            $config[$conf->config_group_title][$conf->config_key] = $conf->config_value;
        }

        return $config;
    }
}
