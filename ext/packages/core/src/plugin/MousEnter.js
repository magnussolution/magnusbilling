/**
 * This plugin calls a callback whenever the mouse enters or leaves descendant
 * elements of its host component identified by a {@link Ext.ux.MouseEnter#delegate delegate}
 * query selector string.
 *
 * This is useful for components which render arbitrary and transient child elements
 * such as DataViews and Charts. It allows notification of mousenter events from 
 * child nodes witghout having to add  listeners to each child element.
 */
Ext.define('Ext.plugin.MouseEnter', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.mouseenter',

    /**
     * @cfg {Ext.dom.Element/String} [element="el"] The element, or component element reference
     * name to which to add the mouse listener.
     */
    element: 'el',

    /**
     * @cfg {String} delegate A query selector string to identify descendant elements
     * which trigger a call to the handler.
     */

    /**
     * @cfg {String/Function} handler A callback to invoke when a the mouse enters a
     * descendant delegate.
     * @cfg {Ext.event.Event} handler.e The `mouseover` event which triggered the mouse enter.
     * @cfg {Ext.dom.Element} handler.target The delegate element into which the mouse just entered.
     */

    /**
     * @cfg {String/Function} [leaveHandler] A callback to invoke when a the mouse leaves a
     * descendant delegate.
     * @cfg {Ext.event.Event} handler.e The `mouseover` event which triggered the mouse leave.
     * @cfg {Ext.dom.Element} handler.target The delegate element which the mouse just left.
     */

    /**
     * @cfg {Object} [scope] The scope (`this` pointer) in which to execute the callback(s).
     */

    init: function (component) {
        //<debug>
        if (!this.delegate) {
            Ext.raise('mouseenter plugin must be configured with a delegate selector');
        }
        if (!this.handler) {
            Ext.raise('mouseenter plugin must be configured with handler callback');
        }
        //</debug>
        var me = this,
            listeners = {
                mouseover: me.onMouseOver,
                scope: me,
                destroyable: true
            };

        if (me.leaveHandler) {
            listeners.mouseout = me.onMouseOut;
        }

        // Element being a string means a referenced element name in the Component
        if (typeof me.element === 'string') {
            listeners.element = me.element;
            me.mouseListener = component.on(listeners);
        } else {
            me.mouseListener = me.element.on(listeners);
        }
    },

    onMouseOver: function(e) {
        var me = this,
            delegate = e.getTarget(me.delegate);

        // If we have changed delegates, fire the handler
        if (delegate && delegate !== e.getRelatedTarget(me.delegate)) {
            Ext.callback(me.handler, null, [e, delegate], 0, me.cmp, me.scope);
        }
    },

    onMouseOut: function(e) {
        var me = this,
            delegate = e.getRelatedTarget(me.delegate);

        // If we have left a delegate, fire the leave handler
        if (delegate && delegate !== e.getTarget(me.delegate)) {
            Ext.callback(me.leaveHandler, null, [e, delegate], 0, me.cmp, me.scope);
        }
    },

    destroy: function () {
        this.callParent();
        Ext.destroy(this.mouseListener);
    }
});