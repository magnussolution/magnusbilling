/**
 * Classe que define a model "Alarm"
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
 * 03/01/2021
 */
Ext.define('MBilling.model.Alarm', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'type',
        type: 'int'
    }, {
        name: 'amount',
        type: 'int'
    }, {
        name: 'condition',
        type: 'int'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'email',
        type: 'string'
    }, {
        name: 'period',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, 'idPlanname'],
    proxy: {
        type: 'uxproxy',
        module: 'alarm'
    }
});