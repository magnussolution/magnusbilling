<?php

/**
 * Acoes do modulo "Plan".
 *
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
 * 27/07/2012
 */

class PlayAudioController extends Controller
{

    public function actionIndex()
    {

        if (preg_match('/queue-periodic/', $_GET['audio'])) {
            $file_name = '/var/lib/asterisk/sounds/' . $_GET['audio'];

            if (file_exists($file_name . '.gsm')) {
                $file_name .= '.gsm';
            } else {
                $file_name .= '.wav';
            }
        } else {
            $file_name = $this->magnusFilesDirectory . 'sounds/' . $_GET['audio'];
        }

        if (! file_exists($file_name)) {
            exit('<center><br>' . Yii::t('zii', 'File not found') . '</center>');
        }
        if (preg_match('/gsm/', $file_name)) {
            header("Cache-Control: public");
            header("Content-Description: File Transfer");
            header("Content-Disposition: attachment; filename=" . $_GET['audio']);
            header("Content-Type: audio/x-gsm");
            header("Content-Transfer-Encoding: binary");
            readfile($file_name);
        } else {
            copy(preg_replace('/ /', '', $file_name), '/var/www/html/mbilling/tmp/' . $_GET['audio']);
            echo '<body style="margin:0px;padding:0px;overflow:hidden">
                            <iframe src="../../tmp/' . $_GET['audio'] . '" frameborder="0" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>
                        </body>';
        }
    }
}
