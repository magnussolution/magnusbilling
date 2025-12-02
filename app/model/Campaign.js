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
Ext.define('MBilling.model.Campaign', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'frequency',
        type: 'int'
    }, {
        name: 'enable_max_call',
        type: 'int'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'type',
        type: 'int'
    }, {
        name: 'monday',
        type: 'int'
    }, {
        name: 'tuesday',
        type: 'int'
    }, {
        name: 'wednesday',
        type: 'int'
    }, {
        name: 'thursday',
        type: 'int'
    }, {
        name: 'nb_callmade',
        type: 'int'
    }, {
        name: 'secondusedreal',
        type: 'int'
    }, {
        name: 'friday',
        type: 'int'
    }, {
        name: 'saturday',
        type: 'int'
    }, {
        name: 'sunday',
        type: 'int'
    }, {
        name: 'forward_number',
        type: 'string'
    }, {
        name: 'description',
        type: 'string'
    }, {
        name: 'startingdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'expirationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'daily_start_time',
        type: 'string'
    }, {
        name: 'daily_stop_time',
        type: 'string'
    }, {
        name: 'restrict_phone',
        type: 'int'
    }, {
        name: 'tts_audio',
        type: 'string'
    }, {
        name: 'tts_audio2',
        type: 'string'
    }, {
        name: 'asr_audio',
        type: 'string'
    }, {
        name: 'asr_options',
        type: 'string'
    }, {
        name: 'auto_reprocess',
        type: 'int'
    }, {
        name: 'record_call',
        type: 'int'
    }, 'audio', 'audio_2', 'idUserusername', 'subRecords', 'id_phonebook'],
    proxy: {
        type: 'uxproxy',
        module: 'campaign'
    }
});