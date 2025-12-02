/**
 * Classe que define a model "CallSummaryDayUser"
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
Ext.define('MBilling.model.CallSummaryMonthDid', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'month',
        type: 'date',
        dateFormat: 'Y-m'
    }, {
        name: 'sessiontime',
        type: 'int'
    }, {
        name: 'aloc_all_calls',
        type: 'int'
    }, {
        name: 'nbcall',
        type: 'int'
    }, {
        name: 'sessionbill',
        type: 'float'
    }, {
        name: 'id_did',
        type: 'int'
    }, 'idDiddid', 'sumsessiontime', 'sumsessionbill', 'sumaloc_all_calls', 'sumnbcall'],
    proxy: {
        type: 'uxproxy',
        module: 'callSummaryMonthDid'
    }
});