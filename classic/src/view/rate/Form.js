/**
 * Classe que define o form de "Rate"
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
Ext.define('MBilling.view.rate.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.rateform',
    fieldsHideUpdateLot: ['id_prefix'],
    initComponent: function() {
        var me = this;
        me.defaults = {
            labelWidth: 200
        };
        me.items = [{
            xtype: 'planlookup',
            ownerForm: me,
            name: 'id_plan',
            fieldLabel: t('Plan'),
            hidden: App.user.isClient,
            allowBlank: false
        }, {
            xtype: 'prefixlookup',
            ownerForm: me,
            name: 'id_prefix',
            fieldLabel: t('Destination'),
            hidden: App.user.isClient,
            allowBlank: false
        }, {
            xtype: 'trunkgrouplookup',
            ownerForm: me,
            name: 'id_trunk_group',
            fieldLabel: t('Trunk groups'),
            hidden: !App.user.isAdmin,
            allowBlank: !App.user.isAdmin
        }, {
            xtype: 'moneyfield',
            name: 'rateinitial',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            minValue: 0,
            readOnly: App.user.isClient,
            hidden: App.user.hidden_prices == 1
        }, {
            xtype: 'numberfield',
            name: 'initblock',
            fieldLabel: t('Initial block'),
            value: 1,
            minValue: 1,
            hidden: App.user.isClient
        }, {
            xtype: 'numberfield',
            name: 'billingblock',
            fieldLabel: t('Billing block'),
            value: 1,
            minValue: 1,
            hidden: App.user.isClient
        }, {
            xtype: 'numberfield',
            name: 'minimal_time_charge',
            fieldLabel: t('Minimum time to charge'),
            value: 0,
            minValue: 0,
            hidden: App.user.isClient
        }, {
            name: 'additional_grace',
            fieldLabel: t('Additional time'),
            allowBlank: true,
            value: 0,
            minValue: 0,
            hidden: !App.user.isAdmin
        }, {
            xtype: 'moneyfield',
            name: 'connectcharge',
            fieldLabel: t('Connection charge'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isClient,
            minValue: 0,
            hidden: App.user.hidden_prices == 1
        }, {
            xtype: 'noyescombo',
            name: 'package_offer',
            fieldLabel: t('Include in offer'),
            hidden: App.user.isClient,
            allowBlank: true
        }, {
            xtype: 'booleancombo',
            name: 'status',
            fieldLabel: t('Status'),
            hidden: !App.user.isAdmin,
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});