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
            history = result.history || {},
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

        html += me.renderHistory(history, result.trunkAlerts || {});

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

    renderHistory: function(history, trunkAlerts) {
        var me = this,
            invite = history.invite || {},
            entries = history.entries || [],
            serverName = invite.server && invite.server.name,
            html = '<section class="call-history"><h3>' +
                me.encode(t('Call history')) + '</h3><ol class="timeline">';

        if (invite.at) {
            html += '<li class="timeline-item invite"><div class="timeline-time">' +
                me.encode(invite.at) + '</div><div class="timeline-card"><strong>' +
                me.encode(t('INVITE received')) + '</strong><p>' +
                me.formatText(
                    'The call arrived at server {0}.',
                    [serverName || t('Unknown')]
                ) + '</p><p class="metadata">' + me.encode(t('Uniqueid')) + ': <code>' +
                me.encode(invite.uniqueid) + '</code>';
            if (invite.unixTimestamp !== null && invite.unixTimestamp !== undefined) {
                html += ' · ' + me.encode(t('Unix timestamp')) + ': <code>' +
                    me.encode(invite.unixTimestamp) + '</code>';
            }
            html += '</p></div></li>';
        }

        Ext.Array.each(entries, function(entry) {
            var raw = entry.raw || {},
                trunk = entry.trunk || {},
                alerts = entry.sentinelAlerts || [],
                interval = entry.secondsAfterPrevious,
                intervalKey = 'seconds after the previous attempt';

            if (entry.sequence === 1) {
                interval = entry.secondsAfterInvite;
                intervalKey = 'seconds after the INVITE';
            }
            html += '<li class="timeline-item attempt"><div class="timeline-time">' +
                me.encode(entry.eventTime) + '</div><div class="timeline-card"><strong>' +
                me.formatText('Attempt {0}: trunk {1}', [
                    entry.sequence,
                    trunk.name || ('#' + trunk.id)
                ]) + '</strong>';
            if (interval !== null && interval !== undefined) {
                html += '<p class="elapsed">' + me.encode(interval) + ' ' +
                    me.encode(t(intervalKey)) + '.</p>';
            }
            if (entry.isNextTrunk) {
                html += '<p>' +
                    me.encode(t('MagnusBilling then tried the next observed trunk.')) +
                    '</p>';
            }
            html += '<p>' + me.formatText('The trunk returned {0} {1}.', [
                raw.code,
                raw.reason || t('Unknown')
            ]) + '</p>' + me.renderTrunkAlertStatus(
                alerts,
                trunkAlerts.available
            ) + '</div></li>';
        });

        if (!invite.at && !entries.length) {
            html += '<li>' + me.encode(t('No correlated event was found.')) + '</li>';
        }
        return html + '</ol></section>';
    },

    renderTrunkAlertStatus: function(alerts, available) {
        var me = this,
            html;

        if (!available) {
            return '<p class="sentinel-alert unavailable">' +
                me.encode(t('Sentinel alert status is unavailable.')) + '</p>';
        }
        if (!alerts.length) {
            return '<p class="sentinel-alert none">' +
                me.encode(t('At the time of this diagnostic, Magnus Sentinel has no active alert for this trunk.')) +
                '</p>';
        }
        html = '<div class="sentinel-alert active"><p>' +
            me.formatText(
                'At the time of this diagnostic, Magnus Sentinel has {0} active alert(s) for this trunk.',
                [alerts.length]
            ) + '</p><ul>';
        Ext.Array.each(alerts, function(alert) {
            html += '<li><strong>' + me.encode(alert.severity || '') + '</strong> — ' +
                me.encode(alert.type || '');
            if (alert.summary) {
                html += ': ' + me.encode(alert.summary);
            }
            html += '</li>';
        });
        return html + '</ul><p class="causality-warning">' +
            me.encode(t('An active alert does not prove that it caused this call.')) +
            '</p></div>';
    },

    formatText: function(template, values) {
        var translated = String(t(template));
        Ext.Array.each(values || [], function(value, index) {
            translated = translated.replace(
                new RegExp('\\{' + index + '\\}', 'g'),
                String(value === undefined || value === null ? '' : value)
            );
        });
        return this.encode(translated);
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
            '.call-history{margin:18px 0}.timeline{list-style:none;margin:0;padding:0 0 0 18px;' +
            'border-left:3px solid #d7dce2}.timeline-item{position:relative;margin:0 0 14px 0;padding-left:18px}' +
            '.timeline-item:before{content:"";position:absolute;left:-25px;top:4px;width:11px;height:11px;' +
            'border-radius:50%;background:#1976d2;border:3px solid #fff;box-shadow:0 0 0 1px #1976d2}' +
            '.timeline-item.attempt:before{background:#ef6c00;box-shadow:0 0 0 1px #ef6c00}' +
            '.timeline-time{color:#555;font-size:12px;font-weight:bold;margin-bottom:4px}' +
            '.timeline-card{background:#f8fafc;border:1px solid #dfe4ea;border-radius:4px;padding:10px 12px}' +
            '.timeline-card p{margin:6px 0}.metadata,.elapsed{color:#555;font-size:12px}' +
            '.sentinel-alert{border-left:3px solid #78909c;padding:6px 9px;margin-top:9px!important;' +
            'background:#eef3f5}.sentinel-alert.active{border-color:#ef6c00;background:#fff4e5}' +
            '.sentinel-alert.none{border-color:#2e7d32;background:#edf7ee}' +
            '.sentinel-alert ul{margin:5px 0;padding-left:20px}.causality-warning{font-size:12px;color:#6d4c41}' +
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
