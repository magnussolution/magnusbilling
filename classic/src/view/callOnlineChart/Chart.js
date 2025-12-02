/**
 * Classe que define o grafico de "call"
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
Ext.define('MBilling.view.callOnlineChart.Chart', {
    extend: 'Ext.ux.panel.Chart',
    alias: 'widget.callonlinechartchart',
    controller: 'callsummaryperday',
    store: 'CallOnlineChart',
    fieldValue: ['total', 'answer'],
    fieldDescription: 'date',
    labelYLine: t('Total / Min'),
    labelXLine: t('Time'),
    reference: 'callonlinechartchart',
    defaultChart: 'line',
    btnShowColumn: false,
    btnShowBar: false,
    btnShowLine: true,
    btnShowPie: false,
    animate: true,
    btnShowLineHidden: true,
    radius: 1,
    hiddenButtonsCharts: true,
    insetPadding: 0,
    initComponent: function() {
        var me = this;
        me.rendererLegend = function(value) {
            if (value == 'answer') {
                value = 'answered';
            }
            return t(value.charAt(0).toUpperCase() + value.slice(1));
        }
        me.rendererFieldValue = function(axis, label, layoutContext) {
            return layoutContext.renderer(label);
        };
        me.tbarChart = [{
            text: '1' + ' ' + t('hour'),
            scope: me,
            handler: 'onPerMinute',
            value: '1'
        }, {
            text: '6' + ' ' + t('hours'),
            scope: me,
            handler: 'onPerMinute',
            value: '6'
        }, {
            text: '12' + ' ' + t('hours'),
            scope: me,
            handler: 'onPerMinute',
            value: '12'
        }, {
            text: '1' + ' ' + t('Day'),
            scope: me,
            handler: 'onPerMinute',
            value: '24'
        }, {
            text: '2' + ' ' + t('days'),
            scope: me,
            handler: 'onPerMinute',
            value: '48'
        }, {
            text: '3' + ' ' + t('days'),
            scope: me,
            handler: 'onPerMinute',
            value: '36'
        }, {
            text: '1' + ' ' + t('week'),
            scope: me,
            handler: 'onPerMinute',
            value: '168'
        }];
        me.legend = {
            position: 'right',
            boxStrokeWidth: 0,
            labelFont: '12px Helvetica',
            renderer: me.rendererLegend
        };
        me.bbarChart = [{
            xtype: 'tbtext',
            itemId: 'tbTextSum'
        }];
        me.sessionLoad = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load();
        }, me);
        me.callParent(arguments);
        me.store.on('load', me.onLoadStore, me);
    },
    onPerMinute: function(btn) {
        var me = this;
        me.store.setRemoteFilter(true);
        me.store.filter('hours', btn.value);
        me.store.load();
    },
    onLoadStore: function() {
        this.onActivateModule();
    },
    onActivateModule: function() {
        this.sessionLoad && this.sessionLoad.delay(30000);
    }
});