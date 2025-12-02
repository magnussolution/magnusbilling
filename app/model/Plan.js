/**
 * Classe que define a model "Plan"
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
 * 24/07/2012
 */
Ext.define('MBilling.model.Plan', {
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
        name: 'lcrtype',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'signup',
        type: 'int'
    }, {
        name: 'portabilidadeMobile',
        type: 'int'
    }, {
        name: 'portabilidadeFixed',
        type: 'int'
    }, {
        name: 'ini_credit',
        type: 'string'
    }, {
        name: 'play_audio',
        type: 'int'
    }, 'idUserusername', 'id_services', {
        name: 'techprefix',
        type: 'string'
    }, {
        name: 'tariff_limit',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'plan'
    }
});