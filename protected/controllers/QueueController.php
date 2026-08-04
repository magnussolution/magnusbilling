<?php

/**
 * Acoes do modulo "Queue".
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

class QueueController extends Controller
{
    public $attributeOrder = 't.id';
    public $extraValues    = ['idUser' => 'username'];

    private $host     = 'localhost';
    private $user     = 'magnus';
    private $password = 'magnussolution';

    public $fieldsFkReport = [
        'id_user' => [
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ],
    ];

    public function init()
    {
        $this->instanceModel = new Queue;
        $this->abstractModel = Queue::model();
        $this->titleReport   = Yii::t('zii', 'Queue');
        parent::init();
    }

    public function afterSave($model, $values)
    {

        if (isset($_FILES["musiconhold"]) && strlen($_FILES["musiconhold"]["name"]) > 1) {

            $uploaddir = '/var/lib/asterisk/moh/' . $model->name;

            if (! is_dir($uploaddir)) {
                mkdir($uploaddir, 0755, true);
            }

            $typefile = Util::validExtension($_FILES['musiconhold']['tmp_name'], $_FILES["musiconhold"]["name"], ['gsm', 'wav']);
            $uploadfile = $uploaddir . '/queue-' . time() . '.' . $typefile;
            move_uploaded_file($_FILES["musiconhold"]["tmp_name"], $uploadfile);

            $model->musiconhold = $model->name;
            $model->save();
        }

        if (isset($_FILES["periodic-announce"]) && strlen($_FILES["periodic-announce"]["name"]) > 1) {

            $uploaddir  = '/var/lib/asterisk/moh/';
            $typefile = Util::validExtension($_FILES['periodic-announce']['tmp_name'], $_FILES["periodic-announce"]["name"], ['gsm', 'wav']);
            $uploadfile = $uploaddir . 'queue-periodic-announce-' . $model->id . '.' . $typefile;
            move_uploaded_file($_FILES["periodic-announce"]["tmp_name"], $uploadfile);
            $model->{'periodic-announce'} = 'queue-periodic-announce-' . $model->id;
            $model->save();
        }

        $files = glob('/var/lib/asterisk/moh/queue-periodic-announce-' . $model->id . '*');

        if (! isset($files[0])) {
            $model->{'periodic-announce'} = 'queue-periodic-announce';
            $model->save();
        }

        $modelQueue = Queue::model()->findAll([
            'condition' => 'musiconhold != "default"',
            'group'     => 'musiconhold',
        ]);

        $file = '/etc/asterisk/musiconhold_magnus.conf';
        $line = '';
        $fd   = fopen($file, "w");
        foreach ($modelQueue as $key => $queue) {
            if ($fd) {
                $line .= "\n\n[" . $queue->name . "]\n";
                $line .= "mode=files\n";
                $line .= "directory=/var/lib/asterisk/moh/" . $queue->name . "\n\n";
            }
        }

        if (fwrite($fd, $line) === false) {
            Yii::log("Impossible to write to the file ($file)", 'error');
        }

        AsteriskAccess::instance()->generateQueueFile();

        return;
    }

    public function actionDeleteMusicOnHold()
    {
        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canUpdate');

        if (! isset($_POST['id_queue']) || ! is_numeric($_POST['id_queue'])) {
            return;
        }

        $modelQueue = $this->findAuthorizedQueueForMusicDelete((int) $_POST['id_queue']);
        if (isset($modelQueue->id)) {
            $musicDirectory = '/var/lib/asterisk/moh/' . $modelQueue->name;
            if (is_dir($musicDirectory)) {
                rmdir($musicDirectory);
            }
            echo json_encode([
                $this->nameSuccess => true,
                $this->nameMsg     => 'All musiconhold deleted from queue',
            ]);
        } else {
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => 'Queue not found',
            ]);
        }
    }

    protected function findAuthorizedQueueForMusicDelete($idQueue)
    {
        $condition = 't.id = :queueId';
        $params    = [':queueId' => (int) $idQueue];

        if (Yii::app()->session['isClient']) {
            $condition .= ' AND t.id_user = :authenticatedUser';
            $params[':authenticatedUser'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAgent']) {
            $condition .= ' AND t.id_user IN ('
                . 'SELECT id FROM pkg_user WHERE id_user = :authenticatedAgent)';
            $params[':authenticatedAgent'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAdmin']) {
            if (Yii::app()->session['adminLimitUsers'] == true) {
                $condition .= ' AND t.id_user IN ('
                    . 'SELECT id FROM pkg_user WHERE id_group IN ('
                    . 'SELECT gug.id_group FROM pkg_group_user_group gug '
                    . 'WHERE gug.id_group_user = :authenticatedGroup))';
                $params[':authenticatedGroup'] = (int) Yii::app()->session['id_group'];
            }
        } else {
            $condition .= ' AND 1 = 0';
        }

        return Queue::model()->find(['condition' => $condition, 'params' => $params]);
    }

    public function actionResetQueueStats()
    {

        $filter       = isset($_POST['filter']) ? $_POST['filter'] : null;
        $filter       = $this->createCondition(json_decode($filter));
        $this->filter = $filter = $this->extraFilter($filter);

        $id  = json_decode($_POST['ids']);
        $ids = implode(",", $id);

        $uniID = count($ids) == 1 ? true : false;

        $this->abstractModel->truncateQueueStatus();

        $modelQueue = Queue::model()->findAll("id IN ($ids)");
        foreach ($modelQueue as $key => $queue) {
            try {
                AsteriskAccess::instance('localhost', 'magnus', 'magnussolution')->queueReseteStats(trim($queue->name));
                $sussess = true;
            } catch (Exception $e) {
                $sussess          = false;
                $this->msgSuccess = $e->getMessage();
            }
        }
        echo json_encode([
            $this->nameSuccess => $sussess,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }

    public function afterUpdateAll($strIds)
    {
        AsteriskAccess::instance()->generateQueueFile();
        return;
    }

    public function afterDestroy($values)
    {
        AsteriskAccess::instance()->generateQueueFile();
        return;
    }
}
