Ext.define('MBilling.view.callDiagnostic.Window', {
    extend: 'Ext.window.Window',
    xtype: 'calldiagnosticwindow',
    width: 760,
    height: 620,
    modal: false,
    constrain: true,
    layout: 'border',
    closeAction: 'destroy',

    initComponent: function() {
        var me = this,
            inbound = me.diagnosticType === 'inbound';
        me.title = inbound ? t('Check DID') : t('Check User');
        me.items = [{
            region: 'north',
            xtype: 'form',
            reference: 'inputForm',
            bodyPadding: 12,
            defaults: {
                anchor: '100%',
                labelWidth: 150
            },
            items: [{
                xtype: 'displayfield',
                fieldLabel: inbound ? t('DID') : t('SIP user'),
                value: Ext.htmlEncode(me.recordLabel)
            }, {
                xtype: 'textfield',
                name: 'number',
                fieldLabel: t('Destination number'),
                hidden: inbound,
                allowBlank: inbound,
                maxLength: 40
            }, {
                xtype: 'textfield',
                name: 'callerId',
                fieldLabel: t('CallerID'),
                value: me.defaultCallerId || '',
                maxLength: 80
            }],
            buttons: [{
                text: t('Run diagnostic'),
                iconCls: 'x-fa fa-play',
                handler: function() {
                    me.runDiagnostic();
                }
            }, {
                text: t('Check REGISTER'),
                iconCls: 'x-fa fa-sign-in',
                hidden: inbound,
                handler: function() {
                    me.runRegisterDiagnostic();
                }
            }, {
                text: t('Capture SIP packets'),
                iconCls: 'x-fa fa-exchange',
                hidden: true,
                reference: 'captureRegisterButton',
                handler: function() {
                    me.confirmRegisterCapture();
                }
            }]
        }, {
            region: 'center',
            xtype: 'panel',
            reference: 'resultPanel',
            scrollable: true,
            bodyPadding: 14,
            bodyStyle: {
                userSelect: 'text',
                webkitUserSelect: 'text',
                MozUserSelect: 'text',
                cursor: 'text'
            },
            html: Ext.htmlEncode(t('Enter the test data and run the diagnostic.')),
            listeners: {
                afterrender: function(panel) {
                    panel.body.removeCls('x-unselectable');
                    panel.body.dom.setAttribute('unselectable', 'off');
                    panel.body.on('contextmenu', function(event) {
                        event.stopPropagation();
                    });
                }
            }
        }];
        me.callParent(arguments);
        me.on('show', me.positionOverList, me);
    },

    positionOverList: function() {
        var me = this,
            view = me.ownerList && me.ownerList.getView(),
            element = view && view.getEl(),
            box,
            width,
            height;
        if (!element) return;
        box = element.getBox();
        width = Math.min(760, box.width);
        height = Math.min(620, box.height);
        me.setSize(width, height);
        me.setPosition(
            box.x + Math.max(0, (box.width - width) / 2),
            box.y + Math.max(0, (box.height - height) / 2)
        );
        me.constrainTo = element;
    },

    runDiagnostic: function() {
        var me = this,
            form = me.down('form').getForm(),
            values = form.getValues(),
            params = {
                callerId: values.callerId || '',
                language: App.lang || (window.localStorage && localStorage.getItem('lang')) || window.lang || 'en'
            };
        if (!form.isValid()) return;
        if (me.diagnosticType === 'inbound') {
            params.didId = me.recordId;
        } else {
            params.sipId = me.recordId;
            params.number = values.number;
        }
        me.setLoading(t('Running diagnostic'));
        Ext.Ajax.request({
            url: 'index.php/callDiagnostic/' + (me.diagnosticType === 'inbound' ? 'inbound' : 'outbound'),
            method: 'POST',
            params: params,
            callback: function() {
                me.setLoading(false);
            },
            success: function(response) {
                var payload = Ext.decode(response.responseText);
                if (!payload.success) {
                    Ext.ux.Alert.alert(t('Error'), payload.msg, 'error');
                    return;
                }
                me.renderResult(payload.result);
            },
            failure: function(response) {
                var payload;
                try { payload = Ext.decode(response.responseText); } catch (e) { payload = {}; }
                Ext.ux.Alert.alert(t('Error'), payload.msg || t('The diagnostic could not be completed safely.'), 'error');
            }
        });
    },

    confirmRegisterCapture: function() {
        var me = this;
        Ext.Msg.confirm(
            t('Capture SIP packets'),
            Ext.String.format(
                t('After confirming, try to register SIP account {0} on the MagnusBilling server within the next 120 seconds.'),
                Ext.htmlEncode(me.recordLabel)
            ),
            function(answer) {
                if (answer === 'yes') me.startRegisterCapture();
            }
        );
    },

    startRegisterCapture: function() {
        var me = this,
            captureButton = me.down('[reference=captureRegisterButton]');
        captureButton && captureButton.disable();
        me.setLoading(t('Starting SIP capture'));
        Ext.Ajax.request({
            url: 'index.php/callDiagnostic/startRegisterCapture',
            method: 'POST',
            params: {
                sipId: me.recordId,
                language: App.lang || window.lang || 'en'
            },
            callback: function() { me.setLoading(false); },
            success: function(response) {
                var payload = Ext.decode(response.responseText);
                if (!payload.success) {
                    captureButton && captureButton.enable();
                    Ext.ux.Alert.alert(t('Error'), payload.msg, 'error');
                    return;
                }
                me.captureToken = payload.result.token;
                me.captureDeadline = Date.now() + ((payload.result.timeout || 120) + 8) * 1000;
                me.pollRegisterCapture();
            },
            failure: function(response) {
                var payload;
                try { payload = Ext.decode(response.responseText); } catch (e) { payload = {}; }
                captureButton && captureButton.enable();
                Ext.ux.Alert.alert(t('Error'), payload.msg || t('The SIP capture could not be started.'), 'error');
            }
        });
    },

    pollRegisterCapture: function() {
        var me = this;
        if (me.destroyed || !me.captureToken) return;
        Ext.Ajax.request({
            url: 'index.php/callDiagnostic/registerCaptureStatus',
            method: 'POST',
            params: {
                sipId: me.recordId,
                token: me.captureToken,
                language: App.lang || window.lang || 'en'
            },
            success: function(response) {
                var payload = Ext.decode(response.responseText), result;
                if (!payload.success) {
                    me.captureToken = null;
                    var invalidButton = me.down('[reference=captureRegisterButton]');
                    invalidButton && invalidButton.enable();
                    Ext.ux.Alert.alert(t('Error'), payload.msg, 'error');
                    return;
                }
                result = payload.result;
                me.renderResult(result);
                if (result.complete) {
                    me.captureToken = null;
                    var completeButton = me.down('[reference=captureRegisterButton]');
                    completeButton && completeButton.enable();
                    return;
                }
                Ext.defer(function() { me.pollRegisterCapture(); }, 2000);
            },
            failure: function() {
                if (Date.now() < me.captureDeadline) {
                    Ext.defer(function() { me.pollRegisterCapture(); }, 3000);
                } else {
                    me.captureToken = null;
                    var failedButton = me.down('[reference=captureRegisterButton]');
                    failedButton && failedButton.enable();
                    Ext.ux.Alert.alert(t('Error'), t('The SIP capture status could not be read.'), 'error');
                }
            }
        });
    },

    runRegisterDiagnostic: function() {
        var me = this;
        me.setLoading(t('Checking REGISTER'));
        Ext.Ajax.request({
            url: 'index.php/callDiagnostic/register',
            method: 'POST',
            params: {
                sipId: me.recordId,
                language: App.lang || (window.localStorage && localStorage.getItem('lang')) || window.lang || 'en'
            },
            callback: function() {
                me.setLoading(false);
            },
            success: function(response) {
                var payload = Ext.decode(response.responseText);
                if (!payload.success) {
                    Ext.ux.Alert.alert(t('Error'), payload.msg, 'error');
                    return;
                }
                var captureButton = me.down('[reference=captureRegisterButton]');
                captureButton && captureButton.show();
                me.renderResult(payload.result);
            },
            failure: function(response) {
                var payload;
                try { payload = Ext.decode(response.responseText); } catch (e) { payload = {}; }
                Ext.ux.Alert.alert(t('Error'), payload.msg || t('The diagnostic could not be completed safely.'), 'error');
            }
        });
    },

    renderResult: function(result) {
        var me = this,
            colors = {passed: '#2e7d32', failed: '#c62828', warning: '#ef6c00', inconclusive: '#616161'},
            html = '<h2 style="color:' + colors[result.status] + '">' + Ext.htmlEncode(result.summary) + '</h2>' +
                '<div>' + Ext.htmlEncode(t('Diagnostic ID')) + ': <code>' + Ext.htmlEncode(result.diagnosticId || '') + '</code></div><hr>';
        if (result.failureCause) {
            html += me.renderFailureCause(result.failureCause);
        }
        Ext.Array.each(result.steps || [], function(step) {
            html += '<div style="border-left:4px solid ' + (colors[step.status] || colors.inconclusive) + ';padding:8px;margin:8px 0">' +
                '<b>' + Ext.htmlEncode(step.label) + '</b> — ' + Ext.htmlEncode(step.status) +
                '<div>' + Ext.htmlEncode(step.message) + '</div>';
            if (step.displayDetails && step.displayDetails.length) {
                html += '<table class="step-details">';
                Ext.Array.each(step.displayDetails, function(detail) {
                    if (detail.value !== undefined && detail.value !== null && detail.value !== '') {
                        html += '<tr><th>' + Ext.htmlEncode(detail.label) + '</th><td><code>' +
                            Ext.htmlEncode(String(detail.value)) + '</code></td></tr>';
                    }
                });
                html += '</table>';
            }
            if (step.resolution && step.resolution.message) {
                html += '<div><b>' + Ext.htmlEncode(t('Recommended action')) + ':</b> ' + Ext.htmlEncode(step.resolution.message) + '</div>';
            }
            html += '</div>';
        });
        Ext.Array.each(result.warnings || [], function(warning) {
            html += '<p style="color:' + colors.warning + '">' + Ext.htmlEncode(warning) + '</p>';
        });
        html += me.renderTechnicalDetails(result.technicalDetails || {});
        me.renderSelectableHtml(html);
    },

    renderFailureCause: function(cause) {
        return '<section class="failure-cause"><h3>' +
            Ext.htmlEncode(t('Cause identified')) + '</h3><div><code>' +
            Ext.htmlEncode(cause.code || '') + '</code></div><p><strong>' +
            Ext.htmlEncode(t(cause.title || '')) + '</strong></p><p>' +
            Ext.htmlEncode(t(cause.explanation || '')) + '</p><p><strong>' +
            Ext.htmlEncode(t('What to do')) + ':</strong> ' +
            Ext.htmlEncode(t(cause.action || '')) + '</p></section>';
    },

    renderTechnicalDetails: function(details) {
        var context = details.context || {},
            trace = details.trace || [],
            events = details.events || [],
            validations = [],
            queries = [],
            routeRows = [
                [t('Status'), details.status === 'ready_to_dial' ? t('Ready to dial') :
                    (details.status === 'blocked' ? t('Blocked before Dial') : details.status)],
                [t('Destination number'), context.destination],
                [t('CallerID'), context.callerId],
                [t('SIP user'), context.sipAccount],
                [t('Account code'), context.accountcode],
                [t('Dial string'), context.dialString],
                [t('Dial parameters'), context.dialParams],
                [t('Timeout'), Ext.isNumber(context.timeout) ? context.timeout + 's' : context.timeout],
                [t('Hangup cause'), context.hangupCause]
            ],
            executionRows = [
                [t('Failure code'), details.reason],
                [t('PHP CLI'), details.phpCli || details.phpBinary],
                [t('AGI script'), details.script],
                [t('Process exit code'), details.exitCode],
                [t('Result marker found'), details.resultMarkerFound === true ? t('Yes') :
                    (details.resultMarkerFound === false ? t('No') : null)],
                [t('JSON error'), details.jsonError],
                [t('Script file exists'), details.isFile === true ? t('Yes') :
                    (details.isFile === false ? t('No') : null)],
                [t('Script is readable'), details.isReadable === true ? t('Yes') :
                    (details.isReadable === false ? t('No') : null)],
                [t('Script directory is accessible'), details.directoryAccessible === true ? t('Yes') :
                    (details.directoryAccessible === false ? t('No') : null)],
                [t('Application error type'), details.errorType],
                [t('Application error message'), details.errorMessage],
                [t('Application error file'), details.errorFile],
                [t('Application error line'), details.errorLine]
            ],
            routeRowsHtml = '',
            executionRowsHtml = '',
            html = '<details><summary>' + Ext.htmlEncode(t('Technical details')) + '</summary>' +
                '<div class="technical-content">';

        Ext.Array.each(routeRows, function(row) {
            if (row[1] !== undefined && row[1] !== null && row[1] !== '') {
                routeRowsHtml += '<tr><th>' + Ext.htmlEncode(row[0]) + '</th><td><code>' +
                    Ext.htmlEncode(String(row[1])) + '</code></td></tr>';
            }
        });
        Ext.Array.each(executionRows, function(row) {
            if (row[1] !== undefined && row[1] !== null && row[1] !== '') {
                executionRowsHtml += '<tr><th>' + Ext.htmlEncode(row[0]) + '</th><td><code>' +
                    Ext.htmlEncode(String(row[1])) + '</code></td></tr>';
            }
        });
        if (executionRowsHtml) {
            html += '<h3>' + Ext.htmlEncode(t('Diagnostic execution')) +
                '</h3><table>' + executionRowsHtml + '</table>';
        }
        if (routeRowsHtml) {
            html += '<h3>' + Ext.htmlEncode(t('Route summary')) +
                '</h3><table>' + routeRowsHtml + '</table>';
        }

        Ext.Array.each(events, function(item) {
            var message = String(item.message || '').trim(),
                component = String(item.component || '').trim();
            if (message) validations.push((component ? component + ': ' : '') + message);
        });
        Ext.Array.each(trace, function(item) {
            var message = String(item.message || '').trim();
            if (/^(SELECT|INSERT|UPDATE|DELETE)\s/i.test(message)) queries.push(message);
        });

        if (validations.length) {
            html += '<h3>' + Ext.htmlEncode(t('AGI validation trace')) + '</h3><ol class="trace">';
            Ext.Array.each(validations, function(message) {
                html += '<li>' + Ext.htmlEncode(message) + '</li>';
            });
            html += '</ol>';
        }
        if (queries.length) {
            html += '<details class="advanced"><summary>' + Ext.htmlEncode(t('SQL queries')) +
                ' (' + queries.length + ')</summary><pre>' +
                Ext.htmlEncode(queries.join('\n\n')) + '</pre></details>';
        }
        if (details.stderr) {
            html += '<details class="advanced error"><summary>' + Ext.htmlEncode(t('Process errors')) +
                '</summary><pre>' + Ext.htmlEncode(details.stderr) + '</pre></details>';
        }
        if (details.stdout) {
            html += '<details class="advanced"><summary>' + Ext.htmlEncode(t('Process output')) +
                '</summary><pre>' + Ext.htmlEncode(details.stdout) + '</pre></details>';
        }
        if (details.sipPackets && details.sipPackets.length) {
            html += '<details class="advanced"><summary>' +
                Ext.htmlEncode(t('SIP packets supporting the diagnosis')) +
                ' (' + details.sipPackets.length + ')</summary><pre>' +
                Ext.htmlEncode(details.sipPackets.join('\n\n')) + '</pre></details>';
        }
        return html + '</div></details>';
    },

    renderSelectableHtml: function(html) {
        var panel = this.down('[reference=resultPanel]'),
            frameId = Ext.id(null, 'call-diagnostic-frame-'),
            frame,
            documentHtml;
        panel.setHtml(
            '<iframe id="' + frameId + '" title="' + Ext.htmlEncode(t('Diagnostic result')) + '"' +
            ' style="border:0;height:100%;width:100%;background:#fff"></iframe>'
        );
        frame = document.getElementById(frameId);
        if (!frame) return;
        documentHtml = '<!doctype html><html><head><meta charset="utf-8"><style>' +
            'html,body{margin:0;padding:0;background:#fff;color:#333;font:14px Arial,sans-serif;' +
            '-webkit-user-select:text!important;-moz-user-select:text!important;user-select:text!important;cursor:text}' +
            'body{padding:14px}*{-webkit-user-select:text!important;-moz-user-select:text!important;' +
            'user-select:text!important}pre{white-space:pre-wrap;word-break:break-word}' +
            'details summary{cursor:pointer}.technical-content{padding:8px 4px}' +
            '.technical-content h3{font-size:15px;margin:14px 0 6px}' +
            '.technical-content table{border-collapse:collapse;width:100%}' +
            '.technical-content th{background:#f5f5f5;text-align:left;width:160px}' +
            '.technical-content th,.technical-content td{border:1px solid #ddd;padding:7px;vertical-align:top}' +
            '.technical-content code{word-break:break-all}.trace{margin:6px 0;padding-left:24px}' +
            '.step-details{border-collapse:collapse;margin-top:7px}.step-details th{text-align:left;background:#f5f5f5}' +
            '.step-details th,.step-details td{border:1px solid #ddd;padding:5px 8px}' +
            '.failure-cause{background:#fff4f4;border:1px solid #ef9a9a;border-left:5px solid #c62828;' +
            'margin:12px 0;padding:10px 12px}.failure-cause h3{color:#b71c1c;margin:0 0 8px}' +
            '.trace li{border-bottom:1px solid #eee;padding:5px 2px}.advanced{margin-top:12px}' +
            '.advanced pre{background:#f7f7f7;border:1px solid #ddd;padding:10px}' +
            '.error summary{color:#c62828}</style></head><body>' + html + '</body></html>';
        frame.contentWindow.document.open();
        frame.contentWindow.document.write(documentHtml);
        frame.contentWindow.document.close();
    }
});
