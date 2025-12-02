/**
 * Classe que define a model "User"
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
 * 19/09/2012
 */
Ext.define('MBilling.model.User', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'id_group',
        type: 'int'
    }, {
        name: 'id_plan',
        type: 'int'
    }, {
        name: 'offer',
        type: 'int'
    }, {
        name: 'id_user',
        type: 'int'
    }, {
        name: 'id_offer',
        type: 'int'
    }, {
        name: 'username',
        type: 'string'
    }, {
        name: 'password',
        type: 'string'
    }, {
        name: 'active',
        type: 'int'
    }, {
        name: 'credit',
        type: 'number'
    }, {
        name: 'enableexpire',
        type: 'int'
    }, {
        name: 'expiredays',
        type: 'int'
    }, {
        name: 'status',
        type: 'int'
    }, {
        name: 'typepaid',
        type: 'int'
    }, {
        name: 'creditlimit',
        type: 'int'
    }, {
        name: 'credit_notification',
        type: 'int'
    }, {
        name: 'restriction',
        type: 'int'
    }, {
        name: 'callingcard_pin',
        type: 'int'
    }, {
        name: 'callshop',
        type: 'int'
    }, {
        name: 'plan_day',
        type: 'int'
    }, {
        name: 'active_paypal',
        type: 'int'
    }, {
        name: 'boleto',
        type: 'int'
    }, {
        name: 'lastname',
        type: 'string'
    }, {
        name: 'firstname',
        type: 'string'
    }, {
        name: 'redial',
        type: 'string'
    }, {
        name: 'tag',
        type: 'string'
    }, {
        name: 'company_name',
        type: 'string'
    }, {
        name: 'commercial_name',
        type: 'string'
    }, {
        name: 'address',
        type: 'string'
    }, {
        name: 'city',
        type: 'string'
    }, {
        name: 'state',
        type: 'string'
    }, {
        name: 'country',
        type: 'string'
    }, {
        name: 'loginkey',
        type: 'string'
    }, {
        name: 'zipcode',
        type: 'string'
    }, {
        name: 'phone',
        type: 'string'
    }, {
        name: 'mobile',
        type: 'string'
    }, {
        name: 'email',
        type: 'string'
    }, {
        name: 'email2',
        type: 'string'
    }, {
        name: 'doc',
        type: 'string'
    }, {
        name: 'vat',
        type: 'string'
    }, {
        name: 'language',
        type: 'string'
    }, {
        name: 'company_website',
        type: 'string'
    }, {
        name: 'prefix_local',
        type: 'string'
    }, {
        name: 'boleto_day',
        type: 'int'
    }, {
        name: 'firstusedate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'expirationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'lastuse',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'description',
        type: 'string'
    }, {
        name: 'creationdate',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, {
        name: 'id_group_agent',
        type: 'int'
    }, {
        name: 'calllimit',
        type: 'int'
    }, {
        name: 'mix_monitor_format',
        type: 'string'
    }, {
        name: 'disk_space',
        type: 'int'
    }, {
        name: 'sipaccountlimit',
        type: 'int'
    }, {
        name: 'cpslimit',
        type: 'int'
    }, {
        name: 'sip_count',
        type: 'int'
    }, {
        name: 'inbound_call_limit',
        type: 'int'
    }, {
        name: 'dist',
        type: 'string'
    }, 'idUserusername', 'idGroupname', 'idGroupid_user_type', 'idPlanname'],
    proxy: {
        type: 'uxproxy',
        module: 'user'
    }
});