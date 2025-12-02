/**
 * Classe que define a combo de "prefixcombo"
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
 * 01/08/2012
 */
Ext.define('MBilling.view.prefix.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.prefixcombo',
    name: 'id_prefix',
    fieldLabel: t('Destination'),
    displayField: 'prefix',
    filterMode: 'remote',
    valueField: 'id',
    listConfig: {
        itemTpl: Ext.create('Ext.XTemplate', '<div>{prefix} - {destination}</div>')
    },
    displayTpl: Ext.create('Ext.XTemplate', '<tpl for=".">{prefix} - {destination}</tpl>'),
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.PrefixCombo', {
            proxy: {
                type: 'uxproxy',
                module: 'prefixCombo',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});