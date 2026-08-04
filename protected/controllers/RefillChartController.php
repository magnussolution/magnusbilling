<?php
/**
 * Acoes do modulo "Refill".
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
 * 23/06/2012
 */

class RefillChartController extends Controller
{
    public $attributeOrder = 'date DESC';

    public function init()
    {
        $this->instanceModel = new Refill;
        $this->abstractModel = Refill::model();
        parent::init();
    }

    public function actionRead($asJson = true, $condition = null)
    {
        $this->checkActionAccess([], $this->instanceModel->getModule(), 'canRead');

        $filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : null;
        $scope  = $this->getRefillChartScope();

        $records = Refill::model()->getRefillChart($filter, $scope['condition'], $scope['params']);

        # envia o json requisitado
        echo json_encode(array(
            $this->nameRoot  => $records,
            $this->nameCount => 25,
        ));

    }

    protected function getRefillChartScope()
    {
        $condition = '1 = 1';
        $params    = [];

        if (Yii::app()->session['isClient']) {
            $condition = 'r.id_user = :authenticatedUser';
            $params[':authenticatedUser'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAgent']) {
            $condition = '(r.id_user = :authenticatedAgent OR r.id_user IN ('
                . 'SELECT id FROM pkg_user WHERE id_user = :authenticatedAgent))';
            $params[':authenticatedAgent'] = (int) Yii::app()->session['id_user'];
        } elseif (Yii::app()->session['isAdmin']) {
            if (Yii::app()->session['adminLimitUsers'] == true) {
                $condition = 'r.id_user IN ('
                    . 'SELECT id FROM pkg_user WHERE id_group IN ('
                    . 'SELECT gug.id_group FROM pkg_group_user_group gug '
                    . 'WHERE gug.id_group_user = :authenticatedGroup))';
                $params[':authenticatedGroup'] = (int) Yii::app()->session['id_group'];
            }
        } else {
            $condition = '1 = 0';
        }

        return ['condition' => $condition, 'params' => $params];
    }
}
