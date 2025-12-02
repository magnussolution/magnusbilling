/**
 * Classe que define a model "Call"
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
Ext.define('MBilling.model.CallFailed', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'id_trunk',
        type: 'int'
    }, {
        name: 'id_server',
        type: 'int'
    }, {
        name: 'id_prefix',
        type: 'int'
    }, {
        name: 'starttime',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'calledstation',
        type: 'string'
    }, {
        name: 'terminatecauseid',
        type: 'int'
    }, {
        name: 'src',
        type: 'string'
    }, {
        name: 'callerid',
        type: 'string'
    }, {
        name: 'sipiax',
        type: 'int'
    }, {
        name: 'uniqueid',
        type: 'string'
    }, {
        name: 'hangupcause',
        type: 'int'
    }, 'idPrefixdestination', 'idUserusername', 'idPlanname', 'idTrunktrunkcode', 'idServername'],
    proxy: {
        type: 'uxproxy',
        module: 'callFailed'
    }
});