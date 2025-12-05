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
        if (! Yii::app()->session['isAdmin']) {
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

        if (! is_array($result)) {
            return;
        }

        for ($i = 0; $i < count($result); $i++) {

            if ($i < $start) {
                continue;
            }

            if (!preg_match('/^backup_voip_softswitch\.(\d{2})-(\d{2})-(\d{4})\.tgz$/', $result[$i])) {
                continue;
            }


            $size     = filesize($this->diretory . $result[$i]) / 1000000;
            $values[] = [
                'id'   => $i,
                'name' => $result[$i],
                'size' => number_format($size, 2) . ' MB'
            ];
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

        if (!isset($_GET['file'])) {
            exit('File not defined');
        }

        // Normalize
        $file = basename(trim($_GET['file']));

        // Strict pattern: backup_voip_softswitch.DD-MM-YYYY.tgz
        $pattern = '/^backup_voip_softswitch\.(\d{2})-(\d{2})-(\d{4})\.tgz$/';

        if (!preg_match($pattern, $file, $m)) {
            exit('Invalid file name');
        }
        // Optional: validate date real
        if (!checkdate((int)$m[2], (int)$m[1], (int)$m[3])) {
            exit('Invalid date');
        }

        // Build path
        $baseDir = rtrim($this->diretory, '/') . '/';
        $fullPath = $baseDir . $file;

        // Resolve real paths (block traversal)
        $realBase = realpath($baseDir);
        $realFile = realpath($fullPath);

        if ($realBase === false || $realFile === false || strpos($realFile, $realBase) !== 0) {
            exit('Invalid path');
        }

        if (!is_file($realFile) || !is_readable($realFile)) {
            exit('File not found');
        }

        // Send file safely
        header('Content-Description: File Transfer');
        header('Content-Type: application/gzip');
        header('Content-Disposition: attachment; filename="' . $file . '"');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . filesize($realFile));

        readfile($realFile);
        exit;
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
        if (Yii::app()->session['isAdmin'] != true || !Yii::app()->session['id_user']) {
            exit;
        }

        if (!isset($_POST['ids'])) {
            exit;
        }

        $ids = json_decode($_POST['ids'], true);
        if (!is_array($ids)) {
            exit;
        }

        $baseDir  = rtrim($this->diretory, '/') . '/';
        $realBase = realpath($baseDir);
        if ($realBase === false) {
            exit;
        }

        // Padrão: backup_voip_softswitch.DD-MM-YYYY.tgz
        $pattern = '/^backup_voip_softswitch\.(\d{2})-(\d{2})-(\d{4})\.tgz$/';

        foreach ($ids as $value) {

            // Normaliza nome
            $file = basename(trim((string)$value));

            // Valida o formato
            if (!preg_match($pattern, $file, $m)) {
                continue;
            }

            // Valida data
            if (!checkdate((int)$m[2], (int)$m[1], (int)$m[3])) {
                continue;
            }

            $fullPath = $baseDir . $file;
            $realFile = realpath($fullPath);

            // Garante que está dentro do diretório de backup
            if ($realFile === false || strpos($realFile, $realBase) !== 0) {
                continue;
            }

            if (is_file($realFile) && is_writable($realFile)) {
                @unlink($realFile);
            }
        }

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
