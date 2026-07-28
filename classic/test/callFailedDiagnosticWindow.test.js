'use strict';

var fs = require('fs');
var vm = require('vm');
var assert = require('assert');
var windowDefinition;
var controllerDefinition;
var listDefinition;

global.t = function(value) {
    return value;
};
global.Ext = {
    Array: {
        each: function(items, callback) {
            (items || []).forEach(callback);
        }
    },
    define: function(name, value) {
        if (name === 'MBilling.view.callFailed.DiagnosticWindow') {
            windowDefinition = value;
        } else if (name === 'MBilling.view.callFailed.Controller') {
            controllerDefinition = value;
        } else if (name === 'MBilling.view.callFailed.List') {
            listDefinition = value;
        }
    },
    htmlEncode: function(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
global.icons = {info: 'info'};
global.App = {user: {isAdmin: true, isClient: false, isAgent: false, language: 'en'}};

[
    '../src/view/callFailed/DiagnosticWindow.js',
    '../src/view/callFailed/Controller.js',
    '../src/view/callFailed/List.js'
].forEach(function(file) {
    vm.runInThisContext(fs.readFileSync(__dirname + '/' + file, 'utf8'));
});

assert.ok(windowDefinition, 'diagnostic window must be defined');
assert.ok(controllerDefinition, 'call failed controller must be defined');
assert.ok(listDefinition, 'call failed list must be defined');
assert.strictEqual(
    windowDefinition.encode('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;',
    'provider reason must be HTML encoded'
);
var historyHtml = windowDefinition.renderHistory({
    invite: {
        at: '2026-07-24 13:22:39',
        unixTimestamp: 1784910159,
        uniqueid: '1784910159.159421',
        server: {id: 1, name: 'MASTER'}
    },
    entries: [{
        sequence: 1,
        eventTime: '2026-07-24 13:22:44',
        secondsAfterInvite: 5,
        secondsAfterPrevious: 5,
        isNextTrunk: false,
        trunk: {id: 277, name: 'sdsdsd'},
        raw: {code: 615, reason: '<img src=x onerror=alert(1)>'},
        callerIdSent: {
            available: true,
            value: '5511777777777',
            source: 'pkg_magnus_sentinel_trunk_event.callerid'
        },
        currentTrunkStatus: {
            status: 'unavailable',
            summary: 'Asterisk currently reports the trunk contact as unavailable.',
            latencyMs: null,
            firewall: {
                checked: true,
                blocked: true,
                checkedIps: ['198.51.100.20'],
                matches: [{
                    ip: '198.51.100.20',
                    jail: '<img src=x onerror=alert(2)>'
                }]
            }
        },
        sentinelAlerts: []
    }, {
        sequence: 2,
        eventTime: '2026-07-24 13:22:48',
        secondsAfterInvite: 9,
        secondsAfterPrevious: 4,
        isNextTrunk: true,
        trunk: {id: 256, name: 'provider3'},
        raw: {code: 615, reason: 'Unknown'},
        callerIdSent: {
            available: true,
            value: '<script>alert(3)</script>'
        },
        currentTrunkStatus: {
            status: 'available',
            summary: 'Asterisk currently reports the trunk contact as available.',
            latencyMs: 18.4,
            firewall: {
                checked: true,
                blocked: false,
                checkedIps: ['203.0.113.30'],
                matches: []
            }
        },
        sentinelAlerts: [{
            severity: 'warning',
            type: 'trunk_response_degradation',
            summary: '<script>alert(1)</script>'
        }]
    }]
}, {available: true});
assert.ok(
    historyHtml.indexOf('1784910159.159421') < historyHtml.indexOf('sdsdsd') &&
        historyHtml.indexOf('sdsdsd') < historyHtml.indexOf('provider3'),
    'history must render INVITE and trunk attempts chronologically'
);
assert.ok(
    historyHtml.indexOf('4 seconds after the previous attempt') !== -1,
    'history must explain elapsed time between attempts'
);
assert.strictEqual(
    historyHtml.indexOf('<img src=x'),
    -1,
    'malicious provider reason must not render as markup'
);
assert.strictEqual(
    historyHtml.indexOf('<script>alert(1)</script>'),
    -1,
    'malicious Sentinel summary must not render as markup'
);
assert.strictEqual(
    historyHtml.indexOf('<script>alert(3)</script>'),
    -1,
    'caller ID must not render as markup'
);
assert.ok(
    historyHtml.indexOf('Caller ID sent') !== -1 &&
        historyHtml.indexOf('5511777777777') !== -1 &&
        historyHtml.indexOf('Current trunk status') !== -1 &&
        historyHtml.indexOf('Fail2ban') !== -1 &&
        historyHtml.indexOf('pkg_firewall') === -1,
    'history must show caller ID, current trunk state and Fail2ban result'
);
assert.ok(
    windowDefinition.renderCallerIdSent({available: false})
        .indexOf('Not recorded for this attempt.') !== -1,
    'empty event caller ID must be reported as unavailable'
);
assert.ok(
    historyHtml.indexOf('does not prove that it caused this call') !== -1,
    'active Sentinel alert must not be presented as causal proof'
);

var controllerSource = fs.readFileSync(
    __dirname + '/../src/view/callFailed/Controller.js',
    'utf8'
);
var windowSource = fs.readFileSync(
    __dirname + '/../src/view/callFailed/DiagnosticWindow.js',
    'utf8'
);
assert.strictEqual(
    windowSource.indexOf("t('Technical details')"),
    -1,
    'technical details section must be removed from the operator window'
);
assert.strictEqual(
    windowSource.indexOf("t('Diagnostic limitations')"),
    -1,
    'diagnostic limitations section must be removed from the operator window'
);
assert.strictEqual(
    controllerSource.indexOf('window.open'),
    -1,
    'legacy window.open must be removed'
);
assert.ok(
    controllerSource.indexOf('callFailed.DiagnosticWindow') !== -1,
    'controller must open the ExtJS diagnostic window'
);

var listSource = fs.readFileSync(
    __dirname + '/../src/view/callFailed/List.js',
    'utf8'
);
assert.ok(
    listSource.indexOf("t('Diagnose call')") !== -1,
    'button must use Diagnose call'
);

process.stdout.write('callFailedDiagnosticWindow.test.js OK\n');
