/**
 * @class Ext.Widget
 */
Ext.define('Ext.overrides.Widget', {
    override: 'Ext.Widget',

    mixins: [
        'Ext.mixin.Traversable'
    ],

    requires: [
        'Ext.behavior.Translatable'
    ],

    statics: {
        /**
         * This method reorders the DOM structure of floated components to arrange that the clicked
         * element is last of its siblings, and therefore on the visual "top" of the floated component stack.
         * @param {type} e The mousedown event
         * @private
         */
        onDocumentMouseDown: function(e) {
            var selector = Ext.Widget.prototype.floatedSelector,
                targetFloated = Ext.Component.fromElement(e.getTarget(selector, Ext.getBody()));

            // If the mousedown is in a floated, move it to top.
            if (targetFloated) {
                targetFloated.toFront(true);
            }
        },

        onModalMaskTap: function() {
            var top = this.topModal;
            if (top && top.getHideOnMaskTap && top.getHideOnMaskTap()) {
                top.hide();
                this.topModal = null;
            }
        },

        range: document.createRange()
    },

    config: {
        /**
         * @cfg {Number} flex
         * The flex of this item *if* this item item is inside a {@link Ext.layout.HBox} or {@link Ext.layout.VBox}
         * layout.
         *
         * You can also update the flex of a component dynamically using the {@link Ext.layout.FlexBox#setItemFlex}
         * method.
         */
        flex: {
            evented: true,
            $value: null
        },

        /**
         * @cfg {String} id
         * The **unique id of this component instance.**
         *
         * It should not be necessary to use this configuration except for singleton objects in your application. Components
         * created with an id may be accessed globally using {@link Ext#getCmp Ext.getCmp}.
         *
         * Instead of using assigned ids, use the {@link #itemId} config, and {@link Ext.ComponentQuery ComponentQuery}
         * which provides selector-based searching for Sencha Components analogous to DOM querying. The
         * {@link Ext.Container} class contains {@link Ext.Container#down shortcut methods} to query
         * its descendant Components by selector.
         *
         * Note that this id will also be used as the element id for the containing HTML element that is rendered to the
         * page for this component. This allows you to write id-based CSS rules to style the specific instance of this
         * component uniquely, and also to select sub-elements using this component's id as the parent.
         *
         * **Note**: to avoid complications imposed by a unique id also see `{@link #itemId}`.
         *
         * Defaults to an auto-assigned id.
         */

        /**
         * @cfg {String} itemId
         * An itemId can be used as an alternative way to get a reference to a component when no object reference is
         * available. Instead of using an `{@link #id}` with {@link Ext#getCmp}, use `itemId` with
         * {@link Ext.Container#getComponent} which will retrieve `itemId`'s or {@link #id}'s. Since `itemId`'s are an
         * index to the container's internal MixedCollection, the `itemId` is scoped locally to the container - avoiding
         * potential conflicts with {@link Ext.ComponentManager} which requires a **unique** `{@link #id}`.
         *
         * Also see {@link #id}, {@link Ext.Container#query}, {@link Ext.Container#down} and {@link Ext.Container#child}.
         *
         * @accessor
         */
        itemId: undefined,

        /**
         * @cfg {Boolean} [floated=false]
         * A Component may be floated above all other components in the application. This means that the component is absolutely
         * positioned, and will move to the front and occlude other sibling floated component if clicked.
         *
         * A Floated component may have floated descendants. It will bring these decendants to the front with it when brought 
         * to the front of its sibling floated components.
         *
         * By default, descendant floated components are all positioned using the viewport coordinate system. To make a floating 
         * component a positioning parent for descendants, and have the ancestors positioned relatively, configure the parent
         * floated component with `{@link #cfg-relative}: true`.
         *
         * @since 6.2.0
         */
        floated: null,

        /**
         * @cfg {Boolean} [relative=false]
         * *Only valid when a component is `{@link #cfg-floated}`*
         *
         * Configure this as `true` if you require descendant floated components to be positioned  relative to this
         * component's coordinate space, not the viewport's coordinate space.
         * 
         * *Note:* The coordinate space is this Component's encapsulating element's area. Not that of the inner
         * element in which static child items are rendered by the layout.
         *
         * @since 6.2.0
         */
        relative: null,
        
        /**
         * @cfg {Number} [x=0]
         * *Only valid when a component is `{@link #cfg-floated}`*
         *
         * The x position at which to position this component. This is usually viewport-relative. But if there is a
         * `{@link #relative}: true` ancestor, it will be relative to that.
         */
        x: null,
        
        /**
         * @cfg {Number} [y=0]
         * *Only valid when a component is `{@link #cfg-floated}`*
         *
         * The x position at which to position this component. This is usually viewport-relative. But if there is a
         * `{@link #relative}: true` ancestor, it will be relative to that.
         */
        y: null,

        /**
         * @cfg {Boolean} [shadow]
         * Configure as `true` for the component to have a drop shadow. 'false' will suppress any default shadow.
         * By default the theme will determine the presence of a shadow.
         *
         * @since 6.2.0
         */
        shadow: null,

        /**
         * @cfg {Boolean} [shim=false]
         * *Only valid when a component is `{@link #cfg-floated}`*
         *
         * Configure as `true` for the component to use an `<iframe>` as an underlay to ensure certain non-standard
         * browser plugins are occluded by this component.
         *
         * @since 6.2.0
         */
        shim: null,

        /**
         * @cfg {Boolean/Number} [alwaysOnTop=false] A flag indicating that this component should be above its floated siblings.
         *
         * This may be a positive number to prioritize the ordering of multiple visible always on top components.
         *
         * This may be set to a *negative* number to prioritize a component to the *bottom* of the z-index stack.
         *
         * @since 6.2.0
         */
        alwaysOnTop: null,

        /**
         * @cfg {Boolean} [toFrontOnShow=true]
         * True to automatically call {@link #toFront} when a {@link #cfg-floated} Component is shown.
         */
        toFrontOnShow: true,

        /**
         * @cfg {Object} translatable
         * @private
         * @accessor
         */
        translatable: null
    },

    /**
     * @property {String} [floatingCls="x-floated"] The CSS class to add to this component when it is floated at the viewport level.
     * @private
     * @readonly
     */
    floatedCls: Ext.baseCSSPrefix + 'floated',

    /**
     * @property {String} [floatedSelector=".x-floated"] The CSS selector to match floated elements.
     * @private
     * @readonly
     */
    floatedSelector: '.' + Ext.baseCSSPrefix + 'floated',

    /**
     * @property {String} [shadowCls] The CSS class to add to this component when it has a shadow.
     * @private
     * @readonly
     */
    shadowCls: Ext.baseCSSPrefix + 'shadow',

    /**
     * @property {String} [shadowCls] The CSS class to add to this component should not have a shadow.
     * @private
     * @readonly
     */
    noShadowCls: Ext.baseCSSPrefix + 'no-shadow',
    
    /**
     * @property {String} [floatWrapCls="x-float-wrap"] The CSS class to add to this component's floatWrap when it's created.
     * @private
     * @readonly
     */
    floatWrapCls: Ext.baseCSSPrefix + 'float-wrap',
    
    /**
     * @property {String} [shimCls="x-shim"] The CSS class to add to this component's shim element if enabled.
     * @private
     * @readonly
     */
    shimCls: Ext.baseCSSPrefix + 'shim',

    /**
     * @event beforetofront
     * Fires before a {@link #cfg-floated} component is brought to the front of the visual stack.
     * @param {Ext.Component} this The component instance
     */

    /**
     * @event tofront
     * Fires when a {@link #cfg-floated} component has been brought to the front of the visual stack.
     * @param {Ext.Component} this The component instance
     */

    /**
     * @private
     */
    isInner: true,

    /**
     * @private
     */
    alignmentRegex: /^([a-z]+)-([a-z]+)(\?)?$/,

    constructor: function(config) {
        this.callParent([config]);
        this.initBindable();
    },

    applyFlex: function(flex) {
        if (flex) {
            flex = Number(flex);

            if (isNaN(flex)) {
                flex = null;
            }
        }
        else {
            flex = null;
        }

        return flex;
    },

    beforeHide: Ext.emptyFn,

    afterHide: function() {
        var me = this,
            parent = me.getParent();

        if (parent && parent.afterItemHide) {
            parent.afterItemHide(me);
        }

        if (me.isFloated()) {
            me.syncShim();
        }
    },

    beforeShow: function() {
        var me = this;

        if (me.isFloated()) {
            // An instantiated, but not yet shown floated.
            // It will still be wrapped in its documentFragment.
            // Insert it into the global floatRoot.
            if (!Ext.getBody().contains(me.element)) {
                me.findFloatParent();
            }
            if (me.getToFrontOnShow()) {
                me.toFront();
            } else {
                me.syncAlwaysOnTop();
            }
        }
    },

    afterShow: function() {
        var me = this,
            parent = me.getParent();

        if (parent && parent.afterItemShow) {
            parent.afterItemShow(me);
        }
    },

    applyItemId: function(itemId) {
        return itemId || this.getId();
    },

    render: function(container, insertBeforeElement) {
        this.renderTo(container, insertBeforeElement);
    },

    renderTo: function(container, insertBeforeElement) {
        var dom = this.renderElement.dom,
            containerDom = Ext.getDom(container),
            insertBeforeChildDom;

        if (Ext.isNumber(insertBeforeChildDom)) {
            insertBeforeElement = containerDom.childNodes[insertBeforeElement];
        }
        insertBeforeChildDom = Ext.getDom(insertBeforeElement);

        if (containerDom) {
            if (insertBeforeChildDom) {
                containerDom.insertBefore(dom, insertBeforeChildDom);
            }
            else {
                containerDom.appendChild(dom);
            }

            this.setRendered(Boolean(dom.offsetParent));
        }
    },

    destroy: function() {
        var me = this,
            parent = me.getParent();

        if (parent && parent.remove) {
            parent.remove(me, false);
        }
        me.setShim(false);
        Ext.destroy(me.getTranslatable());

        me.removeBindings();

        me.callParent();
    },

    isInnerItem: function() {
        return this.isInner;
    },

    isCentered: function() {
        return false;
    },

    isDocked: function() {
        return Boolean(this.getDocked());
    },

    isFloating: function() {
        return false;
    },

    isPositioned: function() {
        return false;
    },

    isFloated: function() {
        return Boolean(this.getFloated());
    },

    isRelative: function() {
        return Boolean(this.getRelative());
    },

    getDocked: function() {
        return this._docked;
    },

    /**
     * @private
     */
    onAdded: function(parent, instanced) {
        var me = this,
            inheritedState = me.inheritedState,
            currentParent = me.parent;

        if (currentParent && currentParent !== parent) {
            currentParent.remove(me, false);
        }

        me.parent = parent;

        me.onInheritedAdd(parent, instanced);

        // If we are floated, register with a floatParent
        if (me.isFloated()) {
            me.findFloatParent();
        }
    },

    onRemoved: function(destroying) {
        if (!destroying) {
            this.removeBindings();
        }

        this.onInheritedRemove(destroying);

        this.parent = null;
    },

    setLayoutSizeFlags: Ext.emptyFn,

    /**
     * @private
     * @param {Boolean} rendered
     */
    setRendered: function(rendered) {
        var wasRendered = this.rendered;

        if (rendered !== wasRendered) {
            this.rendered = rendered;

            return true;
        }

        return false;
    },

    doRefreshSizeState: function() {
        var me = this,
            floatWrap = me.floatWrap,
            mask,
            mySize;

        if (me.isFloated() && me.isVisible()) {
            mySize = me.el.getSize();

            me.syncShim();
            
            // We will have a floatWrap if we have child floateds
            if (floatWrap) {

                // If we are positioning child floateds in our address space,
                // size the floatWrap in which child floateds are rendered.
                if (me.isRelative()) {
                    floatWrap.setSize(mySize);
                } else {
                    mask = floatWrap.getData().modalMask;
                    if (mask) {
                        mask.setSize(mySize);
                    }
                }
            }
        }
    },

    setIsInner: function(isInner) {
        if (isInner !== this.isInner) {
            this.isInner = isInner;

            if (this.initialized) {
                this.fireEvent('innerstatechange', this, isInner);
            }
        }
    },

    refreshInnerState: function() {
        this.setIsInner(!this.isFloated() && !this.isCentered() && !this.isPositioned() && !this.isDocked());
    },

    /**
     * Brings a {@link #cfg-floated} Component to the front of any other visible, floated Components.
     *
     * TODO: If this Component is modal, inserts the modal mask just below this Component.
     *
     * @return {Ext.Component} this
     */
    toFront: function(/* private */ fromMousedown) {
        //<debug>
        if (!this.isFloated()) {
            Ext.raise('Cannot use toFront on a non-floated component');
        }
        //</debug>
        var me = this,
            floatParent = me.getFloatParent();

        if (!me.hasListeners.beforetofront || me.fireEvent('beforetofront', me) !== false) {
            me.syncAlwaysOnTop(fromMousedown);

            // All floatParents must move to the front of their own floatWraps
            // If we hit the floatRoot, it's not associated with a floated component
            // which could need moving, so there will be no component
            if (floatParent && floatParent.isFloated()) {
                floatParent.toFront(fromMousedown);
            }

            if (me.hasListeners.tofront) {
                me.fireEvent('tofront', me);
            }
        }

        return me;
    },

    getTranslatableBehavior: function() {
        var behavior = this.translatableBehavior;

        if (!behavior) {
            behavior = this.translatableBehavior = new Ext.behavior.Translatable(this);
        }

        return behavior;
    },

    applyTranslatable: function(config) {
        this.getTranslatableBehavior().setConfig(config);
    },

    getTranslatable: function() {
        return this.getTranslatableBehavior().getTranslatable();
    },

    translate: function() {
        var translatable = this.getTranslatable();

        if (!translatable) {
            this.setTranslatable(true);
            translatable = this.getTranslatable();
        }

        translatable.translate.apply(translatable, arguments);
    },

    /**
     * Prepares information on aligning this to component using alignment.
     * Also checks to see if this is already aligned to component according to alignment.
     * @protected
     */
    getAlignmentInfo: function (component, alignment){
        var me = this,
            alignToBox = component.isRegion ? component : (component.isComponent ? component.renderElement : Ext.fly(component)).getBox(),
            element = me.renderElement,
            box = element.getBox(),
            stats = {
                alignToBox: alignToBox,
                alignment: alignment,
                top: alignToBox.top,
                left: alignToBox.left,

                // Might be an Ext.util.Point which does not have dimensions.
                alignToWidth: alignToBox.width || 0,
                alignToHeight: alignToBox.height || 0,

                width: box.width,
                height: box.height
            },
            currentAlignmentInfo = me.getCurrentAlignmentInfo(),
            isAligned = true;

        if (!Ext.isEmpty(currentAlignmentInfo)) {
            Ext.Object.each(stats, function(key, value) {
                if (!Ext.isObject(value) && currentAlignmentInfo[key] !== value) {
                    isAligned = false;
                    return false;
                }
                return true;
            });
        } else {
            isAligned = false;
        }

        return {isAligned: isAligned, stats: stats};
    },

    /**
     * Current Alignment information from the last alignTo call
     * @private
     */
    getCurrentAlignmentInfo: function() {
        return this.$currentAlignmentInfo;
    },

    /**
     * Sets the current Alignment information, called by alignTo
     * @private
     */
    setCurrentAlignmentInfo: function(alignmentInfo) {
        this.$currentAlignmentInfo = Ext.isEmpty(alignmentInfo) ? null : Ext.merge({}, alignmentInfo.stats ? alignmentInfo.stats : alignmentInfo);
    },

    /**
     * @private
     */
    alignTo: function(component, alignment, options) {
        var me = this,
            alignmentInfo = me.getAlignmentInfo(component, alignment),
            config = me.initialConfig,
            positioned = me.isPositioned(),
            setX = positioned ? me.setLeft : me.setX,
            setY = positioned ? me.setTop : me.setY,
            oldHeight, resultRegion;

        if (alignmentInfo.isAligned) {
            return;
        }

        if ('unconstrainedWidth' in me) {
            me.setWidth(me.unconstrainedWidth);
        }
        if ('unconstrainedHeight' in me) {
            me.setHeight(me.unconstrainedHeight);
        }
        resultRegion = me.getAlignRegion(component, alignment, options);

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
        me.setCurrentAlignmentInfo(alignmentInfo);
    },

    /**
     * @private
     */
    getAlignRegion: function(component, alignment, options) {
        var me = this,
            alignmentInfo = me.getAlignmentInfo(component, alignment),
            matches,
            inside;

        if (alignmentInfo.isAligned) {
            return;
        }

        var alignToBox = alignmentInfo.stats.alignToBox,
            // TODO: Allow configuration of constrain region
            constrainBox = me.getConstrainRegion(),
            height = alignmentInfo.stats.height,
            width = alignmentInfo.stats.width;

        if (!alignment || alignment === 'auto') {
            if (constrainBox.bottom - alignToBox.bottom < height) {
                if (alignToBox.top - constrainBox.top < height) {
                    if (alignToBox.left - constrainBox.left < width) {
                        alignment = 'l-r?';
                    }
                    else {
                        alignment = 'r-l?';
                    }
                }
                else {
                    alignment = 'b-t?';
                }
            }
            else {
                alignment = 't-b?';
            }
        }

        matches = alignment.match(me.alignmentRegex);
        //<debug>
        if (!matches) {
            Ext.Logger.error("Invalid alignment value of '" + alignment + "'");
        }
        //</debug>
        
        // If position spec ended with a "?" or "!", then constraining is necessary
        if (matches[3]) {
            // Constrain to the correct enclosing object:
            // If the assertive form was used (like "tl-bl!"), constrain to the align to component.
            if (matches[3] === '!') {
                inside = component.el.getRegion();
            }
            else {
                inside = constrainBox;
            }
        }

        return me.el.getRegion().alignTo(Ext.apply({
            target: Ext.util.Region.from(alignmentInfo.stats.alignToBox),
            align: matches[1] + '-' + matches[2],
            inside: inside,
            minWidth: me.getMinWidth && me.getMinWidth(),
            minHeight: me.getMinHeight && me.getMinHeight()
        }, options));
    },

    privates: {
        /**
         * @private
         * Returns `true` if the passed element is within the container tree of this component.
         *
         * For example if a menu's submenu contains an {@link Ext.form.field.Date}, that top level
         * menu owns the elements of the date picker. Using this method, you can tell if an event took place
         * within a certain component tree.
         */
        owns: function(element) {
            var result = false,
                cmp;

            if (element.isEvent) {
                element = element.target;
            } else if (element.isElement) {
                element = element.dom;
            }

            cmp = Ext.Component.fromElement(element);

            if (cmp) {
                result = (cmp === this) || (!!cmp.up(this));
            }

            return result;
        },

        getBubbleTarget: function() {
            return this.getParent();
        },

        // TODO: Allow configuration of constrain region
        getConstrainRegion: function() {
            var me = this,
                parent,
                constrainEl,
                constrainComponent;

            // If we're floated, find the owning Component's region if any.
            // If we are owned by the global floatRoot, use the document body.
            if (me.isFloated()) {
                constrainEl = me.floatParentNode;
                constrainComponent = constrainEl.getData().component;
                if (constrainComponent) {
                    constrainEl = constrainComponent.element;
                } else {
                    constrainEl = Ext.getBody();
                }
            }
            // If not floated, use parent's element.
            else {
                parent = me.getParent();
                constrainEl = parent ? parent.element : me.element.parent();
            }
            
            return constrainEl.getConstrainRegion();
        },

        /**
         * *For {@link #cfg-floated} components only. *
         *
         * Finds the owning {@link #cfg-floated} component (if any) responsible for
         * the base z-index stack position of this compoonent, and, if that component
         * is {@link #cfg-relative}, for the coordinate system in which this component
         * is positioned.
         *
         * If this is a top level floated component, this method will return `null`
         * @return {Ext.Component} The owning floated component or `null` if this
         * component is top level floated.
         * @private
         */
        getFloatParent: function() {
            var result = this.floatParentNode.getData().component;
            return result && result.isFloated() ? result : null;
        },

        /**
         * @private
         * @param {Boolean} floated
         * @return {Boolean}
         */
        applyFloated: function(floated) {
            var me = this;

            floated = Boolean(floated);

            if (floated) {
                me.refreshInnerState = Ext.emptyFn;

                if (me.isPositioned()) {
                    me.resetPositioned();
                }

                if (me.isDocked()) {
                    me.setDocked(false);
                }

                me.setIsInner(false);
                delete me.refreshInnerState;
            }

            if (me.initialized) {
                me.fireEvent('floatedchange', me, floated);
            }

            return floated;
        },

        updateFloated: function(floated, oldFloated) {
            var me = this,
                modal;

            me.el.toggleCls(me.floatedCls, floated);

            // If we are *changing* floatedness, these
            // copnfigs behave in different ways
            if (oldFloated != null) {
                modal = me.getModal && me.getModal();
                if (modal) {
                    Ext.destroy(modal);
                    me.setModal(true);
                }
                if (me.getHideOnMaskTap && me.getHideOnMaskTap()) {
                    me.setHideOnMaskTap(false);
                    me.setHideOnMaskTap(true);
                }
            }

            if (floated) {
                me.findFloatParent();
                
                // If being configured, and we are not configured hidden:fale
                if (me.isConfiguring && me.getHidden() == null) {
                    me.setHidden(true);
                } else if (me.isVisible()) {
                    if (me.isCentered()) {
                        // Ensure any configs are pulled through
                        me.getWidth();
                        me.getHeight();
                        me.center();
                    } else {
                        me.syncXYPosition();
                    }
                    me.showModalMask();
                }
                
            } else {
                me.refreshInnerState();
                me.translate(0, 0, 0);
            }
        },

        /**
         * The method finds this floated component's floatParent. That means a DOM positioning container
         * which acts as a root element for sibling floated components, and allows allows floated components
         * to be absolutely positioned, and their encapsulating elements to be reordered to produce a visual
         * stacking effect.
         *
         * This component's element is appended to its floatParent.
         *
         * There is a global floatParent element, created on demand when the first top level floated component
         * is shown. This may be an item child of a container configured with `{@link #cfg-floated}: true`,
         * or a free `floated` component which is programatically {@link Ext.Component#show shown}.
         *
         * Child items of components inside a floated component may also be configured `floated`. These
         * are give a floatParent which is created on demand wrapping the nearest `floated` ancestor.
         * This means that when that ancestor's element is brought to the top of the stack (by moving its
         * element to the end of its own floatParent), the descendant elements will automatically remain above.
         *
         * @private
         */
        findFloatParent: function() {
            var me = this,
                parent = me.getParent();

            // Climb to the nearest floated if possible
            while (parent && !parent.isFloated()) {
                parent = parent.getParent();
            }

            // Hit the top seeing no floateds; use the global floatRoot
            // The property floatParentNode is an Element.
            // It cannot be called floatParent because that is used by getRefOwner in the case
            // of no ownerCt/parent/$initParent etc.
            if (!parent) {
                me.floatParentNode = Ext.getFloatRoot();
            }
            // Use the nearest floating ancestor's floatRoot wrapper.
            else {
                me.floatParentNode = parent.getFloatWrap();
            }

            me.insertFloatedDom();
        },

        /**
         * This method returns, or creates on demand the floatWrap element which wraps the passed
         * floated component. It enables that floated component to act as a host for descendant floated
         * components.
         *
         * @return {Ext.Element} The passed component's floatWrap element.
         * @private
         */
        getFloatWrap: function() {
            var me = this,
                fw = me.floatWrap,
                viewport = Ext['Viewport'], // Hide from Cmd dependency checking
                parentNode;
            
            if (!fw) {
                parentNode = me.el.up('') || (viewport ? viewport.el : Ext.getBody());

                fw = me.link('floatWrap', parentNode.createChild({
                    cls: me.floatWrapCls,
                    id: me.id + '-floatWrap',
                    "data-componentId": me.id
                }));

                // Need a link to the owning component so that floateds which are hosted
                // in this element can easily find their floatParent component to move it to
                // front.
                fw.getData().component = me;

                // We wrap ourselves in this, and it becomes the hosting element for
                // child floaters.
                fw.dom.appendChild(me.element.dom);

                // alwaysOnTop flag duplicated in the floatWrap so syncAlwaysOnTop can sort.
                fw.getData().alwaysOnTop = me.element.getData().alwaysOnTop;
            }
            return fw;
        },

        /**
         * This method inserts this floated component's DOM into its owning floatParent.
         * @private
         */
        insertFloatedDom: function() {
            var me = this,
                floatParentNode = me.floatParentNode,
                positionEl = me.floatWrap || me.element,
                Widget = Ext.Widget;

            floatParentNode.dom.appendChild(positionEl.dom);

            // Sync positions of all associated elements.
            me.syncXYPosition();

            // Add the global mousedown floated reorderer listener only once on first floated insert.
            if (!Widget.$mousedownListeners) {
                Widget.$mousedownListeners = Ext.getDoc().on({
                    mousedown: Widget.onDocumentMouseDown,
                    destroyable: true
                });
            }
        },

        applyShim: function(shim) {
            //<debug>
            if (shim && !this.isFloated()) {
                Ext.raise('Cannot use setShim on a non-floated component');
            }
            //</debug>
            if (shim) {
                // Allow shim config options to be passed.
                return Ext.getBody().createChild(Ext.apply({
                    cls: this.shimCls
                }, shim));
            } else {
                Ext.destroy(this.shim);
                return null;
            }
        },

        updateShim: function() {
            this.syncShim();
        },

        hideModalMask: function() {
            var me = this,
                mask = me.floatParentNode.getData().modalMask;

            if (mask && mask.dom.parentNode) {
                mask = mask.dom;
                Ext.getDetachedBody().appendChild(mask);
            }
        },

        showModalMask: function() {
            var me = this,
                Widget = Ext.Widget,
                positionEl = me.floatWrap || me.element,
                parent = me.getParent(),
                floatParentNode = me.floatParentNode,
                data = floatParentNode.getData(),
                mask = data.modalMask;

            if (me.isFloated() && me.getModal && me.getModal()) {
                if (mask) {
                    floatParentNode.dom.insertBefore(mask.dom, positionEl.dom);
                } else {
                    mask = data.modalMask = floatParentNode.createChild({
                        cls: 'x-mask'
                    }, positionEl);
                    mask.on({
                        tap: Widget.onModalMaskTap,
                        scope: Widget
                    });
                }
                Widget.topModal = me;

                // Ensure that the mask is sized and positioned if
                // parent is not relative
                if (parent && parent.isFloated() && !parent.isRelative()) {
                    parent.doRefreshSizeState();
                    parent.syncXYPosition();
                }
            }
        },

        syncShim: function() {
            var me = this,
                shim = me.getShim();

            if (shim) {
                if (me.isVisible(true)) {
                    shim.show();
                    me.el.dom.parentNode.insertBefore(shim.dom, me.el.dom);
                    shim.setSize(me.getSize());
                    if (me.floatWrap) {
                        shim.translate(0, 0);
                    } else {
                        shim.translate(me.getX() || 0, me.getY() || 0);
                    }
                } else {
                    shim.hide();
                }
            }
        },
        
        updateAlwaysOnTop: function(alwaysOnTop) {
            var positionEl = this.floatWrap || this.element;

            positionEl.getData().alwaysOnTop = Number(alwaysOnTop);
            this.syncAlwaysOnTop();
        },

        /**
         * @private
         * Fixes up the alwaysOnTop order of this floated widget within its siblings.
         * @return {Boolean} `true` if this was the topmost widget among its siblings.
         */
        syncAlwaysOnTop: function(/* private */ fromMousedown) {
            var me = this,
                positionEl = (me.floatWrap || me.element).dom,
                parentEl = me.floatParentNode,
                nodes = parentEl.dom.childNodes,
                len = nodes.length,
                i, startIdx,
                alwaysOnTop = Number(me.getAlwaysOnTop()),
                refNode,
                range = me.statics().range;

            // Start from 1.
            // All elements if floatRoot are considered, The first element in child floatWraps
            // is the child floated which owns that floatWrap.
            startIdx = parentEl === Ext.floatRoot ? 0 : 1;
            for (i = len - 1; i >= startIdx; i--) {
                // Do not include shim elements in the comparison
                // Do not include our own element in the comparison.
                if (!Ext.fly(nodes[i]).is('.' + me.shimCls) && nodes[i] !== positionEl) {
                    // If we've gone back to find a node that should be below us,
                    // grab its next sibling as the refNode to insertBefore.
                    if (alwaysOnTop >= (Ext.get(nodes[i]).getData().alwaysOnTop || 0)) {
                        refNode = nodes[i].nextSibling;
                        break;
                    }
                }
            }
            // Already in correct position
            if (refNode === positionEl) {
                return;
            }

            // If we didn't find a node we are greater than, go to bottom of stack
            if (i < startIdx) {
                refNode = nodes[0];
            }

            // If we contain focus, or this is triggered by a mousedown,
            // then preserve this element's DOM, and move siblings around it.
            if (me.containsFocus || fromMousedown) {

                // Nodes to move to before our positionEl
                range.setStartAfter(positionEl);
                range.setEndAfter(refNode || nodes[len - 1]);

                // Move before nodes to before the positionEl
                parentEl.dom.insertBefore(range.extractContents(), positionEl);
            } else {
                parentEl.dom.insertBefore(positionEl, refNode);
            }

            // Keep shims in line.
            me.showModalMask();
            me.syncShim();
            if (refNode) {
                Ext.Component.fromElement(refNode).syncShim();
            } else {
                return true;
            }
        },

        updateRelative: function() {
            this.syncXYPosition();
        },

        updateShadow: function(shadow) {
            this.el.toggleCls(this.shadowCls, shadow);
            this.el.toggleCls(this.noShadowCls, shadow === false);
        },

        updateX: function() {
            //<debug>
            if (!this.isFloated()) {
                Ext.raise('Cannot use setX on a non-floated component');
            }
            //</debug>
            this.syncXYPosition();
        },

        updateY: function() {
            //<debug>
            if (!this.isFloated()) {
                Ext.raise('Cannot use setY on a non-floated component');
            }
            //</debug>
            this.syncXYPosition();
        },

        /*
         * Only applicable to floated components.
         * Ensures correct position after either {@link #cfg-x} or {@link #cfg-x} have been set.
         * If we are positioning descendant floateds relatively, then the
         * wrapping floatWrap is used to position both us and our descendant floateds
         * @private
         */
        syncXYPosition: function() {
            var me = this,
                floatWrap = me.floatWrap,
                mask,
                x = me.getX() || 0,
                y = me.getY() || 0;

            // If we are configured to relatively position our descendants, then we ourselves
            // are positioned by our floatWrap element
            if (me.isRelative()) {
                floatWrap = floatWrap || me.getFloatWrap();
                floatWrap.translate(x, y);
                floatWrap.setWidth(me.el.getWidth());
                floatWrap.setHeight(me.el.getHeight());
                me.translate(0, 0);
                mask = floatWrap.getData().modalMask;
                if (mask) {
                    mask.translate(0, 0);
                }
            }
            // Descendants to be positioned absolutely, just position our element.
            else {
                me.translate(x, y);
                mask = me.floatWrap && me.floatWrap.getData().modalMask;
                if (mask) {
                    mask.translate(x, y);
                }
            }
            me.syncShim();
        }
    }
}, function(Widget) {
    
    this.borrow(Ext.util.Positionable, ['clipTo', 'clearClip']);

    /**
     * This method returns, or creates on demand the global floatParent element into which top
     * level floated components are inserted.
     *
     * @return {Ext.Element} The global floatRoot element.
     * @member Ext
     * @method getFloatRoot
     * @private
     */
    Ext.getFloatRoot = function() {
        var fp = Ext.floatRoot,
            viewport = Ext['Viewport']; // Hide from Cmd dependency checking

        if (fp) {
            // Always ensure it's on top so that floateds are above inline components
            fp.el.dom.parentNode.appendChild(fp.dom);
        } else {
            if (viewport) {
                fp = viewport.floatWrap = viewport.element.createChild({
                    cls: Widget.prototype.floatWrapCls,
                    id: 'global-floatWrap',
                    "data-sticky": true
                });
            } else {
                fp = Ext.getBody().createChild({
                    cls: Widget.prototype.floatWrapCls,
                    id: 'global-floatWrap',
                    "data-sticky": true
                });
            }
            Ext.floatRoot = fp;
        }
        return fp;
    };
});
