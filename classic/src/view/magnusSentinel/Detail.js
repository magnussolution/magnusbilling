/**
 * Detalhe sob demanda dos incidentes do Magnus Sentinel.
 */
Ext.define('MBilling.view.magnusSentinel.Detail', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.magnussentineldetail',
    reference: 'incidentDetail',
    title: t('Problem details'),
    bodyPadding: 14,
    border: true,
    split: true,
    collapsible: true,
    scrollable: true,
    minWidth: 340,
    initComponent: function() {
        var me = this;
        me.tpl = Ext.create('Ext.XTemplate',
            '<tpl if="loaded">',
                '<div style="border-left:6px solid {priorityColor};padding-left:12px">',
                    '<div style="font-weight:bold;color:{priorityColor};">',
                        '{priority:htmlEncode}',
                    '</div>',
                    '<h2 style="margin:5px 0 8px">{title:htmlEncode}</h2>',
                    '<p>{summary:htmlEncode}</p>',
                '</div>',
                '<div style="background:#f5f5f5;padding:9px;margin:12px 0">',
                    '<b>' + t('Component') + ':</b> {entity:htmlEncode}<br>',
                    '<b>' + t('State') + ':</b> {state:htmlEncode}<br>',
                    '<b>' + t('First detection') + ':</b> {firstSeen:htmlEncode}<br>',
                    '<b>' + t('Last detection') + ':</b> {lastSeen:htmlEncode}',
                '</div>',
                '<h3>' + t('Impact') + '</h3><p>{impact:htmlEncode}</p>',
                '<h3>' + t('Probable cause'),
                    ' <span class="x-fa fa-info-circle" tabindex="0" role="img"' +
                        ' data-qtip="{probableCauseHelp:htmlEncode}"' +
                        ' aria-label="{probableCauseHelp:htmlEncode}"' +
                        ' style="color:#205493;cursor:help;font-size:14px"></span>',
                '</h3>',
                '<p>{probableCause:htmlEncode} ',
                    '<tpl if="hypothesis">',
                        '<span style="background:#fff0d8;color:#7a3900;' +
                            'padding:2px 6px;border-radius:8px">',
                            t('Hypothesis to confirm'),
                        '</span>',
                    '</tpl>',
                '</p>',
                '<p style="color:#555"><b>' + t('Analysis confidence') +
                    ':</b> {confidence:htmlEncode}</p>',
                '<div style="border-left:5px solid #205493;background:#edf5ff;' +
                    'padding:8px 12px;margin:12px 0">',
                    '<h3 style="margin-top:0">' + t('Recommended action') + '</h3>',
                    '<p>{recommendedAction:htmlEncode}</p>',
                    '<h4 style="margin:10px 0 3px">' +
                        t('What the operator can do') + '</h4>',
                    '<tpl if="operatorSteps.length">',
                        '<ol style="padding-left:22px;margin-bottom:8px">',
                        '<tpl for="operatorSteps">',
                            '<li style="margin-bottom:5px">{.:htmlEncode}</li>',
                        '</tpl>',
                        '</ol>',
                    '</tpl>',
                    '<tpl if="technicalSteps.length">',
                        '<h4 style="margin:10px 0 3px">' +
                            t('For technical support') + '</h4>',
                        '<ol style="padding-left:22px;margin-bottom:0">',
                        '<tpl for="technicalSteps">',
                            '<li style="margin-bottom:5px">{.:htmlEncode}</li>',
                        '</tpl>',
                        '</ol>',
                    '</tpl>',
                '</div>',
                '<h3>' + t('Evidence') + '</h3>',
                '<tpl if="evidence.length">',
                    '<table style="width:100%;border-collapse:collapse">',
                    '<tpl for="evidence">',
                        '<tr><td style="padding:5px;border-bottom:1px solid #ddd">',
                            '{label:htmlEncode}',
                            '<tpl if="help">',
                                ' <span class="x-fa fa-info-circle" tabindex="0"' +
                                    ' role="img" data-qtip="{help:htmlEncode}"' +
                                    ' aria-label="{help:htmlEncode}"' +
                                    ' style="color:#205493;cursor:help"></span>',
                            '</tpl>',
                        '</td><td style="padding:5px;border-bottom:1px solid #ddd;' +
                            'font-weight:bold">{value:htmlEncode}</td></tr>',
                    '</tpl>',
                    '</table>',
                '<tpl else>',
                    '<p>' + t('No additional evidence available.') + '</p>',
                '</tpl>',
                '<h3>' + t('State history') + '</h3>',
                '<tpl if="transitions.length">',
                    '<tpl for="transitions">',
                        '<div style="border-left:3px solid #999;padding:3px 8px;' +
                            'margin-bottom:7px">',
                            '<b>{state:htmlEncode}</b><br>',
                            '<small>{date:htmlEncode}<tpl if="note"> · ',
                                '{note:htmlEncode}</tpl></small>',
                        '</div>',
                    '</tpl>',
                '<tpl else>',
                    '<p>' + t('No manual state changes.') + '</p>',
                '</tpl>',
            '<tpl else>',
                '<div style="text-align:center;color:#666;padding:28px">',
                    '<h3>' + t('No incident selected') + '</h3>',
                    '<p>' + t('Select an incident to see what happened, the evidence and the recommended action.') + '</p>',
                '</div>',
            '</tpl>'
        );
        me.data = {
            loaded: false
        };
        me.callParent(arguments);
    },
    clearIncident: function() {
        this.update({
            loaded: false
        });
    },
    showError: function(message) {
        this.update({
            loaded: true,
            priority: t('Error'),
            priorityColor: '#b42318',
            title: t('Unable to open details'),
            summary: message,
            entity: '',
            state: '',
            firstSeen: '',
            lastSeen: '',
            impact: '',
            probableCause: '',
            probableCauseHelp: '',
            confidence: '',
            hypothesis: false,
            recommendedAction: '',
            operatorSteps: [],
            technicalSteps: [],
            evidence: [],
            transitions: []
        });
    }
});
