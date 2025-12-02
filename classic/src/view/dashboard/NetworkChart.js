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
Ext.define('MBilling.view.dashboard.NetworkChart', {
    extend: 'Ext.ux.panel.Chart',
    alias: 'widget.networkchart',
    controller: 'main',
    store: 'StatusSystem',
    fieldValue: ['networkin', 'networkout'],
    fieldDescription: 'date',
    labelYLine: '', //t('Network'),
    labelXLine: t('Network'),
    reference: 'networkchart',
    defaultChart: 'line',
    btnShowColumn: false,
    btnShowBar: false,
    btnShowLine: true,
    btnShowPie: false,
    animate: true,
    btnShowLineHidden: true,
    radius: 1,
    showDownload: false,
    animation: true,
    insetPadding: 0,
    verticalLinesHidden: true,
    horizontalLinesHidden: false,
    hiddenButtonsCharts: true,
    seriesLine: [{
        type: 'line',
        colors: ['rgba(103, 144, 199, 0.6)'],
        useDarkerStrokeColor: false,
        xField: 'date',
        yField: ['networkin'],
        fill: true,
        smooth: true
    }, {
        type: 'line',
        colors: ['rgba(238, 146, 156, 0.6)'],
        useDarkerStrokeColor: false,
        xField: 'date',
        yField: ['networkout'],
        fill: true,
        smooth: true
    }],
    initComponent: function() {
        var me = this;
        me.rendererFieldValue = function(axis, label, layoutContext) {
            return layoutContext.renderer(label) + 'kb/s';
        };
        me.sessionLoad = Ext.create('Ext.util.DelayedTask', function() {
            me.store.load({
                scope: me,
                callback: function(record) {}
            });
        }, me);
        me.sprites = [{
            type: 'text',
            text: t('Network usage'),
            fontSize: 10,
            width: 100,
            height: 30,
            x: 100, // the sprite x position
            y: 150 // the sprite y position
        }];
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