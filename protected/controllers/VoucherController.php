<?php
/**
 * Acoes do modulo "Voucher".
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
 * 20/09/2012
 */

class VoucherController extends Controller
{
    public $attributeOrder        = 't.id';
    public $extraValues           = ['idUser' => 'username'];
    public $fieldsInvisibleClient = [
        'tag',
        'creationdate',
        'expirationdate',
        'used',
        'currency',
    ];
    public $fieldsInvisibleAgent = [
        'tag',
    ];

    public function init()
    {
        $this->instanceModel = new Voucher;
        $this->abstractModel = Voucher::model();
        $this->titleReport   = Yii::t('zii', 'Voucher');
        parent::init();
    }

    public function actionSample()
    {
        $this->abstractModel->sample();
    }

    public function actionSave()
    {

        if (Yii::app()->session['isClient']) {
            $values = $this->getAttributesRequest();

            $modelVoucher = $this->abstractModel->find('id_user IS NULL AND voucher= :voucher AND used = 0 AND usedate = :key1',
                [
                    ':voucher' => $values['voucher'],
                    ':key1'    => '0000-00-00 00:00:00',
                ]);

            if (isset($modelVoucher->id)) {
                $modelVoucher->id_user = Yii::app()->session['id_user'];
                $modelVoucher->used    = 1;
                $modelVoucher->usedate = date('Y-m-d H:i:s');
                try {
                    $modelVoucher->save();
                } catch (Exception $e) {
                    print_r($e);
                }

                $this->success = true;
                $this->msg     = $this->msgSuccess;

                UserCreditManager::releaseUserCredit(Yii::app()->session['id_user'], $modelVoucher->credit, 'Voucher ' . $values['voucher']);

            } else {
                $this->success = false;
                $this->msg     = Yii::t('zii', 'Voucher inexistente or already used');
                $this->nameMsg = 'errors';
            }

            # retorna o resultado da execucao
            echo json_encode([
                $this->nameSuccess => $this->success,
                $this->nameMsg     => $this->msg,
            ]);
        } else {

            $values = $this->getAttributesRequest();
            for ($i = 0; $i < $values['quantity']; $i++) {

                $voucher                    = $this->geraVoucher();
                $modelVoucher               = new Voucher();
                $modelVoucher->id_plan      = $values['id_plan'];
                $modelVoucher->voucher      = $voucher;
                $modelVoucher->credit       = $values['credit'];
                $modelVoucher->tag          = $values['tag'];
                $modelVoucher->language     = $values['language'];
                $modelVoucher->prefix_local = $values['prefix_local'];
                try {
                    $modelVoucher->save();
                } catch (Exception $e) {
                    print_r($e);
                }
            }

            $newRecord = $this->abstractModel->findAll([
                'select' => $this->select,
                'join'   => $this->join,
                'order'  => 'id DESC',
                'limit'  => 1,
            ]);

            echo json_encode([
                $this->nameSuccess => true,
                $this->nameRoot    => $this->getAttributesModels($newRecord, $this->extraValues),
                $this->nameMsg     => $this->msgSuccess,
            ]);
            exit;

        }
    }

    public function extraFilterCustom($filter)
    {
        if (isset($this->defaultFilterAgent)) {
            if (Yii::app()->session['user_type'] == 1) {
                $filter .= ' AND ' . $this->defaultFilterAgent . ' = :dfby0';
                $this->paramsFilter[':dfby0'] = 1;
            } else if (Yii::app()->session['user_type'] == 2) {
                $filter .= ' AND ' . $this->defaultFilterAgent . ' = :dfby';
                $this->paramsFilter[':dfby'] = Yii::app()->session['id_user'];
            }
        }

        if (Yii::app()->session['user_type'] == 3) {
            $filter .= ' AND t.id_user = :dfby';

            $this->paramsFilter[':dfby'] = Yii::app()->session['id_user'];
        }

        return $filter;
    }

    public function geraVoucher()
    {
        $existsVoucher = true;
        while ($existsVoucher) {
            $randVoucher = Util::generatePassword(6, false, false, true, false);
            $sql         = "SELECT count(id) FROM pkg_voucher WHERE voucher LIKE :randVoucher
                OR (SELECT count(id) FROM pkg_user WHERE callingcard_pin LIKE :randVoucher) > 0";
            $command = Yii::app()->db->createCommand($sql);
            $command->bindValue(":randVoucher", $randVoucher, PDO::PARAM_STR);
            $countVoucher = $command->queryAll();

            if (count($countVoucher) > 0) {
                $existsVoucher = false;
                break;
            }
        }

        return $randVoucher;
    }
}
