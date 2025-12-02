<link rel="stylesheet" type="text/css" href="../../resources/css/signup.css" />

<?php

$form = $this->beginWidget('CActiveForm', array(
    'id'                   => 'contactform',
    'htmlOptions'          => array('class' => 'rounded'),
    'enableAjaxValidation' => false,
    'clientOptions'        => array('validateOnSubmit' => true),
    'errorMessageCssClass' => 'error',
));
?>
<br>

<div class="field">
    <label for="Call_StartTime"><?php echo Yii::t('zii', 'Filter call to username') . ' ' . $modelUser->username; ?></label>

</div>
<br><br><br><br>

<div class="field">
    <?php echo $form->labelEx($model, Yii::t('zii', 'Start time')) ?>

<?php
$this->widget(
    'ext.jui.EJuiDateTimePicker',
    array(
        'model'     => $model,
        'attribute' => 'starttime',
        'language'  => 'en', //default Yii::app()->language
        'mode'      => 'datetime', //'datetime' or 'time' ('datetime' default)
        'options'   => array(
            'dateFormat' => 'yy-mm-dd',
            'timeFormat' => 'HH:mm:ss',
        ),
    )
);

?>
<?php echo $form->error($model, 'starttime') ?>
    <p class="hint"><?php echo Yii::t('zii', 'Enter your') . ' ' . Yii::t('zii', 'Start time') ?></p>

</div>
<br>
<div class="field">
    <?php echo $form->labelEx($model, Yii::t('zii', 'Stop time')) ?>
<?php
$this->widget(
    'ext.jui.EJuiDateTimePicker',
    array(
        'model'     => $model,
        'attribute' => 'stoptime',
        'language'  => 'en', //default Yii::app()->language
        //'mode'    => 'datetime',//'datetime' or 'time' ('datetime' default)

        'options'   => array(
            'dateFormat' => 'yy-mm-dd',
            'timeFormat' => 'HH:mm:ss',
        ),
    )
);

?>
</div>
<br>
<?php echo $form->hiddenField($model, 'id_user', array('value' => $modelUser->id)); ?>
<?php echo CHtml::submitButton(Yii::t('zii', 'Filter'), array('class' => 'button')); ?>
<?php $this->endWidget();?>