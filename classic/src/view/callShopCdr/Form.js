/**
 * Classe que define o form de "CallShopCdr"
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
Ext.define('MBilling.view.callShopCdr.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.callshopcdrform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'userlookup',
            name: 'id_user',
            fieldLabel: t('Username'),
            ownerForm: me,
            hidden: App.user.isClient,
            allowBlank: App.user.isClient
        }];
        me.callParent(arguments);
    }
});