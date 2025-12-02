/**
 * Classe que define a model "Diddestination"
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
 * 24/09/2012
 */
Ext.define('MBilling.model.Diddestination', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_ivr',
        type: 'int'
    }, {
        name: 'id_queue',
        type: 'int'
    }, {
        name: 'id_sip',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_did',
        type: 'int'
    }, {
        name: 'destination',
        type: 'string'
    }, {
        name: 'priority',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'activated',
        type: 'int'
    }, {
        name: 'secondusedreal',
        type: 'number'
    }, {
        name: 'voip_call',
        type: 'int'
    }, {
        name: 'id_ivr',
        type: 'int'
    }, 'idDiddid', 'idIvrname', 'idUserusername', 'idQueuename', 'idSipname'],
    proxy: {
        type: 'uxproxy',
        module: 'diddestination'
    }
});