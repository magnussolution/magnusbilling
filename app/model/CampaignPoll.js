/**
 * Classe que define a model "CampaignPoll"
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
Ext.define('MBilling.model.CampaignPoll', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_campaign',
        type: 'int'
    }, {
        name: 'digit_authorize',
        type: 'int'
    }, {
        name: 'request_authorize',
        type: 'int'
    }, {
        name: 'name',
        type: 'string'
    }, 'arq_audio', {
        name: 'ordem_exibicao',
        type: 'int'
    }, {
        name: 'description',
        type: 'string'
    }, {
        name: 'option0',
        type: 'string'
    }, {
        name: 'option1',
        type: 'string'
    }, {
        name: 'option2',
        type: 'string'
    }, {
        name: 'option3',
        type: 'string'
    }, {
        name: 'option4',
        type: 'string'
    }, {
        name: 'option5',
        type: 'string'
    }, {
        name: 'option6',
        type: 'string'
    }, {
        name: 'option7',
        type: 'string'
    }, {
        name: 'option8',
        type: 'string'
    }, {
        name: 'option9',
        type: 'string'
    }, 'idCampaignname', {
        name: 'repeat',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'campaignPoll'
    }
});