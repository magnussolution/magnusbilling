/**
 * Classe que define o panel de "dashboard"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.dashboard.Module', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashboardmodule',
    autoShow: true,
    xtype: 'container',
    bodyPadding: 5,
    requires: ['MBilling.view.dashboard.Trunks', 'Ext.ux.layout.ResponsiveColumn', 'MBilling.view.dashboard.Network', 'MBilling.view.dashboard.NetworkChart', 'MBilling.view.dashboard.DashboardController'],
    layout: 'responsivecolumn',
    controller: 'dashboard',
    listeners: {
        render: 'onRenderModule'
    },
    initComponent: function() {
        var me = this;
        if (window.isTablet) {
            me.items = [{}]
        } else if (window.customDashboard && !App.user.isAdmin) {
            me.items = [{
                header: false,
                bodyPadding: 0,
                style: 'background-color:transparent;',
                bodyStyle: 'background-color:transparent !important;',
                html: '<br><iframe src="index.php/notice/read" scrolling="yes" frameborder="0" style="border:none; overflow:hidden; width:100%; height:600px; margin-top:0px" allowTransparency="true"></iframe>',
                collapseDirection: 'bottom',
                collapsible: true,
                autoScroll: true,
                height: Ext.Element.getViewportHeight()
            }];
        } else {
            //verifica se a opção comprar credito e did estao ativos
            showDid = showBuy = showCampaignDashBoad = false;
            if (!App.user.isAdmin) {
                Ext.each(App.user.menu, function(menuItem) {
                    if (!Ext.isEmpty(menuItem.rows)) {
                        Ext.each(menuItem.rows, function(item) {
                            if (item.module == 'didbuy') {
                                showDid = true;
                            }
                            if (item.module == 'buycredit') {
                                showBuy = true;
                            }
                            if (item.module == 'campaign') {
                                showCampaignDashBoad = true;
                            }
                        }, me);
                    }
                }, me);
                if (App.user.social_media_network.length > 10) {
                    facebookhtml = '<br><iframe src="' + App.user.social_media_network + '" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100%; height:600px; margin-top:0px" allowTransparency="true"></iframe>';
                }
            }
            width = window.isTablet ? Ext.Element.getViewportWidth() - 240 : Ext.Element.getViewportWidth() - 220;
            height = (Ext.Element.getViewportHeight() - 130) / 2;
            if (App.user.isAdmin) {
                me.items = [{
                    xtype: 'network',
                    // 60% width when viewport is big enough,
                    // 100% when viewport is small
                    height: height,
                    userCls: 'big-60 small-100'
                }, {
                    xtype: 'component',
                    bodyPadding: 5,
                    baseCls: 'weather-panel',
                    border: false,
                    height: (height - 60) / 4,
                    reference: 'totalusersdiv',
                    cls: 'weather-panel shadow',
                    userCls: 'big-40 small-100'
                }, {
                    xtype: 'component',
                    baseCls: 'weather-panel',
                    border: false,
                    height: (height - 60) / 4,
                    reference: 'maximumcc',
                    cls: 'weather-panel shadow',
                    userCls: 'big-40 small-100'
                }, {
                    xtype: 'component',
                    baseCls: 'weather-panel',
                    border: false,
                    height: (height - 60) / 4,
                    reference: 'monthprofitdiv',
                    cls: 'weather-panel shadow',
                    userCls: 'big-40 small-100',
                    hidden: App.user.hidden_prices == 1
                }, {
                    xtype: 'component',
                    baseCls: 'weather-panel',
                    border: false,
                    height: (height - 60) / 4,
                    reference: 'totalrefill',
                    cls: 'weather-panel shadow',
                    userCls: 'big-40 small-100',
                    hidden: App.user.hidden_prices == 1
                }, {
                    xtype: 'callonlinechartchart',
                    title: t('Simultaneous calls'),
                    cls: 'dashboard-main-chart shadow',
                    height: height,
                    showDownload: false,
                    hiddenButtonsCharts: true,
                    userCls: 'big-60 small-100'
                }, {
                    xtype: 'trunks',
                    userCls: 'big-40 small-100'
                }]
            } else {
                if (App.user.showMCDashBoard == true && showCampaignDashBoad) {
                    me.items = [{
                        xtype: 'campaigndashboardlist',
                        header: true,
                        title: t('DashBoard callcenter'),
                        height: Ext.Element.getViewportHeight() - 130,
                        userCls: 'big-100 small-100',
                        cls: 'dashboard-main-chart shadow'
                    }]
                } else {
                    me.items = [{
                        xtype: 'buycreditmodule',
                        header: true,
                        title: t('Buy credit'),
                        // 60% width when viewport is big enough,
                        // 100% when viewport is small
                        height: height,
                        userCls: 'big-50 small-100',
                        hidden: !showBuy,
                        cls: 'dashboard-main-chart shadow'
                    }, {
                        xtype: 'didbuymodule',
                        header: true,
                        title: t('Buy DID'),
                        height: height,
                        userCls: 'big-50 small-100',
                        hidden: !showDid || !App.user.isClient,
                        cls: 'dashboard-main-chart shadow'
                    }]
                }
            }
        }
        me.callParent(arguments);
    }
});