/**
 * Classe que define a model "Api"
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
 * 19/09/2019
 */
Ext.define('MBilling.model.Api', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'api_key',
        type: 'string'
    }, {
        name: 'api_secret',
        type: 'string'
    }, {
        name: 'action',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'api_restriction_ips',
        type: 'string'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'api'
    }
});