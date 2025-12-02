/**
 * Classe que define a model "Services"
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
 * 17/08/2017
 */
Ext.define('MBilling.model.Services', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'type',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'price',
        type: 'string'
    }, {
        name: 'description',
        type: 'string'
    }, {
        name: 'calllimit',
        type: 'int'
    }, {
        name: 'disk_space',
        type: 'int'
    }, {
        name: 'sipaccountlimit',
        type: 'int'
    }, {
        name: 'return_credit',
        type: 'int'
    }, {
        name: 'next_due_date',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'services'
    }
});