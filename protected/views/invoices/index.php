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
$modelUser = User::model()->findAll([
    'order' => 'username ASC',
]);
$users = CHtml::listData($modelUser, 'id', 'username');?>
<div class="field">
    <?php echo $form->labelEx($model, Yii::t('zii', 'Select a user')) ?>
    <div class="styled-select">
    <?php echo $form->dropDownList($model, 'id', $users); ?>
    </div>
</div>
<br>



<?php echo CHtml::submitButton(Yii::t('zii', 'Filter'), array('class' => 'button')); ?>

<?php $this->endWidget();?>