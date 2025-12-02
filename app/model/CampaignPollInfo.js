/**
 * Classe que define a model "CampaignPollInfo"
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
Ext.define('MBilling.model.CampaignPollInfo', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_campaign_poll',
        type: 'int'
    }, {
        name: 'resposta',
        type: 'string'
    }, {
        name: 'number',
        type: 'string'
    }, {
        name: 'date',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'city',
        type: 'string'
    }, 'sumresposta', 'resposta2', {
        name: 'obs',
        type: 'string'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'campaignPollInfo'
    }
});