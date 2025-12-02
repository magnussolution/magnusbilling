/**
 * Classe que define a model "Ivr"
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
Ext.define('MBilling.model.Ivr', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'use_holidays',
        type: 'int'
    }, {
        name: 'monFriStart',
        type: 'string'
    }, {
        name: 'monFriStop',
        type: 'string'
    }, {
        name: 'satStart',
        type: 'string'
    }, {
        name: 'satStop',
        type: 'string'
    }, {
        name: 'sunStart',
        type: 'string'
    }, {
        name: 'sunStop',
        type: 'string'
    }, {
        name: 'option_0',
        type: 'string'
    }, {
        name: 'option_1',
        type: 'string'
    }, {
        name: 'option_2',
        type: 'string'
    }, {
        name: 'option_3',
        type: 'string'
    }, {
        name: 'option_4',
        type: 'string'
    }, {
        name: 'option_5',
        type: 'string'
    }, {
        name: 'option_6',
        type: 'string'
    }, {
        name: 'option_7',
        type: 'string'
    }, {
        name: 'option_8',
        type: 'string'
    }, {
        name: 'option_9',
        type: 'string'
    }, {
        name: 'option_10',
        type: 'string'
    }, {
        name: 'option_out_0',
        type: 'string'
    }, {
        name: 'option_out_1',
        type: 'string'
    }, {
        name: 'option_out_2',
        type: 'string'
    }, {
        name: 'option_out_3',
        type: 'string'
    }, {
        name: 'option_out_4',
        type: 'string'
    }, {
        name: 'option_out_5',
        type: 'string'
    }, {
        name: 'option_out_6',
        type: 'string'
    }, {
        name: 'option_out_7',
        type: 'string'
    }, {
        name: 'option_out_8',
        type: 'string'
    }, {
        name: 'option_out_9',
        type: 'string'
    }, {
        name: 'option_out_10',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, 'workaudio', 'noworkaudio', 'idDiddid', 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'ivr'
    }
});