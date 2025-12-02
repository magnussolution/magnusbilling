/**
 * Classe que define a model "PhoneNumber"
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
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/10/2012
 */
Ext.define('MBilling.model.PhoneNumber', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_phonebook',
        type: 'int'
    }, {
        name: 'number',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'city',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'info',
        type: 'string'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, 'idPhonebookname'],
    proxy: {
        type: 'uxproxy',
        module: 'phoneNumber'
    }
});