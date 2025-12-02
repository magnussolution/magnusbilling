<?php
/**
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2016 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v2.1
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 *
 */

// Definicao do framework e do arquivo de config da aplicacao
$yii    = dirname(__FILE__) . '/yii/framework/yii.php';
$config = dirname(__FILE__) . '/protected/config/cron.php';

// Remover no ambiente de producao
defined('YII_DEBUG') or define('YII_DEBUG', false);

defined('YII_TRACE_LEVEL') or define('YII_TRACE_LEVEL', 0);

require_once $yii;
Yii::createConsoleApplication($config)->run();
