/**
 * Filter by a configurable Ext.picker.DatePicker menu
 *
 * This filter allows for the following configurations:
 *
 * - Any of the normal configs will be passed through to either component.
 * - There can be a docked config.
 * - The timepicker can be on the right or left (datepicker, too, of course).
 * - Choose which component will initiate the filtering, i.e., the event can be
 *   configured to be bound to either the datepicker or the timepicker, or if
 *   there is a docked config it be automatically have the handler bound to it.
 *
 * Although not shown here, this class accepts all configuration options
 * for {@link Ext.picker.Date} and {@link Ext.picker.Time}.
 *
 * In the case that a custom dockedItems config is passed in, the
 * class will handle binding the default listener to it so the
 * developer need not worry about having to do it.
 *
 * The default dockedItems position and the toolbar's
 * button text can be passed a config for convenience, i.e.,:
 *
 *     dock: {
 *        buttonText: 'Click to Filter',
 *        dock: 'left'
 *     }
 *
 * Or, pass in a full dockedItems config:
 *
 *     dock: {
 *        dockedItems: {
 *            xtype: 'toolbar',
 *            dock: 'bottom',
 *            ...
 *        }
 *     }
 *
 * Or, give a value of `true` to accept dock defaults:
 *
 *     dock: true
 *
 * But, it must be one or the other.
 *
 * Example Usage:
 *
 *     var filters = Ext.create('Ext.ux.grid.GridFilters', {
 *         ...
 *         filters: [{
 *             // required configs
 *             type: 'datetime',
 *             dataIndex: 'date',
 *
 *             // optional configs
 *             positionDatepickerFirst: false,
 *             //selectDateToFilter: false, // this is overridden b/c of the presence of the dock cfg object
 *
 *             date: {
 *                 format: 'm/d/Y',
 *             },
 *
 *             time: {
 *                 format: 'H:i:s A',
 *                 increment: 1
 *             },
 *
 *             dock: {
 *                 buttonText: 'Click to Filter',
 *                 dock: 'left'
 *
 *                 // allows for custom dockedItems cfg
 *                 //dockedItems: {}
 *             }
 *         }]
 *     });
 *
 * In the above example, note that the filter is being passed a {@link #date} config object,
 * a {@link #time} config object and a {@link #dock} config. These are all optional.
 *
 * As for positioning, the datepicker will be on the right, the timepicker on the left
 * and the docked items will be docked on the left. In addition, since there's a {@link #dock}
 * config, clicking the button in the dock will trigger the filtering.
 */
Ext.define('Ext.ux.grid.filter.DateTimeFilter', {
    extend: 'Ext.ux.grid.filter.DateFilter',
    alias: 'gridfilter.datetime',
    /**
     * @private
     */
    dateDefaults: {
        xtype: 'datepicker',
        format: 'm/d/Y'
    },
    /**
     * @private
     */
    timeDefaults: {
        xtype: 'timepicker',
        width: 100,
        height: 200,
        format: 'g:i A'
    },
    /**
     * @private
     */
    dockDefaults: {
        dock: 'top',
        buttonText: 'Filter'
    },
    /**
     * @cfg {Object} date
     * A {@link Ext.picker.Date} can be configured here.
     * Uses {@link #dateDefaults} by default.
     */
    /**
     * @cfg {Object} time
     * A {@link Ext.picker.Time} can be configured here.
     * Uses {@link #timeDefaults} by default.
     */
    /**
     * @cfg {Boolean/Object} dock
     * A {@link Ext.panel.AbstractPanel#cfg-dockedItems} can be configured here.
     * A `true` value will use the {@link #dockDefaults} default configuration.
     * If present, the button in the docked items will initiate the filtering.
     */
    /**
     * @cfg {Boolean} [selectDateToFilter=true]
     * By default, the datepicker has the default event listener bound to it.
     * Setting to `false` will bind it to the timepicker.
     *
     * The config will be ignored if there is a `dock` config.
     */
    selectDateToFilter: true,
    /**
     * @cfg {Boolean} [positionDatepickerFirst=true]
     * Positions the datepicker within its container.
     * A `true` value will place it on the left in the container.
     * Set to `false` if the timepicker should be placed on the left.
     * Defaults to `true`.
     */
    positionDatepickerFirst: true,
    reTime: /\s(am|pm)/i,
    reItemId: /\w*-(\w*)$/,
    /**
     * Replaces the selected value of the timepicker with the default 00:00:00.
     * @private
     * @param {Object} date
     * @param {Ext.picker.Time} timepicker
     * @return Date object
     */
    addTimeSelection: function(date, timepicker) {
        var me = this,
            selection = timepicker.getSelectionModel().getSelection(),
            time, len, fn, val,
            i = 0,
            arr = [],
            timeFns = ['setHours', 'setMinutes', 'setSeconds', 'setMilliseconds'];
        if (selection.length) {
            time = selection[0].get('disp');
            // Loop through all of the splits and add the time values.
            arr = time.replace(me.reTime, '').split(':');
            for (len = arr.length; i < len; i++) {
                fn = timeFns[i];
                val = arr[i];
                if (val) {
                    date[fn](parseInt(val, 10));
                }
            }
        }
        return date;
    },
    /**
     * @private
     * Template method that is to initialize the filter and install required menu items.
     */
    init: function(config) {
        var me = this,
            dateCfg = Ext.applyIf(me.date || {}, me.dateDefaults),
            timeCfg = Ext.applyIf(me.time || {}, me.timeDefaults),
            dockCfg = me.dock, // should not default to empty object
            defaultListeners = {
                click: {
                    scope: me,
                    click: me.onMenuSelect
                },
                select: {
                    scope: me,
                    select: me.onMenuSelect
                }
            },
            pickerCtnCfg, i, len, item, cfg,
            items = [dateCfg, timeCfg],
            // we need to know the datepicker's position in the items array
            // for when the itemId name is bound to it before adding to the menu
            datepickerPosition = 0;
        if (!me.positionDatepickerFirst) {
            items = items.reverse();
            datepickerPosition = 1;
        }
        pickerCtnCfg = Ext.apply(me.pickerOpts, {
            xtype: !dockCfg ? 'container' : 'panel',
            layout: 'hbox',
            items: items
        });
        // If there's no dock config then bind the default listener to the desired picker.
        if (!dockCfg) {
            if (me.selectDateToFilter) {
                dateCfg.listeners = defaultListeners.select;
            } else {
                timeCfg.listeners = defaultListeners.select;
            }
        } else if (dockCfg) {
            me.selectDateToFilter = null;
            if (dockCfg.dockedItems) {
                pickerCtnCfg.dockedItems = dockCfg.dockedItems;
                // TODO: allow config that will tell which item to bind the listener to
                // right now, it's using the first item
                pickerCtnCfg.dockedItems.items[dockCfg.bindToItem || 0].listeners = defaultListeners.click;
            } else {
                // dockCfg can be `true` if button text and dock position defaults are wanted
                if (Ext.isBoolean(dockCfg)) {
                    dockCfg = {};
                }
                dockCfg = Ext.applyIf(dockCfg, me.dockDefaults);
                pickerCtnCfg.dockedItems = {
                    xtype: 'toolbar',
                    dock: dockCfg.dock,
                    items: [{
                        xtype: 'button',
                        text: dockCfg.buttonText,
                        flex: 1,
                        listeners: defaultListeners.click
                    }]
                };
            }
        }
        me.fields = {};
        for (i = 0, len = me.menuItems.length; i < len; i++) {
            item = me.menuItems[i];
            if (item !== '-') {
                pickerCtnCfg.items[datepickerPosition].itemId = item;
                cfg = {
                    itemId: 'range-' + item,
                    text: me[item + 'Text'],
                    menu: Ext.create('Ext.menu.Menu', {
                        items: pickerCtnCfg
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
        me.values = {};
    },
    /**
     * @private
     */
    onCheckChange: function(item, checked) {
        var me = this,
            menu = item.menu,
            timepicker = menu.down('timepicker'),
            datepicker = menu.down('datepicker'),
            itemId = datepicker.itemId,
            values = me.values;
        if (checked) {
            values[itemId] = me.addTimeSelection(datepicker.value, timepicker);
        } else {
            delete values[itemId];
        }
        me.setActive(me.isActivatable());
        me.fireEvent('update', me);
    },
    /** 
     * Handler for when the DatePicker for a field fires the 'select' event
     * @param {Ext.picker.Date} picker
     * @param {Object} date
     */
    onMenuSelect: function(picker, date) {
        // NOTE: we need to redefine the picker.
        var me = this,
            menu = me.menu,
            checkItemId = menu.getFocusEl().itemId.replace(me.reItemId, '$1'),
            fields = me.fields,
            field;
        picker = menu.queryById(checkItemId);
        field = me.fields[picker.itemId];
        field.setChecked(true);
        if (field == fields.on) {
            fields.before.setChecked(false, true);
            fields.after.setChecked(false, true);
        } else {
            fields.on.setChecked(false, true);
            if (field == fields.after && me.getFieldValue('before') < date) {
                fields.before.setChecked(false, true);
            } else if (field == fields.before && me.getFieldValue('after') > date) {
                fields.after.setChecked(false, true);
            }
        }
        me.fireEvent('update', me);
        // The timepicker's getBubbleTarget() returns the boundlist's implementation,
        // so it doesn't look up ownerCt chain (it looks up this.pickerField).
        // This is a problem :)
        // This can be fixed by just walking up the ownerCt chain
        // (same thing, but confusing without comment).
        picker.ownerCt.ownerCt.hide();
    },
    /**
     * @private
     * Template method that is to get and return serialized filter data for
     * transmission to the server.
     * @return {Object/Array} An object or collection of objects containing
     * key value pairs representing the current configuration of the filter.
     */
    getSerialArgs: function() {
        var me = this,
            key,
            fields = me.fields,
            args = [];
        for (key in fields) {
            if (fields[key].checked) {
                args.push({
                    type: 'datetime',
                    comparison: me.compareMap[key],
                    value: Ext.Date.format(me.getFieldValue(key), (me.date.format || me.dateDefaults.format) + ' ' + (me.time.format || me.timeDefaults.format))
                });
            }
        }
        return args;
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
        var me = this,
            fields = me.fields,
            key,
            val,
            datepicker;
        for (key in fields) {
            val = value[key];
            if (val) {
                datepicker = me.menu.down('datepicker[itemId="' + key + '"]');
                // Note that calling the Ext.picker.Date:setValue() calls Ext.Date.clearTime(),
                // which we don't want, so just call update() instead and set the value on the component.
                datepicker.update(val);
                datepicker.value = val;
                fields[key].setChecked(true);
            } else if (!preserve) {
                fields[key].setChecked(false);
            }
        }
        me.fireEvent('update', me);
    },
    /**
     * Template method that is to validate the provided Ext.data.Record
     * against the filters configuration.
     * @param {Ext.data.Record} record The record to validate
     * @return {Boolean} true if the record is valid within the bounds
     * of the filter, false otherwise.
     */
    validateRecord: function(record) {
        // remove calls to Ext.Date.clearTime
        var me = this,
            key,
            pickerValue,
            val = record.get(me.dataIndex);
        if (!Ext.isDate(val)) {
            return false;
        }
        val = val.getTime();
        for (key in me.fields) {
            if (me.fields[key].checked) {
                pickerValue = me.getFieldValue(key).getTime();
                if (key == 'before' && pickerValue <= val) {
                    return false;
                }
                if (key == 'after' && pickerValue >= val) {
                    return false;
                }
                if (key == 'on' && pickerValue != val) {
                    return false;
                }
            }
        }
        return true;
    }
});