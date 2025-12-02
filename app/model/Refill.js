/**
 * Classe que define a model "Admin"
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
Ext.define('MBilling.model.Refill', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'date',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'credit',
        type: 'number'
    }, {
        name: 'id_user',
        type: 'int'
    }, 'description', {
        name: 'refill_type',
        type: 'int'
    }, {
        name: 'payment',
        type: 'int'
    }, 'sumCredit', 'sumCreditMonth', 'CreditMonth', 'idUserusername', 'invoice_number'],
    proxy: {
        type: 'uxproxy',
        module: 'refill'
    }
});