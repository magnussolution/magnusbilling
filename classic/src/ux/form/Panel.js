/**
 * Class to creation of forms
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 14/07/2014
 */
Ext.define('Ext.ux.form.Panel', {
    extend: 'Ext.form.Panel',
    requires: ['Ext.form.field.Date', 'Ext.form.field.Checkbox', 'Ext.form.field.Number', 'Ext.form.field.Date', 'Ext.form.field.Time', 'Ext.form.field.Tag', 'Ext.ux.form.field.DateTime', 'Ext.ux.form.field.Float', 'Ext.ux.form.field.Money'],
    bodyPadding: 5,
    autoScroll: true,
    border: false,
    allowCreate: true,
    allowUpdate: true,
    defaultType: 'textfield',
    layout: 'anchor',
    idRecord: 0,
    textNew: t('New'),
    glyphNew: icons.file,
    textSave: t('Save'),
    glyphSave: icons.disk,
    textCancel: t('Cancel'),
    glyphCancel: icons.stop,
    alignButtonsBottom: '->',
    defaults: {
        plugins: 'markallowblank',
        allowBlank: false,
        anchor: '100%',
        enableKeyEvents: true
    },
    buttonsTbar: [],
    labelWidthFields: 100,
    labelAlignFields: 'right',
    header: window.isTablet || window.isTablets ? false : '',
    fieldsHideUpdateLot: [],
    initComponent: function() {
        var me = this;
        var formName = me.xtype.slice(0, -4);
        eval('var ' + "modulename" + '= ' + 'window.module_extra_form_' + formName + ';');
        if (modulename) {
            var theobj = JSON.parse(modulename);
            if (me.items[0].xtype == 'tabpanel') {
                if (theobj.items[0].hidden) {
                    switch (theobj.items[0].hidden) {
                        case 'App.user.isClient':
                            value = App.user.isClient;
                            break;
                        case 'App.user.isAdmin':
                            value = App.user.isAdmin;
                            break;
                        case 'App.user.isAgent':
                            value = App.user.isAgent;
                            break;
                        case 'App.user.isClientAgent':
                            value = App.user.isClientAgent;
                            break;
                        case '!App.user.isClient':
                            value = !App.user.isClient;
                            break;
                        case '!App.user.isAdmin':
                            value = !App.user.isAdmin;
                            break;
                        case '!App.user.isAgent':
                            value = !App.user.isAgent;
                            break;
                        case '!App.user.isClientAgent':
                            value = !App.user.isClientAgent;
                            break;
                    }
                    theobj.items[0].hidden = value;
                }
                me.items[0].items.push(theobj);
            } else {
                if (theobj.hidden) {
                    switch (theobj.hidden) {
                        case 'App.user.isClient':
                            value = App.user.isClient;
                            break;
                        case 'App.user.isAdmin':
                            value = App.user.isAdmin;
                            break;
                        case 'App.user.isAgent':
                            value = App.user.isAgent;
                            break;
                        case 'App.user.isClientAgent':
                            value = App.user.isClientAgent;
                            break;
                        case '!App.user.isClient':
                            value = !App.user.isClient;
                            break;
                        case '!App.user.isAdmin':
                            value = !App.user.isAdmin;
                            break;
                        case '!App.user.isAgent':
                            value = !App.user.isAgent;
                            break;
                        case '!App.user.isClientAgent':
                            value = !App.user.isClientAgent;
                            break;
                    }
                    theobj.hidden = value;
                }
                me.items.push(theobj);
            }
        }
        if (me.items && App.user.isAdmin && App.user.show_filed_help == true) {
            if (me.items[0].xtype == 'tabpanel') {
                me.items[0].items.forEach(function(tab) {
                    tab.items.forEach(function(field) {
                        if (field.xtype == 'fieldcontainer') {
                            field.items.forEach(function(field) {
                                var helpString = h(formName + '.' + field.name);
                                if (helpString.length > 10) field.fieldLabel = field.fieldLabel + ' ' + helpString
                            });
                        } else if (field.xtype == 'fieldset') {
                            field.items.forEach(function(field) {
                                var helpString = h(formName + '.' + field.name);
                                if (helpString.length > 10) field.fieldLabel = field.fieldLabel + ' ' + helpString
                            });
                        } else {
                            var helpString = h(formName + '.' + field.name);
                            if (helpString.length > 10) field.fieldLabel = field.fieldLabel + ' ' + helpString
                        }
                    });
                });
            } else {
                for (var i in me.items) {
                    if (me.items[i].xtype == 'fieldset') {
                        me.items[i].items.forEach(function(field) {
                            var helpString = h(formName + '.' + field.name);
                            if (helpString.length > 10) field.fieldLabel = field.fieldLabel + ' ' + helpString
                        });
                    } else {
                        var helpString = h(formName + '.' + me.items[i].name);
                        if (helpString.length > 10) me.items[i].fieldLabel = me.items[i].fieldLabel + ' ' + helpString
                    }
                }
            }
        }
        Ext.applyIf(me.defaults, {
            anchor: '0',
            enableKeyEvents: true,
            labelAlign: me.labelAlignFields,
            labelWidth: me.labelWidthFields,
            msgTarget: 'side',
            plugins: 'markallowblank',
            allowBlank: false
        });
        me.dockedItems = [];
        itemsTbar = me.buttonsTbar.length ? me.buttonsTbar : [{
            xtype: 'tbtext'
        }, me.alignButtonsBottom, {
            reference: 'save',
            text: me.textSave,
            width: 90,
            glyph: me.glyphSave,
            handler: 'onSave',
            hidden: !me.allowCreate && !me.allowUpdate
        }, {
            text: me.textCancel,
            width: 100,
            glyph: me.glyphCancel,
            handler: 'onCancel'
        }];
        if (me.extraButtons && me.extraButtons.length) {
            itemsTbar = Ext.Array.merge(me.extraButtons, itemsTbar);
        };
        me.hideTbar = Ext.isDefined(me.hideTbar) ? me.hideTbar : !me.allowCreate;
        me.hideBbar = me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            items: itemsTbar
        }];
        me.callParent(arguments);
    }
});