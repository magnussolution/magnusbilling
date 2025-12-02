<?php

/**
 * Modelo para a tabela "Queue".
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2023 MagnusSolution. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 19/09/2012
 */

class Queue extends Model
{
    protected $_module = 'queue';
    /**
     * Retorna a classe estatica da model.
     * @return Prefix classe estatica da model.
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return nome da tabela.
     */
    public function tableName()
    {
        return 'pkg_queue';
    }

    /**
     * @return nome da(s) chave(s) primaria(s).
     */
    public function primaryKey()
    {
        return 'id';
    }

    /**
     * @return array validacao dos campos da model.
     */
    public function rules()
    {
        $rules = [
            ['name, id_user', 'required'],
            ['id_user, timeout, retry, wrapuptime, weight, periodic-announce-frequency, max_wait_time', 'numerical', 'integerOnly' => true],
            ['language, joinempty, leavewhenempty, musiconhold,announce-holdtime,leavewhenempty,strategy, ringinuse, announce-position, announce-holdtime, announce-frequency', 'length', 'max' => 128],
            ['periodic-announce ', 'length', 'max' => 200],
            ['ring_or_moh ', 'length', 'max' => 4],
            ['name', 'length', 'max' => 25],
            ['max_wait_time_action', 'length', 'max' => 50],
            ['name', 'checkname'],
            ['max_wait_time_action', 'check_max_wait_time_action'],

        ];
        return $this->getExtraField($rules);
    }

    /**
     * @return array regras de relacionamento.
     */
    public function relations()
    {
        return [
            'idUser' => [self::BELONGS_TO, 'User', 'id_user'],
        ];
    }

    public function check_max_wait_time_action($attribute, $params)
    {
        if (strlen($this->max_wait_time_action) > 2) {
            if (preg_match('/\//', $this->max_wait_time_action)) {

                if (preg_match('/LOCAL/', strtoupper($this->max_wait_time_action))) {
                    return;
                } else {
                    $data        = explode('/', $this->max_wait_time_action);
                    $type        = strtoupper($data[0]);
                    $destination = $data[1];

                    switch ($type) {
                        case 'PJSIP':
                            $model = Sip::model()->find('UPPER(name) = :key', [':key' => strtoupper($destination)]);
                            break;
                        case 'QUEUE':
                            $model = Queue::model()->find('UPPER(name)  = :key', [':key' => strtoupper($destination)]);
                            break;
                        case 'IVR':
                            $model = Ivr::model()->find('UPPER(name)  = :key', [':key' => strtoupper($destination)]);
                            break;
                    }
                }
                if (! isset($model->id)) {
                    $this->addError($attribute, Yii::t('zii', 'You need add a existent Sip Account, IVR or Queue.'));
                }
                $this->max_wait_time_action = $type . '/' . $destination;
            }
        }
    }

    public function checkname($attribute, $params)
    {
        if (preg_match('/ /', $this->name)) {
            $this->addError($attribute, Yii::t('zii', 'No space allow in name'));
        }

        if (! preg_match('/^[0-9]|^[A-Z]|^[a-z]/', $this->name)) {
            $this->addError($attribute, Yii::t('zii', 'Name need start with numbers or letters'));
        }
    }

    public function truncateQueueStatus()
    {
        $sql = "TRUNCATE pkg_queue_status";
        Yii::app()->db->createCommand($sql)->execute();
    }

    public function deleteQueueStatus($id)
    {
        $sql = "DELETE FROM pkg_queue_status WHERE callId = " . $id;
        Yii::app()->db->createCommand($sql)->execute();
    }

    public function updateQueueStatus($operator, $holdtime, $uniqueid)
    {
        $sql = "UPDATE pkg_queue_status SET status = 'answered', agentName = :key,
                    holdtime = :key2  WHERE callId = :key3 ";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":key", $operator, PDO::PARAM_STR);
        $command->bindValue(":key2", $holdtime, PDO::PARAM_STR);
        $command->bindValue(":key3", $uniqueid, PDO::PARAM_STR);
        $command->execute();
    }
    public function getQueueStatus($agentName, $id_queue)
    {
        $sql     = "SELECT * FROM pkg_queue_status WHERE agentName = :key AND id_queue = :key1";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":key", $agentName, PDO::PARAM_STR);
        $command->bindValue(":key1", $id_queue, PDO::PARAM_STR);
        return $command->queryAll();
    }

    public function getQueueAgentStatus($id)
    {
        $sql     = "SELECT agentName FROM pkg_queue_agent_status WHERE id = :key";
        $command = Yii::app()->db->createCommand($sql);
        $command->bindValue(":key", $id, PDO::PARAM_STR);
        return $command->queryAll();
    }

    public function insertQueueStatus($id_queue, $uniqueid, $queueName, $callerId, $channel)
    {
        $sql = "INSERT INTO pkg_queue_status (id_queue, callId, queue_name, callerId, time, channel, status)
                        VALUES (" . $id_queue . ", '" . $uniqueid . "', '$queueName', '" . $callerId . "',
                        '" . date('Y-m-d H:i:s') . "', '" . $channel . "', 'ringing')";
        Yii::app()->db->createCommand($sql)->execute();
    }

    public function beforeSave()
    {
        if (! $this->getIsNewRecord()) {
            $model = Queue::model()->findByPk((int) $this->id);

            QueueMember::model()->updateAll(['queue_name' => $this->name], 'queue_name = :key', [':key' => $model->name]);
        }
        return parent::beforeSave();
    }
}
