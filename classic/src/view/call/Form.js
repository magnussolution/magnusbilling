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
Ext.define('MBilling.view.call.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callform',
    fieldsHideUpdateLot: ['calledstation'],
    initComponent: function() {
        var me = this;
        me.extraButtons = [{
            text: '<font color=green>' + t('Download REC') + '</font>',
            iconCls: 'call',
            handler: 'onRecordCall',
            width: 130,
            height: 30,
            hidden: !window.isTablet
        }];
        me.defaults = {
            readOnly: true,
            allowBlank: true
        };
        me.items = [{
            xtype: 'datetimefield',
            name: 'starttime',
            fieldLabel: t('Date'),
            format: 'Y-m-d H:i:s'
        }, {
            name: 'src',
            fieldLabel: t('Sip user')
        }, {
            name: 'callerid',
            fieldLabel: t('CallerID')
        }, {
            name: 'calledstation',
            fieldLabel: t('Number')
        }, {
            name: 'idPrefixdestination',
            fieldLabel: t('Destination')
        }, {
            name: 'idUserusername',
            fieldLabel: t('Username')
        }, {
            name: 'idTrunktrunkcode',
            fieldLabel: t('Trunk')
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
            hidden: App.user.isClient || App.user.isAgent || App.user.hidden_prices == 1,
            readOnly: !App.user.isAdmin
        }, {
            xtype: 'moneyfield',
            name: 'sessionbill',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isClient || App.user.isAgent,
            hidden: App.user.isAgent || App.user.isClientAgent || App.user.hidden_prices == 1
        }, {
            xtype: 'moneyfield',
            name: 'agent_bill',
            fieldLabel: t('Sell price'),
            mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
            readOnly: App.user.isAgent,
            hidden: !App.user.isAgent && !App.user.isClientAgent
        }, {
            name: 'uniqueid',
            fieldLabel: t('Uniqueid')
        }, {
            xtype: 'displayfield',
            name: 'terminatecauseid',
            fieldLabel: t('Hangup Source'),
            renderer: function(value) {
                return value == 1 ? t('Sip user') : t('Other');
            },
            hidden: !window.dialC
        }];
        me.callParent(arguments);
    }
});