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
 * 22/12/2020
 */
Ext.define('MBilling.view.holidays.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.holidaysform',
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'name',
            fieldLabel: t('Name')
        }, {
            xtype: 'datefield',
            name: 'day',
            fieldLabel: t('Date')
        }];
        me.callParent(arguments);
    }
});