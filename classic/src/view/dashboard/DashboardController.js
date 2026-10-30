Ext.define('MBilling.view.dashboard.DashboardController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.dashboard',
    onHideView: function() {
        //
    },
    onRenderModule: function() {
        var me = this;
        if (App.user.isAdmin) {
            storeStatusSystem = Ext.create('MBilling.store.StatusSystem');
            storeStatusSystem.load({
                scope: me,
                callback: function(record) {
                    me.onUpdateDashboardNetWork(record)
                }
            });
            setInterval(function() {
                storeStatusSystem.load({
                    scope: me,
                    callback: function(record) {
                        me.onUpdateDashboardNetWork(record)
                    }
                });
            }, 10000);
        }
    },
    toggleCallsChart: function(chart, tool) {
        var me = this,
            view = me.getView();
        Ext.suspendLayouts();
        if (me.maximizedCallsChart) {
            chart.setHeight(me.callsChartHeight);
            Ext.each(me.hiddenDashboardItems, function(item) {
                if (!item.destroyed) {
                    item.show();
                }
            });
            me.maximizedCallsChart = null;
            me.hiddenDashboardItems = null;
            tool.setType('maximize');
            tool.setTooltip(t('Maximize'));
        } else {
            me.callsChartHeight = chart.getHeight();
            me.hiddenDashboardItems = [];
            view.items.each(function(item) {
                if (item !== chart && !item.hidden) {
                    me.hiddenDashboardItems.push(item);
                    item.hide();
                }
            });
            me.maximizedCallsChart = chart;
            me.onDashboardResize();
            tool.setType('restore');
            tool.setTooltip(t('Restore'));
        }
        Ext.resumeLayouts(true);
    },
    onDashboardResize: function() {
        var me = this,
            view = me.getView();
        if (me.maximizedCallsChart && view.body) {
            me.maximizedCallsChart.setHeight(Math.max(250, view.body.getHeight() - 30));
        }
    },
    onUpdateDashboardNetWork: function(record) {
        var me = this;
        //cpu
        me.lookupReference('cpuMediaUso').update('<span class="x-fa fa-hdd-o "> &nbsp;' + t('CPU actual usage') + ': ' + record[0].data.cpuPercent + '% </span> &nbsp;&nbsp;&nbsp;&nbsp;<span class="x-fa fa-hdd-o" style="text-align: right;"> ' + t('Load Average') + ': ' + record[0].data.cpuMediaUso + '%</span>');
        me.lookupReference('cpuPercent').setValue(record[0].data.cpuPercent / 100);
        if (record[0].data.disk_perc > 90) {
            me.lookupReference('diskFree').update('<span class="x-fa fa-server"><font color=red>&nbsp; <b>Disk Avail ' + record[0].data.disk_free + 'G. ' + record[0].data.disk_perc + '% USED</b></font></span>');
        } else {
            me.lookupReference('diskFree').update('<span class="x-fa fa-server">&nbsp; Disk Avail ' + record[0].data.disk_free + 'G</span>');
        }
        me.lookupReference('diskPerc').setValue(record[0].data.disk_perc / 100);
        //memory
        me.lookupReference('memTotal').update(record[0].data.memTotal + '&nbsp;GB ');
        me.lookupReference('memUsed').update(record[0].data.memUsed + '&nbsp;GB ');
        me.lookupReference('uptime').update(record[0].data.uptime);
        //
        imageContainerHeight = me.lookupReference('totalusersdiv').height;
        userstpl = '<div class="weather-image-container" style="height: ' + imageContainerHeight + 'px;"><img src="resources/images/icons/users-icon.png" style="height: ' + imageContainerHeight * 0.6 + 'px;" alt="' + t('Active users') + '"/></div>' + '<div class="weather-details-container">' + '<div>' + record[0].data.totalActiveUsers + '</div>' + '<div>' + t('Active users') + '</div>' + '</div>'
        me.lookupReference('totalusersdiv').update(userstpl);
        userstpl = '<div class="weather-image-container" style="height: ' + imageContainerHeight + 'px;"><img src="resources/images/icons/profit-icon.png" style="height: ' + imageContainerHeight * 0.6 + 'px;" alt="' + t('Month profit') + '"/></div>' + '<div class="weather-details-container">' + ' <div>' + App.user.currency + ' ' + record[0].data.monthprofit + '</div>' + '<div>' + t('Month profit') + '</div>' + '</div>'
        me.lookupReference('monthprofitdiv').update(userstpl);
        userstpl = '<div class="weather-image-container" style="height: ' + imageContainerHeight + 'px;"><img src="resources/images/icons/calls-icon.png" style="height: ' + imageContainerHeight * 0.6 + 'px;" alt="' + t('Today peak') + '"/></div>' + '<div class="weather-details-container">' + ' <div>' + ' ' + record[0].data.maximumcc + '</div>' + '<div>' + t('Today peak') + '</div>' + '</div>'
        me.lookupReference('maximumcc').update(userstpl);
        userstpl = '<div class="weather-image-container" style="height: ' + imageContainerHeight + 'px;"><img src="resources/images/icons/profit-icon.png" style="height: ' + imageContainerHeight * 0.6 + 'px;" alt="' + t('Month refill') + '"/></div>' + '<div class="weather-details-container">' + ' <div>' + App.user.currency + ' ' + record[0].data.monthRefill + '</div>' + '<div>' + t('Month refill') + '</div>' + '</div>'
        me.lookupReference('totalrefill').update(userstpl);
    }
});