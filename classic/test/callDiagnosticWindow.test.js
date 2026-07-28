const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

var windowDefinition;

global.t = function(value) {
    return value;
};
global.Ext = {
    define: function(name, definition) {
        windowDefinition = definition;
    },
    htmlEncode: function(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    isNumber: function(value) {
        return typeof value === 'number';
    },
    Array: {
        each: function(items, callback) {
            (items || []).forEach(callback);
        }
    }
};

vm.runInThisContext(fs.readFileSync(
    __dirname + '/../src/view/callDiagnostic/Window.js',
    'utf8'
));

assert.ok(windowDefinition, 'Call Diagnostic Window must be defined');

var causeHtml = windowDefinition.renderFailureCause({
    code: 'AGI_PHP_FATAL_ERROR',
    title: '<script>alert(1)</script>',
    explanation: 'PHP terminated before returning a result.',
    action: 'Use the process error.'
});
assert.ok(
    causeHtml.indexOf('Cause identified') !== -1 &&
        causeHtml.indexOf('AGI_PHP_FATAL_ERROR') !== -1,
    'the identified cause and stable failure code must be prominent'
);
assert.strictEqual(
    causeHtml.indexOf('<script>'),
    -1,
    'failure cause content must be HTML encoded'
);

var detailsHtml = windowDefinition.renderTechnicalDetails({
    reason: 'AGI_RESULT_JSON_INVALID',
    exitCode: 255,
    resultMarkerFound: true,
    jsonError: 'Malformed UTF-8 characters',
    stdout: 'MBILLING_RESULT <invalid>',
    stderr: '<img src=x onerror=alert(1)>'
});
assert.ok(
    detailsHtml.indexOf('Diagnostic execution') !== -1 &&
        detailsHtml.indexOf('AGI_RESULT_JSON_INVALID') !== -1 &&
        detailsHtml.indexOf('Malformed UTF-8 characters') !== -1 &&
        detailsHtml.indexOf('Process output') !== -1 &&
        detailsHtml.indexOf('Process errors') !== -1,
    'technical evidence must explain the failed process without server access'
);
assert.strictEqual(
    detailsHtml.indexOf('<img src=x'),
    -1,
    'process errors must be HTML encoded'
);
assert.strictEqual(
    detailsHtml.indexOf('Route summary'),
    -1,
    'an empty route summary must not be shown before routing was evaluated'
);

process.stdout.write('callDiagnosticWindow.test.js OK\n');
