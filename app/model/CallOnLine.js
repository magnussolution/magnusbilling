/**
 * Classe que define a model "CallOnline"
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
 * 10/08/2012
 */
Ext.define('MBilling.model.CallOnLine', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'uniqueid',
        type: 'string'
    }, {
        name: 'canal',
        type: 'string'
    }, {
        name: 'tronco',
        type: 'string'
    }, {
        name: 'ndiscado',
        type: 'string'
    }, {
        name: 'codec',
        type: 'string'
    }, {
        name: 'status',
        type: 'string'
    }, {
        name: 'duration',
        type: 'int'
    }, {
        name: 'reinvite',
        type: 'string'
    }, {
        name: 'from_ip',
        type: 'string'
    }, {
        name: 'server',
        type: 'string'
    }, {
        name: 'sip_account',
        type: 'string'
    }, {
        name: 'callerid',
        type: 'string'
    }, 'idUserusername', 'idUsercredit'],
    proxy: {
        type: 'uxproxy',
        module: 'callOnLine'
    }
});