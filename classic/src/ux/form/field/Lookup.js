Ext.define('Ext.ux.form.field.Lookup', {
    extend: 'Ext.form.FieldContainer',
    mixins: {
        field: 'Ext.form.field.Field'
    },
    layout: 'fit',
    blankText: t('This field is required'),
    displayField: undefined,
    valueField: 'id',
    gridConfig: {},
    windowConfig: {},
    iconClsSearch: 'x-form-search-trigger',
    layout: 'hbox',
    startX: 150,
    hiddenSearchButton: false,
    eventsRelay: ['dirtychange', 'validitychange', 'errorchange', 'specialkey', 'blur', 'keydown', 'keyup', 'keypress', 'change'],
    initComponent: function() {
        var me = this;
        me.store = Ext.data.StoreManager.lookup(me.store || 'ext-empty-store');
        me.items = me.initSubFields();
        me.callParent(arguments);
    },
    initSubFields: function() {
        var me = this,
            isMobileLayout = me.isMobileLayout();
        me.rawField = Ext.widget('textfield', {
            readOnly: true,
            flex: 1,
            onClearButtonClick: me.reset,
            clearButtonScope: me,
            isFormField: false,
            listeners: {
                scope: me,
                change: me.onChangeRawField
            },
            triggers: {
                clear: {
                    weight: 0,
                    cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                    hidden: true,
                    clickOnReadOnly: true,
                    handler: me.reset,
                    scope: me
                }
            }
        });
        me.relayEvents(me.rawField, me.eventsRelay);
        me.buttonSearch = Ext.widget('button', {
            iconCls: 'ux-gridfilter-text-icon',
            scope: me,
            text: isMobileLayout ? '' : t('Search'),
            tooltip: t('Search'),
            width: isMobileLayout ? 48 : 80,
            handler: me.onClickSearch,
            hidden: me.hiddenSearchButton
        });
        return [me.rawField, me.buttonSearch];
    },
    isMobileLayout: function() {
        return window.isMobileLayout || window.isTablet || window.isTablets;
    },
    getWindowSearchMetrics: function() {
        var me = this,
            bodySize = Ext.getBody().getViewSize(),
            isMobileLayout = me.isMobileLayout(),
            margin = 4,
            y = me.rawField.getY() + 23,
            height = me.rawField.getY() > 250 ? 300 : bodySize.height - 270;
        if (isMobileLayout) {
            height = bodySize.height - y - margin;
            if (height < 260) {
                y = margin;
                height = bodySize.height - (margin * 2);
            }
            return {
                x: margin,
                y: y,
                width: Math.max(240, bodySize.width - (margin * 2)),
                height: Math.max(220, height)
            };
        }
        return {
            x: me.rawField.getX() - me.startX,
            y: y,
            width: me.rawField.getWidth() + 70 + me.startX,
            height: height
        };
    },
    onChangeRawField: function(field) {
        field.getTrigger('clear').show();
    },
    onClickSearch: function(btn, e) {
        var me = this,
            metrics = me.getWindowSearchMetrics(),
            isMobileLayout = me.isMobileLayout();
        if (!me.windowSearch) {
            me.list = Ext.widget(me.gridConfig.xtype, Ext.apply({
                selType: 'checkboxmodel',
                selModel: {
                    mode: 'SINGLE'
                },
                buttonImportCsv: false,
                allowCreate: false,
                allowUpdate: false,
                allowDelete: false,
                allowPrint: false,
                autoLoadList: false,
                buttonCsv: false,
                extraButtons: [],
                listeners: {
                    scope: me,
                    selectionchange: me.onSelectionChangeList,
                    itemdblclick: me.onItemDblClick
                }
            }, me.gridConfig));
            me.buttonOk = Ext.widget('button', {
                text: t('Ok'),
                width: 70,
                disabled: true,
                glyph: icons.checkmark,
                scope: me,
                handler: me.onClickSelect
            });
            me.windowSearch = Ext.widget('window', Ext.apply({
                closeAction: 'hide',
                header: false,
                layout: 'fit',
                closable: false,
                resizable: !isMobileLayout,
                draggable: false,
                constrain: true,
                baseCls: 'x-panel',
                cls: isMobileLayout ? 'mb-mobile-lookup-window' : '',
                width: metrics.width,
                height: metrics.height,
                items: me.list,
                bbar: ['->', {
                    text: t('Cancel'),
                    glyph: icons.stop,
                    scope: me,
                    handler: function() {
                        me.windowSearch.close();
                    }
                }, me.buttonOk],
                listeners: {
                    scope: me,
                    show: me.onShowWindowSearch
                }
            }, me.windowConfig));
        } else {
            me.windowSearch.setSize(metrics.width, metrics.height);
        }
        me.windowSearch.showAt(metrics.x, metrics.y);
    },
    onSelectionChangeList: function(selModel, selections) {
        this.recordSelected = selections[0];
        this.buttonOk.setDisabled(!selections.length);
    },
    onItemDblClick: function(grid, rec) {
        this.selectRecord(rec);
    },
    onClickSelect: function() {
        this.selectRecord();
    },
    selectRecord: function(rec) {
        var me = this;
        rec = rec || me.recordSelected;
        me.setValue(rec.getId(), rec.get(me.displayFieldList));
        me.windowSearch.close();
        me.list.store.defaultFilter = [];
        me.list.store.load();
    },
    onShowWindowSearch: function(win) {
        var me = this,
            searchField = me.list.down('searchfield');
        searchField && searchField.focus(true, 10);
        !me.list.store.getCount() && Ext.defer(function() {
            me.list.store.load()
        }, 10);
    },
    getErrors: function() {
        var me = this,
            errors = [];
        if (me.allowBlank) {
            return errors;
        }
        if (!me.getValue()) {
            errors.push(me.blankText);
            return errors;
        }
        return errors;
    },
    reset: function() {
        var me = this;
        me.rawField.reset();
        me.setValue('');
        me.rawField.getTrigger('clear').hide();
        me.rawField.updateLayout();
    },
    setValue: function(value, rawValue) {
        var me = this,
            rec = me.ownerForm && me.ownerForm.getRecord();
        if (!Ext.isEmpty(value)) {
            rawValue = rawValue || (rec && rec.get(me.displayField));
        }
        me.value = value;
        me.rawField.setValue(rawValue || value);
        me.fireEvent('select', me, value);
    },
    getValue: function() {
        return this.value;
    },
    getRawValue: function() {
        return this.rawField.getRawValue();
    }
});
