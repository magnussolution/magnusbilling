<?php

/**
 * Actions of module "Firewall".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 01/02/2014
 * Defaults!/usr/bin/fail2ban-client !requiretty
 */

class FirewallController extends Controller
{

    public $attributeOrder = 'date DESC';
    public $extraValues         = ['idServer' => 'name'];
    public function init()
    {

        $this->instanceModel = new Firewall;
        $this->abstractModel = Firewall::model();
        $this->titleReport   = Yii::t('zii', 'Firewall');

        parent::init();
    }

    public function actionDestroy()
    {
        $values = $this->getAttributesRequest();
        $namePk = 'id';
        $ids    = array();

        # Se existe a chave 0, indica que existe um array interno (mais de 1 registro selecionado)
        if (array_key_exists(0, $values)) {
            # percorre o array para excluir o(s) registro(s)
            foreach ($values as $value) {
                array_push($ids, $value[$namePk]);
            }
        } else {
            array_push($ids, $values[$namePk]);
        }

        foreach ($ids as $value) {


            $model = Firewall::model()->findByPk((int) $value);
            $model->action = 3;
            $model->save();
        }

        echo json_encode(array(
            $this->nameSuccess => true,
            $this->nameMsg     => 'The IP wil unban in 1 minute',
        ));
    }
}
