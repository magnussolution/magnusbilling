/**
 * A base class for draggable and droppable items that wrap a DOM element.
 *
 * @abstract
 */
Ext.define('Ext.drag.Item', {
    mixins: [
        'Ext.mixin.Observable',
        'Ext.mixin.Identifiable'
    ],

    config: {
        /**
         * @cfg {Boolean} autoDestroy
         * `true` to destroy the {@link #element} when this item is destroyed.
         */
        autoDestroy: true,

        /**
         * @cfg {String/HTMLElement/Ext.dom.Element} element
         * The id, dom or Element reference for this item.
         */
        element: null,

        /**
         * @cfg {String/String[]} groups
         * A group controls which {@link Ext.drag.Source sources} and {@link Ext.drag.Target} targets
         * can interact with each other. Only items that have the same (or intersecting) groups will
         * react to each other. Items with no groups will be in the default pool.
         */
        groups: null
    },

    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
    },

    /**
     * Checks whether this item is currently disabled.
     * @return {Boolean} `true` if this item is disabled.
     */
    isDisabled: function() {
        return this.disabled;
    },

    /**
     * Disable the current item to disallow it from participating
     * in drag/drop operations.
     */
    disable: function() {
        this.disabled = true;
    },

    /**
     * Enable the current item to allow it to participate in
     * drag/drop operations.
     */
    enable: function() {
        this.disabled = false;
    },

    applyElement: function(element) {
        return element ? Ext.get(element) : null;
    },

    updateElement: function(element) {
        this.setupListeners();
    },

    applyGroups: function(group) {
        if (typeof group === 'string') {
            group = [group];
        }
        return group;
    },

    destroy: function() {
        var me = this,
            el = me.getElement();

        me.destroying = true;
        me.setElement(null);
        if (el && me.getAutoDestroy()) {
            el.destroy();
        }
        me.callParent();
        me.destroying = false;
    },

    privates: {
        /**
        * @property {Boolean} disabled
        * `true` if this item is disabled.
        *
        * @private
        */
        disabled: false,

        /**
         * Gets any listeners to attach for the current element.
         * @return {Object} The listeners for thie element.
         *
         * @private
         */
        getElListeners: Ext.privateFn,

        /**
         * Detach any existing listeners and add new listeners
         * to the element.
         * 
         * @private
         */
        setupListeners: function(element) {
            var me = this,
                elListeners = me.elListeners;

            element = element || me.getElement();

            if (elListeners) {
                elListeners.destroy();
                me.elListeners = null;
            }

            if (element) {
                me.elListeners = element.on(Ext.apply({
                    scope: me,
                    destroyable: true
                }, me.getElListeners()));
            }
        }
    }
});
