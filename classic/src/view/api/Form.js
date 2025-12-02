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
Ext.define('MBilling.view.api.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.apiform',
    initComponent: function() {
        var me = this;
        t('Field list');
        t('We did not write the description to this field');
        t('Click to more details');
        t('You can see more details at the link');
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient,
            allowBlank: App.user.isClient
        }, {
            name: 'api_key',
            fieldLabel: t('Api key')
        }, {
            name: 'api_secret',
            fieldLabel: t('Api secret')
        }, {
            xtype: 'booleancombo',
            name: 'status',
            fieldLabel: t('Status'),
            allowBlank: true
        }, {
            xtype: 'checkboxgroup',
            columns: 4,
            allowBlank: true,
            name: 'action',
            fieldLabel: t('Permissions'),
            items: [{
                boxLabel: t('Read'),
                name: 'action',
                inputValue: 'r',
                checked: true
            }, {
                boxLabel: t('Create'),
                name: 'action',
                inputValue: 'c'
            }, {
                boxLabel: t('Edit'),
                name: 'action',
                inputValue: 'u'
            }, {
                boxLabel: t('Delete'),
                name: 'action',
                inputValue: 'd',
                allowBlank: true
            }]
        }, {
            xtype: 'textareafield',
            name: 'api_restriction_ips',
            fieldLabel: t('Restriction IPs'),
            emptyText: t('Comma separated. EX: 200.200.200.200, 200.2.5.88'),
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});