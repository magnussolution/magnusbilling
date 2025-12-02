/**
 * This class monitors DOM elements that have attributes encoded
 * to show a tooltip. A single {@link Ext.tip.ToolTip} instance is reused
 * and reconfigured with the attributes retrieved from the DOM.
 *
 * Typically, this class will not be created directly, but rather configured
 * via the application with the {@link Ext.app.Application#quickTips} config to
 * enable this globally.
 *
 * # Configuring via Ext.Component
 *
 * A configuration given to a {@link Ext.Component#tooltip tooltip} config will
 * be registered with this manager and shared tips will be displayed when that
 * component is activated. See {@link Ext.Component#tooltip tooltip} for details.
 *
 * # Configuring via HTML attributes
 *
 * A tip may also be configured by adding data attributes to DOM elements. The
 * following attribute names are supported and map to configurations on the 
 * {@link Ext.tip.ToolTip} class. The following are supported:
 * - `data-qtip`: {@link Ext.tip.ToolTip#html}
 * - `data-qwidth`: {@link Ext.tip.ToolTip#width}
 * - `data-qminWidth`: {@link Ext.tip.ToolTip#minWidth}
 * - `data-qmaxWidth`: {@link Ext.tip.ToolTip#maxWidth}
 * - `data-qtitle`: {@link Ext.tip.ToolTip#title}
 * - `data-qautoHide`: {@link Ext.tip.ToolTip#autoHide}
 * - `data-qcls`: {@link Ext.tip.ToolTip#cls}
 * - `data-qalign`: {@link Ext.tip.ToolTip#align}
 * - `data-qanchor`: {@link Ext.tip.ToolTip#anchor}
 * - `data-qanchorToTarget`: {@link Ext.tip.ToolTip#anchorToTarget}
 * - `data-qshowDelay`: {@link Ext.tip.ToolTip#showDelay}
 * - `data-qhideDelay`: {@link Ext.tip.ToolTip#hideDelay}
 * - `data-qdismissDelay`: {@link Ext.tip.ToolTip#dismissDelay}
 * - `data-qtrackMouse`: {@link Ext.tip.ToolTip#trackMouse}
 *
 * Example usage:
 *
 *     <div class="foo" data-qtip="Message goes here">Hover me</div>
 */
Ext.define('Ext.tip.Manager', {

    requires: ['Ext.tip.ToolTip'],

    config: {
        tooltip: {
            xtype: 'tooltip',
            // Default to mouse alignment
            align: '',
            anchorToTarget: false,
            anchor: false,
            closeAction: 'hide',
            quickShowInterval: 0
        }
    },

    /**
     * @cfg {Boolean} interceptTitles
     * Set to `true` to automatically use an element's DOM `title` attribute if one is
     * available.
     */
    interceptTitles: false,
    
    constructor: function (config) {
        var me = this,
            tip;

        me.initConfig(config);

        me._fly = new Ext.dom.Fly();
        me.tip = tip = Ext.create(me.createTooltip());

        tip.on({
            beforeshow: 'onBeforeShow',
            hovertarget: 'onHoverTarget',
            scope: me
        });

        me.globalListeners = Ext.on({
            scope: me,
            destroyable: true,
            dragstart: 'dragDisable',
            dragend: 'dragEnable',
            dragcancel: 'dragEnable'
        });
    },

    /**
     * Disable this manager. Tips will not be able to show.
     */
    disable: function() {
        var n = ++this.disabled;
        if (n === 1) {
            this.getTooltip().disable();
        }
    },

    /**
     * Enable this manager. Tips will be able to show.
     */
    enable: function() {
        var n = --this.disabled;
        if (n === 0) {
            this.getTooltip().enable();
        } else if (n < 0) {
            this.disabled = 0;
        }
    },

    destroy: function () {
        var me = this;

        me._fly.detach(); // just in case
        me.globalListeners = me.tip = Ext.destroy(me.tip, me.globalListeners);

        me.callParent();
    },

    createTooltip: function () {
        var me = this,
            config = me.getTooltip();

        return Ext.apply({
            id: 'ext-global-tooltip',
            delegate: me.delegateQuickTip.bind(me),
            target: Ext.getBody()
        }, config);
    },

    hide: function() {
        if (this.tip) {
            this.tip.hide();
        }
    },

    privates: {
        disabled: 0,

        /**
         * @property {Object} _propertyMap
         * The key are the configs for the `ToolTip` and the values are the corresponding
         * DOM attribute names.
         * @private
         * @readonly
         */
        _propertyMap: (function() {
            var numFn = function(v) {
                return parseInt(v, 10);
            }, boolFn = function(v) {
                return !!v;
            }, fn = Ext.identityFn;

            return {
                html: {
                    prop: 'data-qtip',
                    parse: fn
                },
                width: {
                    prop: 'data-qwidth',
                    parse: numFn
                },
                minWidth: {
                    prop: 'data-qminWidth',
                    parse: fn
                },
                maxWidth: {
                    prop: 'data-qmaxWidth',
                    parse: fn
                },
                title: {
                    prop: 'data-qtitle',
                    parse: fn
                },
                autoHide: {
                    prop: 'data-qautoHide',
                    parse: boolFn
                },
                cls : {
                    prop: 'data-qcls',
                    parse: fn
                },
                align : {
                    prop: 'data-qalign',
                    parse: fn
                },
                anchor : {
                    prop: 'data-anchor',
                    parse: fn
                },
                showDelay: {
                    prop: 'data-qshowDelay',
                    parse: numFn
                },
                hideDelay: {
                    prop: 'data-qhideDelay',
                    parse: numFn
                },
                dismissDelay: {
                    prop: 'data-qdismissDelay',
                    parse: numFn
                },
                trackMouse: {
                    prop: 'data-qtrackMouse',
                    parse: boolFn
                },
                anchorToTarget: {
                    prop: 'data-qanchorToTarget',
                    parse: boolFn
                },
                closable: true
            };
        })(),

        delegateQuickTip: function (dom) {
            var qtip = this.getTipConfig(dom, 'html');
            return !!qtip;
        },

        dragDisable: function() {
            if (!this.disabled) {
                this.tip.disable();
            }
        },

        dragEnable: function() {
            if (!this.disabled) {
                this.tip.enable();
            }
        },

        getTipConfig: function (dom, property) {
            var me = this,
                propertyMap = me._propertyMap,
                tipDefaults = me._tipDefaults,
                fly = me._fly,
                data = fly.attach(dom).getData().qtip,
                tip = me.tip,
                textAttr = propertyMap.html.prop,
                name, text, ret, value, item;

            // Before we ever reconfigure the toolTip, we need to snag its default
            // values so we can restore them. Don't bother if all we want is the tip
            // text.
            if (!tipDefaults && property !== 'html') {
                me._tipDefaults = tipDefaults = {};

                for (name in propertyMap) {
                    tipDefaults[name] = tip.getConfig(name);
                }
            }

            if (data) {
                if (property) {
                    ret = data[property];
                } else {
                    ret = Ext.apply({}, tipDefaults);
                    Ext.apply(ret, data);
                }
            } else {
                if (dom.hasAttribute(textAttr)) {
                    text = dom.getAttribute(textAttr);
                    if (!text) {
                        text = me.interceptTitles && dom.title;
                        if (text) {
                            dom.setAttribute(textAttr, text);
                            dom.removeAttribute('title');
                        }
                    }
                }

                if (text) { // if there is no qtip text there is no tooltip
                    if (property === 'html') {
                        ret = text;
                    } else if (property) {
                        item = propertyMap[property];
                        if (item.prop) {
                            if (dom.hasAttribute(item.prop)) {
                                ret = item.parse(dom.getAttribute(item.prop));
                            }
                        }
                    } else {
                        ret = data = {
                            html: text
                        };

                        for (name in propertyMap) {
                            if (name !== 'html') {
                                item = propertyMap[name];
                                value = null;
                                if (item.prop) {
                                    if (dom.hasAttribute(item.prop)) {
                                        value = item.parse(dom.getAttribute(item.prop));
                                    }
                                }
                                if (value === null) {
                                    value = tipDefaults[name];
                                }
                                data[name] = value;
                            }
                        }
                    }
                }
            }

            fly.detach();

            if (property && ret == null && property !== 'html') {
                ret = tipDefaults[property];
            }

            return ret;
        },

        onBeforeShow: function (tip) {
            var me = this,
                dom = tip.currentTarget.dom,
                data, header;

            if (dom) {
                data = me.getTipConfig(dom);
                tip.setConfig(data);
                header = tip.getHeader();
                if (header) {
                    header.setHidden(!data.title && !data.closable);
                }
            }
        },

        priorityConfigs: ['showDelay', 'anchor', 'anchorToTarget', 'align', 'trackMouse'],

        onHoverTarget: function (tip, currentTarget) {
            var dom = currentTarget.dom,
                cfg;

            if (dom) {
                cfg = {};
                this.priorityConfigs.forEach(function(name) {
                    cfg[name] = this.getTipConfig(dom, name);
                }, this);
                tip.setConfig(cfg);
            }
        }
    }
});