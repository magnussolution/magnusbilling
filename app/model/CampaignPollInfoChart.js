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
Ext.define('MBilling.model.CampaignPollInfoChart', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'sumresposta',
        type: 'int'
    }, {
        name: 'resposta2',
        type: 'int'
    }, {
        name: 'resposta_name',
        type: 'string'
    }, {
        name: 'total_votos',
        type: 'string'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'campaignPollInfoChart'
    }
});