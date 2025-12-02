/**
 * Classe que define a model "RateCallshop"
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
 * 30/07/2012
 */
Ext.define('MBilling.model.RateCallshop', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'dialprefix',
        type: 'string'
    }, {
        name: 'buyrate',
        type: 'number'
    }, {
        name: 'minimo',
        type: 'int'
    }, {
        name: 'block',
        type: 'int'
    }, {
        name: 'destination',
        type: 'string'
    }, {
        name: 'minimal_time_charge',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'rateCallshop'
    }
});