<?php header('Content-type: text/html; charset=utf-8');?>
<link rel="stylesheet" type="text/css" href="../../resources/css/signup.css" />

<?php $form = $this->beginWidget('CActiveForm', array(
    'id'                   => 'contactform',
    'htmlOptions'          => array('class' => 'rounded'),
    'enableAjaxValidation' => false,
    'clientOptions'        => array('validateOnSubmit' => true),
    'errorMessageCssClass' => 'error',
));?>

<br/>

<?php

$cities = CHtml::listData($cities, 'id', 'name');?>

<?php if (count($cities) > 1): ?>
<div class="field">
	<?php echo $form->labelEx($did, Yii::t('zii', 'City')) ?>
	<div class="styled-select">
	<?php echo $form->dropDownList($did, 'city', $cities, array('prompt' => Yii::t('zii', 'Select a city'))); ?>
	</div>
</div>




<?php endif;?>



<?php echo CHtml::submitButton(Yii::t('zii', 'Next'), array('class' => 'button')); ?>

<?php echo CHtml::button('Cancel', array('class' => 'button', 'onclick' => 'js:document.location.href="add"')); ?>

<?php $this->endWidget();?>