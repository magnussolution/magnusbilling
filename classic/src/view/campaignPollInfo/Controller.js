/**
 * Classe que define a lista de "CallShopCdr"
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
 * 01/10/2013
 */
Ext.define('MBilling.view.campaignPollInfo.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.campaignpollinfo',
    aliasChart: 'campaignpollinfochart',
    onRenderModule: function() {
        var me = this,
            btnChart = me.lookupReference('chart');
        me.callParent(arguments);
        me.store.on({
            scope: me,
            beforeload: function() {
                btnChart.disable();
            },
            load: function(store) {
                btnChart.enable();
            }
        });
    },
    onChart: function() {
        var me = this,
            store = me.list.getStore(),
            filters = me.list.filters.getFilterData(),
            haveFilter = false,
            onlyOnePoll = false;
        if (!filters) {
            Ext.ux.Alert.alert('Alert', t('Use filters'), 'information');
            return;
        }
        Ext.each(filters, function(filter) {
            if (filter.field == 'id_campaign_poll') {
                if (filter.data.value.length == 1) {
                    onlyOnePoll = true;
                }
                haveFilter = true;
                return;
            }
        });
        if (!haveFilter) {
            Ext.ux.Alert.alert('Alert', t('Select one or more poll to create a chart'), 'information');
            return;
        }
        me.chart = Ext.widget('window', {
            title: t('Charts'),
            iconCls: 'icon-chart-column',
            layout: 'fit',
            autoShow: true,
            modal: true,
            resizable: false,
            width: window.isThemeNeptune ? 740 : 710,
            items: {
                xtype: me.aliasChart,
                titleText: onlyOnePoll ? store.getData().items[0].data.idCampaignPollname : '',
                list: me.list
            }
        });
    }
});