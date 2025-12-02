/**
 * Classe que define o form de "RestrictedPhonenumber"
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
 * 24/09/2012
 */
Ext.define('MBilling.view.restrictedPhonenumber.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.restrictedphonenumberform',
    fieldsHideUpdateLot: ['id_user'],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient,
            readOnly: App.user.isClient,
            allowBlank: App.user.isClient
        }, {
            name: 'number',
            fieldLabel: t('Number')
        }, {
            xtype: 'combobox',
            name: 'direction',
            fieldLabel: t('Direction'),
            forceSelection: true,
            editable: false,
            value: '1',
            store: window.dialC ? [
                [1, t('Outbound')],
                [2, t('Inbound')],
                [3, t('Outbound & CallerID')],
                [4, t('CallerID')]
            ] : [
                [1, t('Outbound')],
                [2, t('Inbound')]
            ]
        }];
        me.callParent(arguments);
    }
});