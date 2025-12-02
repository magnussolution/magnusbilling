<?php
/**
 * Acoes do modulo "Call".
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
 * 17/08/2012
 */

class BackupController extends Controller
{
    private $diretory = "/usr/local/src/magnus/backup/";

    public function init()
    {
        if ( ! Yii::app()->session['isAdmin']) {
            exit;
        }
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        if (Yii::app()->session['isAdmin'] != true || ! Yii::app()->session['id_user']) {
            exit;
        }

        $result = $this->scan_dir($this->diretory, 1);

        $values = [];
        $start  = $_GET['start'];
        $limit  = $_GET['limit'];

        if ( ! is_array($result)) {
            return;
        }

        for ($i = 0; $i < count($result); $i++) {

            if ($i < $start) {
                continue;
            }

            if ( ! preg_match("/backup_voip_softswitch/", $result[$i])) {
                continue;
            }
            $size     = filesize($this->diretory . $result[$i]) / 1000000;
            $values[] = [
                'id'   => $i,
                'name' => $result[$i],
                'size' => number_format($size, 2) . ' MB'];
        }

        //
        # envia o json requisitado
        echo json_encode([
            $this->nameRoot  => $values,
            $this->nameCount => $i,
            $this->nameSum   => [],
        ]);
    }
    public function actionDownload()
    {
        if (Yii::app()->session['isAdmin'] != true || ! Yii::app()->session['id_user']) {
            exit;
        }

        $file = $_GET['file'];

        if ( ! preg_match("/backup_voip_softswitch/", $file)) {
            exit;
        }
        $path = $this->diretory . $file;

        header('Content-type: application/csv');
        header('Content-Disposition: inline; filename="' . $file . '"');
        header('Content-Transfer-Encoding: binary');
        header('Accept-Ranges: bytes');
        ob_clean();
        flush();
        readfile($path);

    }
    public function scan_dir($dir)
    {
        if (Yii::app()->session['isAdmin'] != true || ! Yii::app()->session['id_user']) {
            exit;
        }

        $ignored = ['.', '..', '.svn', '.htaccess'];

        $files = [];
        foreach (scandir($dir) as $file) {
            if (in_array($file, $ignored)) {
                continue;
            }

            $files[$file] = filemtime($dir . '/' . $file);
        }

        arsort($files);
        $files = array_keys($files);

        return ($files) ? $files : false;
    }

    public function actionDestroy()
    {
        if (Yii::app()->session['isAdmin'] != true || ! Yii::app()->session['id_user']) {
            exit;
        }

        $ids = json_decode($_POST['ids']);
        foreach ($ids as $key => $value) {
            unlink($this->diretory . $value);
        }

        # retorna o resultado da execucao
        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameMsg     => $this->success,
        ]);
    }

    public function actionSave()
    {

        echo json_encode([
            $this->nameSuccess => $this->success,
            $this->nameRoot    => $this->attributes,
            $this->nameMsg     => $this->msg . 'This option has been discontinued. To create a new backup, run the following command via SSH: php /var/www/html/mbilling/cron.php Backup',
        ]);

    }
}
