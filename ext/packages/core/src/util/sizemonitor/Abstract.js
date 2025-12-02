/**
 * @private
 */
Ext.define('Ext.util.sizemonitor.Abstract', {

    mixins: ['Ext.mixin.Templatable'],

    requires: [
        'Ext.TaskQueue'
    ],

    config: {
        element: null,

        callback: Ext.emptyFn,

        scope: null,

        args: []
    },

    width: null,

    height: null,

    contentWidth: null,

    contentHeight: null,

    constructor: function(config) {
        this.refresh = Ext.Function.bind(this.refresh, this);

        this.info = {
            width: 0,
            height: 0,
            contentWidth: 0,
            contentHeight: 0,
            flag: 0
        };

        this.initElement();

        this.initConfig(config);

        this.bindListeners(true);
    },

    bindListeners: Ext.emptyFn,

    applyElement: function(element) {
        if (element) {
            return Ext.get(element);
        }
    },

    updateElement: function(element) {
        element.append(this.detectorsContainer);
        element.addCls(Ext.baseCSSPrefix + 'size-monitored');
    },

    applyArgs: function(args) {
        return args.concat([this.info]);
    },

    refreshMonitors: Ext.emptyFn,

    forceRefresh: function() {
        Ext.TaskQueue.requestRead('refresh', this);
    },

    getContentBounds: function() {
        return this.detectorsContainer.getBoundingClientRect();
    },

    getContentWidth: function() {
        return this.detectorsContainer.clientWidth;
    },

    getContentHeight: function() {
        return this.detectorsContainer.clientHeight;
    },

    refreshSize: function() {
        var element = this.getElement();

        if (!element || element.destroyed) {
            return false;
        }

        var width = element.getWidth(),
            height = element.getHeight(),
            contentWidth = this.getContentWidth(),
            contentHeight = this.getContentHeight(),
            currentContentWidth = this.contentWidth,
            currentContentHeight = this.contentHeight,
            info = this.info,
            resized = false,
            flag = 0;

        this.width = width;
        this.height = height;
        this.contentWidth = contentWidth;
        this.contentHeight = contentHeight;

        flag = ((currentContentWidth !== contentWidth ? 1 : 0) + (currentContentHeight !== contentHeight ? 2 : 0));

        if (flag > 0) {
            info.width = width;
            info.height = height;
            info.contentWidth = contentWidth;
            info.contentHeight = contentHeight;
            info.flag = flag;

            resized = true;
            this.getCallback().apply(this.getScope(), this.getArgs());
        }

        return resized;
    },

    refresh: function(force) {
        if (this.destroying || this.destroyed) {
            return;
        }
        
        if (this.refreshSize() || force) {
            Ext.TaskQueue.requestWrite('refreshMonitors', this);
        }
    },

    destroy: function() {
        var me = this,
            element = me.getElement();

        me.bindListeners(false);

        if (element && !element.destroyed) {
            element.removeCls(Ext.baseCSSPrefix + 'size-monitored');
        }

        delete me._element;
        
        // This is a closure so Base destructor won't null it
        me.refresh = null;

        me.callParent();
    }
});
