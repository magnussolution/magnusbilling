/**
 * Classe que define o form de "Call"
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
Ext.define('MBilling.view.callArchive.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callarchiveform',
    fieldsHideUpdateLot: ['calledstation'],
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'calledstation',
            fieldLabel: t('Number'),
            readOnly: true
        }, {
            name: 'sessiontime',
            fieldLabel: t('Duration'),
            readOnly: App.user.isClient || App.user.isAgent,
            hidden: App.user.isClient || App.user.isAgent
        }, {
            xtype: 'moneyfield',
            name: 'buycost',
            fieldLabel: t('Buy price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            hidden: App.user.isClient || App.user.isAgent
        }, {
            xtype: 'moneyfield',
            name: 'sessionbill',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isClient || App.user.isAgent,
            hidden: App.user.isAgent || App.user.isClientAgent
        }, {
            xtype: 'moneyfield',
            name: 'agent_bill',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isAgent,
            hidden: !App.user.isAgent && !App.user.isClientAgent
        }];
        me.callParent(arguments);
    }
});