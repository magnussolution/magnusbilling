/**
 * Classe que define a model "Callerid"
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
Ext.define('MBilling.model.Module', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'text',
        convert: function(value) {
            return (value.indexOf('t(') !== -1) ? eval(value) : value;
        }
    }, 'module', 'icon_cls', {
        name: 'id_module',
        type: 'int',
        useNull: true
    }, {
        name: 'idModuletext',
        convert: function(value) {
            console.log(value);
            if (value) {
                return (value.indexOf('t(') !== -1) ? eval(value) : value;
            } else {
                return value;
            }
        }
    }, {
        name: 'priority',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'module'
    }
});