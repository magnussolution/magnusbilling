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
Ext.define('MBilling.view.userRate.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.userrateform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: !App.user.isAdmin ? 'textfield' : 'userlookup',
            ownerForm: me,
            fieldLabel: t('Username'),
            name: 'id_user',
            hidden: !App.user.isAdmin,
            allowBlank: !App.user.isAdmin
        }, {
            xtype: 'prefixlookup',
            ownerForm: me,
            name: 'id_prefix',
            fieldLabel: t('Destination'),
            hidden: !App.user.isAdmin,
            allowBlank: !App.user.isAdmin
        }, {
            xtype: 'moneyfield',
            name: 'rateinitial',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isClient
        }, {
            xtype: 'numberfield',
            name: 'initblock',
            fieldLabel: t('Initial block'),
            hidden: App.user.isClient
        }, {
            xtype: 'numberfield',
            name: 'billingblock',
            fieldLabel: t('Billing block'),
            hidden: App.user.isClient
        }];
        me.callParent(arguments);
    }
});