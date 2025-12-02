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
Ext.define('MBilling.view.callOnLine.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callonlineform',
    initComponent: function() {
        var me = this;
        me.defaults = {
            readOnly: true,
            allowBlank: true
        };
        me.items = [{
            name: 'idUserusername',
            fieldLabel: t('Username')
        }, {
            name: 'sip_account',
            fieldLabel: t('Sip user')
        }, {
            name: 'idUsercredit',
            fieldLabel: t('Credit')
        }, {
            name: 'ndiscado',
            fieldLabel: t('Number')
        }, {
            name: 'codec',
            fieldLabel: t('Codec')
        }, {
            name: 'callerid',
            fieldLabel: t('CallerID')
        }, {
            name: 'tronco',
            fieldLabel: t('Trunk'),
            hidden: App.user.isClient
        }, {
            name: 'reinvite',
            fieldLabel: t('Reinvite')
        }, {
            name: 'from_ip',
            fieldLabel: t('From IP')
        }, {
            xtype: 'textarea',
            name: 'description',
            fieldLabel: t('Description'),
            hideLabel: true,
            height: 350,
            anchor: '100%',
            hidden: !App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});