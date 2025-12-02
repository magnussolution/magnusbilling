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
 * 01/08/2012
 */
Ext.define('MBilling.view.prefix.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.prefixform',
    fieldsHideEdit: ['prefix'],
    items: [{
        name: 'prefix',
        fieldLabel: t('Prefix'),
        maxLength: 18
    }, {
        name: 'destination',
        fieldLabel: t('Destination')
    }]
});