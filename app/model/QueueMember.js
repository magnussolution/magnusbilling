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
Ext.define('MBilling.model.QueueMember', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'uniqueid',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'membername',
        type: 'string'
    }, {
        name: 'queue_name',
        type: 'string'
    }, {
        name: 'interface',
        type: 'string'
    }, {
        name: 'penalty',
        type: 'int'
    }, {
        name: 'paused',
        type: 'int'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'queueMember'
    }
});