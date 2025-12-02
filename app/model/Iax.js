/**
 * Classe que define a model "Iax"
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
 * 25/06/2016
 */
Ext.define('MBilling.model.Iax', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, 'idUserusername', {
        name: 'name',
        type: 'string'
    }, {
        name: 'accountcode',
        type: 'string'
    }, {
        name: 'regexten',
        type: 'string'
    }, {
        name: 'amaflags',
        type: 'string'
    }, {
        name: 'callgroup',
        type: 'string'
    }, {
        name: 'callerid',
        type: 'string'
    }, {
        name: 'context',
        type: 'string'
    }, {
        name: 'DEFAULTip',
        type: 'string'
    }, {
        name: 'dtmfmode',
        type: 'string'
    }, {
        name: 'fromuser',
        type: 'string'
    }, {
        name: 'fromdomain',
        type: 'string'
    }, {
        name: 'host',
        type: 'string'
    }, {
        name: 'group',
        type: 'string'
    }, {
        name: 'insecure',
        type: 'string'
    }, {
        name: 'language',
        type: 'string'
    }, {
        name: 'mailbox',
        type: 'string'
    }, {
        name: 'md5secret',
        type: 'string'
    }, {
        name: 'nat',
        type: 'string'
    }, {
        name: 'deny',
        type: 'string'
    }, {
        name: 'permit',
        type: 'string'
    }, {
        name: 'port',
        type: 'string'
    }, {
        name: 'qualify',
        type: 'string'
    }, {
        name: 'rtpholdtimeout',
        type: 'string'
    }, {
        name: 'secret',
        type: 'string'
    }, {
        name: 'type',
        type: 'string'
    }, {
        name: 'disallow',
        type: 'string'
    }, {
        name: 'allow',
        type: 'string'
    }, {
        name: 'regseconds',
        type: 'date',
        dateFormat: 'timestamp'
    }, {
        name: 'ipaddr',
        type: 'string'
    }, {
        name: 'useragent',
        type: 'string'
    }, {
        name: 'calllimit',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'iax'
    }
});