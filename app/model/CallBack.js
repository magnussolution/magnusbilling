/**
 * Classe que define a model "CallBack"
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
Ext.define('MBilling.model.CallBack', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'entry_time',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'last_attempt_time',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'status',
        type: 'string'
    }, {
        name: 'channel',
        type: 'string'
    }, {
        name: 'exten',
        type: 'string'
    }, {
        name: 'account',
        type: 'string'
    }, {
        name: 'variable',
        type: 'string'
    }, {
        name: 'sessiontime',
        type: 'int'
    }, {
        name: 'num_attempt',
        type: 'int'
    }, 'idUserusername', 'idDiddid'],
    proxy: {
        type: 'uxproxy',
        module: 'callBack'
    }
});