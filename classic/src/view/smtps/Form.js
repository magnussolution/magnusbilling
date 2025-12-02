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
Ext.define('MBilling.view.smtps.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.smtpsform',
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'host',
            fieldLabel: t('Host'),
            hidden: App.user.isClient
        }, {
            name: 'username',
            fieldLabel: t('Username'),
            hidden: App.user.isClient
        }, {
            name: 'password',
            fieldLabel: t('Password'),
            inputType: 'password',
            hidden: App.user.isClient
        }, {
            xtype: 'numberfield',
            name: 'port',
            fieldLabel: t('Port'),
            value: 587,
            hidden: App.user.isClient
        }, {
            xtype: 'combobox',
            name: 'encryption',
            fieldLabel: t('Encryption'),
            hidden: App.user.isClient,
            value: 'null',
            store: [
                ['ssl', t('SSl')],
                ['tls', t('TLS')],
                ['null', t('NULL')]
            ]
        }];
        me.callParent(arguments);
    }
});