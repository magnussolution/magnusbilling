/**
 * Classe que define a lista de "Diddestination"
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
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 24/09/2012
 */
Ext.define('MBilling.view.diddestination.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.diddestinationlist',
    store: 'Diddestination',
    fieldSearch: 'idDid.did',
    initComponent: function () {
        var me = this;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('DID'),
            dataIndex: 'idDiddid',
            filter: {
                type: 'string',
                field: 'idDid.did'
            },
            flex: 5
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 4,
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }, {
            header: t('Call type'),
            dataIndex: 'voip_call',
            renderer: Helper.Util.formatDidType,
            comboRelated: 'didtypecombo',
            flex: 3,
            filter: {
                type: 'list',
                options: [
                    [0, t('Call to PSTN')],
                    [1, t('PJSIP')],
                    [2, t('IVR')],
                    [3, t('CallingCard')],
                    [4, t('Direct extension')],
                    [5, t('CID Callback')],
                    [6, t('0800 Callback')],
                    [7, t('Queue')],
                    [8, t('SIP group')],
                    [9, t('Custom')],
                    [10, t('Context')],
                    [11, t('Multiples IPs')]
                ]
            }
        }, {
            header: t('Time used'),
            renderer: Helper.Util.formatsecondsToTime,
            dataIndex: 'secondusedreal',
            flex: 3
        }, {
            header: t('priority'),
            dataIndex: 'priority',
            flex: 1
        }, {
            header: t('Creation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'creationdate',
            flex: 5
        }]
        me.callParent(arguments);
    }
});