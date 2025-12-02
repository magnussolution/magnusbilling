/**
 * Classe que define a model "DidHistory"
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
 * 19/09/2022
 */
Ext.define('MBilling.model.DidHistory', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'username',
        type: 'string'
    }, {
        name: 'did',
        type: 'string'
    }, {
        name: 'month_payed',
        type: 'int'
    }, {
        name: 'reservationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'releasedate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'description',
        type: 'string'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'didHistory'
    }
});