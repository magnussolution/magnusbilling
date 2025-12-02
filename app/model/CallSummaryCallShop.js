/**
 * Classe que define a model "CallSummary"
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
 * 17/08/2012
 */
Ext.define('MBilling.model.CallSummaryCallShop', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'day',
        type: 'date',
        dateFormat: 'Y-m-d'
    }, {
        name: 'date',
        type: 'date',
        dateFormat: 'Y-m-d'
    }, {
        name: 'sessiontime',
        type: 'int'
    }, {
        name: 'aloc_success_calls',
        type: 'int'
    }, {
        name: 'aloc_all_calls',
        type: 'int'
    }, {
        name: 'price',
        type: 'float'
    }, {
        name: 'buycost',
        type: 'float'
    }, {
        name: 'nbcall',
        type: 'int'
    }, {
        name: 'success_calls',
        type: 'int'
    }, {
        name: 'asr',
        type: 'int'
    }, {
        name: 'lucro',
        type: 'float'
    }, 'sumsessiontime', 'sumbuycost', 'sumlucro', 'sumprice', 'sumsuccess_calls', 'sumaloc_all_calls', 'sumnbcall', 'sumasr'],
    proxy: {
        type: 'uxproxy',
        module: 'callSummaryCallShop'
    }
});