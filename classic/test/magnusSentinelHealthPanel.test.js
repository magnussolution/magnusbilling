'use strict';

var fs = require('fs');
var vm = require('vm');
var assert = require('assert');
var definition;
var healthDefinition;

global.t = function(value) {
    return value;
};
global.Ext = {
    define: function(name, value) {
        if (name === 'MBilling.view.magnusSentinel.List') {
            definition = value;
        } else if (name === 'MBilling.view.magnusSentinel.Health') {
            healthDefinition = value;
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
    },
    util: {
        Format: {
            htmlEncode: function(value) {
                return String(value);
            }
        }
    }
};

vm.runInThisContext(
    fs.readFileSync(
        __dirname + '/../src/view/magnusSentinel/List.js',
        'utf8'
    )
);
vm.runInThisContext(
    fs.readFileSync(
        __dirname + '/../src/view/magnusSentinel/Health.js',
        'utf8'
    )
);

function emptyMessage(status) {
    var view = {
        emptyText: '',
        refresh: function() {}
    };
    definition.setHealthEmptyState.call({
        getView: function() {
            return view;
        }
    }, {
        health_status: status
    }, 'active');
    return view.emptyText;
}

assert.ok(
    emptyMessage('STALE').indexOf('It is not possible to confirm') !== -1,
    'stale health cannot display a normal message'
);
assert.ok(
    emptyMessage('HEALTHY').indexOf(
        'No active incidents were detected in the received data.'
    ) !== -1,
    'healthy telemetry may describe an empty incident set'
);

var diskRecord = {
    values: {
        filesystem_path: '/',
        filesystem_used_percent: 98,
        filesystem_available_bytes: 449 * 1024 * 1024,
        filesystem_available_inodes: 100000
    },
    get: function(name) {
        return this.values[name];
    }
};
assert.strictEqual(
    healthDefinition.formatFilesystem(diskRecord),
    '/ · 98% used; 449 MB available'
);
assert.strictEqual(
    healthDefinition.reasonLabel('filesystem_space_critical'),
    'Filesystem space is critical'
);
assert.strictEqual(
    healthDefinition.reasonLabel('filesystem_no_space'),
    'Filesystem has no space available'
);

process.stdout.write('magnusSentinelHealthPanel.test.js OK\n');
