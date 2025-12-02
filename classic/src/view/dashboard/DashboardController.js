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
            storeTrunkChart = Ext.create('MBilling.store.TrunkChart');
            storeTrunkChart.load({
                scope: me,
                callback: function(record) {
                    if (record[0]) {
                        me.onUpdateDashboardTrunk(record)
                    }
                }
            });
            setInterval(function() {
                storeTrunkChart.load({
                    scope: me,
                    callback: function(record) {
                        me.onUpdateDashboardTrunk(record)
                    }
                });
            }, 30000);
        }
    },
    onUpdateDashboardTrunk: function(record) {
        var me = this;
        trunkDetails = '<div class="services-text">' + t('Trunk chart') + '</div>' + '<div class="services-legend">';
        if (record[0]) {
            avarege = (record[0].data.sessionbill * 100) / record[0].data.sumsessionbill;
            me.lookupReference('trunkDashboardFields').items.items[0].update('<div class="left-aligned-div">' + record[0].data.idTrunktrunkcode + '</div><div class="right-aligned-div">' + avarege.toFixed(2) + '%</div>');
            me.lookupReference('trunkDashboardFields').items.items[1].setValue(avarege / 100);
            trunkDetails += '<span><div class="legend-trunk1"></div>' + record[0].data.idTrunktrunkcode + '</span>';
        }
        if (record[1]) {
            avarege = (record[1].data.sessionbill * 100) / record[0].data.sumsessionbill;
            me.lookupReference('trunkDashboardFields').items.items[2].update('<div class="left-aligned-div">' + record[1].data.idTrunktrunkcode + '</div><div class="right-aligned-div">' + avarege.toFixed(2) + '%</div>');
            me.lookupReference('trunkDashboardFields').items.items[3].setValue(avarege / 100);
            trunkDetails += '<span><div class="legend-trunk2"></div>' + record[1].data.idTrunktrunkcode + '</span>';
        }
        if (record[2]) {
            avarege = (record[2].data.sessionbill * 100) / record[0].data.sumsessionbill;
            me.lookupReference('trunkDashboardFields').items.items[4].update('<div class="left-aligned-div">' + record[2].data.idTrunktrunkcode + '</div><div class="right-aligned-div">' + avarege.toFixed(2) + '%</div>');
            me.lookupReference('trunkDashboardFields').items.items[5].setValue(avarege / 100);
            trunkDetails += '<span><div class="legend-trunk3"></div>' + record[2].data.idTrunktrunkcode + '</span>';
        }
        trunkDetails += '<div>';
        me.lookupReference('trunkDashboardFields').items.items[6].update(trunkDetails);
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