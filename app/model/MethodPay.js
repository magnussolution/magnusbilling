/**
 * Classe que define a model "MethodPay"
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
 * 04/07/2012
 */
Ext.define('MBilling.model.MethodPay', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'payment_method',
        type: 'string'
    }, {
        name: 'show_name',
        type: 'string'
    }, {
        name: 'country',
        type: 'string'
    }, {
        name: 'active',
        type: 'int'
    }, {
        name: 'obs',
        type: 'string'
    }, {
        name: 'url',
        type: 'string'
    }, {
        name: 'username',
        type: 'string'
    }, {
        name: 'pagseguro_TOKEN',
        type: 'string'
    }, {
        name: 'fee',
        type: 'int'
    }, {
        name: 'P2P_CustomerSiteID',
        type: 'string'
    }, {
        name: 'P2P_KeyID',
        type: 'string'
    }, {
        name: 'P2P_Passphrase',
        type: 'string'
    }, {
        name: 'P2P_RecipientKeyID',
        type: 'string'
    }, {
        name: 'P2P_tax_amount',
        type: 'string'
    }, {
        name: 'client_id',
        type: 'string'
    }, {
        name: 'client_secret',
        type: 'string'
    }, {
        name: 'SLAppToken',
        type: 'string'
    }, {
        name: 'SLAccessToken',
        type: 'string'
    }, {
        name: 'SLSecret',
        type: 'string'
    }, {
        name: 'SLIdProduto',
        type: 'int'
    }, {
        name: 'SLvalidationtoken',
        type: 'string'
    }, {
        name: 'min',
        type: 'number'
    }, {
        name: 'max',
        type: 'number'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'methodpay'
    }
});