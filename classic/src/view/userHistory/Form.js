/**
 * Classe que define a lista de "UserHistory"
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
 * 22/06/2022
 */
Ext.define('MBilling.view.userHistory.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.userhistoryform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient
        }, {
            xtype: 'datetimefield',
            name: 'date',
            fieldLabel: t('Date'),
            format: 'Y-m-d H:i:s',
            hidden: !App.user.isAdmin,
            allowBlank: true,
            value: new Date()
        }, {
            xtype: 'textareafield',
            name: 'description',
            fieldLabel: t(''),
            readOnly: App.user.isClient,
            height: 400,
            anchor: '100%',
            labelWidth: '100%',
            labelAlign: 'left'
        }];
        me.callParent(arguments);
    }
});