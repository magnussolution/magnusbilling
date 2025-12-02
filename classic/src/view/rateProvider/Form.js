/**
 * Classe que define o form de "RateCallshop"
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
 * 30/07/2012
 */
Ext.define('MBilling.view.rateProvider.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.rateproviderform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'providerlookup',
            ownerForm: me,
            name: 'id_provider',
            fieldLabel: t('Provider name'),
            allowBlank: false
        }, {
            xtype: 'prefixlookup',
            ownerForm: me,
            name: 'id_prefix',
            fieldLabel: t('Destination'),
            allowBlank: false
        }, {
            xtype: 'moneyfield',
            name: 'buyrate',
            fieldLabel: t('Buy price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            minValue: 0,
            hidden: App.user.hidden_prices == 1
        }, {
            xtype: 'numberfield',
            name: 'buyrateinitblock',
            fieldLabel: t('Buy price initblock'),
            value: 1,
            minValue: 1
        }, {
            xtype: 'numberfield',
            name: 'buyrateincrement',
            fieldLabel: t('Buy price increment'),
            value: 1,
            minValue: 1
        }, {
            xtype: 'numberfield',
            name: 'minimal_time_buy',
            fieldLabel: t('Minimum time to buy'),
            value: 0,
            minValue: 0
        }];
        me.callParent(arguments);
    }
});