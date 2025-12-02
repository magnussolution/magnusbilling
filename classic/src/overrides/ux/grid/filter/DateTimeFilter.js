Ext.define('Overrides.ux.grid.filter.DateTimeFilter', {
    override: 'Ext.ux.grid.filter.DateTimeFilter',
    requires: ['Ext.ux.form.field.DateTime'],
    tipField: t('Please select a date before filter'),
    /**
     * @cfg {String} dateFormat
     * The date format to return when using getValue.
     * Defaults to 'Y-m-d H:i:s'.
     */
    dateFormat: 'Y-m-d H:i:s',
    /**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
    init: function(config) {
        var me = this,
            i, len, item, cfg;
        Ext.QuickTips.init();
        me.tip = Ext.create('Ext.tip.ToolTip', {
            html: me.tipField,
            anchor: 'bottom'
        });
        me.fields = {};
        for (i = 0, len = me.menuItems.length; i < len; i++) {
            item = me.menuItems[i];
            if (item !== '-') {
                cfg = {
                    itemId: 'range-' + item,
                    text: me[item + 'Text'],
                    menu: Ext.create('Ext.menu.Menu', {
                        plain: true,
                        items: [{
                            xtype: 'datetimefield',
                            format: me.dateFormat,
                            itemId: item,
                            listeners: {
                                change: me.onFieldChange,
                                scope: me,
                                render: function(field) {
                                    me.tip.setTarget(field.el);
                                }
                            }
                        }]
                    }),
                    listeners: {
                        scope: me,
                        checkchange: me.onCheckChange
                    }
                };
                item = me.fields[item] = Ext.create('Ext.menu.CheckItem', cfg);
            }
            //me.add(item);
            me.menu.add(item);
        }
        me.values = {};
    },
    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function() {
        var args = [];
        for (var key in this.fields) {
            if (this.fields[key].checked) {
                args.push({
                    type: 'date',
                    comparison: this.compareMap[key],
                    value: Ext.Date.format(this.getFieldValue(key), this.dateFormat)
                });
            }
        }
        return args;
    },
    onCheckChange: function(item, checked) {
        var me = this,
            field = item.menu.items.first(),
            itemId = field.itemId,
            values = me.values;
        if (checked) {
            values[itemId] = field.getValue();
            // deselect "opposite" checkboxes
            if (itemId == "on") {
                this.fields['after'].setChecked(false);
                this.fields['before'].setChecked(false);
            } else {
                this.fields['on'].setChecked(false);
            }
        } else {
            delete values[itemId]
        }
        me.setActive(me.isActivatable());
        me.fireEvent('update', me);
    },
    onFieldChange: function(field, date) {
        // keep track of the field value separately because the menu gets destroyed
        // when columns order changes.  We return this value from getValue() instead
        // of field.getValue()
        if (!field.isValid()) {
            return;
        }
        // field.up('menu').hide();
        this.fields[field.itemId].setChecked(true);
        // deselect opposite checkboxes
        if (field.itemId == "on") {
            this.fields['after'].setChecked(false);
            this.fields['before'].setChecked(false);
        } else {
            this.fields['on'].setChecked(false);
        }
        this.values[field.itemId] = date;
        this.fireEvent('update', this);
    },
    onMenuSelect: function(field, date) {
        var fields = this.fields,
            field = this.fields[field.itemId];
        field.setChecked(true);
        if (field == fields.on) {
            fields.before.setChecked(false, true);
            fields.after.setChecked(false, true);
        } else {
            fields.on.setChecked(false, true);
            if (field == fields.after && this.getFieldValue('before') < date) {
                fields.before.setChecked(false, true);
            } else if (field == fields.before && this.getFieldValue('after') > date) {
                fields.after.setChecked(false, true);
            }
        }
        this.fireEvent('update', this);
        field.up('menu').hide();
    },
    /**
     * @private
     * Template method that is to set the value of the filter.
     * @param {Object} value The value to set the filter
     * @param {Boolean} preserve true to preserve the checked status
     * of the other fields.  Defaults to false, unchecking the
     * other fields
     */
    setValue: function(value, preserve) {
        var key;
        for (key in this.fields) {
            if (value[key]) {
                this.getPicker(key).setValue(value[key]);
                this.fields[key].setChecked(true);
            } else if (!preserve) {
                this.fields[key].setChecked(false);
            }
        }
        this.fireEvent('update', this);
    },
    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function(record) {
        var key,
            fieldValue,
            val = record.get(this.dataIndex),
            clearTime = Ext.Date.clearTime;
        if (!Ext.isDate(val)) {
            return false;
        }
        val = clearTime(val, true).getTime();
        for (key in this.fields) {
            if (this.fields[key].checked) {
                fieldValue = clearTime(this.getFieldValue(key), true).getTime();
                if (key == 'before' && fieldValue <= val) {
                    return false;
                }
                if (key == 'after' && fieldValue >= val) {
                    return false;
                }
                if (key == 'on' && fieldValue != val) {
                    return false;
                }
            }
        }
        return true;
    }
});