/**
 * Classe que define a model "Campaign"
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
 * 28/10/2012
 */
Ext.define('MBilling.model.CampaignDashBoard', {
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
        name: 'callsPlaced',
        type: 'int'
    }, {
        name: 'callsringing',
        type: 'int'
    }, {
        name: 'callsInTransfer',
        type: 'int'
    }, {
        name: 'callsTransfered',
        type: 'int'
    }, {
        name: 'callsTotalNumbers',
        type: 'int'
    }, {
        name: 'callsDialedtoday',
        type: 'int'
    }, {
        name: 'callsRemaningToDial',
        type: 'int'
    }, 'idUserusername', 'id_phonebook'],
    proxy: {
        type: 'uxproxy',
        module: 'campaignDashBoard'
    }
});