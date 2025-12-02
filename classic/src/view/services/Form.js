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
 * 19/09/2012
 */
Ext.define('MBilling.view.services.Form', {
    extend: 'Ext.ux.form.Panel',
    requires: ['Ext.ux.form.field.Permission'],
    alias: 'widget.servicesform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'tabpanel',
            defaults: {
                border: false,
                defaultType: 'textfield',
                layout: 'anchor',
                bodyPadding: 5,
                defaults: {
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%'
                }
            },
            items: [{
                title: t('General'),
                reference: 'generalTab',
                items: [{
                    xtype: 'servicestypecombo',
                    name: 'type',
                    fieldLabel: t('Type'),
                    allowBlank: true,
                    hidden: App.user.isClient
                }, {
                    name: 'name',
                    fieldLabel: t('Name'),
                    readOnly: App.user.isClient
                }, {
                    name: 'calllimit',
                    fieldLabel: t('Call limit'),
                    allowBlank: true,
                    hidden: true,
                    readOnly: App.user.isClient
                }, {
                    name: 'disk_space',
                    fieldLabel: t('Disk space'),
                    allowBlank: true,
                    hidden: true,
                    readOnly: App.user.isClient
                }, {
                    name: 'sipaccountlimit',
                    fieldLabel: t('SIP account limit'),
                    allowBlank: true,
                    hidden: true,
                    readOnly: App.user.isClient
                }, {
                    xtype: 'moneyfield',
                    name: 'price',
                    fieldLabel: t('Price'),
                    mask: App.user.currency + ' #9.999.990,00',
                    readOnly: App.user.isClient
                }, {
                    xtype: 'yesnocombo',
                    name: 'return_credit',
                    fieldLabel: t('Return credit'),
                    hidden: !App.user.isAdmin
                }, {
                    xtype: 'textarea',
                    name: 'description',
                    fieldLabel: t('Description'),
                    allowBlank: true,
                    hidden: App.user.isClient,
                    height: 100,
                    anchor: '100%'
                }]
            }, {
                hidden: App.user.isClient,
                title: t('Actions'),
                items: [{
                    xtype: 'permissionfield',
                    buttonAddPermissionTitle: t('Add permissions for this service'),
                    hideLabel: true,
                    anchor: '100% ' + (!Ext.Boot.platformTags.desktop ? '82%' : window.isThemeNeptune ? '87%' : '89%'),
                    allowBlank: true,
                    hidden: App.user.isClient
                }]
            }]
        }];
        me.callParent(arguments);
    }
});