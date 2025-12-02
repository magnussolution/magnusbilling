/**
 * Classe que define a model "Queue"
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
Ext.define('MBilling.model.QueueDashBoard', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'callId',
        type: 'int'
    }, {
        name: 'agentName',
        type: 'string'
    }, {
        name: 'queue_name',
        type: 'string'
    }, {
        name: 'channel',
        type: 'string'
    }, {
        name: 'id_queue',
        type: 'string'
    }, {
        name: 'callerId',
        type: 'string'
    }, {
        name: 'status',
        type: 'string'
    }, {
        name: 'position',
        type: 'string'
    }, {
        name: 'originalPosition',
        type: 'string'
    }, {
        name: 'holdtime',
        type: 'string'
    }, {
        name: 'keyPressed',
        type: 'string'
    }, {
        name: 'callduration',
        type: 'int'
    }, {
        name: 'duration',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'queueDashBoard'
    }
});