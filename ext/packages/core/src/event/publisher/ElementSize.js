/**
 * @private
 */
Ext.define('Ext.event.publisher.ElementSize', {

    extend: 'Ext.event.publisher.Publisher',

    requires: [
        'Ext.util.SizeMonitor'
    ],

    type: 'size',

    handledEvents: ['resize'],

    constructor: function() {
        this.monitors = {};
        this.subscribers = {};

        this.callParent(arguments);
    },

    subscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors;

        if (subscribers[id]) {
            ++subscribers[id];
        } else {
            subscribers[id] = 1;

            monitors[id] = new Ext.util.SizeMonitor({
                element: element,
                callback: this.onElementResize,
                scope: this,
                args: [element]
            });
        }

        element.on('painted', 'forceRefresh', monitors[id]);

        return true;
    },

    unsubscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors,
            sizeMonitor;

        if (subscribers[id] && !--subscribers[id]) {
            delete subscribers[id];
            sizeMonitor = monitors[id];
            element.un('painted', 'forceRefresh', sizeMonitor);
            sizeMonitor.destroy();
            delete monitors[id];
        }
    },

    onElementResize: function(element, info) {
        Ext.TaskQueue.requestRead('fire', this, [element, 'resize', [element, info]]);
    }

    //<debug>
    // This is useful for unit testing so we can force resizes
    // to take place synchronously when we know they have changed
    ,privates: {
        syncRefresh: function(elements) {
            elements = Ext.Array.from(elements);

            var len = elements.length,
                i = 0,
                el, monitor;

            for (i = 0; i < len; ++i) {
                el = elements[i];
                if (typeof el !== 'string') {
                    el = el.id;
                }
                monitor = this.monitors[el];
                if (monitor) {
                    monitor.forceRefresh();
                }
            }
            Ext.TaskQueue.flush();
        }
    }
    //</debug>
}, function(ElementSize) {
    ElementSize.instance = new ElementSize();
});
