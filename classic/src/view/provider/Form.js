/**
 * Classe que define o form de "Admin"
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
 * 25/06/2012
 */
Ext.define('MBilling.view.provider.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.providerform',
    fieldsHideUpdateLot: ['provider_name'],
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'provider_name',
            fieldLabel: t('Name')
        }, {
            xtype: 'moneyfield',
            name: 'credit',
            fieldLabel: t('Credit'),
            mask: App.user.currency + ' #9.999.990,00',
            value: '0'
        }, {
            xtype: 'noyescombo',
            name: 'credit_control',
            fieldLabel: t('Credit control'),
            hidden: App.user.isClient
        }, {
            xtype: 'textareafield',
            name: 'description',
            fieldLabel: t('Description'),
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});