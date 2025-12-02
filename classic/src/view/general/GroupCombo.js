/**
 * Classe que define a combo "GroupCombo"
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
 * 17/08/2012
 */
Ext.define('MBilling.view.general.GroupCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.groupcombo',
    fieldLabel: t('Group'),
    value: 'config_group_title',
    forceSelection: true,
    editable: false,
    store: [
        ['global', 'global'],
        ['callback', 'callback'],
        ['agi-conf1', 'agi-conf1'],
        ['agi-conf2', 'agi-conf2']
    ]
});
Ext.define('MBilling.view.general.StateCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.statecombo',
    name: 'state',
    fieldLabel: t('State'),
    displayField: 'nome',
    valueField: 'sigla',
    forceSelection: true,
    editable: false,
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Signup', {
            proxy: {
                type: 'uxproxy',
                module: 'signup',
                limitParam: undefined,
                actionRead: 'getSignupStates'
            }
        });
        me.callParent(arguments);
    }
});