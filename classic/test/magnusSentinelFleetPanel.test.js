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
    }
};

vm.runInThisContext(
    fs.readFileSync(
        __dirname + '/../src/view/magnusSentinel/Controller.js',
        'utf8'
    )
);

assert.strictEqual(controller.entityLabel('fleet'), 'Fleet');
assert.strictEqual(controller.entityLabel('server'), 'Server');
assert.strictEqual(controller.formatEntity('fleet', 'Internal name'), 'Fleet');
assert.strictEqual(
    controller.formatEntity('server', 'S5'),
    'Server S5'
);
assert.ok(
    fs.readFileSync(
        __dirname + '/../src/view/magnusSentinel/List.js',
        'utf8'
    ).indexOf("['fleet', t('Fleets')]") !== -1,
    'fleet filter must be visible'
);

process.stdout.write('magnusSentinelFleetPanel.test.js OK\n');
