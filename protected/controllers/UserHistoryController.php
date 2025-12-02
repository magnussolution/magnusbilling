<?php
/**
 * Acoes do modulo "UserHistory".
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
 * 06/06/2022
 */

class UserHistoryController extends Controller
{
    public $attributeOrder = 'date DESC';
    public $extraValues    = array('idUser' => 'username');

    public $fieldsFkReport = array(
        'id_user' => array(
            'table'       => 'pkg_user',
            'pk'          => 'id',
            'fieldReport' => 'username',
        ),
    );

    public function init()
    {
        $this->instanceModel = new UserHistory;
        $this->abstractModel = UserHistory::model();
        $this->titleReport   = Yii::t('zii', 'User History');

        parent::init();
    }
}
