/**
 * Classe que define o grafico de "refill"
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
 * 13/02/2012
 */
Ext.define('MBilling.view.dashboard.TrunkChart', {
    extend: 'Ext.ux.panel.Chart',
    alias: 'widget.trunkchart',
    controller: 'main',
    store: 'TrunkChart',
    fieldDescription: '',
    labelYLine: '',
    labelXLine: '',
    reference: 'networkchart',
    defaultChart: 'pie',
    btnShowColumn: false,
    btnShowBar: false,
    btnShowLine: false,
    btnShowPie: true,
    animate: true,
    btnShowLineHidden: true,
    radius: 1,
    showDownload: false,
    animation: true,
    insetPadding: 0,
    hiddenButtonsCharts: true,
    heightChart: 110,
    showLegendPie: false,
    donut: 40,
    initComponent: function() {
        var me = this;
        me.rendererFieldDescription = function(axis, label, layoutContext) {
            return t(me.fieldValue);
        };
        me.rendererFieldValue = function(value, description) {
            if (description == 'lucro') {
                return App.user.currency + ' ' + value.toFixed(2);
            } else {
                return value;
            }
        };
        me.chartPie = {
            xtype: 'polar',
            itemId: 'pie',
            height: me.heightChart,
            width: me.width,
            store: me.store,
            colors: ['#fdbf00', '#6aa5dc', '#ee929d'],
            legend: {
                position: me.positionLegendPie,
                renderer: me.rendererFieldDescription
            },
            series: me.series.length || [{
                donut: me.donut,
                type: 'pie',
                angleField: me.fieldValue,
                showInLegend: me.showLegendPie,
                tooltip: {
                    trackMouse: true,
                    width: me.widthTip,
                    renderer: me.rendererPie(me.fieldDescription, me.rendererFieldValue, me.rendererFieldDescription, me.limitCharLabelTip)
                },
                highlight: {
                    segment: {
                        margin: 20
                    }
                }
            }]
        };
        me.sessionLoad = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load({
                scope: me,
                callback: function(record) {}
            });
        }, me);
        me.callParent(arguments);
        me.store.on('load', me.onLoadStore, me);
    },
    onLoadStore: function() {
        this.onActivateModule();
    },
    onActivateModule: function() {
        this.sessionLoad && this.sessionLoad.delay(5000);
    }
});