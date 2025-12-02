/**
 * Classe que define a model "Trunk"
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
 * 25/06/2012
 */
Ext.define('MBilling.model.Trunk', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'trunkcode',
        type: 'string'
    }, {
        name: 'trunkprefix',
        type: 'string'
    }, {
        name: 'providertech',
        type: 'string'
    }, {
        name: 'providerip',
        type: 'string'
    }, {
        name: 'removeprefix',
        type: 'string'
    }, {
        name: 'secondusedreal',
        type: 'int'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'failover_trunk',
        type: 'int'
    }, 'failoverTrunktrunkcode', 'idProviderprovider_name', {
        name: 'fromdomain',
        type: 'string'
    }, {
        name: 'addparameter',
        type: 'string'
    }, {
        name: 'id_provider',
        type: 'int'
    }, {
        name: 'inuse',
        type: 'string'
    }, {
        name: 'maxuse',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'if_max_use',
        type: 'string'
    }, {
        name: 'user',
        type: 'string'
    }, {
        name: 'secret',
        type: 'string'
    }, {
        name: 'allow',
        type: 'string'
    }, {
        name: 'link_sms',
        type: 'string'
    }, {
        name: 'directmedia',
        type: 'string'
    }, {
        name: 'context',
        type: 'string'
    }, {
        name: 'dtmfmode',
        type: 'string'
    }, {
        name: 'insecure',
        type: 'string'
    }, {
        name: 'nat',
        type: 'string'
    }, {
        name: 'qualify',
        type: 'string'
    }, {
        name: 'type',
        type: 'string'
    }, {
        name: 'disallow',
        type: 'string'
    }, {
        name: 'host',
        type: 'string'
    }, {
        name: 'sms_res',
        type: 'string'
    }, {
        name: 'register',
        type: 'int'
    }, {
        name: 'language',
        type: 'string'
    }, {
        name: 'allow_error',
        type: 'int'
    }, {
        name: 'fromuser',
        type: 'string'
    }, {
        name: 'port',
        type: 'int'
    }, {
        name: 'encryption',
        type: 'string'
    }, {
        name: 'transport',
        type: 'string'
    }, {
        name: 'sendrpid',
        type: 'string'
    }, {
        name: 'cnl',
        type: 'int'
    }, {
        name: 'cid_add',
        type: 'string'
    }, {
        name: 'cid_remove',
        type: 'string'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'trunk'
    }
});