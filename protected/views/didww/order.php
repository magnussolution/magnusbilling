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


<?php echo " YOUR DID STATUS IS: " . $status; ?>

<?php echo CHtml::button('Buy more', array('class' => 'button', 'onclick' => 'js:document.location.href="add"')); ?>

<?php $this->endWidget();?>