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



<?php $countries = CHtml::listData($countries, 'id', 'name');?>

<?php if (count($countries) > 1): ?>
<div class="field">
	<?php echo $form->labelEx($did, Yii::t('zii', 'Country')) ?>
	<div class="styled-select">
	<?php echo $form->dropDownList($did, 'country', $countries, array('prompt' => Yii::t('zii', 'Select a country'))); ?>
	</div>
</div>


<?php endif;?>




<?php echo CHtml::submitButton(Yii::t('zii', 'Next'), array('class' => 'button')); ?>

<?php $this->endWidget();?>