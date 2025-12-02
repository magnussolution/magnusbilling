/**
 * Text Field {@link Ext.field.Text#triggers trigger} widget.
 */
Ext.define('Ext.field.trigger.Trigger', {
    extend: 'Ext.Widget',
    xtype: 'trigger',
    alias: 'trigger.trigger',

    requires: [
        'Ext.util.TapRepeater'
    ],

    mixins: [
        'Ext.mixin.Factoryable'
    ],

    factoryConfig: {
        defaultType: 'trigger',
        aliasPrefix: 'trigger.'
    },

    config: {
        /**
         * @cfg {Ext.field.Text}
         * The text field that created this trigger
         * @private
         */
        field: null,

        /**
         * @cfg {String} [group]
         * The name of an optional group trigger that this trigger belongs to.  If no trigger
         * Exists by that name one will automatically be created.  A group trigger is a
         * special trigger that contains other triggers.  Those triggers' elements are
         * appended to the group trigger's element in the DOM.
         *
         * The {@link #weight} of grouped triggers is relative to other triggers in the group.
         */
        group: null,

        /**
         * @cfg {Function/String} [handler=undefined]
         * Function to run when trigger is clicked or tapped.
         * @controllable
         */
        handler: null,

        /**
         * @cfg {Boolean/Object}
         * `true` to attach a {@link Ext.util.TapRepeater tap repeater} to the trigger,
         * or a config object for a tap repeater.
         */
        repeat: null,

        /**
         * @cfg {'left'/'right'} [side='right']
         * The side of the text field's input to render the trigger on.
         */
        side: null,

        /**
         * @cfg {Object} [scope]
         * Execution context for the {@link #handler} function.
         */
        scope: null,

        /**
         * The triggers contained in this trigger (only applicable for trigger groups)
         * @private
         */
        triggers: null,

        weight: null
    },

    classCls: Ext.baseCSSPrefix + 'trigger',
    interactiveCls: Ext.baseCSSPrefix + 'interactive',
    groupedCls: Ext.baseCSSPrefix + 'grouped',

    template: [{
        reference: 'iconElement',
        classList: [
            Ext.baseCSSPrefix + 'icon-el',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }],

    statics: {
        /**
         * Sorts an array of triggers in place by weight
         * @param {Ext.field.Trigger[]} triggers
         * @return {Ext.field.Trigger[]}
         * @private
         * @static
         */
        sort: function(triggers) {
            Ext.Array.sort(triggers, this.weightComparator);
            return triggers;
        },

        /**
         * Comparison function for sorting an array of triggers in ascending order
         * @param {Ext.form.field.Trigger} triggerA
         * @param {Ext.form.field.Trigger} triggerB
         * @return {Number}
         * @private
         * @static
         */
        weightComparator: function(triggerA, triggerB) {
            return (triggerA.getWeight() || 0) - (triggerB.getWeight() || 0);
        }
    },

    constructor: function(config) {
        var me = this,
            element, repeat;

        me.callParent([config]);

        element = me.element;
        repeat = me.getRepeat();

        if (repeat) {
            me.repeater = new Ext.util.TapRepeater(Ext.apply({
                el: element
            }, repeat));

            me.repeater.on('tap', 'onClick', this);
        } else {
            element.on('click', 'onClick', this);
        }
    },

    doDestroy: function() {
        var triggers = this.getTriggers(),
            i, ln;

        if (triggers) {
            for (i = 0, ln = triggers.length; i < ln; i++) {
                triggers[i].destroy();
            }
        }

        this.setTriggers(null);
        Ext.destroyMembers(this, 'repeater');
        this.callParent();
    },

    onClick: function(e) {
        var me = this,
            handler = me.getHandler(),
            field = me.getField();

        // TODO: skip this if readonly? !editable?
        if (handler) {
            Ext.callback(handler, me.getScope(), [field, me, e], null, field);
        }
    },

    updateHandler: function(handler) {
        this.toggleCls(this.interactiveCls, !!handler);
    },

    updateGroup: function(group) {
        if (!this.isConfiguring) {
            this.getField().syncTriggers();
        }
    },

    updateSide: function() {
        if (!this.isConfiguring) {
            this.getField().syncTriggers();
        }
    },

    updateTriggers: function(triggers) {
        var me = this,
            dom = me.element.dom,
            iconElement = me.iconElement,
            i, ln;

        me.toggleCls(me.groupedCls, !!(triggers && triggers.length));

        if (triggers) {
            // group triggers do not have icons of their own, so we can safely remove the iconElement
            if (iconElement) {
                iconElement.destroy();
                me.iconElement = null;
                Ext.Array.remove(me.referenceList, 'iconElement');
            }

            for (i = 0, ln = triggers.length; i < ln; i++) {
                dom.appendChild(triggers[i].element.dom);
            }
        }
    }

});