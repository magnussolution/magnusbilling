/**
 * Classe que define o form de "CallShop"
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
 * 19/09/2012
 */
Ext.define('MBilling.view.callShop.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callshopform',
    hideTbar: true,
    labelWidthFields: '60%',
    bodyPadding: 1,
    layout: 'fit',
    buttonsTbar: [{
        xtype: 'tbtext',
        itemId: 'priceSum'
    }, '->', {
        text: 'Cobrar',
        itemId: 'charge',
        iconCls: 'buycredit',
        urlAction: 'index.php/callShop/cobrar',
        disabled: true,
        handler: 'sendAction',
        width: 100
    }, {
        text: 'Liberar',
        itemId: 'release',
        iconCls: 'release',
        urlAction: 'index.php/callShop/liberar',
        disabled: true,
        handler: 'sendAction',
        width: 100
    }, {
        text: t('Print'),
        itemId: 'print',
        glyph: icons.print,
        urlAction: 'index.php/callShop/report',
        disabled: true,
        handler: 'reportCallshopClient',
        width: 100
    }],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'callshopcdrlist',
            buttonCsv: false,
            filterableColumns: false,
            buttonCleanFilter: false,
            autoLoadStore: false,
            border: true,
            allowCreate: false,
            allowUpdate: false,
            allowDelete: false,
            buttonUpdateLot: false,
            pagination: false,
            allowPrint: false,
            columnsHide: ['status', 'buycost', 'markup'],
            store: Ext.create('MBilling.store.CallShopCdr', {
                remoteSort: false
            })
        }];
        me.callParent(arguments);
    }
});