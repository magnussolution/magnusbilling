/**
 * Classe que define o form de "Diddestination"
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
 * 24/09/2012
 */
Ext.define('MBilling.view.diddestination.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.diddestinationform',
    fieldsHideUpdateLot: ['id_user', 'id_did'],
    fieldsHideEdit: ['id_user', 'id_did'],
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'didlookup',
            name: 'id_did',
            fieldLabel: t('DID'),
            ownerForm: me
        }, {
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            allowBlank: App.user.isClient
        }, {
            xtype: 'booleancombo',
            name: 'activated',
            fieldLabel: t('Status'),
            allowBlank: false
        }, {
            xtype: 'numbercombo',
            name: 'priority',
            fieldLabel: t('Priority'),
            allowBlank: true
        }, {
            xtype: 'fieldset',
            style: 'margin-top:25px; overflow: visible;',
            title: t('DID destination'),
            collapsible: true,
            collapsed: false,
            defaults: {
                labelWidth: 90,
                anchor: '100%',
                labelAlign: me.labelAlignFields
            },
            items: [{
                xtype: 'didtypecombo',
                name: 'voip_call',
                fieldLabel: t('Type')
            }, {
                xtype: 'textfield',
                name: 'destination',
                fieldLabel: t('Destination'),
                value: '',
                allowBlank: true,
                hidden: App.user.isClient || App.user.isAgent
            }, {
                xtype: 'ivrlookup',
                ownerForm: me,
                name: 'id_ivr',
                fieldLabel: t('IVR'),
                allowBlank: true
            }, {
                xtype: 'queuelookup',
                ownerForm: me,
                name: 'id_queue',
                fieldLabel: t('Queue'),
                allowBlank: true
            }, {
                xtype: 'siplookup',
                ownerForm: me,
                name: 'id_sip',
                fieldLabel: t('Sip user'),
                allowBlank: true
            }, {
                xtype: 'textarea',
                name: 'context',
                fieldLabel: t('Context'),
                allowBlank: true,
                emptyText: t('Asterisk dial plan. Example: exten => _X.=>1,Dial(SIP/3333@39.5.5.5,30); )'),
                height: 300,
                anchor: '100%'
            }]
        }];
        me.callParent(arguments);
    }
});