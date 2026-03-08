<?php

/**
 * Actions of module "Authentication".
 *
 * MagnusBilling <info@magnusbilling.com>
 * 15/04/2013
 */

class JoomlaController extends Controller
{
    private $menu = [];

    public function actionIndex()
    {
        $this->render('index');
    }
}
