/**
 * Classe que define o panel de "CallSummary"
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
 * 05/11/2012
 */
Ext.define('MBilling.view.callSummaryMonthTrunk.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callsummarymonthtrunkform',
    defaults: {},
    labelWidthFields: 150,
    defaultType: 'displayfield',
    initComponent: function() {
        var me = this;
        me.allowUpdate = false;
        me.allowCreate = false;
        me.items = [{
            name: 'sumsessiontime',
            fieldLabel: t('Duration'),
            renderer: Ext.util.Format.numberRenderer('0'),
            allowBlank: true
        }, {
            name: 'sumsessionbill',
            fieldLabel: t('Sell price'),
            renderer: Helper.Util.formatMoneyDecimal,
            allowBlank: true,
            hidden: App.user.hidden_prices == 1
        }, {
            name: 'sumbuycost',
            fieldLabel: t('Buy price'),
            renderer: Helper.Util.formatMoneyDecimal,
            hidden: !App.user.isAdmin || App.user.hidden_prices == 1,
            allowBlank: true
        }, {
            name: 'sumlucro',
            fieldLabel: t('Markup'),
            renderer: Helper.Util.formatMoneyDecimal,
            hidden: !App.user.isAdmin || App.user.hidden_prices == 1,
            allowBlank: true
        }, {
            name: 'sumnbcall',
            fieldLabel: t('Total calls'),
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});