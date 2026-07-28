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

var controllerSource = fs.readFileSync(
    __dirname + '/../src/view/callFailed/Controller.js',
    'utf8'
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
