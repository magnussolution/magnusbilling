/**
 * Toggle switch component used by Ext.field.Toggle
 */
Ext.define('Ext.slider.Toggle', {
    extend: 'Ext.slider.Slider',
    xtype: 'toggleslider',

    config: {
        onThumbUi: 'toggle-on',
        offThumbUi: 'toggle-off'
    },

    /**
     * @inheritdoc
     */
    value: 0,

    classCls: Ext.baseCSSPrefix + 'toggleslider',

    // TODO:  7.0 remove these two classes once legacy themes that rely on them are removed
    minValueCls: Ext.baseCSSPrefix + 'off',
    maxValueCls: Ext.baseCSSPrefix + 'on',

    initialize: function() {
        this.callParent();

        this.on({
            change: 'onChange'
        });
    },

    applyMinValue: function() {
        return 0;
    },

    applyMaxValue: function() {
        return 1;
    },

    applyIncrement: function() {
        return 1;
    },

    updateMinValueCls: function(newCls, oldCls) {
        var element = this.element;

        if (oldCls && element.hasCls(oldCls)) {
            element.replaceCls(oldCls, newCls);
        }
    },

    updateMaxValueCls: function(newCls, oldCls) {
        var element = this.element;

        if (oldCls && element.hasCls(oldCls)) {
            element.replaceCls(oldCls, newCls);
        }
    },

    setValue: function(newValue, oldValue) {
        this.callParent(arguments);
        this.onChange(this, this.thumbs[0], newValue, oldValue);
    },

    setIndexValue: function(index, value, animation) {
        var oldValue = this.getValue()[index];
        this.callParent(arguments);

        var thumb = this.thumbs[index],
            newValue = this.getValue();

        if (oldValue !== newValue) {
            this.fireEvent('change', this, thumb, newValue, oldValue);
        }
    },

    onChange: function(me, thumb, newValue, oldValue) {
        var isOn = newValue > 0,
            onCls = me.maxValueCls,
            offCls = me.minValueCls,
            element = this.element;

        element.addCls(isOn ? onCls : offCls);
        element.removeCls(isOn ? offCls : onCls);

        this.thumbs[0].setUi(isOn ? this.getOnThumbUi() : this.getOffThumbUi());
    },

    toggle: function() {
        var value = this.getValue();
        this.setValue((value == 1) ? 0 : 1);

        return this;
    },

    onTap: function() {
        if (this.isDisabled() || this.getReadOnly()) {
            return;
        }

        var oldValue = this.getValue(),
            newValue = (oldValue == 1) ? 0 : 1,
            thumb = this.thumbs[0];

        this.setIndexValue(0, newValue, this.getAnimation());
        this.refreshThumbConstraints(thumb);
    },

    privates: {
        syncFill: function() {
            var me = this,
                fillElement = me.trackElement.down(me.fillSelector),
                values = me.getArrayValues();

            if (values && (values[0] === 1)) {
                fillElement.show();
            } else {
                fillElement.hide();
            }
        }
    }
});
