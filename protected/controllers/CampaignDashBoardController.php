<?php
/**
 * Acoes do modulo "Campaign".
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
 * 28/10/2012
 */

class CampaignDashBoardController extends Controller
{
    public $attributeOrder = 't.id DESC';
    public $extraValues    = ['idUser' => 'username'];
    private $uploaddir;

    public function init()
    {
        $this->instanceModel = new Campaign;
        $this->abstractModel = Campaign::model();
        $this->titleReport   = Yii::t('zii', 'Campaign');
        parent::init();
    }

    public function extraFilterCustomClient($filter)
    {
        $filter .= ' AND t.id_user = :clfby AND status = :key';

        $this->paramsFilter[':clfby'] = Yii::app()->session['id_user'];
        $this->paramsFilter[':key']   = 1;

        return $filter;
    }

    public function setAttributesModels($attributes, $models)
    {

        $pkCount = is_array($attributes) || is_object($attributes) ? $attributes : [];
        for ($i = 0; $i < count($pkCount); $i++) {
            //get all campaign phonebook
            $modelCampaignPhonebook = CampaignPhonebook::model()->findAll('id_campaign = :key', [':key' => $attributes[$i]['id']]);

            $ids_phone_books = [];
            foreach ($modelCampaignPhonebook as $key => $phonebook) {
                $ids_phone_books[] = $phonebook->id_phonebook;
            }

            //Calls Being Placed
            $modelCallOnline = CallOnLine::model()->count('id_user = :key AND sip_account LIKE :key1 ',
                [
                    ':key'  => $attributes[$i]['id_user'],
                    ':key1' => 'MC!' . $attributes[$i]['name'] . '%',
                ]);
            $attributes[$i]['callsPlaced'] = $modelCallOnline;

            // Calls Ringing
            $modelCallOnline = CallOnLine::model()->count('id_user = :key AND status LIKE :key1 ',
                [
                    ':key'  => $attributes[$i]['id_user'],
                    ':key1' => 'Ring%',
                ]);
            $attributes[$i]['callsringing'] = $modelCallOnline;

            //Calls in Transfer
            $modelCallOnline = CallOnLine::model()->count('id_user = :key AND status = :key1 ',
                [
                    ':key'  => $attributes[$i]['id_user'],
                    ':key1' => 'Up',
                ]);
            $attributes[$i]['callsInTransfer'] = $modelCallOnline;

            //Calls Transfered
            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_phonebook', $ids_phone_books);
            $criteria->addCondition('info LIKE "Forward DTMF%"');
            $modelPhoneNumber                  = PhoneNumber::model()->count($criteria);
            $attributes[$i]['callsTransfered'] = $modelPhoneNumber;

            //Total Numbers
            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_phonebook', $ids_phone_books);
            $modelPhoneNumber                    = PhoneNumber::model()->count($criteria);
            $attributes[$i]['callsTotalNumbers'] = $modelPhoneNumber;

            //Diales Today
            $modelCdr = CampaignReport::model()->count('unix_timestamp > :key AND id_campaign = :key1',
                [
                    ':key'  => strtotime(date('Y-m-d')),
                    ':key1' => $attributes[$i]['id'],
                ]);
            $attributes[$i]['callsDialedtoday'] = $modelCdr;

            //Leads Remaining to Dial
            $criteria = new CDbCriteria();
            $criteria->addInCondition('id_phonebook', $ids_phone_books);
            $criteria->addCondition('status = :key');
            $criteria->params[':key']              = 1;
            $modelPhoneNumber                      = PhoneNumber::model()->count($criteria);
            $attributes[$i]['callsRemaningToDial'] = $modelPhoneNumber;

        }

        return $attributes;
    }

}
