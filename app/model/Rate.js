/**
 * Classe que define a model "Rate"
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
 * 30/07/2012
 */
Ext.define('MBilling.model.Rate', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'id_trunk_group',
        type: 'int'
    }, {
        name: 'id_prefix',
        type: 'int'
    }, {
        name: 'rateinitial',
        type: 'number'
    }, {
        name: 'initblock',
        type: 'int'
    }, {
        name: 'billingblock',
        type: 'int'
    }, {
        name: 'connectcharge',
        type: 'number'
    }, {
        name: 'disconnectcharge',
        type: 'number'
    }, {
        name: 'additional_grace',
        type: 'string'
    }, {
        name: 'minimal_cost',
        type: 'int'
    }, {
        name: 'minimal_time_charge',
        type: 'int'
    }, {
        name: 'package_offer',
        type: 'int'
    }, {
        name: 'status',
        type: 'int'
    }, 'idPrefixdestination', 'idPrefixprefix', 'idTrunkGroupname', 'idPlanname'],
    proxy: {
        type: 'uxproxy',
        module: 'rate'
    }
});