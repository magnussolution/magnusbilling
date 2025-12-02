/**
 * Classe que define a model "Callerid"
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
 * 19/09/2012
 */
Ext.define('MBilling.model.SendCreditProducts', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'country_code',
        type: 'int'
    }, {
        name: 'operator_id',
        type: 'string'
    }, {
        name: 'SkuCode',
        type: 'string'
    }, {
        name: 'country',
        type: 'string'
    }, {
        name: 'operator_name',
        type: 'string'
    }, {
        name: 'currency_dest',
        type: 'string'
    }, {
        name: 'product',
        type: 'string'
    }, {
        name: 'currency_orig',
        type: 'string'
    }, {
        name: 'wholesale_price',
        type: 'string'
    }, {
        name: 'send_value',
        type: 'string'
    }, {
        name: 'provider',
        type: 'string'
    }, {
        name: 'info',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'retail_price',
        type: 'string'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'sendCreditProducts'
    }
});