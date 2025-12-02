/**
 * Classe que define a model "CampaignReport"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2020 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnusbilling/mbilling/issues
 * =======================================
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/08/2020
 */
Ext.define('MBilling.model.CampaignReport', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_campaign',
        type: 'int'
    }, {
        name: 'id_phonenumber',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_trunk',
        type: 'int'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'unix_timestamp',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'payment',
        type: 'number'
    }, 'idCampaignname', 'idPhonenumbernumber', 'idTrunktrunkcode', 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'campaignReport'
    }
});