/**
 * Classe que define a lista de "CallShopCdr"
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
 * 01/05/2017
 */
Ext.define('Ext.ux.form.field.Permission', {
    extend: 'Ext.form.FieldContainer',
    requires: ['Ext.grid.column.CheckColumn', 'Overrides.grid.column.CheckColumn'],
    mixins: {
        field: 'Ext.form.field.Field'
    },
    alias: 'widget.permissionfield',
    layout: 'fit',
    border: 1,
    style: {
        borderColor: '#cecece',
        borderStyle: 'solid'
    },
    name: 'id_module',
    moduleText: t('Module'),
    showMenuText: t('Menu'),
    showDesktopText: t('Desktop'),
    showQuickInitText: t('Quick init.'),
    createText: t('Create'),
    updateText: t('Update'),
    deleteText: t('Delete'),
    blankText: t('This field is required'),
    urlReadTree: 'index.php/module/readTree',
    rootPropertyRead: 'rows',
    fieldsMap: {
        idModule: 'id_module',
        action: 'action',
        showMenu: 'show_menu',
        showDesktop: 'createShortCut',
        showQuickInit: 'createQuickStart'
    },
    initComponent: function() {
        var me = this;
        me.items = me.initTreeGrid();
        me.callParent(arguments);
    },
    initTreeGrid: function() {
        var me = this,
            listenersCheckColumns = {
                scope: me,
                checkchange: me.onCheckColumn
            };
        me.treeStore = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: me.urlReadTree,
                reader: {
                    type: 'json',
                    rootProperty: me.rootPropertyRead
                },
                extraParams: me.extraParamsRead
            },
            fields: [{
                name: 'text',
                convert: function(v) {
                    return (v.indexOf('t(') !== -1) ? eval(v) : v;
                }
            }, 'iconCls', {
                name: 'create',
                type: 'boolean'
            }, {
                name: 'update',
                type: 'boolean'
            }, {
                name: 'delete',
                type: 'boolean'
            }, {
                name: 'show_menu',
                type: 'boolean'
            }, {
                name: 'createShortCut',
                type: 'boolean'
            }, {
                name: 'createQuickStart',
                type: 'boolean'
            }],
            remoteSort: false,
            defaultRootProperty: me.rootPropertyRead
        });
        me.treeGrid = Ext.widget('treepanel', {
            style: me.allowBlank === false ? 'border-left: 3px solid red' : '',
            useArrows: true,
            rootVisible: false,
            store: me.treeStore,
            listeners: {
                scope: me,
                checkchange: me.onCheckModule
            },
            columns: [{
                xtype: 'treecolumn',
                text: me.moduleText,
                flex: 3,
                dataIndex: 'text'
            }, {
                xtype: 'checkcolumn',
                text: me.showMenuText,
                flex: 1,
                dataIndex: 'show_menu',
                listeners: {
                    checkchange: me.onCheckMenu
                }
            }, {
                xtype: 'checkcolumn',
                text: me.createText,
                flex: 1,
                dataIndex: 'create',
                listeners: listenersCheckColumns
            }, {
                xtype: 'checkcolumn',
                text: me.updateText,
                flex: 1,
                dataIndex: 'update',
                listeners: listenersCheckColumns
            }, {
                xtype: 'checkcolumn',
                text: me.deleteText,
                flex: 1,
                dataIndex: 'delete',
                listeners: listenersCheckColumns
            }, {
                xtype: 'checkcolumn',
                text: me.showDesktopText,
                flex: 1,
                dataIndex: 'createShortCut',
                listeners: listenersCheckColumns
            }, {
                xtype: 'checkcolumn',
                text: me.showQuickInitText,
                flex: 1,
                dataIndex: 'createQuickStart',
                listeners: listenersCheckColumns
            }]
        });
        return me.treeGrid;
    },
    onCheckMenu: function(col, rowIdx, checked, node) {
        if (!checked) {
            return;
        }
        node.set('checked', true);
        node.parentNode.set(col.dataIndex, true);
        node.parentNode.set('checked', true);
    },
    onCheckColumn: function(col, rowIdx, checked, node) {
        if (checked) {
            node.set('checked', true);
            node.parentNode.set('checked', true);
        }
        if (node.isLeaf()) {
            return;
        }
        node.cascadeBy(function(rec) {
            rec.set(col.dataIndex, checked);
            if (checked) {
                rec.set('checked', true);
                rec.parentNode.set('checked', true);
            }
        });
    },
    onCheckModule: function(node, checked) {
        var me = this;
        checked ? (node.parentNode && !node.parentNode.get('checked') && node.parentNode.set('checked', true)) : me.resetNode(node);
        if (node.isLeaf()) {
            return;
        }
        node.cascadeBy(function(rec) {
            rec.set('checked', checked);
            checked ? (rec.parentNode && rec.parentNode.set('checked', true)) : me.resetNode(rec);
        }, me);
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
        this.treeStore.load();
    },
    resetNode: function(node) {
        node.set({
            create: false,
            update: false,
            'delete': false,
            show_menu: false,
            createShortCut: false,
            createQuickStart: false,
            checked: false
        });
        node.commit();
    },
    setValue: function(values) {
        var me = this,
            rec,
            action,
            isLeaf;
        me.treeStore.load({
            scope: me,
            callback: function() {
                me.setLoading(true);
                Ext.each(values, function(value) {
                    rec = me.treeStore.getRootNode().findChild('id', parseInt(value[me.fieldsMap.idModule]), true);
                    action = value[me.fieldsMap.action] || [];
                    isLeaf = rec.isLeaf();
                    rec.set({
                        create: isLeaf && action.indexOf('c') !== -1,
                        update: isLeaf && action.indexOf('u') !== -1,
                        'delete': isLeaf && action.indexOf('d') !== -1,
                        show_menu: value[me.fieldsMap.showMenu] == 1,
                        createShortCut: isLeaf && value[me.fieldsMap.showDesktop] == 1,
                        createQuickStart: isLeaf && value[me.fieldsMap.showQuickInit] == 1,
                        checked: true
                    });
                    rec.commit();
                });
                me.setLoading(false);
            }
        });
    },
    getValue: function() {
        var me = this,
            value = {},
            values = [],
            actions;
        this.treeStore.getRootNode().cascadeBy(function(rec) {
            if (rec.get('checked') && !rec.isRoot()) {
                actions = [];
                value = {};
                rec.get('create') && actions.push('c');
                actions.push('r');
                rec.get('update') && actions.push('u');
                rec.get('delete') && actions.push('d');
                value[me.fieldsMap.idModule] = rec.getId();
                value[me.fieldsMap.action] = actions.join('');
                value[me.fieldsMap.showMenu] = rec.get('show_menu') ? 1 : 0;
                value[me.fieldsMap.showDesktop] = rec.get('createShortCut') ? 1 : 0;
                value[me.fieldsMap.showQuickInit] = rec.get('createQuickStart') ? 1 : 0;
                values.push(Ext.clone(value));
            }
        });
        return values;
    }
});