/**
 * Resumo por prioridade dos incidentes do Magnus Sentinel.
 */
Ext.define('MBilling.view.magnusSentinel.Summary', {
    extend: 'Ext.container.Container',
    alias: 'widget.magnussentinelsummary',
    region: 'north',
    height: 92,
    padding: 10,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaults: {
        xtype: 'component',
        flex: 1,
        margin: '0 8 0 0'
    },
    initComponent: function() {
        var me = this;
        me.items = [{
            itemId: 'criticalSummary',
            style: 'background:#fff;border:1px solid #d9d9d9;' +
                'border-left:6px solid #b42318;padding:12px;',
            html: me.summaryHtml(0, t('Check now'))
        }, {
            itemId: 'warningSummary',
            style: 'background:#fff;border:1px solid #d9d9d9;' +
                'border-left:6px solid #b54708;padding:12px;',
            html: me.summaryHtml(0, t('Monitor'))
        }, {
            itemId: 'totalSummary',
            margin: 0,
            style: 'background:#fff;border:1px solid #d9d9d9;' +
                'border-left:6px solid #4777a7;padding:12px;',
            html: me.summaryHtml(0, t('Active problems'))
        }];
        me.callParent(arguments);
    },
    summaryHtml: function(value, label) {
        return '<strong style="display:block;font-size:25px;line-height:28px">' +
            Ext.util.Format.htmlEncode(value) + '</strong><span>' +
            Ext.util.Format.htmlEncode(label) + '</span>';
    },
    setSummary: function(summary, history) {
        summary = summary || {};
        this.down('#criticalSummary').update(
            this.summaryHtml(summary.critical || 0, t('Check now'))
        );
        this.down('#warningSummary').update(
            this.summaryHtml(summary.warning || 0, t('Monitor'))
        );
        this.down('#totalSummary').update(
            this.summaryHtml(
                summary.total || 0,
                history ? t('In history') : t('Active problems')
            )
        );
    }
});
