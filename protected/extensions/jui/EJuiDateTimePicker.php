<?php
/**
 * EJuiDateTimePicker displays a DateTimePicker or TimePicker.
 *
 * EJuiDateTimePicker encapsulates the {@link http://trentrichardson.com/examples/timepicker/} addon.
 *
 * To use this widget, you may insert the following code in a view:
 * <pre>
 * $this->widget('ext.jui.EJuiDateTimePicker', array(
 *     'model'     => $model,
 *     'attribute' => 'publish_time',
 *     // additional javascript options for the datetime picker plugin
 *     'options' => array(
 *         'dateFormat' => 'yy-mm-dd',
 *     ),
 *     'htmlOptions' => array(
 *         'style' => 'height:20px;'
 *     ),
 * ));
 * </pre>
 *
 * @author Fadeev Ruslan <fadeevr@gmail.com>
 * @author Jani Mikkonen <janisto@php.net>
 */

Yii::import('zii.widgets.jui.CJuiDatePicker');

class EJuiDateTimePicker extends CJuiDatePicker
{
    /**
     * @var string path to assets.
     */
    protected $assetsPath;

    /**
     * @var string URL to assets.
     */
    protected $assetsUrl;

    /**
     * @var string widget mode. Use time, datetime or date.
     */
    public $mode = 'datetime';

    /**
     * Init widget
     */
    public function init()
    {
        parent::init();
        if (!in_array($this->mode, array('date', 'time', 'datetime'))) {
            throw new CException('EJuiDateTimePicker - unknown mode: "' . $this->mode . '". Use time, datetime or date!');
        }
        if (empty($this->language)) {
            $this->language = str_replace('-', '_', strtolower(Yii::app()->language));
            $parts = explode('_', $this->language);
            if (count($parts) == 2) {
                $this->language = $parts[0] .'-'. strtoupper($parts[1]);
            }
            if ($this->language == 'en-US') {
                $this->language = 'en';
            }
        }
        if ($this->assetsPath === null) {
            $this->assetsPath = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'assets';
        }
        if ($this->assetsUrl === null) {
            $this->assetsUrl = Yii::app()->assetManager->publish($this->assetsPath);
        }
    }

    /**
     * Run widget.
     */
    public function run()
    {
        if ($this->mode == 'date') {
            parent::run();
        } else {
            list($name, $id) = $this->resolveNameID();
            if (isset($this->htmlOptions['id'])) {
                $id = $this->htmlOptions['id'];
            } else {
                $this->htmlOptions['id'] = $id;
            }
            if (isset($this->htmlOptions['name'])) {
                $name = $this->htmlOptions['name'];
            }
            if ($this->flat === false) {
                if ($this->hasModel()) {
                    echo CHtml::activeTextField($this->model, $this->attribute, $this->htmlOptions);
                } else {
                    echo CHtml::textField($name, $this->value, $this->htmlOptions);
                }
            } else {
                if ($this->hasModel()) {
                    echo CHtml::activeHiddenField($this->model, $this->attribute, $this->htmlOptions);
                    $attribute = $this->attribute;
                    $this->options['defaultDate'] = $this->model->$attribute;
                } else {
                    echo CHtml::hiddenField($name, $this->value, $this->htmlOptions);
                    $this->options['defaultDate'] = $this->value;
                }
                if (!isset($this->options['onSelect'])) {
                    $this->options['onSelect'] = new CJavaScriptExpression("function( selectedDate ) { jQuery('#{$id}').val(selectedDate);}");
                }
                $this->options['altField'] = '#'. $id;
                $id = $this->htmlOptions['id'] = $id . '_container';
                $this->htmlOptions['name'] = $name . '_container';
                echo CHtml::tag('div', $this->htmlOptions, '');
            }

            // set current time
            $this->options['hour']   = date('H');
            $this->options['minute'] = date('i');
            $this->options['second'] = date('s');

            $this->registerClientScript();
        }
    }

    /**
     * Register CSS and scripts.
     */
    protected function registerClientScript()
    {
        $cs = Yii::app()->clientScript;
        $cs->registerCssFile($this->assetsUrl . '/jquery-ui-timepicker-addon'. (YII_DEBUG ? '' : '.min') .'.css');
        $cs->registerScriptFile($this->assetsUrl .'/jquery-ui-timepicker-addon'. (YII_DEBUG ? '' : '.min') .'.js', CClientScript::POS_END);

        if ($this->language != 'en') {
            $this->registerScriptFile($this->i18nScriptFile);
            $cs->registerScriptFile($this->assetsUrl .'/lang/jquery-ui-timepicker-'. $this->language .'.js', CClientScript::POS_END);
            $cs->registerScript(
                __CLASS__ .'#i18n-'. $this->language,
                "jQuery.datepicker.setDefaults(jQuery.datepicker.regional['{$this->language}']);",
                CClientScript::POS_READY
            );
        }

        if (isset($this->defaultOptions)) {
            $this->registerScriptFile($this->i18nScriptFile);
            $cs->registerScript(
                __CLASS__ .'#mode-'. $this->mode,
                'jQuery.'. $this->mode .'picker.setDefaults('. CJavaScript::encode($this->defaultOptions) .');',
                CClientScript::POS_READY
            );
        }

        $selector = '#'. $this->htmlOptions['id'];
        $cs->registerScript(
            __CLASS__ . $selector,
            'jQuery('. CJavaScript::encode($selector) .').'. $this->mode .'picker('. CJavaScript::encode($this->options) .');',
            CClientScript::POS_READY
        );
    }
}
