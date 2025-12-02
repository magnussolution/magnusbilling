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
 * 19/09/2012
 */

//http://localhost/mbilling/index.php/callApp?number=5511999464731&user=24315&name=magnus&city=torres

//http://localhost/mbilling/index.php/callApp/getReturn?number=5511999464731&user=24315&name=magnus&city=torres

//http://localhost/mbilling/index.php/callApp/getReturn?id=269196
class CallAppController extends Controller
{

    public $user;
    public $name;
    public $city;
    public $destination;
    public $id_phonebook;

    public function int()
    {
        $this->destination  = isset($_GET['number']) ? $_GET['number'] : '';
        $this->user         = isset($_GET['user']) ? $_GET['user'] : '';
        $this->name         = isset($_GET['name']) ? $_GET['name'] : '';
        $this->city         = isset($_GET['city']) ? $_GET['city'] : '';
        $this->id_phonebook = $this->getIdPhoneBook();
        parent::int();
    }

    public function actionIndex()
    {

        if ( ! isset($_GET['number'])) {

            echo 'error, numer is necessary';

        } else {

            $modelPhoneNumber               = new PhoneNumber();
            $modelPhoneNumber->id_phonebook = $this->id_phonebook;
            $modelPhoneNumber->number       = $$this->destination;
            $modelPhoneNumber->name         = $this->name;
            $modelPhoneNumber->city         = $this->city;
            $modelPhoneNumber->status       = 1;
            $modelPhoneNumber->try          = 1;
            $modelPhoneNumber->save();
            $idNumber = $modelPhoneNumber->getPrimaryKey();

            $array = [
                'msg' => 'success',
                'id'  => $idNumber,
            ];

            echo json_encode($array);

        }
    }

    public function actionGetReturn()
    {

        if ( ! isset($_GET['id'])) {

            if ( ! isset($_GET['number'])) {
                echo 'error, numer is necessary';
                exit;
            }

            $modelPhoneNumber = PhoneNumber::model()->find(
                [
                    'condition' => 'id_phonebook = :id_phonebook AND number = :destination AND name = :name',
                    'params'    => [
                        ':id_phonebook' => $this->id_phonebook,
                        ':destination'  => $this->destination,
                        ':name'         => $this->name,
                    ],
                ]
            );
        } else {
            $modelPhoneNumber = PhoneNumber::model()->findByPk((int) $_GET['id']);
        }

        if (isset($modelPhoneNumber->status)) {
            $status = $modelPhoneNumber->status;
            $msg    = 'success';
        } else {
            $status = '';
            $msg    = 'Invalid Number';
        }

        $array = [
            'msg'    => $msg,
            'status' => $status,
        ];

        echo json_encode($array);
    }

    public function getIdPhoneBook()
    {
        $modelUser = User::model()->find("username = :username", [':username' => $this->user]);

        if ( ! is_array($modelUser) || ! count($modelUser)) {
            $error_msg = Yii::t('zii', 'Error : User no Found!');
            echo $error_msg;
            exit;
        }

        $id_user = $modelUser->id;

        $modelCampaign = Campaign::model()->find("status = 1 AND id_user = :id_user",
            [':id_user' => $id_user]
        );

        if (is_array($modelUser) && count($modelCampaign)) {

            $modelCampaignPhonebook = CampaignPhonebook::model()->find("id_campaign = :id_campaign",
                [':id_campaign' => $modelCampaign->id]
            );
        } else {
            echo "User not have campaign";
            exit;
        }

        if ( ! $modelCampaignPhonebook) {
            echo "Campaign not have PhoneBook";
            exit;
        }

        return $modelCampaignPhonebook->id_phonebook;
    }
}
