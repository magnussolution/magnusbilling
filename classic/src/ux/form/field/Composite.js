/**
 * Classe que define o form de "Call"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 06/08/2030
 */
Ext.define('Ext.ux.form.field.Composite', {
    extend: 'Ext.form.FieldContainer',
    requires: ['Ext.grid.plugin.RowEditing', 'Ext.grid.column.Action'],
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.compositefield',
    layout: 'fit',
    blankText: t('This field is required'),
    deleteText: t('Delete'),
    defaultRecord: {},
    columnsEditor: [],
    value: [],
    height: 450,
    onBeforeEdit: Ext.emptyFn,
    onEdit: Ext.emptyFn,
    onValidateEdit: Ext.emptyFn,
    initComponent: function() {
        var me = this;
        me.items = me.initGrid();
        me.callParent(arguments);
    },
    onRender: function() {
        var me = this;
        me.callParent(arguments);
        me.setValue(me.value);
    },
    initGrid: function() {
        var me = this;
        me.columnsEditor = Ext.Array.merge(me.columnsEditor, [{
            xtype: 'actioncolumn',
            width: 30,
            menuDisabled: true,
            iconCls: 'icon-delete',
            tooltip: me.deleteText,
            handler: Ext.bind(me.removeItem, me),
            editRenderer: function() {
                return
            }
        }]);
        me.grid = Ext.widget('grid', {
            store: me.store,
            listeners: {
                scope: me,
                itemdblclick: me.onItemDblClick
            },
            plugins: {
                ptype: 'rowediting',
                pluginId: 'rowEditor',
                listeners: {
                    scope: me,
                    beforeedit: me.onBeforeEdit,
                    edit: me.onEditEditor,
                    canceledit: me.onCancelEdit,
                    validateedit: me.onValidateEdit
                }
            },
            tbar: [{
                glyph: icons.file,
                scope: me,
                handler: me.onAddRecord
            }],
            columns: me.columnsEditor
        });
        return me.grid;
    },
    onEditEditor: function(editor, context) {
        var me = this;
        me.onEdit(editor, context);
        me.fireEvent('change', me, me.getValue());
    },
    onAddRecord: function(btn) {
        var me = this,
            list = btn.up('grid'),
            pluginEditor = list.getPlugin('rowEditor');
        if (pluginEditor.editing && me.isCreate) {
            return false;
        }
        list.store.insert(0, me.defaultRecord);
        pluginEditor.startEdit(0, 0);
        me.isCreate = true;
    },
    onCancelEdit: function(editor, context) {
        this.isCreate && context.grid.store.remove(context.record);
    },
    addItem: function(value, index) {
        var me = this;
        value = value || {};
        me.store.add(value);
    },
    removeItem: function(grid, rowIndex) {
        var me = this,
            record = me.store.getAt(rowIndex);
        me.store.remove(record);
        me.fireEvent('change', me, me.getValue());
    },
    getErrors: function() {
        var me = this,
            errors = [];
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
        this.value = [];
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
            values = [];
        me.store.each(function(record) {
            values.push(record.data);
        });
        return values;
    },
    getSubmitValue: function() {
        return Ext.encode(this.getValue());
    },
    getSubmitData: function() {
        var me = this,
            data = {};
        data[me.getName()] = Ext.encode(me.getValue());
        return data;
    },
    onItemDblClick: function() {
        this.isCreate = false;
    }
});