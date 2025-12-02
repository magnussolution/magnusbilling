/**
 * Classe que define o form de "Firewall"
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
Ext.define('MBilling.view.firewall.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.firewallform',
    initComponent: function () {
        var me = this;
        me.items = [{
            name: 'ip',
            fieldLabel: t('IP'),
            vtype: 'IPOrCIDR'
        }, {
            xtype: 'combobox',
            store: [
                ['0', 'Temp ban'],
                ['1', 'Permanent ban'],
                ['3', 'Unban'],
                ['5', 'Add to IgnoreIP']
            ],
            name: 'action',
            fieldLabel: t('Action'),
            forceSelection: true,
            editable: false,
            allowBlank: true,
            value: '0'
        }, {
            xtype: 'textarea',
            name: 'description',
            fieldLabel: t('Description'),
            allowBlank: true,
            height: 300,
            anchor: '100%',
            readOnly: true
        }];
        me.callParent(arguments);
    }
});