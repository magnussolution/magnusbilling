Ext.define('Overrides.ux.grid.filter.StringFilter', {
    override: 'Ext.ux.grid.filter.StringFilter',
    emptyText: t('Search...'),
    startingText: t('Starting with'),
    endsText: t('Ends with'),
    containsText: t('Contains'),
    equalText: t('Equal to'),
    compareMap: {
        starting: 'st',
        ends: 'ed',
        contains: 'ct',
        equal: 'eq'
    },
    menuItems: ['starting', 'ends', 'contains', '-', 'equal'],
    menuItemCfgs: {
        selectOnFocus: true,
        width: 125
    },
    init: function(config) {
        var me = this,
            i, len, item, cfg;
        Ext.applyIf(config, {
            xtype: 'textfield',
            enableKeyEvents: true,
            labelCls: 'ux-rangemenu-icon ' + this.iconCls,
            hideEmptyLabel: false,
            labelSeparator: '',
            labelWidth: 28,
            listeners: {
                scope: me,
                blur: me.onInputKeyUp,
                keyup: me.onInputKeyUp,
                el: {
                    click: function(e) {
                        e.stopPropagation();
                    }
                }
            }
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
                        items: [
                            Ext.apply(config, {
                                itemId: item
                            })
                        ]
                    }),
                    listeners: {
                        scope: me,
                        checkchange: me.onCheckChange
                    }
                };
                item = me.fields[item] = Ext.create('Ext.menu.CheckItem', cfg);
            }
            me.menu.add(item);
        }
        me.updateTask = Ext.create('Ext.util.DelayedTask', me.fireUpdate, me);
    },
    onCheckChange: function() {
        this.setActive(this.isActivatable());
        this.fireEvent('update', this);
    },
    onInputKeyUp: function(field, e) {
        var me = this,
            type = me.fields[field.itemId];
        var k = e.getKey();
        if (e.type !== 'blur' && field.isValid()) {
            e.stopEvent();
            return;
        }
        type.setChecked(true);
        if (type == me.fields.equal) {
            me.fields.starting.setChecked(false, true);
            me.fields.ends.setChecked(false, true);
            me.fields.contains.setChecked(false, true);
        } else {
            me.fields.equal.setChecked(false, true);
        }
        this.fireEvent('update', this);
    },
    isActivatable: function() {
        var key;
        for (key in this.fields) {
            if (this.fields[key].checked) {
                return true;
            }
        }
        return false;
    },
    getValue: function() {
        var me = this,
            key, result = {};
        for (key in me.fields) {
            if (me.fields[key].checked) {
                result[key] = me.getFieldValue(key);
            }
        }
        return result;
    },
    getFieldValue: function(item) {
        return this.getFieldString(item).getValue();
    },
    getFieldString: function(item) {
        return this.fields[item].menu.items.first();
    },
    setValue: function(value, preserve) {
        var me = this,
            key;
        for (key in me.fields) {
            if (value[key]) {
                me.getFieldString(key).setValue(value[key]);
                me.fields[key].setChecked(true);
            } else if (!preserve) {
                me.fields[key].setChecked(false);
            }
        }
        me.fireEvent('update', this);
    },
    getSerialArgs: function() {
        var me = this,
            args = [];
        for (var key in me.fields) {
            if (me.fields[key].checked) {
                args.push({
                    type: 'string',
                    comparison: me.compareMap[key],
                    value: me.getFieldValue(key)
                });
            }
        }
        return args;
    },
    validateRecord: function(record) {
        var me = this,
            key,
            val = record.get(me.dataIndex),
            v,
            fieldValue;
        for (key in me.fields) {
            if (me.fields[key].checked) {
                v = val.toLowerCase();
                fieldValue = me.getFieldValue(key).toLowerCase();
                if (key === 'equal' && v !== fieldValue) {
                    return false;
                } else {
                    if (key === 'starting' && !new RegExp('^' + fieldValue + '.*').test(v)) {
                        return false;
                    }
                    if (key === 'ends' && !new RegExp('^.*' + fieldValue + '$').test(v)) {
                        return false;
                    }
                    if (key === 'contains' && v.indexOf(fieldValue) === -1) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
});