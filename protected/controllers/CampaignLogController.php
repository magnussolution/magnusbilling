<?php

/**
 * Url for customer register http://ip/billing/index.php/user/add .
 */
class CampaignLogController extends Controller
{
    public $attributeOrder = 't.date DESC';

    public function init()
    {
        $this->instanceModel = new CampaignLog;
        $this->abstractModel = CampaignLog::model();
        $this->titleReport   = Yii::t('zii', 'CampaignLog');
        parent::init();
    }
}
