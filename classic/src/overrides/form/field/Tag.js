/** * Overrides.form.field.Tag
 */
Ext.define('Overrides.form.field.Tag', {
    override: 'Ext.form.field.Tag',
    // OVERRIDE - EXTJS-14530 - (Actual fix in 5.0.2)
    setValue: function(value, doSelect, skipLoad) {
        var me = this,
            valueStore = me.valueStore,
            valueField = me.valueField,
            unknownValues = [],
            record, len, i, valueRecord, cls;
        if (Ext.isEmpty(value)) {
            value = null;
        }
        if (Ext.isString(value) && me.multiSelect) {
            value = value.split(me.delimiter);
        }
        value = Ext.Array.from(value, true);
        for (i = 0, len = value.length; i < len; i++) {
            record = value[i];
            if (!record || !record.isModel) {
                valueRecord = valueStore.findExact(valueField, record);
                if (valueRecord >= 0) {
                    value[i] = valueStore.getAt(valueRecord);
                } else {
                    valueRecord = me.findRecord(valueField, record);
                    if (!valueRecord) {
                        if (me.forceSelection) {
                            unknownValues.push(record);
                        } else {
                            valueRecord = {};
                            valueRecord[me.valueField] = record;
                            valueRecord[me.displayField] = record;
                            cls = me.valueStore.getModel();
                            valueRecord = new cls(valueRecord);
                        }
                    }
                    if (valueRecord) {
                        // OVERRIDE
                        // value[i] = valueRecord;
                        if (valueRecord instanceof Ext.util.Collection) {
                            value[i] = valueRecord.getAt(0);
                        } else {
                            value[i] = valueRecord;
                        }
                    }
                }
            }
        }
        if ((skipLoad !== true) && (unknownValues.length > 0) && (me.queryMode === 'remote')) {
            var params = {};
            params[me.valueParam || me.valueField] = unknownValues.join(me.delimiter);
            me.store.load({
                params: params,
                callback: function() {
                    if (me.itemList) {
                        me.itemList.unmask();
                    }
                    me.setValue(value, doSelect, true);
                    me.autoSize();
                    me.lastQuery = false;
                }
            });
            return false;
        }
        // For single-select boxes, use the last good (formal record) value if possible
        if (!me.multiSelect && (value.length > 0)) {
            for (i = value.length - 1; i >= 0; i--) {
                if (value[i].isModel) {
                    value = value[i];
                    break;
                }
            }
            if (Ext.isArray(value)) {
                value = value[value.length - 1];
            }
        }
        return me.callParent([value, doSelect]);
    }
});