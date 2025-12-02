/**
 * Classe que define a model "RateProvider"
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
Ext.define('MBilling.model.RateProvider', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_prefix',
        type: 'int'
    }, {
        name: 'id_provider',
        type: 'int'
    }, {
        name: 'buyrate',
        type: 'number'
    }, {
        name: 'buyrateinitblock',
        type: 'int'
    }, {
        name: 'buyrateincrement',
        type: 'int'
    }, {
        name: 'minimal_time_buy',
        type: 'int'
    }, 'idPrefixdestination', 'idProviderprovider_name', 'idPrefixprefix'],
    proxy: {
        type: 'uxproxy',
        module: 'RateProvider'
    }
});