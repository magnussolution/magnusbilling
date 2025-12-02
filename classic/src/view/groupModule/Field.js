/**
 * Class to define field to "GroupModule"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 02/07/2013
 */
Ext.define('MBilling.view.groupModule.Field', {
    extend: 'Ext.form.FieldContainer',
    requires: ['MBilling.view.module.Combo', 'Ext.form.field.Checkbox', 'Ext.form.field.Tag', 'Ext.grid.plugin.RowEditing', 'Ext.grid.column.CheckColumn'],
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.groupmodulefield',
    layout: 'fit',
    name: 'id_module',
    fieldLabel: t('Modules'),
    moduleText: t('Module'),
    showMenuText: t('Show menu'),
    showDesktopText: t('Show desktop'),
    showQuickInitText: t('Show quick init.'),
    readText: t('Read'),
    createText: t('Create'),
    updateText: t('Update'),
    deleteText: t('Delete'),
    actionsText: t('Actions'),
    blankText: t('This field is required'),
    itemExistsText: t('This item already exists'),
    subFieldsName: {
        module: 'id_module',
        moduleText: 'idModuletext',
        showMenu: 'show_menu',
        showDesktop: 'createShortCut',
        showQuickInit: 'createQuickStart',
        actions: 'action'
    },
    initComponent: function() {
        var me = this,
            remainingHeight;
        me.items = me.initGrid();
        me.callParent(arguments);
    },
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        me.setValue(me.value);
    },
    initGrid: function() {
        var me = this,
            valueDefault = {},
            pluginEditor;
        me.store = Ext.create('MBilling.store.GroupModule', {
            remoteSort: false
        });
        me.moduleCombo = Ext.widget('modulecombo', {
            hideLabel: true,
            allowBlank: false,
            validator: Ext.bind(me.checkModuleExists, me)
        });
        me.grid = Ext.widget('grid', {
            style: me.allowBlank === false ? 'border-left: 3px solid red' : '',
            store: me.store,
            plugins: {
                ptype: 'rowediting',
                pluginId: 'rowEditor',
                listeners: {
                    scope: me,
                    beforeedit: me.onBeforeEdit,
                    edit: me.onEdit,
                    canceledit: me.onCancelEdit
                }
            },
            tbar: [{
                glyph: icons.file,
                scope: me,
                text: t('Add permissions for this group'),
                handler: function() {
                    pluginEditor = me.grid.getPlugin('rowEditor');
                    if (!me.isUpdate && pluginEditor.editing) {
                        me.moduleCombo.focus();
                        return false;
                    }
                    me.moduleCombo.reset();
                    valueDefault[me.subFieldsName.showMenu] = 1;
                    valueDefault[me.subFieldsName.showDesktop] = 0;
                    valueDefault[me.subFieldsName.showQuickInit] = 0;
                    me.addItem(valueDefault, 0);
                    pluginEditor.startEdit(0, 0);
                    me.isUpdate = false;
                    me.recordEditing = null;
                }
            }],
            columns: [{
                xtype: 'templatecolumn',
                flex: 7,
                tpl: '{' + me.subFieldsName.moduleText + '}',
                header: me.moduleText,
                dataIndex: me.subFieldsName.module,
                editor: me.moduleCombo
            }, {
                header: me.actionsText,
                flex: 7,
                dataIndex: me.subFieldsName.actions,
                scope: me,
                renderer: me.rendererActions,
                editor: {
                    xtype: 'combo',
                    multiSelect: true,
                    store: [
                        ['c', me.createText],
                        ['r', me.readText],
                        ['u', me.updateText],
                        ['d', me.deleteText]
                    ]
                }
            }, {
                xtype: 'booleancolumn',
                flex: 6,
                header: me.showMenuText,
                dataIndex: me.subFieldsName.showMenu,
                editor: {
                    xtype: 'checkbox'
                }
            }, {
                xtype: 'booleancolumn',
                flex: 6,
                header: me.showDesktopText,
                dataIndex: me.subFieldsName.showDesktop,
                editor: {
                    xtype: 'checkbox'
                }
            }, {
                xtype: 'booleancolumn',
                flex: 6,
                header: me.showQuickInitText,
                dataIndex: me.subFieldsName.showQuickInit,
                editor: {
                    xtype: 'checkbox'
                }
            }, {
                xtype: 'actioncolumn',
                flex: 1,
                menuDisabled: true,
                iconCls: 'icon-delete',
                tooltip: me.deleteText,
                handler: Ext.bind(me.removeItem, me),
                editRenderer: function() {
                    return
                }
            }]
        });
        return me.grid;
    },
    rendererActions: function(action) {
        var me = this,
            values = Ext.isString(action) ? action.split('') : action,
            actions = [];
        Ext.each(values, function(v) {
            switch (v) {
                case 'c':
                    actions.push(me.createText);
                    break;
                case 'r':
                    actions.push(me.readText);
                    break;
                case 'u':
                    actions.push(me.updateText);
                    break;
                case 'd':
                    actions.push(me.deleteText);
                    break;
            }
        }, me);
        return actions.join(', ');
    },
    onBeforeEdit: function(editor, context) {
        var me = this,
            record = context.record,
            nameAction = me.subFieldsName.actions,
            action = record.get(nameAction);
        record.set(nameAction, Ext.isString(action) ? action.split('') : undefined);
        me.isUpdate = record.get(me.subFieldsName.module) > 0;
        me.recordEditing = me.isUpdate ? record : null;
    },
    onEdit: function(editor, context) {
        var me = this,
            record = context.record,
            nameAction = me.subFieldsName.actions;
        record.set(nameAction, record.get(nameAction).join(''));
        record.set('idModuletext', "t('" + me.moduleCombo.getRawValue() + "')");
        record.commit();
    },
    onCancelEdit: function(editor, context) {
        var me = this,
            record = context.record,
            nameAction = me.subFieldsName.actions,
            actions = record.get(nameAction);
        me.isUpdate ? record.set(nameAction, actions && actions.join('')) : me.store.removeAt(context.rowIdx);
        record.commit();
    },
    addItem: function(value, index) {
        var me = this;
        value = value || {};
        Ext.isDefined(index) ? me.store.insert(index, Ext.clone(value)) : me.store.add(Ext.clone(value));
    },
    removeItem: function(grid, rowIndex) {
        var me = this,
            record = me.store.getAt(rowIndex);
        me.store.remove(record);
    },
    getErrors: function() {
        var me = this,
            errors = [],
            moduleCombo;
        if (me.allowBlank) {
            return errors;
        }
        if (!me.getValue().length) {
            errors.push(me.blankText);
            return errors;
        }
        return errors;
    },
    reset: function() {
        this.store.removeAll();
    },
    setValue: function(values) {
        var me = this;
        me.reset();
        Ext.each(values, function(value) {
            me.addItem(value);
        }, me);
    },
    getValue: function() {
        var me = this,
            values = [],
            value = {},
            actions,
            module;
        me.store.each(function(record) {
            module = record.get(me.subFieldsName.module);
            if (module) {
                value[me.subFieldsName.module] = module;
                value[me.subFieldsName.showMenu] = record.get(me.subFieldsName.showMenu);
                value[me.subFieldsName.showDesktop] = record.get(me.subFieldsName.showDesktop);
                value[me.subFieldsName.showQuickInit] = record.get(me.subFieldsName.showQuickInit);
                value[me.subFieldsName.actions] = record.get(me.subFieldsName.actions);
                values.push(Ext.clone(value));
            }
        });
        return values;
    },
    // getSubmitValue: function() {
    //     return Ext.encode(this.getValue());
    // },
    getSubmitData: function() {
        var me = this,
            data = {};
        data[me.getName()] = Ext.encode(me.getValue());
        return data;
    },
    checkModuleExists: function() {
        var me = this,
            idModule = me.moduleCombo.getValue(),
            oldModule = me.recordEditing && me.recordEditing.get(me.subFieldsName.module);
        if (!idModule) {
            return true;
        }
        if (me.isUpdate && (oldModule !== idModule) && me.store.find(me.subFieldsName.module, idModule) !== -1) {
            return me.itemExistsText;
        } else if (!me.isUpdate && me.store.find(me.subFieldsName.module, idModule) !== -1) {
            return me.itemExistsText;
        }
        return true;
    }
});