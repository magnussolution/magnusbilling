/**
 * Classe que define a model "Offer"
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
Ext.define('MBilling.model.Offer', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'label',
        type: 'string'
    }, {
        name: 'packagetype',
        type: 'int'
    }, {
        name: 'billingtype',
        type: 'int'
    }, {
        name: 'startday',
        type: 'int'
    }, {
        name: 'freetimetocall',
        type: 'int'
    }, {
        name: 'price',
        type: 'number'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'offer'
    }
});