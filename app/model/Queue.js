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
Ext.define('MBilling.model.Queue', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'language',
        type: 'string'
    }, {
        name: 'strategy',
        type: 'string'
    }, {
        name: 'ringinuse',
        type: 'string'
    }, {
        name: 'timeout',
        type: 'int'
    }, {
        name: 'retry',
        type: 'int'
    }, {
        name: 'wrapuptime',
        type: 'int'
    }, {
        name: 'weight',
        type: 'int'
    }, {
        name: 'periodic-announce',
        type: 'string'
    }, {
        name: 'periodic-announce-frequency',
        type: 'int'
    }, {
        name: 'announce-position',
        type: 'string'
    }, {
        name: 'announce-holdtime',
        type: 'string'
    }, {
        name: 'announce-frequency',
        type: 'string'
    }, {
        name: 'musiconhold',
        type: 'string'
    }, {
        name: 'joinempty',
        type: 'string'
    }, {
        name: 'ring_or_moh',
        type: 'string'
    }, {
        name: 'leavewhenempty',
        type: 'string'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'queue'
    }
});