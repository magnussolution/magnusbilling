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

class QueueMemberDashBoardController extends Controller
{

    public $attributeOrder = 't.id';
    public $extraValues    = ['idQueue' => 'name'];

    public function init()
    {
        $this->instanceModel = new QueueMemberDashBoard;
        $this->abstractModel = QueueMemberDashBoard::model();
        $this->titleReport   = Yii::t('zii', 'Queue Member DashBoard');

        parent::init();
    }

    public function setAttributesModels($attributes, $models)
    {

        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            if (preg_match('/IN CALL|IN USE|ON HOLD/', strtoupper($attributes[$i]['agentStatus']))) {
                $result                   = Queue::model()->getQueueStatus($attributes[$i]['agentName'], $attributes[$i]['id_queue']);
                $attributes[$i]['number'] = isset($result[0]['callerId']) ? $result[0]['callerId'] : null;
            }
        }
        return $attributes;
    }
}
