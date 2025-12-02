/**
 * Classe que define a lista de "CampaignPollInfo"
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
 * 19/09/2012
 */
Ext.define('MBilling.view.campaignPollInfo.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.campaignpollinfolist',
    store: 'CampaignPollInfo',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.extraButtons = [{
            text: t('Charts'),
            iconCls: 'icon-chart-column',
            handler: 'onChart',
            reference: 'chart',
            disabled: true
        }];
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Number'),
            dataIndex: 'number',
            flex: 4
        }, {
            xtype: 'templatecolumn',
            tpl: '{idCampaignPollname}',
            header: t('Poll'),
            dataIndex: 'id_campaign_poll',
            comboFilter: 'campaignpollcombo',
            flex: 4
        }, {
            header: t('Result'),
            dataIndex: 'resposta',
            flex: 4
        }, {
            header: t('City'),
            dataIndex: 'city',
            flex: 4
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'date',
            flex: 4
        }]
        me.callParent(arguments);
    }
});