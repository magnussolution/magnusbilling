/**
 * Classe que define a model "Voucher"
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
 * 25/06/2012
 */
Ext.define('MBilling.model.Voucher', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'usedate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'expirationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'voucher',
        type: 'number'
    }, {
        name: 'tag',
        type: 'string'
    }, {
        name: 'credit',
        type: 'number'
    }, {
        name: 'used',
        type: 'int'
    }, {
        name: 'quantity',
        type: 'int'
    }, {
        name: 'prefix_local',
        type: 'string'
    }, {
        name: 'language',
        type: 'string'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'voucher'
    }
});