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
Ext.define('MBilling.model.Call', {
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
        name: 'id_server',
        type: 'int'
    }, {
        name: 'id_trunk',
        type: 'int'
    }, {
        name: 'id_prefix',
        type: 'int'
    }, {
        name: 'real_sessiontime',
        type: 'int'
    }, {
        name: 'starttime',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'calledstation',
        type: 'string'
    }, {
        name: 'sessiontime',
        type: 'int'
    }, {
        name: 'terminatecauseid',
        type: 'string'
    }, {
        name: 'buycost',
        type: 'number'
    }, {
        name: 'sessionbill',
        type: 'number'
    }, {
        name: 'agent_bill',
        type: 'number'
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
    }, 'idPrefixdestination', 'idUserusername', 'idPlanname', 'idTrunktrunkcode', 'idCampaignname', 'idServername', {
        name: 'id_campaign',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'call'
    }
});