/**
 * Panels add extra functionality by providing various options for configuring a header
 * that is docked inside the panel.
 * See:
 * - {@link #title}
 * - {@link #iconCls}
 * - {@link #tools}
 * - {@link #closable}
 *
 * It is also possible to configure the header directly using the {@link #header}
 * configuration. See {@link Ext.panel.Header} for more information.
 * 
 * Panels are also useful as Overlays - containers that float over your application.
 * If configured with `{@link #cfg-anchor: true}`, when you {@link #showBy} another
 * component, there will be an anchor arrow pointing to the reference component.
 *
 */
Ext.define('Ext.Panel', {
    extend: 'Ext.Container',
    xtype: 'panel',

    alternateClassName: 'Ext.panel.Panel',

    defaultBindProperty: 'title',

    isPanel: true,

    config: {
        /**
         * @cfg border
         * @inheritdoc
         */
        border: false,

        /**
         * @cfg {Number/Boolean/String} bodyPadding
         * A shortcut for setting a padding style on the body element. The value can either be
         * a number to be applied to all sides, or a normal CSS string describing padding.
         */
        bodyPadding: null,

        /**
         * @cfg {Boolean} bodyBorder
         * - `true` to enable the border around the panel body (as defined by the theme)
         * Note that even when enabled, the bodyBorder is only visible when there are docked
         * items around the edges of the panel.  Where the bodyBorder touches the panel's outer
         * border it is automatically collapsed into a single border.
         *
         * - `false` to disable the body border
         *
         * - `null` - use the value of {@link #border} as the value for bodyBorder
         */
        bodyBorder: null,

        /**
         * @cfg {Boolean/Object} header
         * Pass as `false` to prevent a header from being created.
         *
         * You may also assign a header with a config object (optionally containing an `xtype`)
         * to custom-configure your panel's header.
         *
         * See {@link Ext.panel.Header} for all the options that may be specified here.
         */
        header: null,

        /**
         * @cfg {String} icon
         * @inheritdoc Ext.panel.Header#icon
         */
        icon: null,

        /**
         * @cfg {String} iconCls
         * @inheritdoc Ext.panel.Header#iconCls
         */
        iconCls: null,

        /**
         * @cfg {String/Object} title
         * @inheritdoc Ext.panel.Header#title
         */
        title: null,

        /**
         * @cfg {Object[]/Ext.panel.Tool[]} tools
         * An array of {@link Ext.panel.Tool} configs/instances to be added to the header tool area. The tools are stored as
         * child components of the header container.
         */
        tools: null,

        /**
         * @cfg {Boolean} [anchor=false]
         * Configure `true` to show an anchor element pointing to the target component when this Panel is
         * {@link #showBy shown by} another component.
         */
        anchor: null,

        /**
         * @cfg {String} [anchorPosition]
         * Set the anchor position.
         *
         * @private
         */
        anchorPosition: null,

        /**
         * @cfg {Boolean} closable
         * True to display the 'close' tool button and allow the user to close the panel, false to hide the button and
         * disallow closing the window.
         *
         * By default, when close is requested by clicking the close button in the header, the {@link #method-close} method will be
         * called. This will _{@link Ext.Component#method-destroy destroy}_ the Panel and its content meaning that it may not be
         * reused.
         *
         * To make closing a Panel _hide_ the Panel so that it may be reused, set {@link #closeAction} to 'hide'.
         */
        closable: null,

        /**
         * @cfg {String} closeAction
         * The action to take when the close header tool is clicked:
         *
         * - **`'{@link #method-destroy}'`** :
         *
         *   {@link #method-remove remove} the window from the DOM and {@link Ext.Component#method-destroy destroy} it and all descendant
         *   Components. The window will **not** be available to be redisplayed via the {@link #method-show} method.
         *
         * - **`'{@link #method-hide}'`** :
         *
         *   {@link #method-hide} the window by setting visibility to hidden and applying negative offsets. The window will be
         *   available to be redisplayed via the {@link #method-show} method.
         *
         * **Note:** This behavior has changed! setting *does* affect the {@link #method-close} method which will invoke the
         * appropriate closeAction.
         */
        closeAction: 'destroy',

        //<locale>
        /**
         * @cfg {String} closeToolText Text to be announced by screen readers when the 
         * **close** {@link Ext.panel.Tool tool} is focused.  Will also be set as the close 
         * tool's {@link Ext.panel.Tool#cfg-tooltip tooltip} text.
         * 
         * **Note:** Applicable when the panel is {@link #closable}: true
         */
        closeToolText: 'Close panel'
        //</locale>
    },

    classCls: Ext.baseCSSPrefix + 'panel',

    manageBorders: true,

    allowHeader: true,

    getElementConfig: function() {
        return {
            reference: 'element',
            classList: ['x-container', 'x-unsized'],
            children: [
                {
                    reference: 'innerElement',
                    className: 'x-inner'
                },
                {
                    reference: 'tipElement',
                    className: 'x-anchor',
                    hidden: true
                }
            ]
        };
    },

    /**
     * Adds a CSS class to the body element. If not rendered, the class will
     * be added when the panel is rendered.
     * @param {String} cls The class to add
     * @return {Ext.panel.Panel} this
     */
    addBodyCls: function(cls) {
        this.innerElement.addCls(cls);
        return this;
    },

    /**
     * Removes a CSS class from the body element.
     * @param {String} cls The class to remove
     * @return {Ext.panel.Panel} this
     */
    removeBodyCls: function(cls) {
        this.innerElement.removeCls(cls);
        return this;
    },

    applyBodyPadding: function(bodyPadding) {
        if (bodyPadding === true) {
            bodyPadding = 5;
        }

        if (bodyPadding) {
            bodyPadding = Ext.dom.Element.unitizeBox(bodyPadding);
        }

        return bodyPadding;
    },

    addTool: function (tool) {
        var header = this.ensureHeader(),  // creates if header !== false
            items;

        if (header) {
            items = header.createTools(Ext.Array.from(tool), this);

            if (items && items.length) {
                items = header.add(items);
            }
        }

        return items;
    },

    applyHeader: function (newHeader, oldHeader) {
        // This method should never call any getters here doing so will cause re-entry into this method. Extra Headers will be created
        var me = this,
            header = oldHeader;

        me.allowHeader = newHeader !== false;

        if (!me.allowHeader) {
            if (header) {
                me.remove(header);
                header = null;
            }
        } else if (newHeader) {
            if (header) {
                if (newHeader !== true) {
                    header.setConfig(newHeader);
                }
            } else {
                // Unlike classic, modern doesn't have (yet) the "weight" concept to control the
                // docking order. To make sure that the header is the first docked item, let's
                // use insert() instead of add() since this last, through getItems(), creates
                // and adds config items BEFORE our header, which is not what we want.
                header = me.insert(0, me.createHeader(newHeader));
            }
        }

        return header || null;
    },

    applyTools: function (tools) {
        var header = this.ensureHeader(),  // creates if header !== false
            items;

        if (header) {
            // Remove all tools (since we are the impl of a setTools([...]) call)
            header.clearTools();

            items = header.createTools(tools, this);

            if (items && items.length) {
                header.add(items);
            }
        }

        // we don't return anything since the tools are "stored" on the Header
    },

    close: function() {
        var me = this;

        if (me.fireEvent('beforeclose', me) !== false) {
            me[me.getCloseAction()]();
            me.fireEvent('close', me);
        }
    },

    createHeader: function (config) {
        var me = this,
            ret = {
                xtype: 'panelheader',
                docked: 'top',
                ui: me.getUi()
            },
            icon, title;

        me._isCreatingHeader = true;

        if (config && config !== true) {
            Ext.merge(ret, config);
        }

        if (me.initialized) {
            // Only attempt to configure title if we are not currently initializing.
            // During initialization the updater for title will run if present and apply
            // it to the header so there is no work to be done here.
            title = me.getTitle();

            if (title != null) {
                if (typeof title === 'string') {
                    title = {
                        text: title
                    };
                }

                Ext.merge(ret, {
                    title: title
                });
            }

            icon = me.getIconCls();
            if (icon != null) {
                ret.iconCls = icon;
            } else {
                icon = me.getIcon();
                if (icon != null) {
                    ret.icon = icon;
                }
            }
        }

        me._isCreatingHeader = false;
        return ret;
    },

    updateAnchor: function(anchor) {
        this.tipElement.setVisible(!!anchor);
    },

    updateAnchorPosition: function(anchorPosition, oldAnchorPosition) {
        var tipElement = this.tipElement,
            prefix = this.anchorPrefix;

        if (oldAnchorPosition) {
            tipElement.removeCls(prefix + oldAnchorPosition.side);
        }

        if (anchorPosition) {
            tipElement.addCls(prefix + anchorPosition.side);
            tipElement.translate(anchorPosition.x, anchorPosition.y);
            tipElement.show();
        } else {
            tipElement.hide();
        }
    },

    updateBorder: function(border, oldBorder) {
        this.callParent([ border, oldBorder ]);

        if (this.getBodyBorder() === null) {
            this.setBodyBorderEnabled(border !== false);
        }
    },

    updateBodyPadding: function(newBodyPadding) {
        this.innerElement.setStyle('padding', newBodyPadding);
    },

    updateBodyBorder: function(bodyBorder) {
        var border = (bodyBorder === null) ? this.getBorder() : bodyBorder;

        this.setBodyBorderEnabled(bodyBorder !== false);
    },

    updateClosable: function(closable) {
        var me = this;

        if (closable) {
            me.closeTool = me.addTool({
                type: 'close',
                weight: 1000,
                scope: me,
                handler: me.close,
                tooltip: me.getCloseToolText()
            })[0];
        } else {
            Ext.destroy(me.closeTool);
        }
    },

    updateIcon: function (icon) {
        var header = this.ensureHeader();  // creates if header !== false

        if (header) {
            header.setIcon(icon);
        }
    },

    updateIconCls: function (icon) {
        var header = this.ensureHeader();  // creates if header !== false

        if (header) {
            header.setIconCls(icon);
        }
    },

    updateTitle: function (title) {
        var header = this.ensureHeader();  // creates if header !== false

        if (header) {
            header.setTitle(title);
        }
    },

    updateUi: function(ui, oldUi) {
        var me = this,
            innerElement = me.innerElement,
            // Let the header initter get the ui since ui is a cached config and
            // should not pull in non-cached cfgs at this early stage
            header = !me.isConfiguring && me.ensureHeader();

        if (header) {
            me.getTitle();
            header.setUi(ui);
        }

        me.callParent([ui, oldUi]);
    },

    alignTo: function(component, alignment, options) {
        var me = this,
            tipElement = me.tipElement,
            alignmentInfo = me.getAlignmentInfo(component, alignment),
            config = me.initialConfig,
            positioned = me.isPositioned(),
            setX = positioned ? me.setLeft : me.setX,
            setY = positioned ? me.setTop : me.setY,
            x = 0,
            y = 0,
            resultRegion, oldHeight, cls;

        if (alignmentInfo.isAligned) {
            return;
        }

        if (!me.isFloated() && !me.getParent()) {
            me.setFloated(true);
        }

        // Superclass does pure alignment.
        // We only need extra if we're showing an anchor.
        if (!me.getAnchor()) {
            me.setAnchorPosition(null);
            return me.callParent([component, alignment, options]);
        }

        // Show anchor el so we can measure it
        if (!me.anchorSize) {
            cls = me.anchorMeasureCls;
            tipElement.addCls(cls);
            tipElement.show();

            me.anchorSize = new Ext.util.Offset(tipElement.getWidth(), tipElement.getHeight());
            tipElement.removeCls(cls);
            tipElement.hide();
        }

        if ('unconstrainedWidth' in me) {
            me.setWidth(me.unconstrainedWidth);
        }
        if ('unconstrainedHeight' in me) {
            me.setHeight(me.unconstrainedHeight);
        }
        resultRegion = me.getAlignRegion(component, alignment, Ext.apply({
            anchorSize: me.anchorSize,
            axisLock: me.getAxisLock()
        }, options));

        // If already aligned, will return undefined
        if (resultRegion) {
            setX.call(me, resultRegion.x);
            setY.call(me, resultRegion.y);
            if (resultRegion.constrainWidth) {
                me.unconstrainedWidth = config.width || me.self.prototype.width;

                // We must deal with height changeing if we restrict width and we are aliging above
                oldHeight = me.el.getHeight();
                me.setWidth(alignmentInfo.stats.width = resultRegion.getWidth());

                // We are being positioned above, bump upwards by how much the
                // element has expanded as a result of width restriction.
                if (resultRegion.align.position === 0) {
                    setY.call(me, resultRegion.y + (oldHeight - me.el.getHeight()));
                }
            }
            if (resultRegion.constrainHeight) {
                me.unconstrainedHeight = config.height || me.self.prototype.height;
                me.setHeight(alignmentInfo.stats.height = resultRegion.getHeight());
            }
            if (resultRegion.anchor) {
                x = 0;
                y = 0;

                // The result is to the left or right of the target
                if (resultRegion.anchor.align & 1) {
                   y = resultRegion.anchor.y - resultRegion.y - resultRegion.getHeight();
                } else {
                    x = resultRegion.anchor.x - resultRegion.x;
                }

                me.setAnchorPosition({
                    side: resultRegion.anchor.position,
                    x: x,
                    y: y
                });
            } else {
                me.setAnchorPosition(null);
            }
            me.setCurrentAlignmentInfo(alignmentInfo);
        } else {
            // Already aligned
            tipElement.show();
        }
    },

    privates: {
        anchorMeasureCls: Ext.baseCSSPrefix + 'anchor-top',
        anchorPrefix: Ext.baseCSSPrefix + 'anchor-',

        ensureHeader: function () {
            var me = this,
                header;

            if (!me._isCreatingHeader) {
                me.getViewModel();
                me.getItems();

                header = me.getHeader();

                if (!header && me.allowHeader) {
                    me.setHeader(true);
                    header = me.getHeader();
                }
            }

            return header;
        },

        setBodyBorderEnabled: function(enabled) {
            this.innerElement.setStyle('border-width', enabled ? '' : '0');
        }
    }
});
