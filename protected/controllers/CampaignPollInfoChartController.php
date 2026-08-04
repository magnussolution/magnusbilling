<?php
/**
 * Acoes do modulo "CampaignPollInfo".
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/10/2012
 */

class CampaignPollInfoChartController extends Controller
{
    public $attributeOrder = 't.id';
    protected $authorizedCampaignPolls = [];

    public function init()
    {
        $this->instanceModel = new CampaignPollInfo;
        $this->abstractModel = CampaignPollInfo::model();
        $this->titleReport   = Yii::t('zii', 'Poll Info');
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canRead');

        $requestedPollIds = $this->getRequestedCampaignPollIds();
        $this->authorizedCampaignPolls = $this->findAuthorizedCampaignPolls($requestedPollIds);
        $authorizedPollIds = array_map(function ($poll) {
            return (int) $poll->id;
        }, $this->authorizedCampaignPolls);

        if (count($authorizedPollIds) === 0) {
            echo json_encode(array(
                $this->nameRoot  => array(),
                $this->nameCount => 0,
            ));
            return;
        }

        $criteria = new CDbCriteria();
        $criteria->addInCondition('t.id_campaign_poll', $authorizedPollIds);
        $this->filter       = $criteria->condition;
        $this->paramsFilter = $criteria->params;

        $records = CampaignPollInfo::model()->findAll(array(
            'select'    => 'id, resposta AS resposta2, COUNT( resposta ) AS sumresposta, id_campaign_poll',
            'join'      => $this->join,
            'condition' => $this->filter,
            'params'    => $this->paramsFilter,
            'order'     => 'resposta DESC',
            'group'     => 'resposta',

        ));

        echo json_encode(array(
            $this->nameRoot  => $this->getAttributesModels($records),
            $this->nameCount => count($records),
        ));
    }

    public function getAttributesModels($records, $itemsExtras = array())
    {
        $model      = $this->authorizedCampaignPolls;
        $total_poll = count($model);

        if (isset($records[0]['id_campaign_poll'])) {
            $ids_campaign_poll = array();
            foreach ($model as $key => $campaign_poll) {
                $ids_campaign_poll[] = $campaign_poll->id_campaign;
            }

            //get all campaign phonebook
            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_campaign', $ids_campaign_poll);

            $modelCampaignPhonebook = CampaignPhonebook::model()->findAll($criteria);
            $ids_phone_books        = array();
            foreach ($modelCampaignPhonebook as $key => $phonebook) {
                $ids_phone_books[] = $phonebook->id_phonebook;
            }

            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_phonebook', $ids_phone_books);
            $criteria->addCondition('status = :key');
            $criteria->params[':key'] = 3;
            $modelPhoneNumber         = PhoneNumber::model()->count($criteria);

            if ($modelPhoneNumber == 0) {
                $modelPhoneNumber = 1;
            }

            $totalVotes = CampaignPollInfo::model()->count(array(
                'condition' => $this->filter,
                'params'    => $this->paramsFilter,
            ));

            for ($i = 0; $i < count($records); $i++) {
                $records[$i]['percentage']    = Yii::t('zii', 'Votes') . ': ' . $records[$i]['sumresposta'] . ' - ' . number_format(($records[$i]['sumresposta'] * 100) / $totalVotes, 2) . '%';
                $records[$i]['resposta_name'] = $total_poll == 1 && strlen($model[0]['option' . $records[$i]['resposta2']]) > 0 ? $model[0]['option' . $records[$i]['resposta2']] : $records[$i]['resposta2'];
                $records[$i]['total_votos']   = '<b>' . Yii::t('zii', 'Answered') . ':</b>' . $modelPhoneNumber;
                $records[$i]['total_votos'] .= '<br><b>' . Yii::t('zii', 'Votes') . ':</b>' . $totalVotes;
                $records[$i]['total_votos'] .= '<br><b>' . Yii::t('zii', 'Voted') . ': </b>' . number_format(($totalVotes * 100) / $modelPhoneNumber, 2) . '%';
            }
        } else {

        }

        return $records;

    }

    protected function getRequestedCampaignPollIds()
    {
        $outerFilter = isset($_GET['filter']) ? json_decode($_GET['filter']) : null;
        if (! is_array($outerFilter) || ! isset($outerFilter[0]->value)
            || ! is_string($outerFilter[0]->value)) {
            return [];
        }

        $filters = json_decode($outerFilter[0]->value);
        if (! is_array($filters)) {
            return [];
        }

        $pollIds = [];
        foreach ($filters as $filter) {
            if (! isset($filter->type, $filter->field, $filter->value)
                || $filter->field !== 'id_campaign_poll') {
                continue;
            }

            $values = is_array($filter->value) ? $filter->value : [$filter->value];
            foreach ($values as $value) {
                if ((is_int($value) || (is_string($value) && ctype_digit($value))) && (int) $value > 0) {
                    $pollIds[] = (int) $value;
                }
            }
        }

        return array_values(array_unique($pollIds));
    }

    protected function findAuthorizedCampaignPolls($pollIds)
    {
        if (! is_array($pollIds) || count($pollIds) === 0) {
            return [];
        }

        $criteria = new CDbCriteria();
        $criteria->addInCondition('t.id', array_map('intval', $pollIds));

        if (Yii::app()->session['isClient']) {
            $criteria->addCondition('t.id_user = :chartAuthenticatedUser');
            $criteria->params[':chartAuthenticatedUser'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAgent']) {
            $criteria->addCondition(
                't.id_user IN (SELECT id FROM pkg_user WHERE id_user = :chartAuthenticatedAgent)'
            );
            $criteria->params[':chartAuthenticatedAgent'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAdmin']) {
            if (Yii::app()->session['adminLimitUsers'] == true) {
                $criteria->addCondition(
                    't.id_user IN (SELECT id FROM pkg_user WHERE id_group IN ('
                    . 'SELECT gug.id_group FROM pkg_group_user_group gug '
                    . 'WHERE gug.id_group_user = :chartAuthenticatedGroup))'
                );
                $criteria->params[':chartAuthenticatedGroup'] = (int) Yii::app()->session['id_group'];
            }
        } else {
            $criteria->addCondition('1 = 0');
        }

        return CampaignPoll::model()->findAll($criteria);
    }
}
