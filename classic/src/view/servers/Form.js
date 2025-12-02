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
Ext.define('MBilling.view.servers.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.serversform',
    fieldsHideUpdateLot: ['id_user'],
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'name',
            fieldLabel: t('Name')
        }, {
            name: 'host',
            fieldLabel: t('Server IP')
        }, {
            name: 'public_ip',
            fieldLabel: t('Public IP'),
            allowBlank: true
        }, {
            name: 'username',
            fieldLabel: t('Username'),
            allowBlank: true
        }, {
            name: 'password',
            fieldLabel: t('Password'),
            allowBlank: true
        }, {
            name: 'port',
            fieldLabel: t('Port'),
            allowBlank: true
        }, {
            name: 'sip_port',
            fieldLabel: t('SIPport'),
            value: '5060',
            allowBlank: true
        }, {
            xtype: 'combobox',
            name: 'type',
            fieldLabel: t('Type'),
            forceSelection: true,
            editable: false,
            value: 'mbilling',
            store: [
                ['mbilling', t('MagnusBilling')],
                ['asterisk', t('Asterisk')],
                ['sipproxy', t('SipProxy')]
            ]
        }, {
            name: 'weight',
            fieldLabel: t('Weight'),
            hidden: true,
            allowBlank: true,
            emptyText: t('This is useful in order to get a different ratio of traffic between servers.')
        }, {
            xtype: 'booleancombo',
            name: 'status',
            fieldLabel: t('Status'),
            forceSelection: true,
            editable: false,
            value: '1',
            store: [
                [1, t('Active')],
                [0, t('Inactive')],
                [2, t('OffLine')],
                [4, t('Alert')]
            ]
        }, {
            xtype: 'fieldset',
            style: 'margin-top:10px; overflow: visible;',
            title: t('Select one or more slave.'),
            collapsible: true,
            reference: 'id_server',
            height: 100,
            collapsed: false,
            items: [{
                xtype: 'serverstag',
                name: 'id_server',
                fieldLabel: t(''),
                labelWidth: 10,
                anchor: '100%',
                allowBlank: true
            }]
        }, {
            xtype: 'textareafield',
            name: 'description',
            fieldLabel: t('Description'),
            allowBlank: true
        }];
        me.callParent(arguments);
    }
});