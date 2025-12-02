/**
 * Classe que define a model "Callerid"
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
 * 19/09/2012
 */
Ext.define('Ext.ux.app.ViewController', {
    extend: 'Ext.app.ViewController',
    msgWait: t('Wait...'),
    msgConfirmationDelete: t('Really delete the record selected?'),
    titleSuccess: t('Success'),
    titleError: t('Error'),
    titleWarning: t('Warning'),
    titleConfirmation: t('Confirmation'),
    msgFormInvalid: t('Fill in the fields correctly.'),
    titleReport: undefined,
    params: {},
    isSubmitForm: false,
    control: {
        'form field': {
            keyup: 'onKeyUpField'
        }
    },
    msgConfirmation: 'Confirm delete',
    msgDeleteAll: 'Confirm delete all',
    nameSuccessRequest: 'success',
    nameMsgRequest: 'msg',
    init: function() {
        var me = this;
        me.titleReport = me.titleReport || t('Report of') + ' ' + me.type;
        me.callParent(arguments);
    },
    onRenderModule: function() {
        var me = this,
            idProperty,
            arrayIdProperty;
        me.list = me.lookupReference(me.type + 'list');
        me.formPanel = me.lookupReference(me.type + 'form');
        me.saveButton = me.lookupReference('save');
        me.updateLotButton = me.lookupReference('updateLot');
        me.updateLot = !App.user.isClient;
        me.store = me.list.store;
        idProperty = me.store.model.idProperty;
        arrayIdProperty = idProperty.replace(/ /g, "").split(',');
        me.idProperty = arrayIdProperty.length > 1 ? arrayIdProperty : idProperty;
        me.store.on('write', me.onWriteStore, me);
        me.store.getProxy().on('exception', me.onErrorAction, me);
        me.list.on('afterdestroy', me.onAfterDestroy, me);
        me.formPanel.on('aftersave', me.onAfterSave, me);
    },
    onDestroyModule: function() {
        var me = this;
        me.store.un('write', me.onWriteStore, me);
        me.store.getProxy().un('exception', me.onErrorAction, me);
        me.list.un('afterdestroy', me.onAfterDestroy, me);
        me.formPanel.un('aftersave', me.onAfterSave, me);
    },
    onNew: function() {
        var me = this;
        me.setReadOnlyPkComposite(false);
        me.formPanel.getForm().reset();
        me.formPanel.setLoading(false);
        me.formPanel.idRecord = 0;
        me.updateLotButton ? me.updateLotButton.toggle(false) : '';
        me.showHideFields();
        me.formPanel.expand();
        me.focusFirstField();
        me.formPanel.fireEvent('edit', me.formPanel);
    },
    onEdit: function() {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            idRecord = [];
        if (me.formHidden) {
            return;
        };
        if (!record) {
            return;
        };
        if (!Ext.isArray(me.idProperty)) {
            idRecord = record.get(me.idProperty);
        } else {
            Ext.each(me.idProperty, function(idProp) {
                idRecord.push(record.get(idProp));
            });
        }
        me.setReadOnlyPkComposite(true);
        me.formPanel.idRecord = idRecord;
        me.formPanel.recordStore = record;
        me.formPanel.loadRecord(record);
        me.formPanel.setLoading(false);
        me.saveButton.enable();
        me.showHideFields('edit');
        me.formPanel.expand();
        me.focusFirstField();
        me.formPanel.fireEvent('edit', me.formPanel);
    },
    showHideFields: function(type) {
        var me = this,
            fieldsHideCreate = me.formPanel.fieldsHideCreate || [],
            fieldsHideEdit = me.formPanel.fieldsHideEdit || [],
            fieldsHideUpdateLot = me.formPanel.fieldsHideUpdateLot || [],
            isCreate = me.formPanel.idRecord === 0;
        if (!fieldsHideCreate.length && !fieldsHideEdit.length && !fieldsHideUpdateLot.length) {
            return;
        }
        me.formPanel.getForm().getFields().each(function(field) {
            //mostra todos os campos que estao com fieldsHideUpdateLot
            if (fieldsHideUpdateLot.indexOf(field.name) !== -1) {
                field.setVisible(true);
            }
            if (fieldsHideCreate.indexOf(field.name) !== -1) {
                field.setVisible(!isCreate);
            }
            if (fieldsHideEdit.indexOf(field.name) !== -1) {
                field.setVisible(isCreate);
            }
            if (type == 'edit') {
                //oculta se é para ocultar no edit
                if (fieldsHideEdit.indexOf(field.name) !== -1) {
                    field.setVisible(false);
                }
            } else {
                if (fieldsHideEdit.indexOf(field.name) !== -1) {
                    field.setVisible(true);
                }
            }
            if (fieldsHideUpdateLot.indexOf(field.name) !== -1 && me.formPanel.isUpdateLot) {
                field.setVisible(!me.formPanel.isUpdateLot);
            }
            if (!field.isVisible()) {
                if (field.allowBlank === false) {
                    field.setAllowBlank(true);
                    field.originAllowBlank = false;
                }
            } else if (Ext.isDefined(field.originAllowBlank)) {
                field.setAllowBlank(field.originAllowBlank);
                field.allowBlank = field.originAllowBlank;
            }
        });
    },
    onSave: function() {
        var me = this,
            form = me.formPanel.getForm(),
            recordStore = form.getRecord() && me.store.findRecord(me.idProperty, form.getRecord().getId(), 0, false, false, true),
            values = form.getFieldValues(),
            updateLotType = me.updateLotButton && me.updateLotButton.menu.down('menucheckitem[checked=true]').value,
            filters = Ext.encode(me.list.filters.getFilterData()),
            ids = [],
            paramsLot = {},
            valuesLot = {},
            panelMoneyLot,
            fieldMoneyLot;
        Ext.apply(values, me.params);
        if (me.formPanel.idRecord) {
            if (!me.list.allowUpdate) {
                Ext.ux.Alert.alert(me.titleWarning, t('Edit disable'), 'warning');
                me.saveButton.disable();
                return;
            }
        } else {
            if (!me.list.allowCreate && !me.formPanel.isUpdateLot) {
                Ext.ux.Alert.alert(me.titleWarning, t('Create disable'), 'warning');
                me.saveButton.disable();
                return;
            }
        }
        if (!form.isValid()) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
            return;
        }
        me.saveButton.disable();
        me.formPanel.setLoading(me.msgWait);
        if (me.formPanel.isUpdateLot) {
            Ext.Object.each(values, function(key, value) {
                if (!Ext.isEmpty(value) && me.formPanel.fieldsHideUpdateLot.indexOf(key) === -1) {
                    panelMoneyLot = me.formPanel.down('#moneyFieldLot' + key);
                    if (panelMoneyLot && (panelMoneyLot.down('#add').pressed || panelMoneyLot.down('#remove').pressed || panelMoneyLot.down('#percent').pressed)) {
                        fieldMoneyLot = panelMoneyLot.down('field');
                        buttonAdd = panelMoneyLot.down('#add');
                        buttonRemove = panelMoneyLot.down('#remove');
                        buttonPercent = panelMoneyLot.down('#percent');
                        if (!Ext.isEmpty(fieldMoneyLot.getValue())) {
                            valuesLot[key] = {
                                value: fieldMoneyLot.getValue(),
                                isPercent: buttonPercent.pressed,
                                isAdd: buttonAdd.pressed,
                                isRemove: buttonRemove.pressed
                            };
                        }
                    } else if (panelMoneyLot && panelMoneyLot.down('field').getValue()) {
                        valuesLot[key] = panelMoneyLot.down('field').getValue();
                    } else if (!panelMoneyLot) {
                        valuesLot[key] = value;
                    }
                }
            });
            if (!Ext.Object.getSize(valuesLot)) {
                me.formPanel.setLoading(false);
                btn.enable();
                return;
            }
            if (updateLotType === 'all') {
                if (me.store.defaultFilter.length) {
                    Ext.apply(paramsLot, {
                        defaultFilter: Ext.encode(me.store.defaultFilter)
                    });
                };
                Ext.apply(paramsLot, {
                    filter: filters
                });
            } else {
                Ext.each(me.list.getSelectionModel().getSelection(), function(rec) {
                    ids.push(rec.get(me.idProperty));
                });
                valuesLot[me.idProperty] = ids;
            }
            Ext.apply(paramsLot, {
                rows: Ext.encode(valuesLot)
            });
            Ext.Ajax.request({
                url: me.store.getProxy().api.update,
                params: paramsLot,
                scope: me,
                success: function(response) {
                    response = Ext.decode(response.responseText);
                    if (response.success) {
                        Ext.ux.Alert.alert(me.titleSuccess, t(response.msg), 'success');
                        me.formPanel.fireEvent('aftersave', me.formPanel);
                    } else {
                        Ext.ux.Alert.alert(me.titleError, t(response.msg), 'error');
                    }
                    me.formPanel.setLoading(false);
                    me.saveButton.enable();
                    me.updateLotButton.toggle(false);
                    me.store.load();
                },
                failure: function(response) {
                    response = Ext.decode(response.responseText);
                    Ext.ux.Alert.alert(me.titleError, t(response.msg), 'error');
                    me.formPanel.setLoading(false);
                    me.saveButton.enable();
                }
            });
            return;
        }
        if (!me.formPanel.idRecord) {
            if (me.isSubmitForm === false) {
                recordStore = Ext.create(me.store.model.entityName);
                values[me.idProperty] = 0;
                recordStore.set(values);
                me.store.add(recordStore);
            } else {
                me.submitForm('create');
                return;
            }
        } else {
            if (me.isSubmitForm === false) {
                form.getRecord().set(values);
                recordStore.set(values);
                if (!me.store.getUpdatedRecords().length) {
                    me.saveButton.enable();
                    me.formPanel.setLoading(false);
                    return;
                }
            } else {
                me.submitForm('update');
                return;
            }
        }
        me.store.sync();
    },
    submitForm: function(values) {
        var me = this,
            store = me.store,
            params = [];
        params[me.idProperty] = me.formPanel.idRecord;
        me.formPanel.add({
            xtype: 'hiddenfield',
            name: me.idProperty,
            value: me.formPanel.idRecord
        });
        me.formPanel.getForm().submit({
            url: me.store.getProxy().api.create,
            params: params,
            scope: me,
            success: function(form, action) {
                var obj = Ext.decode(action.response.responseText);
                if (obj.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, t(obj.msg), 'success');
                    me.formPanel.fireEvent('aftersave', me.formPanel, obj.rows[0]);
                } else {
                    errors = Helper.Util.convertErrorsJsonToString(obj.msg);
                    if (!Ext.isObject(obj.errors)) {
                        Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                    } else {
                        form.markInvalid(obj.errors);
                        Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
                    }
                }
                me.formPanel.idRecord = obj.rows[0][me.idProperty];
                me.store.load();
                me.formPanel.setLoading(false);
                me.saveButton.enable();
            },
            failure: function(form, action) {
                var obj = Ext.decode(action.response.responseText),
                    errors = Helper.Util.convertErrorsJsonToString(obj.errors);
                if (!Ext.isObject(obj.errors)) {
                    Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                } else {
                    form.markInvalid(obj.errors);
                    Ext.ux.Alert.alert(me.titleWarning, t(errors), 'error');
                }
                me.formPanel.setLoading(false);
                me.saveButton.enable();
            }
        });
    },
    onCancel: function() {
        this.formPanel.collapse();
    },
    onSelectionChange: function(selModel, selections) {
        var me = this,
            btnDelete = me.lookupReference('delete'),
            checkItemSelected,
            checkItemAll;
        btnDelete && btnDelete.setDisabled(!selections.length);
        if (me.updateLotButton) {
            checkItemSelected = me.updateLotButton.menu.down('menucheckitem[value=selected]'),
                checkItemAll = me.updateLotButton.menu.down('menucheckitem[value=all]');
            if (selections.length < 1) {
                checkItemSelected.setChecked(false);
                checkItemSelected.disable();
                checkItemAll.setChecked(true);
            } else {
                if (selections.length && checkItemAll.checked) {
                    me.updateLotButton.toggle(false);
                }
                checkItemSelected.enable();
            }
        }
    },
    onDelete: function(btn) {
        var me = this,
            records,
            destroyType = btn.menu.down('menucheckitem[checked=true]').value;
        var msgConfirmation = (destroyType === 'all') ? t(me.msgDeleteAll) : t(me.msgConfirmation);
        if (!me.list.allowDelete) {
            return;
        }
        Ext.Msg.confirm(me.titleConfirmation, msgConfirmation, function(btn) {
            if (btn === 'yes') {
                records = me.list.getSelectionModel().getSelection(),
                    idProperty = records.length && records[0].idProperty,
                    filters = me.list.filters.getFilterData();
                if (destroyType === 'all') {
                    Ext.apply(filters, me.store.defaultFilter);
                    filters = Ext.encode(filters);
                    Ext.Ajax.request({
                        url: me.store.getProxy().api.destroy,
                        params: {
                            filter: filters
                        },
                        success: function(response) {
                            response = Ext.decode(response.responseText);
                            if (response.success) {
                                Ext.ux.Alert.alert(me.titleSuccess, t(response.msg), 'success');
                                me.formPanel.fireEvent('afterdestroy');
                                me.store.load();
                            } else {
                                var errors = Helper.Util.convertErrorsJsonToString(response.msg);
                                Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                                me.store.load();
                            }
                        }
                    });
                } else {
                    if (Ext.isArray(me.idProperty)) {
                        me.deleteCompositeKey(records);
                    } else {
                        me.store.remove(records);
                        me.store.sync();
                    }
                }
            }
        }, me);
    },
    destroyCompositeKey: function(records) {
        var me = this,
            arrRecords = [],
            objRecord;
        records = Ext.isArray(records) ? records : [records];
        Ext.each(records, function(record) {
            objRecord = {};
            Ext.each(me.idProperty, function(pk) {
                objRecord[pk] = record.get(pk);
            });
            arrRecords.push(Ext.clone(objRecord));
        });
        Ext.Ajax.request({
            url: me.store.getProxy().api.destroy,
            params: {
                rows: Ext.encode(arrRecords)
            },
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    Ext.ux.Alert.alert(me.titleSuccess, t(response.msg), 'success');
                    me.list.fireEvent('afterdestroy', me.formPanel);
                    me.store.load();
                } else {
                    Ext.ux.Alert.alert(me.titleError, t(response.msg), 'error');
                }
            }
        });
    },
    onCheckChangeUpdateLot: function() {
        this.updateLotButton.toggle(true);
    },
    onBulk: function() {
        var me = this,
            module = me.getView();
        Ext.widget(module.module + 'bulk', {
            title: module.titleModule,
            list: me.list
        });
    },
    onSpyCall: function() {
        var me = this,
            module = me.getView();
        Ext.widget(module.module + 'spycall', {
            title: module.titleModule,
            list: me.list
        });
    },
    onImportCsv: function() {
        var me = this,
            module = me.getView();
        Ext.widget(module.module + 'importcsv', {
            title: module.titleModule,
            list: me.list
        });
    },
    onExportCsv: function() {
        var me = this,
            sorters = me.store.sorters.items,
            filter = Ext.encode(me.list.filters.getFilterData()),
            group = me.store.getGroupField(),
            groupDir = me.store.getGroupDir(),
            gridColumns = me.list.columns,
            urlCsv = me.store.getProxy().api.csv,
            sort = [],
            columns = [];
        me.list.setLoading();
        Ext.each(sorters, function(itemSort) {
            sort.push(itemSort.getProperty() + ' ' + (itemSort.getDirection() || 'ASC'));
        });
        group && sort.push(group + ' ' + (groupDir || 'ASC'));
        Ext.each(gridColumns, function(column) {
            if (column.hidden === false && column.isCheckerHd !== true) {
                if (column.dataIndex === group) {
                    columns.splice(0, 0, {
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                } else {
                    columns.push({
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                }
            }
        });
        values = 'columns=' + Ext.encode(columns) + '&filter=' + filter + '&sort=' + Ext.encode(sort) + '&group=' + group;
        url = 'index.php/' + me.store.proxy.module + '/csv/?' + values;
        window.open(url);
        me.list.setLoading(false);
        /*     
        Ext.Ajax.request({
     url    : urlCsv,
     timeout:500000,
     params : {
         sort   : Ext.encode(sort),
         filter : filter,
         group  : group,
         columns: Ext.encode(columns)
     },
     scope  : me,
     success: function(response) {
         var response = Ext.decode(response.responseText);
         window.location.href = response.url;
         me.list.setLoading(false);
     }
        });
        */
    },
    onToggleUpdateLot: function(btn, pressed) {
        var me = this,
            fields = me.formPanel.getForm().getFields(),
            indexField,
            panelButtons,
            fieldClone,
            fieldMoneyLot;
        me.formPanel.isUpdateLot = pressed;
        if (pressed) {
            //active UPDATEALL METHOD
            me.onAfterDestroy();
            fields.each(function(field) {
                if (field.xtype === 'moneyfield' && field.isVisible() && me.formPanel.fieldsHideUpdateLot.indexOf(field.name) === -1) {
                    indexField = me.formPanel.items.indexOf(field);
                    field.setValue();
                    if (field.allowBlank === false) {
                        field.changeToLot = true;
                        field.setAllowBlank(true);
                    }
                    fieldClone = field.cloneConfig({
                        flex: 1,
                        allowBlank: true
                    });
                    field.hide();
                    field = fieldClone;
                    panelButtons = {
                        xtype: 'panel',
                        margin: '0 0 5 0',
                        itemId: 'moneyFieldLot' + field.name,
                        anchor: field.anchor,
                        border: false,
                        layout: 'hbox',
                        defaultType: 'button',
                        defaults: {
                            enableToggle: true
                        },
                        items: [field, {
                            toggleGroup: 'addRemove' + field.name,
                            text: '+',
                            itemId: 'add',
                            listeners: {
                                toggle: function(btn, pressed) {
                                    if (!pressed && !btn.up('panel').down('#remove').pressed) {
                                        btn.up('panel').down('#percent').toggle(false, true);
                                    }
                                }
                            }
                        }, {
                            toggleGroup: 'addRemove' + field.name,
                            text: '-',
                            itemId: 'remove',
                            listeners: {
                                toggle: function(btn, pressed) {
                                    if (!pressed && !btn.up('panel').down('#add').pressed) {
                                        btn.up('panel').down('#percent').toggle(false, true);
                                    }
                                }
                            }
                        }, {
                            text: '%',
                            itemId: 'percent',
                            listeners: {
                                toggle: function(btn, pressed) {
                                    if (btn.up('panel').down('#add').pressed || btn.up('panel').down('#remove').pressed) {
                                        field.setMask(pressed ? '% #9.999.990,000' : App.user.currency + ' #9.999.990,000');
                                    } else {
                                        btn.toggle(false, true);
                                    }
                                }
                            }
                        }]
                    }
                    me.formPanel.insert(++indexField, panelButtons);
                }
                if (field.items && field.xtype.indexOf("/lookup/")) field.items.items[0].setRawValue();
                else field.setRawValue();
                if (field.allowBlank === false) {
                    field.changeToLot = true;
                    field.setAllowBlank(true);
                }
            });
            me.showHideFields();
            me.formPanel.expand();
        } else {
            fields.each(function(field) {
                if (field.changeToLot) {
                    fieldMoneyLot = me.formPanel.down('#moneyFieldLot' + field.name + ' field');
                    if (fieldMoneyLot) {
                        me.formPanel.getForm().findField(fieldMoneyLot.name).show();
                        me.formPanel.remove(fieldMoneyLot.up('panel'))
                    }
                    field.setAllowBlank(false);
                }
            });
        }
    },
    onPrint: function(btn) {
        btn = btn.isButton ? btn : this.list.down('#btnPrint');
        var me = this,
            desktop = window.isDesktop && App.desktop,
            tabPanel = !window.isDesktop && me.list.module.ownerCt,
            sorters = me.store.sorters.items,
            filter = Ext.encode(me.list.filters.getFilterData()),
            group = me.store.getGroupField(),
            groupDir = me.store.getGroupDir(),
            gridColumns = me.list.columns,
            orientation = btn.menu.down('menucheckitem[checked=true]').value,
            urlReport = me.store.getProxy().api.report,
            tabOpen,
            sort = [],
            columns = [];
        Ext.each(sorters, function(itemSort) {
            sort.push(itemSort.getProperty() + ' ' + (itemSort.getDirection() || 'ASC'));
        });
        group && sort.push(group + ' ' + (groupDir || 'ASC'));
        Ext.each(gridColumns, function(column) {
            if (column.hidden === false && column.isCheckerHd !== true) {
                if (column.dataIndex === group) {
                    columns.splice(0, 0, {
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                } else {
                    columns.push({
                        header: column.text,
                        dataIndex: column.dataIndex
                    });
                }
            }
        });
        values = 'columns=' + Ext.encode(columns) + '&filter=' + filter + '&sort=' + Ext.encode(sort) + '&group=' + group + '&orientation=' + orientation;
        url = 'index.php/' + me.store.proxy.module + '/report/?' + values;
        window.open(url);
    },
    destroyReport: function() {
        Ext.Ajax.request({
            url: this.store.getProxy().api.destroyReport
        });
    },
    onAfterDestroy: function(formPanel) {
        var me = this;
        formPanel = formPanel || me.formPanel;
        formPanel.getForm().reset();
        formPanel.idRecord = 0;
        me.focusFirstField();
    },
    onAfterSave: function(formPanel) {
        var me = this;
        formPanel = formPanel || me.formPanel;
        if (!formPanel.idRecord) {
            formPanel.getForm().reset();
            me.focusFirstField();
        }
        me.saveButton.enable();
        me.updateLotButton && me.updateLotButton.toggle(false);
        formPanel.setLoading(false);
        me.formPanel.collapse();
        me.store.load();
    },
    onExpandForm: function() {
        this.focusFirstField();
    },
    focusFirstField: function() {
        var me = this,
            fieldFocus = me.formPanel.down('field[disabled=false]');
        fieldFocus && fieldFocus.focus(false, 10);
    },
    onKeyUpField: function(field, evt) {
        if (evt.getKey() === evt.ENTER && field.xtype !== 'textarea') {
            this.onSave();
        }
    },
    onErrorAction: function(proxy, response) {
        var me = this;
        if (response.responseText && response.responseText.substr(0, 1) == '{') {
            obj = Ext.decode(response.responseText);
            if (!Ext.isObject(obj.errors)) {
                Ext.ux.Alert.alert(me.titleError, t(obj.errors), 'error');
            } else {
                errors = Helper.Util.convertErrorsJsonToString(obj.errors);
                Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                me.formPanel.getForm().markInvalid(obj.errors);
            }
            me.store.load();
        } else {
            errors = response.responseText ? response.responseText.substr(0, 220) : 'Php Error';
            if (errors.match(/Access denied to./)) {
                sessionStorage.setItem('session', '1');
                Ext.Ajax.request({
                    url: 'index.php/authentication/logoff',
                    success: function() {
                        App.user.logged = false;
                    }
                });
                Ext.ux.Alert.alert(me.titleError, t(errors), 'error');
                setTimeout(function() {
                    location.reload()
                }, 5000);
            }
            //Ext.ux.Alert.alert(me.titleError,  errors , 'notification');
        }
        me.formPanel.setLoading(false);
        me.list.setLoading(false);
        me.saveButton.enable();
    },
    onWriteStore: function(proxy, operation) {
        var me = this,
            obj = Ext.decode(operation.getResponse().responseText);
        if (obj.success) {
            Ext.ux.Alert.alert(me.titleSuccess, t(obj.msg), 'success');
            if (operation.action === 'destroy') {
                me.list.fireEvent('afterdestroy', me.formPanel);
            } else {
                me.formPanel.fireEvent('aftersave', me.formPanel);
            }
        } else {
            if (!Ext.isObject(obj.errors)) {
                Ext.ux.Alert.alert(me.titleError, t(obj.errors), 'error');
            } else {
                me.formPanel.getForm().markInvalid(obj.errors);
                Ext.ux.Alert.alert(me.titleWarning, me.msgFormInvalid, 'warning');
            }
            me.store.load();
        }
        me.formPanel.setLoading(false);
        me.list.setLoading(false);
        me.saveButton.enable();
    },
    setReadOnlyPkComposite: function(readOnly) {
        var me = this;
        if (!Ext.isArray(me.idProperty)) {
            return;
        }
        Ext.each(me.idProperty, function(pk) {
            me.formPanel.getForm().findField(pk).setReadOnly(readOnly);
        });
    }
});