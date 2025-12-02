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
Ext.define('MBilling.view.refill.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.refillform',
    fieldsHideUpdateLot: ['id_user'],
    fileUpload: true,
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient
        }, {
            xtype: 'moneyfield',
            name: 'credit',
            fieldLabel: t('Credit'),
            mask: App.user.currency + ' #9.999.990,00',
            readOnly: App.user.isClient
        }, {
            xtype: 'textareafield',
            name: 'description',
            fieldLabel: t('Description'),
            readOnly: App.user.isClient
        }, {
            xtype: 'yesnocombo',
            name: 'payment',
            fieldLabel: t('Add payment'),
            hidden: App.user.isClient
        }, {
            xtype: 'datetimefield',
            name: 'date',
            fieldLabel: t('Date'),
            format: 'Y-m-d H:i:s',
            hidden: !App.user.isAdmin,
            value: new Date()
        }, {
            name: 'invoice_number',
            fieldLabel: t('Invoice number'),
            hidden: !window.invoice,
            allowBlank: true
        }, {
            xtype: 'filefield',
            name: 'image',
            fieldLabel: t('Payment receipt'),
            emptyText: t('Only JPG or PNG Files allowed'),
            allowBlank: true,
            extAllowed: ['png', 'jpeg', 'jpg'],
            hidden: !App.user.isAdmin,
            listeners: {
                afterrender: function(cmp) {
                    cmp.fileInputEl.set({
                        accept: 'image/*' // or w/e type
                    });
                }
            }
        }, {
            xtype: 'box',
            id: 'imagePreview',
            width: '100%',
            html: ''
        }];
        me.callParent(arguments);
    }
});