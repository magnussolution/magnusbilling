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
 */
Ext.define('MBilling.model.SendCreditSummary', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'day',
        type: 'date',
        dateFormat: 'Y-m-d'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'service',
        type: 'string'
    }, {
        name: 'total_sale',
        type: 'string'
    }, {
        name: 'earned',
        type: 'string'
    }, {
        name: 'commision',
        type: 'string'
    }, {
        name: 'profit',
        type: 'string'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'sendCreditSummary'
    }
});