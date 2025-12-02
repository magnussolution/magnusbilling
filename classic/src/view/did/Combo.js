/**
 * Classe que define a combo de "DidCombo"
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
 * 10/07/2012
 */
Ext.define('MBilling.view.did.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.didcombo',
    name: 'id_did',
    fieldLabel: t('DID'),
    displayField: 'did',
    forceSelection: true,
    editable: true,
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Did', {
            proxy: {
                type: 'uxproxy',
                module: 'did',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});
Ext.define('MBilling.view.did.BuyCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.didbuycombo',
    name: 'id_did',
    forceSelection: true,
    editable: false,
    fieldLabel: t('DID'),
    displayField: 'did',
    valueField: 'id',
    triggerAction: 'all',
    multiSelect: true,
    initComponent: function() {
        var me = this;
        me.listConfig = {
            itemTpl: Ext.create('Ext.XTemplate', '<div>{did}  (' + t('Setup') + ': ' + App.user.currency + ' {connection_charge} --> ' + t('Monthly payment') + ': ' + App.user.currency + ' {fixrate})</div>')
        };
        me.displayTpl = Ext.create('Ext.XTemplate', '<tpl for="."> {did}</tpl>');
        me.store = Ext.create('MBilling.store.Did', {
            proxy: {
                type: 'uxproxy',
                module: 'did',
                actionRead: 'readBuy',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});