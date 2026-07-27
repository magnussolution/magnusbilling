'use strict';

var fs = require('fs');
var vm = require('vm');
var assert = require('assert');
var controller;

global.t = function(value) {
    return value;
};
global.Ext = {
    define: function(name, value) {
        if (name === 'MBilling.view.magnusSentinel.Controller') {
            controller = value;
        }
    },
    isNumber: function(value) {
        return typeof value === 'number';
    },
    String: {
        format: function(template) {
            var args = arguments;
            return template.replace(/\{(\d+)\}/g, function(match, index) {
                return args[Number(index) + 1];
            });
        }
    }
};

vm.runInThisContext(
    fs.readFileSync(
        __dirname + '/../src/view/magnusSentinel/Controller.js',
        'utf8'
    )
);

assert.strictEqual(
    controller.formatDisplayDate(
        '2026-07-27 15:49:41',
        'America/Sao_Paulo',
        '2026-07-27 18:49:41.338105'
    ),
    '2026-07-27 15:49:41 America/Sao_Paulo'
);
assert.strictEqual(
    controller.formatDetectionWindow({
        window_start: '2026-07-27 15:29:41',
        window_end: '2026-07-27 15:44:41',
        window_minutes: 15
    }, {}),
    '2026-07-27 15:29:41 to 2026-07-27 15:44:41 (15 minutes)'
);
assert.strictEqual(
    controller.formatDetectionWindow({}, {
        start: '2026-07-27T18:29:41.338105+00:00',
        end: '2026-07-27T18:44:41.338105+00:00'
    }),
    '2026-07-27 18:29:41 UTC to 2026-07-27 18:44:41 UTC'
);

var legacy = controller.legacyActionSteps({
    type: 'server_activity_drop',
    recommended_action: {
        description: 'Old generic action.'
    }
});
assert.strictEqual(legacy.operator.length, 4);
assert.strictEqual(legacy.technical.length, 5);
assert.ok(legacy.technical[1].indexOf('disk and inodes') !== -1);

process.stdout.write('magnusSentinelTimezonePanel.test.js OK\n');
