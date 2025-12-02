<?php header('Content-type: text/html; charset=utf-8');?>
<link rel="stylesheet" type="text/css" href="../../resources/css/signup.css" />

<style type="text/css">

.styled-select
{
        width:450px;
}
form {
	margin: 0 auto;
}

</style>
<dir align=center>
<?php if (file_exists("resources/images/logo_custom.png")): ?>
	<img width="200" src="../../resources/images/logo_custom.png">
<?php else: ?>
	<img src="../../resources/images/logo.png">
<?php endif;?>
</dir>
<?php $form = $this->beginWidget('CActiveForm', array(
    'id'                   => 'contactform',
    'htmlOptions'          => array('class' => 'rounded'),
    'enableAjaxValidation' => false,
    'clientOptions'        => array('validateOnSubmit' => true),
    'errorMessageCssClass' => 'error',
));?>

<br/>

<?php if (isset($message)):
    echo Yii::t('zii', $message);
    ?>
				<?php else: ?>



	<?php $modelMethodPay = CHtml::listData($modelMethodPay, 'id', 'show_name');?>


	<div class="field">
		<?php echo $form->labelEx($model, Yii::t('zii', 'Method pay')) ?>
		<div class="styled-select" style="width: 380px">
		<?php echo $form->dropDownList($model, 'id_method', $modelMethodPay, array(
    'prompt' => Yii::t('zii', 'Select a method'),
)
); ?>
		</div>
	</div>
	<br>
	<?php $totalPrice = 0;?>
	<?php for ($i = 0; $i < count($modelServicesUse); $i++): ?>
		<?php $totalPrice += $modelServicesUse[$i]->idServices->price?>
		<div class="field">

			<?php echo $form->labelEx($model, Yii::t('zii', 'Service') . ' ' . $modelServicesUse[$i]->idServices->name) ?>
			<?php echo $form->textField($model, 'service0', array(
    'class'    => 'input',
    'value'    => $currency . ' ' . number_format($modelServicesUse[$i]->idServices->price, 2),
    'readOnly' => true,
))
?>

		</div>
		<?php if (strlen($modelServicesUse[$i]->idServices->name) > 40): ?>
			<br>
		<?php endif;?>
		<br><br>
	<?php endfor;?>
	<br>

	<?php if ($modelServicesUse[0]->idUser->credit > 0): ?>
	<div class="field">
		<?php echo $form->labelEx($model, Yii::t('zii', 'Your credit')) ?>
		<?php echo $form->checkBox($model, 'use_credit', array('checked' => false)); ?>
		<?php echo ' ' . $currency . ' ' . number_format($modelServicesUse[0]->idUser->credit, 2) . ' ' . Yii::t('zii', 'Use that') ?>

	</div>
	<?php endif;?>
	<br><br><br>

	<div class="field">
		<?php echo $form->labelEx($model, Yii::t('zii', 'Total Price')) ?>
		<?php echo $form->textField($model, 'total', array(
    'class'    => 'input',
    'value'    => $currency . ' ' . number_format($totalPrice, 2),
    'readOnly' => true,
)) ?>
		<p>&nbsp;</p>
	</div>

	<?php echo CHtml::submitButton(Yii::t('zii', 'Pay Now'), array('class' => 'button')); ?>
<?php endif;?>
<?php $this->endWidget();?>