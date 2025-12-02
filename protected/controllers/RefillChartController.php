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

    public function actionRead($asJson = true, $condition = null)
    {
        $filter = isset($_GET['filter']) ? json_decode($_GET['filter']) : null;

        $records = Refill::model()->getRefillChart($filter);

        # envia o json requisitado
        echo json_encode(array(
            $this->nameRoot  => $records,
            $this->nameCount => 25,
        ));

    }
}
