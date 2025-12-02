/**
 * @private
 */
Ext.define('Ext.event.publisher.ElementPaint', {

    extend: 'Ext.event.publisher.Publisher',

    requires: [
        'Ext.util.PaintMonitor',
        'Ext.TaskQueue'
    ],

    type: 'paint',

    handledEvents: ['painted'],

    constructor: function() {
        this.monitors = {};
        this.subscribers = {};

        this.callParent(arguments);
    },

    subscribe: function(element) {
        var me = this,
            id = element.id,
            subscribers = me.subscribers;

        if (subscribers[id]) {
            ++subscribers[id];
        } else {
            subscribers[id] = 1;

            me.monitors[id] = new Ext.util.PaintMonitor({
                element: element,
                callback: me.onElementPainted,
                scope: me,
                args: [element]
            });
        }
    },

    unsubscribe: function(element) {
        var id = element.id,
            subscribers = this.subscribers,
            monitors = this.monitors;

        if (subscribers[id] && !--subscribers[id]) {
            delete subscribers[id];
            monitors[id].destroy();
            delete monitors[id];
        }
    },

    onElementPainted: function(element) {
        Ext.TaskQueue.requestRead('fire', this, [element, 'painted', [element]]);
    }
}, function(ElementPaint) {
    ElementPaint.instance = new ElementPaint();
});
