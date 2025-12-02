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
$configFile = '/etc/asterisk/res_config_mysql.conf';
$array      = parse_ini_file($configFile);
return [
    'basePath'       => dirname(__FILE__) . DIRECTORY_SEPARATOR . '..',
    'name'           => 'cron',
    'preload'        => ['log'],
    'language'       => 'en',
    'sourceLanguage' => 'en',
    'import'         => [
        'application.models.*',
        'application.components.*',
        'application.components.AGI.*',
        'ext.yii-mail.YiiMailMessage',
        'ext.phpAGI.AGI',
        'ext.phpAGI.AGI_AsteriskManager',
        'ext.fpdf.FPDF',
    ],
    'components'     => [
        'mail'         => [
            'class'            => 'ext.yii-mail.YiiMail',
            'transportType'    => 'smtp',
            'transportOptions' => [
                'host'       => '',
                'encryption' => '',
                'username'   => '',
                'password'   => '',
                'port'       => '',
                'encryption' => '',
            ],
            'viewPath'         => 'application.views.mails',
            'logging'          => true,
            'dryRun'           => false,
        ],
        'db'           => [
            'connectionString' => 'mysql:host=' . $array['dbhost'] . ';dbname=' . $array['dbname'] . '',
            'emulatePrepare'   => true,
            'username'         => $array['dbuser'],
            'password'         => $array['dbpass'],
            'charset'          => 'utf8',
            'attributes'       => [
                PDO::MYSQL_ATTR_LOCAL_INFILE => true,
            ],
        ],
        'coreMessages' => [
            'basePath' => 'locale/php',
        ],
        'log'          => [
            'class'  => 'CLogRouter',
            'routes' => [
                [
                    'class'   => 'CFileLogRoute',
                    'logFile' => 'cron.log',
                    'levels'  => 'error, fatal',
                ],
            ],
        ],
        'cache'        => [
            'class' => 'system.caching.CDbCache',
        ],
    ],
];
