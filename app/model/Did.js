/**
 * Classe que define a model "Did"
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
 * 24/09/2012
 */
Ext.define('MBilling.model.Did', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'did',
        type: 'string'
    }, {
        name: 'cbr',
        type: 'int'
    }, {
        name: 'cbr_ua',
        type: 'int'
    }, {
        name: 'cbr_em',
        type: 'int'
    }, {
        name: 'TimeOfDay_monFri',
        type: 'string'
    }, {
        name: 'TimeOfDay_sat',
        type: 'string'
    }, {
        name: 'TimeOfDay_sun',
        type: 'string'
    }, {
        name: 'workaudio',
        type: 'string'
    }, {
        name: 'noworkaudio',
        type: 'string'
    }, {
        name: 'activated',
        type: 'int'
    }, {
        name: 'fixrate',
        type: 'number'
    }, {
        name: 'connection_charge',
        type: 'number'
    }, {
        name: 'reserved',
        type: 'int'
    }, {
        name: 'selling_rate_1',
        type: 'number'
    }, {
        name: 'selling_rate_2',
        type: 'number'
    }, {
        name: 'selling_rate_3',
        type: 'number'
    }, {
        name: 'expression_1',
        type: 'string'
    }, {
        name: 'expression_2',
        type: 'string'
    }, {
        name: 'expression_3',
        type: 'string'
    }, {
        name: 'connection_sell',
        type: 'number'
    }, 'secondusedreal', 'idUserusername', 'idServername', {
        name: 'minimal_time_charge',
        type: 'int'
    }, {
        name: 'initblock',
        type: 'int'
    }, {
        name: 'increment',
        type: 'int'
    }, {
        name: 'block_expression_1',
        type: 'int'
    }, {
        name: 'block_expression_2',
        type: 'int'
    }, {
        name: 'block_expression_3',
        type: 'int'
    }, {
        name: 'send_to_callback_1',
        type: 'int'
    }, {
        name: 'send_to_callback_2',
        type: 'int'
    }, {
        name: 'send_to_callback_3',
        type: 'int'
    }, {
        name: 'charge_of',
        type: 'int'
    }, {
        name: 'description',
        type: 'string'
    }, {
        name: 'cbr_time_try',
        type: 'int'
    }, {
        name: 'cbr_total_try',
        type: 'int'
    }, {
        name: 'record_call',
        type: 'int'
    }, {
        name: 'country',
        type: 'string'
    }, {
        name: 'id_server',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'did'
    }
});