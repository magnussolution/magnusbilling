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
        if (!isset($_GET['audio'])) {
            exit('<center><br>' . Yii::t('zii', 'File not found') . '</center>');
        }

        $audio = trim((string) $_GET['audio']);

        /**
         * PERMITIDO:
         *  - idCampaign_123.wav | .gsm
         *  - idIvrDidNoWork_123.wav | .gsm
         *  - idIvrDidWork_123.wav | .gsm
         *  - queue-periodic.wav | .gsm
         */
        $pattern = '/^(idCampaign_|idIvrDidNoWork_|idIvrDidWork_)(\d+)\.(wav|gsm)$/i';

        if (!preg_match($pattern, $audio, $matches)) {
            exit('Invalid audio file');
        }

        // Normaliza nome (remove qualquer path, por segurança extra)
        $audio = basename($audio);

        $prefix = isset($matches[2]) ? $matches[2] : '';
        $id     = isset($matches[3]) ? (int) $matches[3] : 0;

        // Se tiver ID e for de Campaign, garante que a campaign existe
        if ($id > 0 && $prefix === 'idCampaign_') {
            $modelCampaign = Campaign::model()->findByPk($id);
            if (!isset($modelCampaign->id)) {
                exit('Invalid audio file');
            }
        }

        // Se tiver ID e for de IVR (idIvrDidNoWork_ ou idIvrDidWork_)
        if ($id > 0 && strpos($prefix, 'idIvr') === 0) {
            $modelIvr = Ivr::model()->findByPk($id);
            if (!isset($modelIvr->id)) {
                exit('Invalid audio file');
            }
        }

        // Monta caminho do arquivo original
        $file_name = rtrim($this->magnusFilesDirectory, '/')
            . '/sounds/'
            . $audio;

        if (!file_exists($file_name)) {
            exit('<center><br>' . Yii::t('zii', 'File not found') . '</center>');
        }

        $ext = strtolower(pathinfo($audio, PATHINFO_EXTENSION));

        if ($ext === 'gsm') {
            // Download direto do GSM
            header("Cache-Control: public");
            header("Content-Description: File Transfer");
            header('Content-Disposition: attachment; filename="' . $audio . '"');
            header("Content-Type: audio/x-gsm");
            header("Content-Transfer-Encoding: binary");
            readfile($file_name);
            exit;
        } else {
            // WAV: copia para tmp e abre em iframe (mantendo sua lógica original)
            $tmpDir = '/var/www/html/mbilling/tmp/';
            if (!is_dir($tmpDir)) {
                @mkdir($tmpDir, 0755, true);
            }

            $destPath = $tmpDir . $audio;

            // remove espaços do caminho de origem (como já fazia)
            $sourcePath = preg_replace('/\s+/', '', $file_name);

            if (!copy($sourcePath, $destPath)) {
                exit('Error copying audio file');
            }

            $audioHtml = htmlspecialchars($audio, ENT_QUOTES, 'UTF-8');

            echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Play Audio</title>
    <style>
        html, body {
            margin:0;
            padding:0;
            height:100%;
            overflow:hidden;
        }
        iframe {
            border:0;
            width:100%;
            height:100%;
        }
    </style>
</head>
<body>
    <iframe src="../../tmp/' . $audioHtml . '" frameborder="0"></iframe>
</body>
</html>';
            exit;
        }
    }
}
