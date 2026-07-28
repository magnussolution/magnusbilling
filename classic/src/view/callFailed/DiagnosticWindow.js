Ext.define('MBilling.view.callFailed.DiagnosticWindow', {
    extend: 'Ext.window.Window',
    xtype: 'callfaileddiagnosticwindow',
    width: 820,
    height: 650,
    modal: true,
    constrain: true,
    closeAction: 'destroy',
    layout: 'fit',
    title: t('Diagnose call'),

    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'panel',
            reference: 'resultPanel',
            scrollable: true,
            bodyPadding: 14,
            html: Ext.htmlEncode(t('Running diagnostic')),
            bodyStyle: {
                userSelect: 'text',
                webkitUserSelect: 'text',
                MozUserSelect: 'text',
                cursor: 'text'
            }
        }];
        me.callParent(arguments);
        me.on('afterrender', me.loadDiagnostic, me, {single: true});
    },

    loadDiagnostic: function() {
        var me = this;
        me.setLoading(t('Running diagnostic'));
        Ext.Ajax.request({
            url: 'index.php/callDiagnostic/cdrFailed',
            method: 'POST',
            params: {
                cdrFailedId: me.cdrFailedId
            },
            callback: function() {
                if (!me.destroyed) me.setLoading(false);
            },
            success: function(response) {
                var payload;
                try {
                    payload = Ext.decode(response.responseText);
                } catch (error) {
                    payload = {};
                }
                if (!payload.success || !payload.result) {
                    me.renderError(payload.msg || t('The diagnostic could not be completed safely.'));
                    return;
                }
                me.renderResult(payload.result);
            },
            failure: function(response) {
                var payload;
                try {
                    payload = Ext.decode(response.responseText);
                } catch (error) {
                    payload = {};
                }
                me.renderError(payload.msg || t('The diagnostic could not be completed safely.'));
            }
        });
    },

    renderError: function(message) {
        this.renderSelectableHtml(
            '<h2 class="status-inconclusive">' + this.encode(t('Diagnostic inconclusive')) + '</h2>' +
            '<p>' + this.encode(message) + '</p>'
        );
    },

    renderResult: function(result) {
        var me = this,
            status = result.status || 'inconclusive',
            call = result.call || {},
            actions = result.recommendedActions || [],
            attempts = result.attempts || [],
            facts = result.facts || [],
            limitations = result.limitations || [],
            probable = result.probableCause || {},
            technical = result.technicalDetails || {},
            html = '<section class="conclusion status-box status-' + me.safeClass(status) + '">' +
                '<div class="status-label">' + me.encode(me.statusLabel(status)) + '</div>' +
                '<h2>' + me.encode(result.summary || '') + '</h2>';

        if (actions.length) {
            html += '<h3>' + me.encode(t('Recommended action')) + '</h3><ol class="actions">';
            Ext.Array.each(actions, function(action) {
                html += '<li>' + me.encode(action.text) + '</li>';
            });
            html += '</ol>';
        }
        html += '</section>';

        html += '<section><h3>' + me.encode(t('Call data')) + '</h3><table>' +
            me.row(t('Date'), call.startedAt) +
            me.row(t('Number'), call.calledNumber) +
            me.row(t('CallerID'), call.callerId) +
            me.row(t('Username'), call.user && call.user.name) +
            me.row(t('Plan'), call.plan && call.plan.name) +
            me.row(t('Destination'), call.prefix && call.prefix.name) +
            me.row(t('Trunk'), call.cdrTrunk && call.cdrTrunk.name) +
            me.row(t('Server'), call.server && call.server.name) +
            '</table></section>';

        if (probable.text) {
            html += '<section><h3>' + me.encode(t('Probable cause')) + '</h3><p>' +
                me.encode(probable.text) + ' <span class="confidence">(' +
                me.encode(t('Confidence')) + ': ' + me.encode(probable.confidence || '') +
                ')</span></p></section>';
        }

        html += '<details><summary>' + me.encode(t('Evidence')) +
            ' (' + attempts.length + ')</summary><div class="details-body">';
        if (facts.length) {
            html += '<ul>';
            Ext.Array.each(facts, function(fact) {
                html += '<li>' + me.encode(fact.text) + '</li>';
            });
            html += '</ul>';
        }
        if (attempts.length) {
            html += '<table><thead><tr><th>#</th><th>' + me.encode(t('Date')) +
                '</th><th>' + me.encode(t('Trunk')) + '</th><th>' +
                me.encode(t('Server')) + '</th><th>' + me.encode(t('SIP code')) +
                '</th><th>' + me.encode(t('Reason')) + '</th></tr></thead><tbody>';
            Ext.Array.each(attempts, function(attempt) {
                html += '<tr><td>' + me.encode(attempt.sequence) + '</td><td>' +
                    me.encode(attempt.eventTime) + '</td><td>' +
                    me.encode(attempt.trunk && attempt.trunk.name) + '</td><td>' +
                    me.encode(attempt.server && attempt.server.name) + '</td><td><code>' +
                    me.encode(attempt.raw && attempt.raw.code) + '</code></td><td>' +
                    me.encode(attempt.raw && attempt.raw.reason) + '</td></tr>';
            });
            html += '</tbody></table>';
        } else {
            html += '<p>' + me.encode(t('No correlated event was found.')) + '</p>';
        }
        html += '</div></details>';

        if (limitations.length) {
            html += '<details><summary>' + me.encode(t('Diagnostic limitations')) +
                '</summary><div class="details-body"><ul>';
            Ext.Array.each(limitations, function(item) {
                html += '<li>' + me.encode(item.text) + '</li>';
            });
            html += '</ul></div></details>';
        }

        html += '<details><summary>' + me.encode(t('Technical details')) +
            '</summary><div class="details-body"><table>' +
            me.row(t('Contract'), result.contract) +
            me.row(t('Uniqueid'), technical.rawUniqueid) +
            me.row(t('Catalog'), technical.catalog) +
            me.row(t('Hangup cause'), technical.cdrHangupCause) +
            me.row(t('Status'), result.status) +
            me.row(t('Pipeline status'), result.evidence && result.evidence.pipeline &&
                result.evidence.pipeline.status) +
            me.row(t('Event limit'), result.evidence && result.evidence.eventLimit) +
            me.row(t('Truncated'), result.evidence && result.evidence.truncated ? t('Yes') : t('No')) +
            '</table></div></details>';

        me.renderSelectableHtml(html);
    },

    statusLabel: function(status) {
        if (status === 'confirmed') return t('Confirmed');
        if (status === 'partial') return t('Partial');
        return t('Inconclusive');
    },

    row: function(label, value) {
        if (value === undefined || value === null || value === '') return '';
        return '<tr><th>' + this.encode(label) + '</th><td>' + this.encode(value) + '</td></tr>';
    },

    encode: function(value) {
        return Ext.htmlEncode(String(value === undefined || value === null ? '' : value));
    },

    safeClass: function(value) {
        value = String(value || '').toLowerCase();
        return /^(confirmed|partial|inconclusive)$/.test(value) ? value : 'inconclusive';
    },

    renderSelectableHtml: function(html) {
        var panel = this.down('[reference=resultPanel]'),
            frameId = Ext.id(null, 'failed-call-diagnostic-frame-'),
            frame,
            documentHtml;
        panel.setHtml(
            '<iframe id="' + frameId + '" title="' + this.encode(t('Diagnostic result')) + '"' +
            ' style="border:0;height:100%;width:100%;background:#fff"></iframe>'
        );
        frame = document.getElementById(frameId);
        if (!frame) return;
        documentHtml = '<!doctype html><html><head><meta charset="utf-8"><style>' +
            'html,body{margin:0;background:#fff;color:#333;font:14px Arial,sans-serif;' +
            '-webkit-user-select:text;user-select:text}body{padding:16px}' +
            'h2{margin:4px 0 12px}h3{margin:12px 0 6px}section{margin-bottom:14px}' +
            '.status-box{border-left:6px solid #616161;background:#f5f5f5;padding:12px 16px}' +
            '.status-confirmed{border-color:#2e7d32;background:#edf7ee}' +
            '.status-partial{border-color:#ef6c00;background:#fff5e9}' +
            '.status-inconclusive{border-color:#616161;background:#f5f5f5}' +
            '.status-label{text-transform:uppercase;font-size:11px;font-weight:bold;letter-spacing:.08em}' +
            '.actions{font-weight:bold}.confidence{color:#666}' +
            'table{border-collapse:collapse;width:100%;margin:7px 0}' +
            'th,td{border:1px solid #ddd;padding:7px;text-align:left;vertical-align:top}' +
            'th{background:#f5f5f5}details{border-top:1px solid #ddd;padding:10px 0}' +
            'summary{cursor:pointer;font-weight:bold}.details-body{padding:8px 2px}' +
            'code{word-break:break-all}</style></head><body>' + html + '</body></html>';
        frame.contentWindow.document.open();
        frame.contentWindow.document.write(documentHtml);
        frame.contentWindow.document.close();
    }
});
