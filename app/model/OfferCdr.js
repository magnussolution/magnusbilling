/**
 * Classe que define a model "OfferCdr"
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
Ext.define('MBilling.model.OfferCdr', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_offer',
        type: 'int'
    }, {
        name: 'used_secondes',
        type: 'int'
    }, {
        name: 'date_consumption',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, 'idOfferlabel', 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'offerCdr'
    }
});