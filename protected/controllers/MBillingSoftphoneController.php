<?php
/**
 * Controller module "MBillingSoftphone".
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
 * 28/10/2019
 * index.php/mBillingSoftphone/read?l=felipe|137DCEC44002170DB2D2DCD9C70DBEBF
 */

class MBillingSoftphoneController extends Controller
{
    public $attributeOrder = 'id';
    public $filterByUser   = false;
    private $l;

    public function actionRead($asJson = true, $condition = null)
    {

        if (isset($_GET['l'])) {
            $data = explode('|', $_GET['l']);
            $user = $data[0];
            $pass = $data[1];

            $modelSip = AccessManager::checkAccess($user, $pass);

            if ( ! isset($modelSip->id)) {
                echo 'false';
                exit;
            }
            $result                 = [];
            $result[0]['username']  = 'username';
            $result[0]['firstname'] = $modelSip->idUser->firstname;
            $result[0]['lastname']  = $modelSip->idUser->lastname;
            $result[0]['credit']    = number_format($modelSip->idUser->credit, 2);
            $result[0]['currency']  = $this->config['global']['base_currency'];

            if (count($result) == 0) {
                echo 'false';
                exit;
            }
            //$result[0]['version'] = 'MPhone-1.0.5';

            $result = json_encode([
                $this->nameRoot  => $result,
                $this->nameCount => 1,
                $this->nameSum   => '',
            ]);

            $result = json_decode($result, true);

            echo '<pre>';
            print_r($result);
        }
    }
    public function actionTotalPerCall()
    {
        if (isset($_GET['l'])) {
            $user = $_GET['l'];

            $modelSip = Sip::model()->find("name = :user", [':user' => $user]);

            if (isset($modelSip->callshopnumber) && strlen($modelSip->callshopnumber) > 5) {
                $sessiontime = $modelSip->callshoptime;
                $ndiscado    = $modelSip->callshopnumber;

                $ndiscado = Util::number_translation($modelSip->idUser->prefix_local, $ndiscado);

                $resultCallShop = RateCallshop::model()->findCallShopRate($ndiscado, $modelSip->id_user);

                $buyrate   = $resultCallShop[0]['buyrate'] > 0 ? $resultCallShop[0]['buyrate'] : $cost;
                $initblock = $resultCallShop[0]['minimo'];
                $increment = $resultCallShop[0]['block'];

                $sellratecost_callshop = Util::calculation_price($buyrate, $sessiontime, $initblock, $increment);

                echo number_format($sellratecost_callshop, 2);
            }
        } else {
            echo '0,00';
        }
    }

    public function actionCallshopTotal()
    {

        if (isset($_GET['l'])) {
            $data = explode('|', $_GET['l']);
            $user = $data[0];
            $pass = $data[1];

            $modelSip = AccessManager::checkAccess($user, $pass);

            if ( ! isset($modelSip->id)) {
                echo 'false';
                exit;
            }

            $result                 = [];
            $result[0]['username']  = 'username';
            $result[0]['firstname'] = $modelSip->idUser->firstname;
            $result[0]['lastname']  = $modelSip->idUser->lastname;
            $result[0]['currency']  = $this->config['global']['base_currency'];

            $modelCallShop = CallShopCdr::model()->find([
                'select'    => 'SUM(price) price',
                'condition' => 'status = 0 AND cabina = :user',
                'params'    => [":user" => $user],
            ]);

            $result[0]['credit'] = count($modelCallShop) ? number_format($modelCallShop->price, 2) : '0.00';

            $result = json_encode([
                $this->nameRoot  => $result,
                $this->nameCount => 1,
                $this->nameSum   => '',
            ]);
            $result = json_decode($result, true);
            echo '<pre>';
            print_r($result);

        }
    }

}
