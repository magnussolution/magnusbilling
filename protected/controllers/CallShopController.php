<?php
/**
 * Acoes do modulo "CallShop".
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
 * MagnusSolution.com <info@magnussolution.com>
 * 19/09/2012
 */

class CallShopController extends Controller
{
    public $attributeOrder = 't.callerid';
    public $extraValues    = ['idUser' => 'username'];
    public $join           = ' INNER JOIN pkg_user c ON t.id_user = c.id';
    public $defaultFilter  = 'c.callshop = 1';

    public function init()
    {
        $this->instanceModel = new CallShop;
        $this->abstractModel = CallShop::model();
        $this->titleReport   = Yii::t('zii', 'CallShop');
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        return parent::actionRead($asJson = true, $condition = null);
    }

    public function getAttributesModels($models, $itemsExtras = [])
    {

        $attributes = false;
        foreach ($models as $key => $item) {
            $attributes[$key] = $item->attributes;

            $decimal                   = strlen(Yii::app()->session['decimal']);
            $sql                       = 'SELECT SUM(price) priceSum FROM pkg_callshop t WHERE cabina = "' . $item->name . '" AND status = 0';
            $sumResult                 = Yii::app()->db->createCommand($sql)->queryAll();
            $total                     = is_numeric($sumResult[0]['priceSum']) ? number_format($sumResult[0]['priceSum'], $decimal) : '0.00';
            $attributes[$key]['total'] = $total;

            if (strlen($attributes[$key]['callshopnumber'])) {
                $sql = "SELECT * FROM pkg_rate_callshop WHERE id_user = " . Yii::app()->session['id_user'] . " AND  dialprefix = SUBSTRING(" . $attributes[$key]['callshopnumber'] . ",1,length(dialprefix))
                                ORDER BY LENGTH(dialprefix) DESC LIMIT 1";
                $command      = Yii::app()->db->createCommand($sql);
                $resultPrefix = $command->queryAll();

                $attributes[$key]['price_min']   = isset($resultPrefix[0]['buyrate']) ? $resultPrefix[0]['buyrate'] : 0;
                $attributes[$key]['destination'] = isset($resultPrefix[0]['destination']) ? $resultPrefix[0]['destination'] : '';
            }

            foreach ($itemsExtras as $relation => $fields) {
                $arrFields = explode(',', $fields);
                foreach ($arrFields as $field) {
                    $attributes[$key][$relation . $field] = $item->$relation->$field;
                    if ($_SESSION['isClient']) {
                        foreach ($this->fieldsInvisibleClient as $field) {
                            unset($attributes[$key][$field]);
                        }
                    }

                    if ($_SESSION['isAgent']) {
                        foreach ($this->fieldsInvisibleAgent as $field) {
                            unset($attributes[$key][$field]);
                        }
                    }
                }
            }
        }

        return $attributes;
    }

    public function actionLiberar()
    {
        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canUpdate');

        if (isset($_GET['id'])) {
            $modelSip = $this->findAuthorizedCallShopSip((int) $_GET['id']);
        } else {

            if (isset($_GET['name'])) {
                $filter[0]['value'] = $_GET['name'];
            } else {
                $filter = json_decode($_POST['filter'], true);
            }

            $name     = isset($filter[0]['value']) ? $filter[0]['value'] : '';
            $modelSip = $this->findAuthorizedCallShopSip(null, $name);
        }

        if (! isset($modelSip->id)) {
            header('HTTP/1.0 404 Not Found');
            echo json_encode([
                $this->nameSuccess => false,
                $this->nameMsg     => $this->msgRecordNotFound,
            ]);
            return;
        }

        $modelSip->status = 2;
        $modelSip->save();

        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => $this->msgSuccess,
        ]);

    }

    protected function findAuthorizedCallShopSip($id = null, $name = null)
    {
        $condition = $id !== null ? 't.id = :sipId' : 't.name = :sipName';
        $params    = $id !== null ? [':sipId' => (int) $id] : [':sipName' => $name];

        if (Yii::app()->session['isClient']) {
            $condition .= ' AND t.id_user = :authenticatedUser';
            $params[':authenticatedUser'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAgent']) {
            $condition .= ' AND t.id_user IN ('
                . 'SELECT id FROM pkg_user WHERE id = :authenticatedAgent OR id_user = :authenticatedAgent)';
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

        return Sip::model()->find([
            'condition' => $condition,
            'params'    => $params,
        ]);
    }

    public function actionCobrar()
    {
        if (isset($_GET['id'])) {
            $id                       = (int) $_GET['id'];
            $modelSip                 = Sip::model()->findByPk((int) $id);
            $modelSip->status         = 0;
            $modelSip->callshopnumber = 'NULL';
            $modelSip->callshoptime   = 0;
            $modelSip->save();

            CallShopCdr::model()->updateAll(['status' => '1'], 'cabina = :key', [':key' => $modelSip->name]);
        } else {

            if (isset($_GET['name'])) {
                $filter[0]['value'] = $_GET['name'];
            } else {
                $filter = json_decode($_POST['filter'], true);
            }

            $modelSip                 = Sip::model()->find("name = :name ", [':name' => $filter[0]['value']]);
            $modelSip->status         = 0;
            $modelSip->callshopnumber = 'NULL';
            $modelSip->callshoptime   = 0;
            $modelSip->save();

            CallShopCdr::model()->updateAll(['status' => '1'], 'cabina = :key', [':key' => $filter[0]['value']]);
        }
        echo json_encode([
            $this->nameSuccess => true,
            $this->nameMsg     => $this->msgSuccess,
        ]);
    }
}
