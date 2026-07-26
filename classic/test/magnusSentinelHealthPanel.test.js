'use strict';

var fs = require('fs');
var vm = require('vm');
var assert = require('assert');
var definition;

global.t = function(value) {
    return value;
};
global.Ext = {
    define: function(name, value) {
        if (name === 'MBilling.view.magnusSentinel.List') {
            definition = value;
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

process.stdout.write('magnusSentinelHealthPanel.test.js OK\n');
