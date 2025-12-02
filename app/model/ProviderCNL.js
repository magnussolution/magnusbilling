/**
 * Classe que define a model "ProviderCNL"
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
 * 16/07/2012
 */
Ext.define('MBilling.model.ProviderCNL', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_provider',
        type: 'int'
    }, {
        name: 'cnl',
        type: 'int'
    }, {
        name: 'zone',
        type: 'string'
    }, {
        name: 'id_provider',
        type: 'int'
    }, 'idProviderprovider_name'],
    proxy: {
        type: 'uxproxy',
        module: 'providerCNL'
    }
});