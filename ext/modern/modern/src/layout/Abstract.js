/**
 *
 */
Ext.define('Ext.layout.Abstract', {
    mixins: ['Ext.mixin.Observable'],
    
    isLayout: true,

    constructor: function(config) {
        this.initialConfig = config;
    },

    //<debug>
    isCompatible: function (layout) {
        if (!layout) {
            return true;
        }

        if (layout.isInstance) {
            return false;
        }

        var type = Ext.isString(layout) ? layout : layout.type,
            alias = this.alias;

        if (!alias || !type) {
            return false;
        }

        return alias.indexOf('layout.' + type) > -1;
    },
    //</debug>

    setContainer: function(container) {
        var me = this;

        me.container = container;

        me.mixins.observable.constructor.call(me, me.initialConfig);

        return me;
    },

    onItemAdd: Ext.emptyFn,

    onItemRemove: Ext.emptyFn,

    onItemMove: Ext.emptyFn,

    onItemCenteredChange: Ext.emptyFn,

    onItemPositionedChange: Ext.emptyFn,

    onItemDockedChange: Ext.emptyFn,

    onItemInnerStateChange: Ext.emptyFn
});
