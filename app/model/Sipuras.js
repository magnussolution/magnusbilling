/**
 * Classe que define a model "Sipuras"
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
 * 01/08/2012
 */
Ext.define('MBilling.model.Sipuras', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'nserie',
        type: 'string'
    }, {
        name: 'macadr',
        type: 'string'
    }, {
        name: 'id_user',
        type: 'int'
    }, 'senha_user', 'senha_admin', {
        name: 'antireset',
        type: 'int'
    }, {
        name: 'Enable_Web_Server',
        type: 'int'
    }, 'marca', 'altera', 'User_ID_1', 'Password_1', {
        name: 'Use_Pref_Codec_Only_1',
        type: 'int'
    }, 'Preferred_Codec_1', 'Register_Expires_1', 'Dial_Plan_1', 'NAT_Mapping_Enable_1_', 'NAT_Keep_Alive_Enable_1_', 'Proxy_1', 'User_ID_2', 'Password_2', {
        name: 'Use_Pref_Codec_Only_2',
        type: 'int'
    }, 'Preferred_Codec_2', 'Register_Expires_2', 'Dial_Plan_2', 'NAT_Mapping_Enable_2_', 'NAT_Keep_Alive_Enable_2_', 'Proxy_2', 'STUN_Enable', 'STUN_Test_Enable', 'Substitute_VIA_Addr', 'STUN_Server', 'last_ip', 'obs', {
        name: 'fultmov',
        type: 'date',
        dateFormat: 'Y-m-d H:i:s'
    }, 'idUserusername'],
    proxy: {
        type: 'uxproxy',
        module: 'sipuras'
    }
});