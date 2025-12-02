/**
 * Classe que define a model "UserHistory"
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
 * 06/06/2022
 */
Ext.define('MBilling.model.UserHistory', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'date',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'id_user',
        type: 'int'
    }, 'description', 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'userHistory'
    }
});