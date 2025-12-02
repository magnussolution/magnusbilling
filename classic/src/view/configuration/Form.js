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
 * 17/08/2012
 */
Ext.define('MBilling.view.configuration.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.configurationform',
    items: [{
        name: 'config_value',
        fieldLabel: t('Value'),
        allowBlank: true
    }, {
        xtype: 'textarea',
        name: 'config_description',
        fieldLabel: t('Description'),
        height: 200,
        anchor: '100%',
        readOnly: true
    }]
});