/**
 * Classe que define a model "QueueMember"
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
Ext.define('MBilling.model.QueueMemberDashBoard', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'agentName',
        type: 'string'
    }, {
        name: 'number',
        type: 'string'
    }, {
        name: 'totalCalls',
        type: 'string'
    }, {
        name: 'last_call',
        type: 'string'
    }, {
        name: 'agentId',
        type: 'string'
    }, {
        name: 'agentStatus',
        type: 'string'
    }, {
        name: 'score',
        type: 'string'
    }, 'idQueuename'],
    proxy: {
        type: 'uxproxy',
        module: 'queueMemberDashBoard'
    }
});