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

echo "DID: " . Yii::app()->session['did_number'] . "<br>";
echo "CITY:   " . Yii::app()->session['did_name'] . "<br>";
echo "SETUP PRICE:  " . Yii::app()->session['currency'] . ' ' . Yii::app()->session['setup_price'] . "<br>";
echo "MONTHLY PRICE:   " . Yii::app()->session['currency'] . ' ' . Yii::app()->session['monthly_price'] . "<br>";

?>


<?php echo $form->hiddenField($did, 'confirmation', array('value' => 1)); ?>

<?php echo CHtml::submitButton(Yii::t('zii', 'Confirm'), array('class' => 'button')); ?>
<?php echo CHtml::button('Cancel', array('class' => 'button', 'onclick' => 'js:document.location.href="add"')); ?>
<?php $this->endWidget();?>