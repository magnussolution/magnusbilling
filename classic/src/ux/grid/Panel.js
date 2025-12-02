/**
 * Class to creation of list
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 14/07/2014
 */
Ext.define('Ext.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: ['Ext.grid.feature.Grouping', 'Ext.ux.grid.FiltersFeature', 'Ext.selection.CheckboxModel', 'Ext.toolbar.Paging', 'Ext.grid.column.Template', 'Ext.grid.column.Number', 'Ext.grid.column.Boolean', 'Ext.ux.form.SearchField', 'Ext.grid.column.Date'],
    selType: 'checkboxmodel',
    selModel: {
        mode: 'MULTI'
    },
    border: false,
    columnLines: true,
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true,
    allowPrint: true,
    allowSearch: true,
    fieldSearch: '',
    filterFieldOnClick: true,
    textNew: t('New'),
    buttonNewWidth: 70,
    buttonNewHeight: '',
    buttonDeleteWidth: 100,
    glyphNew: icons.file,
    textEdit: t('Edit'),
    glyphEdit: icons.pencil,
    textDelete: t('Delete'),
    hiddenDeleteAll: false,
    glyphDelete: icons.remove,
    textCleanFilter: t('Clear filters'),
    iconClsCleanFilter: 'icon-clean-filter',
    textPrint: t('Print'),
    glyphPrint: icons.print,
    dockPagination: 'bottom',
    displayInfoPagination: true,
    grupableColumns: true,
    filterableColumns: true,
    remoteFilter: true,
    extraButtons: [],
    labelPicture: t('Picture'),
    labelLandscape: t('Landscape'),
    buttonUpdateLot: true,
    iconButtonUpdateLot: 'icon-save-all',
    textButtonUpdateLot: t('Batch  update'),
    labelSelected: t('Selected'),
    labelAll: t('All'),
    pagination: true,
    buttonCsv: true,
    buttonImportCsv: false,
    iconButtonCsv: 'icon-export-csv',
    textButtonCsv: t('Export CSV'),
    widthButtonCsv: 140,
    iconButtonImportCsv: 'icon-import-csv',
    textButtonImportCsv: t('Import CSV'),
    actionButtonCsv: 'onExportCsv',
    buttonUpdateLotCallShopRate: false,
    extraFilters: [],
    cmpsExtraFilters: [],
    regionExtraFilters: 'west',
    widthExtraFilters: 140,
    collapsedExtraFilters: true,
    collapsibleExtraFilters: true,
    iconAddFilter: 'icon-add-filter',
    titleAddFilter: t('Add filters'),
    columnsHide: [],
    paginationButton: [],
    buttonCleanFilter: true,
    buttonPrint: true,
    autoLoadList: true,
    buttonsTbar: [],
    comparisonfilter: 'st',
    header: window.isTablet || window.isTablets ? false : '',
    viewConfig: {
        loadMask: {
            msg: t('Loading...')
        },
        emptyText: '<center class="grid-empty">' + t('No record found') + '</center>'
    },
    initComponent: function() {
        var me = this,
            groupDelete = Ext.id(),
            groupUpdateLot = Ext.id();
        if (window.isTablet) {
            me.textButtonCsv = '';
            me.textNew = '';
            me.textDelete = '';
            me.textButtonUpdateLot = '';
            me.buttonNewWidth = 40;
            me.buttonDeleteWidth = 60;
            me.widthButtonCsv = 40;
        } else {
            me.buttonNewWidth = window.isThemeTriton ? 90 : me.buttonNewWidth;
            me.buttonDeleteWidth = window.isThemeTriton ? 120 : me.buttonDeleteWidth;
        }
        me.tbar = [];
        if (me.module && !me.listeners) {
            me.listeners = {
                selectionchange: 'onSelectionChange',
                itemclick: 'onEdit'
            };
        }
        if (me.allowSearch && !Ext.isEmpty(me.fieldSearch)) {
            me.tbar.push({
                emptyText: t('Search') + ' ' + t(me.fieldSearch.split('\.').slice(-1)[0]),
                xtype: 'searchfield',
                fieldFilter: me.fieldSearch,
                filterOnClick: me.filterFieldOnClick,
                store: me.store,
                comparison: me.comparisonfilter,
                width: window.isTablet ? 80 : 130
            });
        }
        if (me.allowCreate) {
            me.tbar.push({
                text: me.textNew,
                width: me.buttonNewWidth,
                height: me.buttonNewHeight,
                glyph: me.glyphNew,
                handler: 'onNew'
            });
        }
        if (me.allowDelete && window.isTablet) {
            me.tbar.push({
                xtype: 'button',
                itemId: 'btnPrint',
                text: me.textDelete,
                width: me.buttonDeleteWidth,
                glyph: me.glyphDelete,
                disabled: true,
                reference: 'delete',
                handler: 'onDelete'
            });
        } else if (me.allowDelete) {
            me.tbar.push({
                xtype: window.isTablet || !App.user.isAdmin ? 'button' : 'splitbutton',
                itemId: 'btnPrint',
                text: me.textDelete,
                width: me.buttonDeleteWidth,
                glyph: me.glyphDelete,
                disabled: true,
                reference: 'delete',
                handler: 'onDelete',
                menu: [{
                    text: me.labelAll,
                    checked: false,
                    hidden: window.isTablet || !App.user.isAdmin || me.hiddenDeleteAll,
                    group: groupDelete,
                    value: 'all'
                }, {
                    text: me.labelSelected,
                    checked: true,
                    hidden: window.isTablet || !App.user.isAdmin,
                    group: groupDelete,
                    value: 'selected'
                }]
            });
        }
        if (App.user.hidden_batch_update == 0) {
            if ((me.allowUpdate && me.buttonUpdateLot && !App.user.isClient && !window.isTablet) || me.buttonUpdateLotCallShopRate) {
                me.tbar.push({
                    xtype: 'splitbutton',
                    iconCls: me.iconButtonUpdateLot,
                    text: me.textButtonUpdateLot,
                    enableToggle: true,
                    width: window.isTablet ? 85 : App.user.language == 'en' ? 140 : 170,
                    reference: 'updateLot',
                    listeners: {
                        toggle: 'onToggleUpdateLot'
                    },
                    menu: [{
                        text: me.labelAll,
                        checked: true,
                        group: groupUpdateLot,
                        value: 'all',
                        listeners: {
                            checkchange: 'onCheckChangeUpdateLot'
                        }
                    }, {
                        text: me.labelSelected,
                        checked: false,
                        group: groupUpdateLot,
                        value: 'selected',
                        disabled: true,
                        listeners: {
                            checkchange: 'onCheckChangeUpdateLot'
                        }
                    }]
                });
            }
        }
        if (me.buttonCsv && !window.isTablet) {
            me.tbar.push({
                iconCls: me.iconButtonCsv,
                text: me.textButtonCsv,
                handler: me.actionButtonCsv,
                width: me.widthButtonCsv
            });
        };
        if (me.buttonImportCsv && !window.isTablet) {
            me.tbar.push({
                iconCls: me.iconButtonImportCsv,
                text: me.textButtonImportCsv,
                handler: 'onImportCsv',
                width: me.widthButtonCsv
            });
        };
        if (me.extraButtons.length) {
            me.tbar = Ext.Array.merge(me.tbar, me.extraButtons);
        };
        if (me.buttonPrint && !window.isTablet) {
            me.tbar.push('->', {
                xtype: 'splitbutton',
                glyph: me.glyphPrint,
                text: window.isTablet ? '' : me.textPrint,
                width: App.user.language == 'en' ? 100 : 110,
                hidden: !me.allowPrint,
                handler: 'onPrint',
                menu: [{
                    text: me.labelPicture,
                    checked: true,
                    group: 'orientation',
                    value: 'P',
                    handler: 'onPrint'
                }, {
                    text: me.labelLandscape,
                    checked: false,
                    group: 'orientation',
                    value: 'L',
                    handler: 'onPrint'
                }]
            });
        }
        if (me.buttonCleanFilter) {
            me.tbar.push({
                iconCls: me.iconClsCleanFilter,
                text: window.isTablet ? '' : me.textCleanFilter,
                scope: me,
                width: window.isTablet ? 50 : App.user.language == 'en' ? 110 : 120,
                handler: me.cleanFilters
            });
        }
        if (me.pagination) {
            me.dockedItems = [{
                xtype: 'pagingtoolbar',
                dock: me.dockPagination,
                store: me.store,
                displayInfo: me.displayInfoPagination,
                items: me.paginationButton
            }, {
                xtype: 'toolbar',
                dock: me.dockPagination,
                items: me.buttonsTbar,
                hidden: !me.buttonsTbar.length
            }];
        }
        me.features = [{
            ftype: 'filters',
            id: 'filters',
            local: !me.remoteFilter
        }, {
            ftype: 'grouping',
            enableGroupingMenu: me.grupableColumns,
            groupHeaderTpl: t('Column') + ': {columnName} -> {name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
        }];
        me.on('render', me.applyDefaultColumns, me);
        me.callParent(arguments);
        me.autoLoadList && !window.isDesktop && me.getStore().load({
            scope: me,
            callback: function() {
                me.view.refresh();
            }
        });
    },
    getExtraFilterClass: function(type) {
        switch (type) {
            case 'auto':
                type = 'string';
                break;
            case 'int':
            case 'float':
                type = 'numeric';
                break;
            case 'bool':
                type = 'boolean';
                break;
        }
        return Ext.ClassManager.getByAlias('gridfilter.' + type);
    },
    addExtraFilter: function(filter) {
        var me = this,
            filterGrid = me.getView().getFeature('filters');
        filter.button.toggle(filter.active);
        filterGrid.extraFilters = me.getFilterData();
        me.deferredUpdate.delay(filter.type === 'string' ? 0 : filterGrid.updateBuffer);
    },
    clearExtraFilters: function() {
        var me = this,
            btnExtraFilters = me.cmpExtraFilters.query('splitbutton[pressed=true]');
        Ext.each(btnExtraFilters, function(btn) {
            btn.toggle(false, true);
            btn.filter.setActive(false);
        });
    },
    getFilterData: function() {
        var me = this,
            filters = [],
            i,
            len;
        Ext.each(me.cmpsExtraFilters, function(f) {
            if (f.active) {
                var d = [].concat(f.serialize());
                for (i = 0, len = d.length; i < len; i++) {
                    filters.push({
                        field: f.field || f.dataIndex,
                        data: d[i],
                        type: d[i].type, //add
                        value: d[i].value // add
                    });
                }
            }
        });
        return filters;
    },
    initExtraFilters: function() {
        var me = this,
            clsFilter,
            cmpFilter,
            menu,
            filterFeature = me.getView().getFeature('filters'),
            //module = window.isDesktop ? me.module.ownerCt : me.module;
            module = me.module;
        Ext.suspendLayouts();
        me.deferredUpdate = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load();
            me.deferredUpdate.cancel();
        }, me);
        me.on('clearfilters', me.clearExtraFilters, me);
        me.cmpExtraFilters = module.add({
            region: me.regionExtraFilters,
            iconCls: me.iconAddFilter,
            title: me.titleAddFilter,
            autoScroll: true,
            defaultType: 'splitbutton',
            layout: 'anchor',
            width: me.widthExtraFilters,
            maxWidth: me.widthExtraFilters,
            collapsed: me.collapsedExtraFilters,
            collapsible: me.collapsibleExtraFilters,
            defaults: {
                anchor: '100%',
                enableToggle: true,
                listeners: {
                    toggle: function(btn, pressed) {
                        if (!btn.filter.active) {
                            btn.toggle(false, true);
                        }
                        btn.filter.setActive(pressed);
                    }
                }
            }
        });
        Ext.each(me.extraFilters, function(extraFilter) {
            clsFilter = me.getExtraFilterClass(extraFilter.type);
            cmpFilter = new clsFilter(extraFilter);
            cmpFilter.on({
                scope: me,
                update: me.addExtraFilter,
                activate: me.addExtraFilter,
                deactivate: me.addExtraFilter
            });
            me.cmpsExtraFilters.push(cmpFilter);
            filterFeature.cmpsExtraFilters = me.cmpsExtraFilters;
            menu = cmpFilter.menu;
            cmpFilter.button = me.cmpExtraFilters.add({
                text: extraFilter.label,
                menu: menu,
                filter: cmpFilter
            });
        });
        Ext.resumeLayouts(true);
    },
    applyDefaultColumns: function() {
        var me = this,
            i,
            column;
        if (me.extraFilters.length) {
            me.initExtraFilters();
        }
        for (i in me.columns) {
            column = me.columns[i];
            if (column.isCheckerHd) {
                continue;
            }
            if (me.columnsHide.indexOf(column.dataIndex) !== -1) {
                column.hidden = true;
            }
            column.flex = column.width || column.flex || 1;
            column.filterable = Ext.isDefined(column.filterable) ? column.filterable : me.filterableColumns;
            if (column.comboFilter) {
                column.filter = column.filter || Helper.Util.getListFilter(column.comboFilter);
            }
        }
    },
    cleanFilters: function() {
        this.filters.clearFilters();
    }
});