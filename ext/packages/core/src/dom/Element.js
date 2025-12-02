/**
 * @class Ext.dom.Element
 * @alternateClassName Ext.Element
 * @mixins Ext.util.Positionable
 * @mixins Ext.mixin.Observable
 *
 * Encapsulates a DOM element, adding simple DOM manipulation facilities, normalizing for browser differences.
 *
 * **Note:** The events included in this Class are the ones we've found to be the most commonly used. Many events are
 * not listed here due to the expedient rate of change across browsers. For a more comprehensive list, please visit the
 * following resources:
 *
 * + [Mozilla Event Reference Guide](https://developer.mozilla.org/en-US/docs/Web/Events)
 * + [W3 Pointer Events](http://www.w3.org/TR/pointerevents/)
 * + [W3 Touch Events](http://www.w3.org/TR/touch-events/)
 * + [W3 DOM 2 Events](http://www.w3.org/TR/DOM-Level-2-Events/)
 * + [W3 DOM 3 Events](http://www.w3.org/TR/DOM-Level-3-Events/)
 *
 * ## Usage
 *
 *     // by id
 *     var el = Ext.get("my-div");
 *
 *     // by DOM element reference
 *     var el = Ext.get(myDivElement);
 *
 * ## Selecting Descendant Elements
 *
 * Ext.dom.Element instances can be used to select descendant nodes using CSS selectors.
 * There are 3 methods that can be used for this purpose, each with a slightly different
 * twist:
 *
 * - {@link #method-query}
 * - {@link #method-selectNode}
 * - {@link #method-select}
 *
 * These methods can accept any valid CSS selector since they all use
 * [querySelectorAll](http://www.w3.org/TR/css3-selectors/) under the hood. The primary
 * difference between these three methods is their return type:
 *
 * To get an array of HTMLElement instances matching the selector '.foo' use the query
 * method:
 *
 *     element.query('.foo');
 *
 * This can easily be transformed into an array of Ext.dom.Element instances by setting
 * the `asDom` parameter to `false`:
 *
 *     element.query('.foo', false);
 *
 * If the desired result is only the first matching HTMLElement use the selectNode method:
 *
 *     element.selectNode('.foo');
 *
 * Once again, the dom node can be wrapped in an Ext.dom.Element by setting the `asDom`
 * parameter to `false`:
 *
 *     element.selectNode('.foo', false);
 *
 * The `select` method is used when the desired return type is a {@link
 * Ext.CompositeElementLite CompositeElementLite} or a {@link Ext.CompositeElement
 * CompositeElement}.  These are collections of elements that can be operated on as a
 * group using any of the methods of Ext.dom.Element.  The only difference between the two
 * is that CompositeElementLite is a collection of HTMLElement instances, while
 * CompositeElement is a collection of Ext.dom.Element instances.  To retrieve a
 * CompositeElementLite that represents a collection of HTMLElements for selector '.foo':
 *
 *     element.select('.foo');
 *
 * For a {@link Ext.CompositeElement CompositeElement} simply pass `true` as the
 * `composite` parameter:
 *
 *     element.select('.foo', true);
 *
 * The query selection methods can be used even if you don't have a Ext.dom.Element to
 * start with For example to select an array of all HTMLElements in the document that match the
 * selector '.foo', simply wrap the document object in an Ext.dom.Element instance using
 * {@link Ext#fly}:
 *
 *     Ext.fly(document).query('.foo');
 *
 * # Animations
 *
 * When an element is manipulated, by default there is no animation.
 *
 *     var el = Ext.get("my-div");
 *
 *     // no animation
 *     el.setWidth(100);
 *
 * specified as boolean (true) for default animation effects.
 *
 *     // default animation
 *     el.setWidth(100, true);
 *
 * To configure the effects, an object literal with animation options to use as the Element animation configuration
 * object can also be specified. Note that the supported Element animation configuration options are a subset of the
 * {@link Ext.fx.Anim} animation options specific to Fx effects. The supported Element animation configuration options
 * are:
 *
 *     Option    Default   Description
 *     --------- --------  ---------------------------------------------
 *     duration  350       The duration of the animation in milliseconds
 *     easing    easeOut   The easing method
 *     callback  none      A function to execute when the anim completes
 *     scope     this      The scope (this) of the callback function
 *
 * Usage:
 *
 *     // Element animation options object
 *     var opt = {
 *         duration: 1000,
 *         easing: 'elasticIn',
 *         callback: this.foo,
 *         scope: this
 *     };
 *     // animation with some options set
 *     el.setWidth(100, opt);
 *
 * The Element animation object being used for the animation will be set on the options object as "anim", which allows
 * you to stop or manipulate the animation. Here is an example:
 *
 *     // using the "anim" property to get the Anim object
 *     if(opt.anim.isAnimated()){
 *         opt.anim.stop();
 *     }
 */
Ext.define('Ext.dom.Element', function(Element) {
    var WIN = window,
        DOC = document,
        docEl = DOC.documentElement,
        TOP = WIN.top,
        elementIdCounter,
        windowId,
        documentId,
        WIDTH = 'width',
        HEIGHT = 'height',
        MIN_WIDTH = 'min-width',
        MIN_HEIGHT = 'min-height',
        MAX_WIDTH = 'max-width',
        MAX_HEIGHT = 'max-height',
        TOP = 'top',
        RIGHT = 'right',
        BOTTOM = 'bottom',
        LEFT = 'left',
        VISIBILITY = 'visibility',
        HIDDEN = 'hidden',
        DISPLAY = "display",
        NONE = "none",
        ZINDEX = "z-index",
        POSITION = "position",
        RELATIVE = "relative",
        STATIC = "static",
        SEPARATOR = '-',
        wordsRe = /\w/g,
        spacesRe = /\s+/,
        classNameSplitRegex = /[\s]+/,
        transparentRe = /^(?:transparent|(?:rgba[(](?:\s*\d+\s*[,]){3}\s*0\s*[)]))$/i,
        adjustDirect2DTableRe = /table-row|table-.*-group/,
        topRe = /top/i,
        borders = {
            t: 'border-top-width',
            r: 'border-right-width',
            b: 'border-bottom-width',
            l: 'border-left-width'
        },
        paddings = {
            t: 'padding-top',
            r: 'padding-right',
            b: 'padding-bottom',
            l: 'padding-left'
        },
        margins = {
            t: 'margin-top',
            r: 'margin-right',
            b: 'margin-bottom',
            l: 'margin-left'
        },
        paddingsTLRB = [paddings.l, paddings.r, paddings.t, paddings.b],
        bordersTLRB = [borders.l,  borders.r,  borders.t,  borders.b],
        numberRe = /\d+$/,
        unitRe = /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
        defaultUnit = 'px',
        camelRe = /(-[a-z])/gi,
        cssRe = /([a-z0-9\-]+)\s*:\s*([^;\s]+(?:\s*[^;\s]+)*);?/gi,
        pxRe = /^\d+(?:\.\d*)?px$/i,
        propertyCache = {},
        ORIGINALDISPLAY = 'originalDisplay',
        camelReplaceFn = function(m, a) {
            return a.charAt(1).toUpperCase();
        },

        clearData = function(node, deep) {
            var childNodes, i, len;

            // Only Element nodes may have _extData and child nodes to clear.
            // IE8 throws an error attempting to set expandos on non-Element nodes.
            if (node.nodeType === 1) {
                node._extData = null;
                if (deep) {
                    childNodes = node.childNodes;
                    for (i = 0, len = childNodes.length; i < len; ++i) {
                        clearData(childNodes[i], deep);
                    }
                }
            }
        },

        visibilityCls = Ext.baseCSSPrefix + 'hidden-visibility',
        displayCls = Ext.baseCSSPrefix + 'hidden-display',
        offsetsCls = Ext.baseCSSPrefix + 'hidden-offsets',
        clipCls = Ext.baseCSSPrefix + 'hidden-clip',
        sizedCls = Ext.baseCSSPrefix + 'sized',
        unsizedCls = Ext.baseCSSPrefix + 'unsized',
        stretchedCls = Ext.baseCSSPrefix + 'stretched',
        CREATE_ATTRIBUTES = {
            style: 'style',
            className: 'className',
            cls: 'cls',
            classList: 'classList',
            text: 'text',
            hidden: 'hidden',
            html: 'html',
            children: 'children'
        },
        lastFocusChange = 0,
        lastKeyboardClose = 0,
        editableHasFocus = false,
        isVirtualKeyboardOpen = false,
        visFly, scrollFly, caFly;

    // Cross-origin access might throw an exception
    try {
        elementIdCounter = TOP.__elementIdCounter__;
    }
    catch (e) {
        TOP = WIN;
    }

    TOP.__elementIdCounter = elementIdCounter = (TOP.__elementIdCounter__ || 0) + 1;
    windowId = 'ext-window-' + elementIdCounter;
    documentId = 'ext-document-' + elementIdCounter;

    return {
        alternateClassName: [ 'Ext.Element' ],

        mixins: [
            'Ext.util.Positionable',
            'Ext.mixin.Observable'
        ],

        requires: [
            'Ext.dom.Shadow',
            'Ext.dom.Shim',
            'Ext.dom.ElementEvent',
            'Ext.event.publisher.Dom',
            'Ext.event.publisher.Gesture',
            'Ext.event.publisher.ElementSize',
            'Ext.event.publisher.ElementPaint'
        ],

        uses: [
            'Ext.dom.Helper',
            'Ext.dom.CompositeElement',
            'Ext.dom.Fly',
            'Ext.dom.TouchAction',
            'Ext.event.publisher.Focus'
        ],

        observableType: 'element',

        isElement: true,

        skipGarbageCollection: true,

        $applyConfigs: true,

        identifiablePrefix: 'ext-element-',

        styleHooks: {},

        validIdRe: Ext.validIdRe,

        blockedEvents: Ext.supports.EmulatedMouseOver ? {
            // mobile safari emulates a mouseover event on clickable elements such as
            // anchors. This event is useless because it runs after touchend. We block
            // this event to prevent mouseover handlers from running after tap events. It
            // is up to the individual component to determine if it has an analog for
            // mouseover, and implement the appropriate event handlers.
            mouseover: 1
        } : {},

        longpressEvents: {
            longpress: 1,
            taphold: 1
        },

        /**
         * @property {Ext.Component} component
         * A reference to the `Component` that owns this element. This is `null` if there
         * is no direct owner.
         */

        //  Mouse events
        /**
         * @event click
         * Fires when a mouse click is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event contextmenu
         * Fires when a right click is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event dblclick
         * Fires when a mouse double click is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mousedown
         * Fires when a mousedown is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseup
         * Fires when a mouseup is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseover
         * Fires when a mouseover is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mousemove
         * Fires when a mousemove is detected with the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseout
         * Fires when a mouseout is detected with the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseenter
         * Fires when the mouse enters the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event mouseleave
         * Fires when the mouse leaves the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  Keyboard events
        /**
         * @event keypress
         * Fires when a keypress is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event keydown
         * Fires when a keydown is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event keyup
         * Fires when a keyup is detected within the element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  HTML frame/object events
        /**
         * @event load
         * Fires when the user agent finishes loading all content within the element. Only supported by window, frames,
         * objects and images.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event unload
         * Fires when the user agent removes all content from a window or frame. For elements, it fires when the target
         * element or any of its content has been removed.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event abort
         * Fires when an object/image is stopped from loading before completely loaded.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event error
         * Fires when an object/image/frame cannot be loaded properly.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event painted
         * Fires whenever this Element actually becomes visible (painted) on the screen. This is useful when you need to
         * perform 'read' operations on the DOM element, i.e: calculating natural sizes and positioning.
         *
         * __Note:__ This event is not available to be used with event delegation. Instead `painted` only fires if you explicitly
         * add at least one listener to it, for performance reasons.
         *
         * @param {Ext.dom.Element} this The component instance.
         */
        /**
         * @event resize
         * Important note: For the best performance on mobile devices, use this only when you absolutely need to monitor
         * a Element's size.
         *
         * __Note:__ This event is not available to be used with event delegation. Instead `resize` only fires if you explicitly
         * add at least one listener to it, for performance reasons.
         *
         * @param {Ext.dom.Element} this The component instance.
         */
        /**
         * @event scroll
         * Fires when a document view is scrolled.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  Form events
        /**
         * @event select
         * Fires when a user selects some text in a text field, including input and textarea.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event change
         * Fires when a control loses the input focus and its value has been modified since gaining focus.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event submit
         * Fires when a form is submitted.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event reset
         * Fires when a form is reset.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event focus
         * Fires when an element receives focus either via the pointing device or by tab navigation.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event blur
         * Fires when an element loses focus either via the pointing device or by tabbing navigation.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event focusmove
         * Fires when focus is moved *within* an element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {Ext.dom.Element} e.target The {@link Ext.dom.Element} element which *recieved* focus.
         * @param {Ext.dom.Element} e.relatedTarget The {@link Ext.dom.Element} element which *lost* focus.
         * @param {HTMLElement} t The target of the event.
         */

        //  User Interface events
        /**
         * @event DOMFocusIn
         * Where supported. Similar to HTML focus event, but can be applied to any focusable element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMFocusOut
         * Where supported. Similar to HTML blur event, but can be applied to any focusable element.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMActivate
         * Where supported. Fires when an element is activated, for instance, through a mouse click or a keypress.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        //  DOM Mutation events
        /**
         * @event DOMSubtreeModified
         * Where supported. Fires when the subtree is modified.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeInserted
         * Where supported. Fires when a node has been added as a child of another node.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeRemoved
         * Where supported. Fires when a descendant node of the element is removed.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeRemovedFromDocument
         * Where supported. Fires when a node is being removed from a document.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMNodeInsertedIntoDocument
         * Where supported. Fires when a node is being inserted into a document.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMAttrModified
         * Where supported. Fires when an attribute has been modified.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */
        /**
         * @event DOMCharacterDataModified
         * Where supported. Fires when the character data has been modified.
         * @param {Ext.event.Event} e The {@link Ext.event.Event} encapsulating the DOM event.
         * @param {HTMLElement} t The target of the event.
         */

        /**
         * @constructor
         * Creates new Element directly by passing an id or the HTMLElement.  This
         * constructor should not be called directly.  Always use {@link Ext#get Ext.get()}
         * or {@link Ext#fly Ext#fly()} instead.
         *
         * In older versions of Ext JS and Sencha Touch this constructor checked to see if
         * there was already an instance of this element in the cache and if so, returned
         * the same instance. As of version 5 this behavior has been removed in order to
         * avoid a redundant cache lookup since the most common path is for the Element
         * constructor to be called from {@link Ext#get Ext.get()}, which has already
         * checked for a cache entry.
         *
         * Correct way of creating a new Ext.dom.Element (or retrieving it from the cache):
         *
         *     var el = Ext.get('foo'); // by id
         *
         *     var el = Ext.get(document.getElementById('foo')); // by DOM reference
         *
         * Incorrect way of creating a new Ext.dom.Element
         *
         *     var el = new Ext.dom.Element('foo');
         *
         * For quick and easy access to Ext.dom.Element methods use a flyweight:
         *
         *     Ext.fly('foo').addCls('foo-hovered');
         *
         * This simply attaches the DOM node with id='foo' to the global flyweight Element
         * instance to avoid allocating an extra Ext.dom.Element instance.  If, however,
         * the Element instance has already been cached by a previous call to Ext.get(),
         * then Ext.fly() will return the cached Element instance.  For more info see
         * {@link Ext#fly}.
         *
         * @param {String/HTMLElement} element
         * @private
         */
        constructor: function(dom) {
            var me = this,
                id;

            if (typeof dom === 'string') {
                dom = DOC.getElementById(dom);
            }

            if (!dom) {
                //<debug>
                Ext.raise("Invalid domNode reference or an id of an existing domNode: " + dom);
                //</debug>
                return null;
            }
            //<debug>
            if (Ext.cache[dom.id]) {
                Ext.raise("Element cache already contains an entry for id '" +
                    dom.id + "'.  Use Ext.get() to create or retrieve Element instances.");
            }
            //</debug>

            /**
             * The DOM element
             * @property dom
             * @type HTMLElement
             */
            me.dom = dom;

            id = dom.id;

            if (id) {
                me.id = id;
            } else {
                id = dom.id = me.getUniqueId();
            }

            //<debug>
            if (!me.validIdRe.test(me.id)) {
                Ext.raise('Invalid Element "id": "' + me.id + '"');
            }
            //</debug>

            // set an "el" property that references "this".  This allows
            // Ext.util.Positionable methods to operate on this.el.dom since it
            // gets mixed into both Element and Component
            me.el = me;

            Ext.cache[id] = me;

            me.longpressListenerCount = 0;

            me.mixins.observable.constructor.call(me);
        },

        inheritableStatics: {
            /**
             * @private
             * @static
             * @inheritable
             */
            cache: Ext.cache = {},

            /**
             * @property
             * @static
             * @private
             * @inheritable
             */
            editableSelector: 'input,textarea,[contenteditable="true"]',

            /**
             * @property {Number}
             * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}.
             * Use the CSS 'visibility' property to hide the element.
             *
             * Note that in this mode, {@link Ext.dom.Element#isVisible isVisible} may return true
             * for an element even though it actually has a parent element that is hidden. For this
             * reason, and in most cases, using the {@link #OFFSETS} mode is a better choice.
             * @static
             * @inheritable
             */
            VISIBILITY: 1,

            /**
             * @property {Number}
             * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}.
             * Use the CSS 'display' property to hide the element.
             * @static
             * @inheritable
             */
            DISPLAY: 2,

            /**
             * @property {Number}
             * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}.
             * Use CSS absolute positioning and top/left offsets to hide the element.
             * @static
             * @inheritable
             */
            OFFSETS: 3,

            /**
             * @property {Number}
             * Visibility mode constant for use with {@link Ext.dom.Element#setVisibilityMode}.
             * Use CSS `clip` property to reduce element's dimensions to 0px by 0px, effectively
             * making it hidden while not being truly invisible. This is useful when an element
             * needs to be published to the Assistive Technologies such as screen readers.
             * @static
             * @inheritable
             */
            CLIP: 4,

            /**
             * @property
             * @static
             * @inheritable
             * @private
             * This property indicates a minimum threshold of vertical resize movement for
             * virtual keyboard detection.
             *
             * On some mobile browsers the framework needs to keep track of whether window
             * resize events were triggered by the opening or closing of a virtual keyboard
             * so that it can prevent unnecessary re-layout of the viewport.  It does this
             * by detecting resize events in the horizontal direction that occur immediately
             * after an editable element is focused or blurred.
             */
            minKeyboardHeight: 100,

            unitRe: unitRe,

            /**
             * @property {Boolean}
             * @private
             * @static
             * @inheritable
             * True to globally disable the delegated event system.  The results of
             * setting this to false are unpredictable since the Gesture publisher relies
             * on delegated events in order to work correctly.  Disabling delegated events
             * may cause Gestures to function incorrectly or to stop working completely.
             * Use at your own risk!
             */
            useDelegatedEvents: true,

            /**
             * @property {Object}
             * @private
             * @static
             * @inheritable
             * The list of valid nodeTypes that are allowed to be wrapped
             */
            validNodeTypes: {
                1: 1, // ELEMENT_NODE
                9: 1 // DOCUMENT_NODE
            },

            /**
             * Test if size has a unit, otherwise appends the passed unit string, or the default for this Element.
             * @param {Object} size The size to set.
             * @param {String} units The units to append to a numeric size value.
             * @return {String}
             * @private
             * @static
             * @inheritable
             */
            addUnits: function(size, units) {
                // Most common case first: Size is set to a number
                if (typeof size === 'number') {
                    return size + (units || defaultUnit);
                }

                // Values which mean "auto"
                // - ""
                // - "auto"
                // - undefined
                // - null
                if (size === "" || size === "auto" || size == null) {
                    return size || '';
                }

                // less common use case: number formatted as a string.  save this case until
                // last to avoid regex execution if possible.
                if (numberRe.test(size)) {
                    return size + (units || defaultUnit);
                }

                // Warn if it's not a valid CSS measurement
                if (!unitRe.test(size)) {
                    //<debug>
                    Ext.Logger.warn("Warning, size detected (" + size + ") not a valid property value on Element.addUnits.");
                    //</debug>
                    return size || '';
                }

                return size;
            },

            /**
             * @private
             * Create method to add support for a DomHelper config. Creates
             * and appends elements/children using document.createElement/appendChild.
             * This method is used by the modern toolkit for a significant performance gain
             * in webkit browsers as opposed to using DomQuery which generates HTML
             * markup and sets it as innerHTML.
             *
             * However, the createElement/appendChild
             * method of creating elements is significantly slower in all versions of IE
             * at the time of this writing (6 - 11), so classic toolkit should not use this method,
             * but should instead use DomHelper methods, or Element methods that use
             * DomHelper under the hood (e.g. createChild).
             * see https:*fiddle.sencha.com/#fiddle/tj
             *
             * @static
             * @inheritable
             */
            create: function(attributes, domNode) {
                var me = this,
                    classes, element, elementStyle, tag, value, name, i, ln, tmp;

                attributes = attributes || {};
                if (attributes.isElement) {
                    return domNode ? attributes.dom : attributes;
                } else if ('nodeType' in attributes) {
                    return domNode ? attributes : Ext.get(attributes);
                }

                if (typeof attributes === 'string') {
                    return DOC.createTextNode(attributes);
                }

                tag = attributes.tag;

                if (!tag) {
                    tag = 'div';
                }

                if (attributes.namespace) {
                    element = DOC.createElementNS(attributes.namespace, tag);
                } else {
                    element = DOC.createElement(tag);
                }

                elementStyle = element.style;

                for (name in attributes) {
                    if (name !== 'tag') {
                        value = attributes[name];

                        switch (name) {
                            case CREATE_ATTRIBUTES.style:
                                if (typeof value === 'string') {
                                    element.setAttribute(name, value);
                                }
                                else {
                                    for (i in value) {
                                        if (value.hasOwnProperty(i)) {
                                            elementStyle[i] = value[i];
                                        }
                                    }
                                }
                                break;

                            case CREATE_ATTRIBUTES.className:
                            case CREATE_ATTRIBUTES.cls:
                                tmp = value.split(spacesRe);
                                classes = classes ? classes.concat(tmp) : tmp
                                break;

                            case CREATE_ATTRIBUTES.classList:
                                classes = classes ? classes.concat(value) : value;
                                break;

                            case CREATE_ATTRIBUTES.text:
                                element.textContent = value;
                                break;

                            case CREATE_ATTRIBUTES.html:
                                element.innerHTML = value;
                                break;

                            case CREATE_ATTRIBUTES.hidden:
                                if (classes) {
                                    classes.push(displayCls);
                                } else {
                                    classes = [displayCls];
                                }
                                break;

                            case CREATE_ATTRIBUTES.children:
                                if (value != null) {
                                    for (i = 0,ln = value.length; i < ln; i++) {
                                        element.appendChild(me.create(value[i], true));
                                    }
                                }
                                break;

                            default:
                                if (value != null) { // skip null or undefined values
                                    element.setAttribute(name, value);
                                }
                        }
                    }
                }

                if (classes) {
                    element.className = classes.join(' ');
                }

                if (domNode) {
                    return element;
                } else {
                    return me.get(element);
                }
            },

            /**
             * @static
             * @inheritable
             * @private
             */
            detach: function() {
                var dom = this.dom;

                if (dom && dom.parentNode && dom.tagName !== 'BODY') {
                    dom.parentNode.removeChild(dom);
                }

                return this;
            },

            /**
             * @inheritdoc Ext#fly
             * @inheritable
             * @static
             */
            fly: function(dom, named) {
                return Ext.fly(dom, named);
            },

            /**
             * Returns the top Element that is located at the passed coordinates in the current viewport.
             * @static
             * @inheritable
             * @param {Number} x The x coordinate
             * @param {Number} y The y coordinate
             * @param {Boolean} [asDom=false] `true` to return a DOM element.
             * @return {Ext.dom.Element/HTMLElement} The found element.
             */
            fromPoint: (function() {
                // IE has a weird bug where elementFromPoint can fail on the first call when inside an iframe.
                // It seems to happen more consistently on older IE, but sometimes crops up even in IE11.
                // This plays havoc especially while running tests.
                var elementFromPointBug;
                if (Ext.isIE) {
                    try {
                        elementFromPointBug = window.self !== window.top;
                    } catch (e) {
                        elementFromPointBug = true;
                    }
                }

                return function(x, y, asDom) {
                    var el = null;
                    el = DOC.elementFromPoint(x, y);
                    if (!el && elementFromPointBug) {
                        el = DOC.elementFromPoint(x, y);
                    }
                    return asDom ? el : Ext.get(el);
                };
            })(),

            /**
             * Returns the top Element that is located at the passed coordinates taking into account
             * the scroll position of the document.
             * @static
             * @inheritable
             * @param {Number} x The x coordinate
             * @param {Number} y The y coordinate
             * @param {Boolean} [asDom=false] `true` to return a DOM element.
             * @return {Ext.dom.Element/HTMLElement} The found element.
             *
             * @since 6.2.0
             */
            fromPagePoint: function(x, y, asDom) {
                var scroll = Ext.getDoc().getScroll();
                return Element.fromPoint(x - scroll.left, y - scroll.top, asDom);
            },

            /**
             * Retrieves Ext.dom.Element objects. {@link Ext#get} is alias for {@link Ext.dom.Element#get}.
             *
             * **This method does not retrieve {@link Ext.Component Component}s.** This method retrieves Ext.dom.Element
             * objects which encapsulate DOM elements. To retrieve a Component by its ID, use {@link Ext.ComponentManager#get}.
             *
             * When passing an id, it should not include the `#` character that is used for a css selector.
             *
             *     // For an element with id 'foo'
             *     Ext.get('foo'); // Correct
             *     Ext.get('#foo'); // Incorrect
             *
             * Uses simple caching to consistently return the same object. Automatically fixes if an object was recreated with
             * the same id via AJAX or DOM.
             *
             * @param {String/HTMLElement/Ext.dom.Element} el The `id` of the node, a DOM Node or an existing Element.
             * @return {Ext.dom.Element} The Element object (or `null` if no matching element was found).
             * @static
             * @inheritable
             */
            get: function(el) {
                var me = this,
                    cache = Ext.cache,
                    nodeType, dom, id, entry, isDoc, isWin, isValidNodeType;

                if (!el) {
                    return null;
                }

                //<debug>
                function warnDuplicate(id) {
                    Ext.raise("DOM element with id " + id +
                        " in Element cache is not the same as element in the DOM. " +
                        "Make sure to clean up Element instances using destroy()" );
                }
                //</debug>

                // Ext.get(flyweight) must return an Element instance, not the flyweight
                if (el.isFly) {
                    el = el.dom;
                }

                if (typeof el === 'string') {
                    id = el;
                    if (cache.hasOwnProperty(id)) {
                        entry = cache[id];
                        if (entry.skipGarbageCollection || !Ext.isGarbage(entry.dom)) {
                            //<debug>
                            dom = Ext.getElementById ? Ext.getElementById(id) :
                                DOC.getElementById(id);
                            if (dom && (dom !== entry.dom)) {
                                warnDuplicate(id);
                            }
                            //</debug>
                            return entry;
                        } else {
                            entry.destroy();
                        }
                    }

                    if (id === windowId) {
                        return Element.get(WIN);
                    } else if (id === documentId) {
                        return Element.get(DOC);
                    }

                    // using Ext.getElementById() allows us to check the detached
                    // body in addition to the body (Ext JS only).
                    dom = Ext.getElementById ? Ext.getElementById(id) :
                        DOC.getElementById(id);
                    if (dom) {
                        return new Element(dom);
                    }
                }

                nodeType = el.nodeType;

                if (nodeType) {
                    isDoc = (nodeType === 9);
                    isValidNodeType = me.validNodeTypes[nodeType];
                } else {
                    // if an object has a window property that refers to itself we can
                    // reasonably assume that it is a window object.
                    // have to use == instead of === for IE8
                    isWin = (el.window == el);
                }

                // check if we have a valid node type or if the el is a window object before
                // proceeding. This allows elements, document fragments, and document/window
                // objects (even those inside iframes) to be wrapped.
                if (isValidNodeType || isWin) {
                    id = el.id;

                    if (cache.hasOwnProperty(id)) {
                        entry = cache[id];
                        if (entry.skipGarbageCollection || el === entry.dom ||
                            !Ext.isGarbage(entry.dom)) {
                            //<debug>
                            if (el !== entry.dom) {
                                warnDuplicate(id);
                            }
                            //</debug>
                            return entry;
                        } else {
                            entry.destroy();
                        }
                    }

                    if (el === DOC) {
                        el.id = documentId;
                    }

                    // Must use == here, otherwise IE fails to recognize the window
                    if (el == WIN) {
                        el.id = windowId;
                    }

                    el = new Element(el);

                    if (isWin || isDoc) {
                        // document and window objects can never be garbage
                        el.skipGarbageCollection = true;
                    }
                    return el;
                }

                if (el.isElement) {
                    return el;
                }

                if (el.isComposite) {
                    return el;
                }

                // Test for iterable.
                // Allow the resulting Composite to be based upon an Array or HtmlCollection of nodes.
                if (Ext.isIterable(el)) {
                    return me.select(el);
                }

                return null;
            },

            /**
             * Returns the active element in the DOM. If the browser supports activeElement
             * on the document, this is returned. If not, the focus is tracked and the active
             * element is maintained internally.
             * @static
             * @inheritable
             *
             * @param {Boolean} asElement Return Ext.Element instance instead of DOM node.
             *
             * @return {HTMLElement} The active (focused) element in the document.
             */
            getActiveElement: function(asElement) {
                var active = DOC.activeElement;

                // The activeElement can be null, however there also appears to be a very odd
                // and inconsistent bug in IE where the activeElement is simply an empty object
                // literal. Test if the returned active element has focus, if not, we've hit the bug
                // so just default back to the document body.
                if (!active || !active.focus) {
                    active = DOC.body;
                }

                return asElement ? Ext.get(active) : active;
            },

            /**
             * Retrieves the document height
             * @static
             * @inheritable
             * @return {Number} documentHeight
             */
            getDocumentHeight: function() {
                return Math.max(!Ext.isStrict ? DOC.body.scrollHeight : docEl.scrollHeight, this.getViewportHeight());
            },

            /**
             * Retrieves the document width
             * @static
             * @inheritable
             * @return {Number} documentWidth
             */
            getDocumentWidth: function() {
                return Math.max(!Ext.isStrict ? DOC.body.scrollWidth : docEl.scrollWidth, this.getViewportWidth());
            },

            /**
             * Retrieves the current orientation of the window. This is calculated by
             * determining if the height is greater than the width.
             * @static
             * @inheritable
             * @return {String} Orientation of window: 'portrait' or 'landscape'
             */
            getOrientation: function() {
                if (Ext.supports.OrientationChange) {
                    return (WIN.orientation == 0) ? 'portrait' : 'landscape';
                }

                return (WIN.innerHeight > WIN.innerWidth) ? 'portrait' : 'landscape';
            },

            /**
             * Retrieves the viewport height of the window.
             * @static
             * @inheritable
             * @return {Number} viewportHeight
             */
            getViewportHeight: function() {
                var viewportHeight = Element._viewportHeight;

                //<feature legacyBrowser>
                if (Ext.isIE9m) {
                    return DOC.documentElement.clientHeight;
                }
                //</feature>

                return (viewportHeight != null) ? viewportHeight : docEl.clientHeight;
            },

            /**
             * Retrieves the viewport width of the window.
             * @static
             * @inheritable
             * @return {Number} viewportWidth
             */
            getViewportWidth: function() {
                var viewportWidth = Element._viewportWidth;

                //<feature legacyBrowser>
                if (Ext.isIE9m) {
                    return DOC.documentElement.clientWidth;
                }
                //</feature>

                return (viewportWidth != null) ? viewportWidth : docEl.clientWidth;
            },

            /**
             * Returns the current zoom level of the viewport as a ratio of page pixels to
             * screen pixels.
             * @private
             * @static
             * @return {Number}
             */
            getViewportScale: function() {
                // on deskop devices, the devicePixel ratio gives us the level of zoom that
                // the user specified using ctrl +/- and or by selecting a zoom level from
                // the menu.
                // On android/iOS devicePixel ratio is a fixed number that represents the
                // screen pixel density (e.g. always "2" on apple retina devices)
                var top = WIN.top;

                return ((Ext.isiOS || Ext.isAndroid) ? 1 :
                    (top.devicePixelRatio || // modern browsers
                        top.screen.deviceXDPI / top.screen.logicalXDPI)) // IE10m
                        * this.getViewportTouchScale();
            },

            /**
             * On touch-screen devices there may be an additional level of zooming
             * that occurs when the user performs a pinch or double-tap to zoom
             * gesture.  This is separate from and in addition to the
             * devicePixelRatio.  We can detect it by comparing the width
             * of the documentElement to window.innerWidth
             * @private
             */
            getViewportTouchScale: function(forceRead) {
                var scale = 1,
                    hidden = 'hidden',
                    top = WIN.top,
                    cachedScale;

                if (!forceRead) {
                    cachedScale = this._viewportTouchScale;

                    if (cachedScale) {
                        return cachedScale;
                    }
                }

                if (Ext.isIE10p || Ext.isEdge || Ext.isiOS) {
                    scale = docEl.offsetWidth / WIN.innerWidth;
                } else if (Ext.isChromeMobile) {
                    scale = top.outerWidth / top.innerWidth;
                }

                return scale;
            },

            /**
             * Retrieves the viewport size of the window.
             * @static
             * @inheritable
             * @return {Object} object containing width and height properties
             */
            getViewSize: function() {
                return {
                    width: Element.getViewportWidth(),
                    height: Element.getViewportHeight()
                };
            },

            /**
             * Mask iframes when shim is true. See {@link Ext.util.Floating#shim}.
             * @private
             */
            maskIframes: function() {
                var iframes = document.getElementsByTagName('iframe');

                Ext.each(iframes, function(iframe) {
                    var myMask;

                    myMask = Ext.fly(iframe.parentNode).mask();
                    myMask.setStyle('background-color','transparent');
                });
            },

            /**
             * Normalizes CSS property keys from dash delimited to camel case JavaScript Syntax.
             * For example:
             *
             * - border-width -> borderWidth
             * - padding-top -> paddingTop
             *
             * @static
             * @inheritable
             * @param {String} prop The property to normalize
             * @return {String} The normalized string
             */
            normalize: function(prop) {
                return propertyCache[prop] || (propertyCache[prop] = prop.replace(camelRe, camelReplaceFn));
            },


            /**
             * @private
             * @static
             * @inheritable
             */
            _onWindowFocusChange: function(e) {
                // Tracks the timestamp of focus entering or leaving an editable element
                // so that we can compare this timestamp to the time of the next window
                // resize for the purpose of determining if the virtual keyboard is displayed
                // see _onWindowResize for more details
                if (Ext.fly(e.target).is(Element.editableSelector)) {
                    lastFocusChange = new Date();
                    editableHasFocus = (e.type === 'focusin' || e.type === 'pointerup');
                }
            },

            /**
             * @private
             * @static
             * @inheritable
             */
            _onWindowResize: function() {
                var documentWidth = docEl.clientWidth,
                    documentHeight = docEl.clientHeight,
                    now = new Date(),
                    threshold = 1000,
                    deltaX, deltaY;

                deltaX = documentWidth - Element._documentWidth;
                deltaY = documentHeight - Element._documentHeight;

                Element._windowWidth = documentWidth;
                Element._windowHeight = documentHeight;

                // If the focus entered or left an editable element within a brief threshold
                // of time, then this resize event MAY be due to a virtual keyboard being
                // shown or hidden.  Let's do some additional checking to find out.
                if (((now - lastFocusChange) < threshold) || ((now - lastKeyboardClose) < threshold)) {
                    // If the resize is ONLY in the vertical direction, and an editable
                    // element has the focus, and the vertical movement was significant,
                    // we can be reasonably certain that the resize event was due to
                    // a virtual keyboard being opened.
                    if (deltaX === 0 && (editableHasFocus && (deltaY <= -Element.minKeyboardHeight))) {
                        isVirtualKeyboardOpen = true;
                        return;
                    }
                }

                if (isVirtualKeyboardOpen && (deltaX === 0) && (deltaY >= Element.minKeyboardHeight)) {
                    isVirtualKeyboardOpen = false;
                    // when windows tablets are rotated while keyboard is open, the keyboard closes
                    // and then immediately reopens.  Track the timestamp of the last keyboard
                    // close so that we can detect a successive resize event that might indicate
                    // reopening
                    lastKeyboardClose = new Date();
                }

                if (isVirtualKeyboardOpen) {
                    return;
                }

                // These cached variables are used by getViewportWidth and getViewportHeight
                // They do not get updated if we returned early due to detecting  that the
                // resize event was triggered by virtual keyboard.
                Element._viewportWidth = documentWidth;
                Element._viewportHeight = documentHeight;
            },

            /**
             * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
             * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
             * @static
             * @inheritable
             * @param {Number/String} box The encoded margins
             * @return {Object} An object with margin sizes for top, right, bottom and left containing the unit
             */
            parseBox: function(box) {
                box = box || 0;

                var type = typeof box,
                    parts,
                    ln;

                if (type === 'number') {
                    return {
                        top: box,
                        right: box,
                        bottom: box,
                        left: box
                    };
                } else if (type !== 'string') {
                    // If not a number or a string, assume we've been given a box config.
                    return box;
                }

                parts  = box.split(' ');
                ln = parts.length;

                if (ln === 1) {
                    parts[1] = parts[2] = parts[3] = parts[0];
                } else if (ln === 2) {
                    parts[2] = parts[0];
                    parts[3] = parts[1];
                } else if (ln === 3) {
                    parts[3] = parts[1];
                }

                return {
                    top: parseFloat(parts[0]) || 0,
                    right: parseFloat(parts[1]) || 0,
                    bottom: parseFloat(parts[2]) || 0,
                    left: parseFloat(parts[3]) || 0
                };
            },

            /**
             * Converts a CSS string into an object with a property for each style.
             *
             * The sample code below would return an object with 2 properties, one
             * for background-color and one for color.
             *
             *     var css = 'background-color: red; color: blue;';
             *     console.log(Ext.dom.Element.parseStyles(css));
             *
             * @static
             * @inheritable
             * @param {String} styles A CSS string
             * @return {Object} styles
             */
            parseStyles: function(styles) {
                var out = {},
                    matches;

                if (styles) {
                    // Since we're using the g flag on the regex, we need to set the lastIndex.
                    // This automatically happens on some implementations, but not others, see:
                    // http://stackoverflow.com/questions/2645273/javascript-regular-expression-literal-persists-between-function-calls
                    // http://blog.stevenlevithan.com/archives/fixing-javascript-regexp
                    cssRe.lastIndex = 0;
                    while ((matches = cssRe.exec(styles))) {
                        out[matches[1]] = matches[2] || '';
                    }
                }
                return out;
            },

            /**
             * Selects elements based on the passed CSS selector to enable
             * {@link Ext.dom.Element Element} methods to be applied to many related
             * elements in one statement through the returned
             * {@link Ext.dom.CompositeElementLite CompositeElementLite} object.
             * @static
             * @inheritable
             * @param {String/HTMLElement[]} selector The CSS selector or an array of
             * elements
             * @param {Boolean} [composite=false] Return a CompositeElement as opposed to
             * a CompositeElementLite. Defaults to false.
             * @param {HTMLElement/String} [root] The root element of the query or id of
             * the root
             * @return {Ext.dom.CompositeElementLite/Ext.dom.CompositeElement}
             */
            select: function(selector, composite, root) {
                return Ext.fly(root || DOC).select(selector, composite);
            },

            /**
             * Selects child nodes of a given root based on the passed CSS selector.
             * @static
             * @inheritable
             * @param {String} selector The CSS selector.
             * @param {Boolean} [asDom=true] `false` to return an array of Ext.dom.Element
             * @param {HTMLElement/String} [root] The root element of the query or id of
             * the root
             * @return {HTMLElement[]/Ext.dom.Element[]} An Array of elements that match
             * the selector.  If there are no matches, an empty Array is returned.
             */
            query: function(selector, asDom, root) {
                return Ext.fly(root || DOC).query(selector, asDom);
            },

            /**
             * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
             * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
             * @static
             * @inheritable
             * @param {Number/String/Object} box The encoded margins, or an object with top, right,
             * @param {String} units The type of units to add
             * @return {String} An string with unitized (px if units is not specified) metrics for top, right, bottom and left
             */
            unitizeBox: function(box, units) {
                var me = this;
                box = me.parseBox(box);

                return me.addUnits(box.top, units) + ' ' +
                    me.addUnits(box.right, units) + ' ' +
                    me.addUnits(box.bottom, units) + ' ' +
                    me.addUnits(box.left, units);
            },

            /**
             * Unmask iframes when shim is true. See {@link Ext.util.Floating#shim}.
             * @private
             */
            unmaskIframes: function() {
                var iframes = document.getElementsByTagName('iframe');

                Ext.each(iframes, function(iframe) {
                    Ext.fly(iframe.parentNode).unmask();
                });
            },

            /**
             * Serializes a DOM form into a url encoded string
             * @param {Object} form The form
             * @return {String} The url encoded form
             * @static
             * @inheritable
             */
            serializeForm: function(form) {
                var fElements = form.elements || (DOC.forms[form] || Ext.getDom(form)).elements,
                    hasSubmit = false,
                    encoder = encodeURIComponent,
                    data = '',
                    eLen = fElements.length,
                    element, name, type, options, hasValue, e,
                    o, oLen, opt;

                for (e = 0; e < eLen; e++) {
                    element = fElements[e];
                    name = element.name;
                    type = element.type;
                    options = element.options;

                    if (!element.disabled && name) {
                        if (/select-(one|multiple)/i.test(type)) {
                            oLen = options.length;
                            for (o = 0; o < oLen; o++) {
                                opt = options[o];
                                if (opt.selected) {
                                    hasValue = opt.hasAttribute('value');
                                    data += Ext.String.format('{0}={1}&', encoder(name), encoder(hasValue ? opt.value : opt.text));
                                }
                            }
                        } else if (!(/file|undefined|reset|button/i.test(type))) {
                            if (!(/radio|checkbox/i.test(type) && !element.checked) && !(type == 'submit' && hasSubmit)) {
                                data += encoder(name) + '=' + encoder(element.value) + '&';
                                hasSubmit = /submit/i.test(type);
                            }
                        }
                    }
                }
                return data.substr(0, data.length - 1);
            },

            /**
             * Returns the common ancestor of the two passed elements.
             * @static
             * @inheritable
             *
             * @param {Ext.dom.Element/HTMLElement} nodeA
             * @param {Ext.dom.Element/HTMLElement} nodeB
             * @param {Boolean} returnDom Pass `true` to return a DOM element. Otherwise An {@link Ext.dom.Element Element} will be returned.
             * @return {Ext.dom.Element/HTMLElement} The common ancestor.
             */
            getCommonAncestor: function(nodeA, nodeB, returnDom) {
                caFly = caFly || new Ext.dom.Fly();
                caFly.attach(Ext.getDom(nodeA));
                while (!caFly.isAncestor(nodeB)) {
                    if (caFly.dom.parentNode) {
                        caFly.attach(caFly.dom.parentNode);
                    }
                    // If Any of the nodes in in a detached state, have to use the document.body
                    else {
                        caFly.attach(DOC.body);
                        break;
                    }
                }
                return returnDom ? caFly.dom : Ext.get(caFly);
            }
        }, // statics

        /**
         * Adds the given CSS class(es) to this Element.
         * @param {String/String[]} names The CSS classes to add separated by space,
         * or an array of classes
         * @param {String} [prefix] Prefix to prepend to each class. The separator `-` will be 
         * appended to the prefix.
         * @param {String} [suffix] Suffix to append to each class. The separator `-` will be 
         * prepended to the suffix.
         * @return {Ext.dom.Element} this
         */
        addCls: function(names, prefix, suffix) {
            var me = this,
                elementData = me.getData(),
                hasNewCls, dom, map, classList, i, ln, name;

            if (!names) {
                return me;
            }

            if (!elementData.isSynchronized) {
                me.synchronize();
            }

            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;

            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';

            if (typeof names === 'string') {
                names = names.split(spacesRe);
            }

            for (i = 0, ln = names.length; i < ln; i++) {
                name = names[i];
                // Check name here, we may have a leading/trailing space in a string or an empty value
                if (name) {
                    name = prefix + name + suffix;

                    if (!map[name]) {
                        map[name] = true;
                        classList.push(name);
                        hasNewCls = true;
                    }
                }
            }

            if (hasNewCls) {
                dom.className = classList.join(' ');
            }

            return me;
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is down and then up on this element (a click effect)
         * @param {String} className The class to add
         * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
         * will be the Element instance. If this functions returns false, the class will not be added.
         * @param {Object} [scope] The scope to execute the testFn in.
         * @return {Ext.dom.Element} this
         */
        addClsOnClick: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);

            me.on("mousedown", function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return false;
                }
                Ext.fly(dom).addCls(className);
                var d = Ext.getDoc(),
                    fn = function() {
                        Ext.fly(dom).removeCls(className);
                        d.removeListener("mouseup", fn);
                    };
                d.on("mouseup", fn);
            });
            return me;
        },

        /**
         * Sets up event handlers to add and remove a css class when this element has the focus
         * @param {String} className The class to add
         * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
         * will be the Element instance. If this functions returns false, the class will not be added.
         * @param {Object} [scope] The scope to execute the testFn in.
         * @return {Ext.dom.Element} this
         */
        addClsOnFocus: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);

            me.on("focus", function() {
                if (hasTest && testFn.call(scope || me, me) === false) {
                    return false;
                }
                Ext.fly(dom).addCls(className);
            });
            me.on("blur", function() {
                Ext.fly(dom).removeCls(className);
            });
            return me;
        },

        /**
         * Sets up event handlers to add and remove a css class when the mouse is over this element
         * @param {String} className The class to add
         * @param {Function} [testFn] A test function to execute before adding the class. The passed parameter
         * will be the Element instance. If this functions returns false, the class will not be added.
         * @param {Object} [scope] The scope to execute the testFn in.
         * @return {Ext.dom.Element} this
         */
        addClsOnOver: function(className, testFn, scope) {
            var me = this,
                dom = me.dom,
                hasTest = Ext.isFunction(testFn);

            me.hover(
                function() {
                    if (hasTest && testFn.call(scope || me, me) === false) {
                        return;
                    }
                    Ext.fly(dom).addCls(className);
                },
                function() {
                    Ext.fly(dom).removeCls(className);
                }
            );
            return me;
        },

        addStyles: function(sides, styles){
            var totalSize = 0,
                sidesArr = (sides || '').match(wordsRe),
                i,
                len = sidesArr.length,
                side,
                styleSides = [];

            if (len === 1) {
                totalSize = Math.abs(parseFloat(this.getStyle(styles[sidesArr[0]])) || 0);
            } else if (len) {
                for (i = 0; i < len; i++) {
                    side = sidesArr[i];
                    styleSides.push(styles[side]);
                }
                //Gather all at once, returning a hash
                styleSides = this.getStyle(styleSides);

                for (i=0; i < len; i++) {
                    side = sidesArr[i];
                    totalSize += parseFloat(styleSides[styles[side]]) || 0;
                }
            }

            return totalSize;
        },

        addUnits: function(size, units) {
            return Element.addUnits(size, units);
        },

        /**
         * @private
         * Returns the fractional portion of this element's measurement in the given dimension.
         * (IE9+ only)
         * @return {Number}
         */
        adjustDirect2DDimension: function(dimension) {
            var me = this,
                dom = me.dom,
                display = me.getStyle('display'),
                inlineDisplay = dom.style.display,
                inlinePosition = dom.style.position,
                originIndex = dimension === WIDTH ? 0 : 1,
                currentStyle = dom.currentStyle,
                floating;

            if (display === 'inline') {
                dom.style.display = 'inline-block';
            }

            dom.style.position = display.match(adjustDirect2DTableRe) ? 'absolute' : 'static';

            // floating will contain digits that appears after the decimal point
            // if height or width are set to auto we fallback to msTransformOrigin calculation

            // Use currentStyle here instead of getStyle. In some difficult to reproduce 
            // instances it resets the scrollWidth of the element
            floating = (parseFloat(currentStyle[dimension]) || parseFloat(currentStyle.msTransformOrigin.split(' ')[originIndex]) * 2) % 1;

            dom.style.position = inlinePosition;

            if (display === 'inline') {
                dom.style.display = inlineDisplay;
            }

            return floating;
        },

        // The following 3 methods add just enough of an animation api to make the scroller work
        // in Sencha Touch
        // TODO: unify touch/ext animations
        animate: function(animation) {
            animation = new Ext.fx.Animation(animation);
            animation.setElement(this);
            this._activeAnimation = animation;
            animation.on({
                animationend: this._onAnimationEnd,
                scope: this
            });
            Ext.Animator.run(animation);
            return animation;
        },

        _onAnimationEnd: function() {
            this._activeAnimation = null;
        },

        getActiveAnimation: function() {
            return this._activeAnimation;
        },

        append: function() {
            this.appendChild.apply(this, arguments);
        },

        /**
         * Appends the passed element(s) to this element
         * @param {String/HTMLElement/Ext.dom.Element/Object} el The id or element to insert
         * or a DomHelper config
         * @param {Boolean} [returnDom=false] True to return the raw DOM element instead
         * of Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The inserted Ext.dom.Element (or 
         * HTMLElement if _returnDom_ is _true_).
         */
        appendChild: function(el, returnDom) {
            var me = this,
                insertEl,
                eLen, e;

            if (el.nodeType || el.dom || typeof el === 'string') { // element
                el = Ext.getDom(el);
                me.dom.appendChild(el);
                return !returnDom ? Ext.get(el) : el;
            } else if (el.length) {
                // append all elements to a documentFragment
                insertEl = Ext.fly(DOC.createDocumentFragment());
                eLen = el.length;

                for (e = 0; e < eLen; e++) {
                    insertEl.appendChild(el[e], returnDom);
                }
                el = Ext.Array.toArray(insertEl.dom.childNodes);
                me.dom.appendChild(insertEl.dom);
                return returnDom ? el : new Ext.dom.CompositeElementLite(el);
            }
            else { // dh config
                return me.createChild(el, null, returnDom);
            }
        },

        /**
         * Appends this element to the passed element.
         * @param {String/HTMLElement/Ext.dom.Element} el The new parent element.
         * The id of the node, a DOM Node or an existing Element.
         * @return {Ext.dom.Element} This element.
         */
        appendTo: function(el) {
            Ext.getDom(el).appendChild(this.dom);
            return this;
        },

        /**
         * More flexible version of {@link #setStyle} for setting style properties.
         * 
         * Styles in object form should be a valid DOM element style property.  
         * [Valid style property names](http://www.w3schools.com/jsref/dom_obj_style.asp) 
         * (_along with the supported CSS version for each_)
         * 
         *     // <div id="my-el">Phineas Flynn</div>
         *     
         *     var el = Ext.get('my-el');
         *     
         *     el.applyStyles('color: white;');
         *     
         *     el.applyStyles({
         *         fontWeight: 'bold',
         *         backgroundColor: 'gray',
         *         padding: '10px'
         *     });
         *     
         *     el.applyStyles(function () {
         *         if (name.initialConfig.html === 'Phineas Flynn') {
         *             return 'font-style: italic;';
         *             // OR return { fontStyle: 'italic' };
         *         }
         *     });
         * 
         * @param {String/Object/Function} styles A style specification string, e.g. "width:100px", or object in the form `{width:"100px"}`, or
         * a function which returns such a specification.
         * @return {Ext.dom.Element} this
         */
        applyStyles: function(styles) {
            if (styles) {
                if (typeof styles === "function") {
                    styles = styles.call();
                }
                if (typeof styles === "string") {
                    styles = Element.parseStyles(styles);
                }
                if (typeof styles === "object") {
                    this.setStyle(styles);
                }
            }
            return this;
        },

        /**
         * Tries to blur the element. Any exceptions are caught and ignored.
         * @return {Ext.dom.Element} this
         */
        blur: function() {
            var me = this,
                dom = me.dom;
            // In IE, blurring the body can cause the browser window to hide.
            // Blurring the body is redundant, so instead we just focus it
            if (dom !== DOC.body) {
                try {
                    dom.blur();
                } catch(e) {
                }
                return me;
            } else {
                return me.focus(undefined, dom);
            }
        },

        /**
         * When an element is moved around in the DOM, or is hidden using `display:none`, it loses layout, and therefore
         * all scroll positions of all descendant elements are lost.
         *
         * This function caches them, and returns a function, which when run will restore the cached positions.
         * In the following example, the Panel is moved from one Container to another which will cause it to lose all scroll positions:
         *
         *     var restoreScroll = myPanel.el.cacheScrollValues();
         *     myOtherContainer.add(myPanel);
         *     restoreScroll();
         *
         * @return {Function} A function which will restore all descendant elements of this Element to their scroll
         * positions recorded when this function was executed. Be aware that the returned function is a closure which has
         * captured the scope of `cacheScrollValues`, so take care to dereference it as soon as not needed - if is it is a `var`
         * it will drop out of scope, and the reference will be freed.
         */
        cacheScrollValues: function() {
            var me = this,
                scrollValues = [],
                scrolledDescendants = [],
                descendants, descendant, i, len;

            scrollFly = scrollFly || new Ext.dom.Fly();

            descendants = me.query('*');
            for (i = 0, len = descendants.length; i < len; i++) {
                descendant = descendants[i];
                // use !== 0 for scrollLeft because it can be a negative number
                // in RTL mode in some browsers.
                if (descendant.scrollTop > 0 || descendant.scrollLeft !== 0) {
                    scrolledDescendants.push(descendant);
                    scrollValues.push(scrollFly.attach(descendant).getScroll());
                }
            }

            return function() {
                var scroll, i, len;

                for (i = 0, len = scrolledDescendants.length; i < len; i++) {
                    scroll = scrollValues[i];
                    scrollFly.attach(scrolledDescendants[i]);
                    scrollFly.setScrollLeft(scroll.left);
                    scrollFly.setScrollTop(scroll.top);
                }
            };
        },

        /**
         * Centers the Element in either the viewport, or another Element.
         * @param {String/HTMLElement/Ext.dom.Element} centerIn element in
         * which to center the element.
         * @return {Ext.dom.Element} This element
         *
         * @chainable
         */
        center: function(centerIn){
            return this.alignTo(centerIn || DOC, 'c-c');
        },

        /**
         * Selects a single *direct* child based on the passed CSS selector (the selector should not contain an id).
         * @param {String} selector The CSS selector.
         * @param {Boolean} [returnDom=false] `true` to return the DOM node instead of Ext.dom.Element.
         * @return {HTMLElement/Ext.dom.Element} The child Ext.dom.Element (or DOM node if `returnDom` is `true`)
         */
        child: function(selector, returnDom) {
            var me = this,
            // Pull the ID from the DOM (Ext.id also ensures that there *is* an ID).
            // If this object is a Flyweight, it will not have an ID
                id = Ext.get(me).id;

            return me.selectNode(Ext.makeIdSelector(id) + " > " + selector, !!returnDom);
        },

        /**
         * Clone this element.
         * @param {Boolean} [deep=false] `true` if the children of the node should also be cloned.
         * @param {Boolean} [returnDom=false] `true` to return the DOM node instead of Ext.dom.Element.
         * @return {HTMLElement/Ext.dom.Element} The newly cloned Ext.dom.Element (or DOM node if `returnDom` is `true`).
         */
        clone: function(deep, returnDom) {
            var clone = this.dom.cloneNode(deep);
            if (Ext.supports.CloneNodeCopiesExpando) {
                clearData(clone, deep);
            }
            return returnDom ? clone : Ext.get(clone);
        },

        constrainScrollLeft: function(left) {
            var dom = this.dom;
            return Math.max(Math.min(left, dom.scrollWidth - dom.clientWidth), 0);
        },

        constrainScrollTop: function(top) {
            var dom = this.dom;
            return Math.max(Math.min(top, dom.scrollHeight - dom.clientHeight), 0);
        },

        /**
         * Creates the passed DomHelper config and appends it to this element or optionally
         * inserts it before the passed child element.
         * @param {Object} config DomHelper element config object.  If no tag is specified
         * (e.g., {tag:'input'}) then a div will be automatically generated with the specified
         * attributes.
         * @param {HTMLElement} [insertBefore] a child element of this element
         * @param {Boolean} [returnDom=false] true to return the dom node instead of creating
         * an Element
         * @return {Ext.dom.Element/HTMLElement} The new child element (or HTMLElement if 
         * _returnDom_ is _true_)
         */
        createChild: function(config, insertBefore, returnDom) {
            config = config || {tag:'div'};
            if (insertBefore) {
                return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
            }
            else {
                return Ext.DomHelper.append(this.dom, config,  returnDom !== true);
            }
        },

        /**
         * Returns `true` if this element is an ancestor of the passed element, or is
         * the element.
         * @param {String/HTMLElement/Ext.dom.Element} element The dom element, 
         * Ext.dom.Element, or id (string) of the dom element to check.
         * @return {Boolean} True if this element is an ancestor of el or the el itself, else false
         */
        contains: function(element) {
            if (!element) {
                return false;
            }

            var me = this,
                dom = Ext.getDom(element);

            // we need el-contains-itself logic here because isAncestor does not do that:
            // https://developer.mozilla.org/en-US/docs/Web/API/Node.contains
            return (dom === me.dom) || me.isAncestor(dom);
        },

        /**
         * Destroys this element by removing it from the cache, removing its DOM reference,
         * and removing all of its event listeners.
         */
        destroy: function() {
            var me = this,
                dom = me.dom;

            //<debug>
            if (me.destroyed) {
                Ext.Logger.warn("Cannot destroy Element \"" + me.id + "\". Already destroyed.");
                return;
            }

            if (dom) {
                if (dom === DOC.body) {
                    Ext.raise("Cannot destroy body element.");
                } else if (dom === DOC) {
                    Ext.raise("Cannot destroy document object.");
                } else if (dom === WIN) {
                    Ext.raise("Cannot destroy window object");
                }
            }
            //</debug>

            if (dom && dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }

            me.collect();
        },

        detach: function() {
            var dom = this.dom;

            if (dom && dom.parentNode && dom.tagName !== 'BODY') {
                dom.parentNode.removeChild(dom);
            }

            return this;
        },

        /**
         * Disables the shadow element created by {@link #enableShadow}.
         * @private
         */
        disableShadow: function() {
            var shadow = this.shadow;
            
            if (shadow) {
                shadow.hide();
                shadow.disabled = true;
            }
        },

        /**
         * Disables the shim element created by {@link #enableShim}.
         * @private
         */
        disableShim: function() {
            var shim = this.shim;

            if (shim) {
                shim.hide();
                shim.disabled = true;
            }
        },

        /**
         * @private
         */
        doReplaceWith: function(element) {
            var dom = this.dom;
            dom.parentNode.replaceChild(Ext.getDom(element), dom);
        },

        /**
         * @private
         * A scrollIntoView implementation for scrollIntoView/rtlScrollIntoView to call 
         * after current scrollX has been determined.
         */
        doScrollIntoView: function(container, hscroll, animate, highlight, getScrollX, scrollTo) {
            scrollFly = scrollFly || new Ext.dom.Fly();

            var me = this,
                dom = me.dom,
                scrollX = scrollFly.attach(container)[getScrollX](),
                scrollY = container.scrollTop,
                position = me.getScrollIntoViewXY(container, scrollX, scrollY),
                newScrollX = position.x,
                newScrollY = position.y;

            // Highlight upon end of scroll
            if (highlight) {
                if (animate) {
                    animate = Ext.apply({
                        listeners: {
                            afteranimate: function() {
                                scrollFly.attach(dom).highlight();
                            }
                        }
                    }, animate);
                } else {
                    scrollFly.attach(dom).highlight();
                }
            }

            if (newScrollY !== scrollY) {
                scrollFly.attach(container).scrollTo('top', newScrollY, animate);
            }

            if (hscroll !== false  && (newScrollX !== scrollX)) {
                scrollFly.attach(container)[scrollTo]('left', newScrollX, animate);
            }
            return me;
        },

        /**
         * Selects a single child at any depth below this element based on the passed CSS selector (the selector should not contain an id).
         * @param {String} selector The CSS selector
         * @param {Boolean} [returnDom=false] `true` to return the DOM node instead of Ext.dom.Element
         * @return {HTMLElement/Ext.dom.Element} The child Ext.dom.Element (or DOM node if `returnDom` is `true`)
         */
        down: function(selector, returnDom) {
            return this.selectNode(selector, !!returnDom);
        },

        /**
         * Enables a shadow element that will always display behind this element
         * @param {Object} [options] Configuration options for the shadow
         * @param {Number} [options.offset=4] Number of pixels to offset the shadow
         * @param {String} [options.mode='sides'] The shadow display mode.  Supports the following
         * options:
         *
         *     - `'sides'`: Shadow displays on both sides and bottom only
         *     - `'frame'`: Shadow displays equally on all four sides
         *     - `'drop'`: Traditional bottom-right drop shadow
         *     - `'bottom'`: Shadow is offset to the bottom
         *
         * @param {Boolean} [options.animate=false] `true` to animate the shadow while
         * the element is animating.  By default the shadow will be hidden during animation.
         * @private
         */
        enableShadow: function(options, /* private */ isVisible) {
            var me = this,
                shadow = me.shadow || (me.shadow = new Ext.dom.Shadow(Ext.apply({
                    target: me
                }, options))),
                shim = me.shim;

            if (shim) {
                shim.offsets = shadow.outerOffsets;
                shim.shadow = shadow;
                shadow.shim = shim;
            }

            // Components pass isVisible to avoid the extra dom read to determine
            // whether or not this element is visible.
            if (isVisible === true || (isVisible !== false && me.isVisible())) {
                // the shadow element may have just been retrieved from an OverlayPool, so
                // we need to explicitly show it to be sure hidden styling is removed
                shadow.show();
            } else {
                shadow.hide();
            }

            shadow.disabled = false;
        },

        /**
         * Enables an iframe shim for this element to keep windowed objects from
         * showing through.  The position, size, and visibility of the shim will be
         * automatically synchronized as the position, size, and visibility of this
         * Element are changed.
         * @param {Object} [options] Configuration options for the shim
         * @return {Ext.dom.Shim} The new Shim
         * @private
         */
        enableShim: function(options, /* private */ isVisible) {
            var me = this,
                shim = me.shim || (me.shim = new Ext.dom.Shim(Ext.apply({
                    target: me
                }, options))),
                shadow = me.shadow;

            if (shadow) {
                shim.offsets = shadow.outerOffsets;
                shim.shadow = shadow;
                shadow.shim = shim;
            }

            // Components pass isVisible to avoid the extra dom read to determine
            // whether or not this element is visible.
            if (isVisible === true || (isVisible !== false && me.isVisible())) {
                // the shim element may have just been retrieved from an OverlayPool, so
                // we need to explicitly show it to be sure hidden styling is removed
                shim.show();
            } else {
                shim.hide();
            }

            shim.disabled = false;
            return shim;
        },

        /**
         * Looks at this node and then at parent nodes for a match of the passed simple selector.
         * @param {String} selector The simple selector to test. See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Number/String/HTMLElement/Ext.dom.Element} [limit]
         * The max depth to search as a number or an element which causes the upward traversal to stop
         * and is **not** considered for inclusion as the result. (defaults to 50 || document.documentElement)
         * @param {Boolean} [returnEl=false] True to return a Ext.dom.Element object instead of DOM node
         * @return {HTMLElement/Ext.dom.Element} The matching DOM node (or 
         * Ext.dom.Element if _returnEl_ is _true_).  Or null if no match was found.
         */
        findParent: function(simpleSelector, limit, returnEl) {
            var me = this,
                target = me.dom,
                topmost = docEl,
                depth = 0;

            if (limit || limit === 0) {
                if (typeof limit !== 'number') {
                    topmost = Ext.getDom(limit);
                    limit = Number.MAX_VALUE;
                }
            } else {
                // No limit passed, default to 50
                limit = 50;
            }

            while (target && target.nodeType === 1 && depth < limit && target !== topmost) {
                if (Ext.fly(target).is(simpleSelector)) {
                    return returnEl ? Ext.get(target) : target;
                }
                depth++;
                target = target.parentNode;
            }
            return null;
        },

        /**
         * Looks at parent nodes for a match of the passed simple selector.
         * @param {String} selector The simple selector to test. See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Number/String/HTMLElement/Ext.dom.Element} [limit]
         * The max depth to search as a number or an element which causes the upward traversal to stop
         * and is **not** considered for inclusion as the result. (defaults to 50 || document.documentElement)
         * @param {Boolean} [returnEl=false] True to return a Ext.dom.Element object instead of DOM node
         * @return {HTMLElement/Ext.dom.Element} The matching DOM node (or 
         * Ext.dom.Element if _returnEl_ is _true_).  Or null if no match was found.
         */
        findParentNode: function(simpleSelector, limit, returnEl) {
            var p = Ext.fly(this.dom.parentNode);
            return p ? p.findParent(simpleSelector, limit, returnEl) : null;
        },

        /**
         * Gets the first child, skipping text nodes
         * @param {String} [selector] Find the next sibling that matches the passed simple selector.
         * See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Boolean} [returnDom=false] `true` to return a raw DOM node instead of an Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The first child or null
         */
        first: function(selector, returnDom) {
            return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
        },

        /**
         * Try to focus the element either immediately or after a timeout
         * if `defer` argument is specified.
         *
         * @param {Number} [defer] Milliseconds to defer the focus
         *
         * @return {Ext.dom.Element} this
         */
        focus: function(defer, /* private */ dom) {
            var me = this;

            dom = dom || me.dom;
            
            if (Number(defer)) {
                Ext.defer(me.focus, defer, me, [null, dom]);
            }
            else {
                Ext.GlobalEvents.fireEvent('beforefocus', dom);
                dom.focus();
            }
            
            return me;
        },

        /**
         * @private
         * Removes the element from the cache and removes listeners.
         * Used for cleaning up orphaned elements after they have been removed from the dom.
         * Similar to {@link #destroy} except it assumes the element has already been
         * removed from the dom.
         */
        collect: function() {
            var me = this,
                dom = me.dom,
                shadow = me.shadow,
                shim = me.shim;

            // The parent destroy sets the destroy to emptyFn, which we don't
            // want on a shared fly
            if (!me.isFly) {
                me.mixins.observable.destroy.call(me);
                delete Ext.cache[me.id];
                me.el = null;
            }

            if (dom) {
                dom._extData = me.dom = null;
            }

            // we do not destroy the shadow and shim because they are returned to their
            // OverlayPools for reuse.
            if (shadow) {
                shadow.hide();
                me.shadow = null;
            }

            if (shim) {
                shim.hide();
                me.shim = null;
            }
        },

        getAnchorToXY: function(el, anchor, local, mySize) {
            return el.getAnchorXY(anchor, local, mySize);
        },

        /**
         * Returns the value of an attribute from the element's underlying DOM node.
         * @param {String} name The attribute name.
         * @param {String} [namespace] The namespace in which to look for the attribute.
         * @return {String} The attribute value.
         */
        getAttribute: function(name, namespace) {
            var dom = this.dom;

            return namespace ?
                (dom.getAttributeNS(namespace, name) || dom.getAttribute(namespace + ":" + name)) :
                (dom.getAttribute(name) || dom[name] || null);
        },
        
        /**
         * Returns an object containing a map of all attributes of this element's DOM node.
         * 
         * @return {Object} Key/value pairs of attribute names and their values.
         */
        getAttributes: function() {
            var attributes = this.dom.attributes,
                result = {},
                attr, i, len;
            
            for (i = 0, len = attributes.length; i < len; i++) {
                attr = attributes[i];
                
                result[attr.name] = attr.value;
            }
            
            return result;
        },

        /**
         * Gets the bottom Y coordinate of the element (element Y position + element height)
         * @param {Boolean} local True to get the local css position instead of page
         * coordinate
         * @return {Number}
         */
        getBottom: function(local) {
            return (local ? this.getLocalY() : this.getY()) + this.getHeight();
        },

        /**
         * Returns a child element of this element given its `id`.
         * @param {String} id The id of the desired child element.
         * @param {Boolean} [asDom=false] True to return the DOM element, false to return a
         * wrapped Element object.
         * @return {Ext.dom.Element/HTMLElement} The child element (or HTMLElement if 
         * _asDom_ is _true_).  Or null if no match was found.
         */
        getById: function (id, asDom) {
            // for normal elements getElementById is the best solution, but if the el is
            // not part of the document.body, we have to resort to querySelector
            var dom = DOC.getElementById(id) ||
                this.dom.querySelector(Ext.makeIdSelector(id));
            return asDom ? dom : (dom ? Ext.get(dom) : null);
        },

        getBorderPadding: function() {
            var paddingWidth = this.getStyle(paddingsTLRB),
                bordersWidth = this.getStyle(bordersTLRB);

            return {
                beforeX: (parseFloat(bordersWidth[borders.l]) || 0) + (parseFloat(paddingWidth[paddings.l]) || 0),
                afterX: (parseFloat(bordersWidth[borders.r]) || 0) + (parseFloat(paddingWidth[paddings.r]) || 0),
                beforeY: (parseFloat(bordersWidth[borders.t]) || 0) + (parseFloat(paddingWidth[paddings.t]) || 0),
                afterY: (parseFloat(bordersWidth[borders.b]) || 0) + (parseFloat(paddingWidth[paddings.b]) || 0)
            };
        },

        /**
         * @private
         */
        getBorders: function() {
            var bordersWidth = this.getStyle(bordersTLRB);

            return {
                beforeX: (parseFloat(bordersWidth[borders.l]) || 0),
                afterX: (parseFloat(bordersWidth[borders.r]) || 0),
                beforeY: (parseFloat(bordersWidth[borders.t]) || 0),
                afterY: (parseFloat(bordersWidth[borders.b]) || 0)
            };
        },

        /**
         * Gets the width of the border(s) for the specified side(s)
         * @param {String} side Can be t, l, r, b or any combination of those to add
         * multiple values. For example, passing `'lr'` would get the border **l**eft
         * width + the border **r**ight width.
         * @return {Number} The width of the sides passed added together
         */
        getBorderWidth: function(side) {
            return this.addStyles(side, borders);
        },

        getData: function(preventCreate) {
            var dom = this.dom,
                data;

            if (dom) {
                data = dom._extData;
                if (!data && !preventCreate) {
                    dom._extData = data = {};
                }
            }
            return data;
        },

        getFirstChild: function() {
            return Ext.get(this.dom.firstElementChild);
        },

        /**
         * Returns the offset height of the element.
         * @param {Boolean} [contentHeight] `true` to get the height minus borders and padding.
         * @return {Number} The element's height.
         */
        getHeight: function(contentHeight, preciseHeight) {
            var me = this,
                dom = me.dom,
                hidden = me.isStyle('display', 'none'),
                height,
                floating;

            if (hidden) {
                return 0;
            }

            // Use the viewport height if they are asking for body height
            if (dom.nodeName === 'BODY') {
                height = Element.getViewportHeight();
            } else {
                height = dom.offsetHeight;

                // SVG nodes do not have offsetHeight, so use boundingClientRect instead.
                if (height == null) {
                    height = dom.getBoundingClientRect().height;
                }
            }

            // IE9/10 Direct2D dimension rounding bug
            if (Ext.supports.Direct2DBug) {
                floating = me.adjustDirect2DDimension(HEIGHT);
                if (preciseHeight) {
                    height += floating;
                }
                else if (floating > 0 && floating < 0.5) {
                    height++;
                }
            }

            if (contentHeight) {
                height -= me.getBorderWidth("tb") + me.getPadding("tb");
            }

            return (height < 0) ? 0 : height;
        },

        /**
         * Returns the `innerHTML` of an Element or an empty string if the element's
         * dom no longer exists.
         * @return {String}
         */
        getHtml: function() {
            return this.dom ? this.dom.innerHTML : '';
        },

        /**
         * Gets the left X coordinate
         * @param {Boolean} local True to get the local css position instead of
         * page coordinate
         * @return {Number}
         */
        getLeft: function(local) {
            return local ? this.getLocalX() : this.getX();
        },

        getLocalX: function() {
            var me = this,
                offsetParent,
                x = me.getStyle('left');

            if (!x || x === 'auto') {
                x = 0;
            } else if (pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();

                // Reading offsetParent causes forced async layout.
                // Do not do it unless needed.
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    x -= Ext.fly(offsetParent).getX();
                }
            }

            return x;
        },

        getLocalXY: function() {
            var me = this,
                offsetParent,
                style = me.getStyle(['left', 'top']),
                x = style.left,
                y = style.top;

            if (!x || x === 'auto') {
                x = 0;
            } else if (pxRe.test(x)) {
                x = parseFloat(x);
            } else {
                x = me.getX();

                // Reading offsetParent causes forced async layout.
                // Do not do it unless needed.
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    x -= Ext.fly(offsetParent).getX();
                }
            }

            if (!y || y === 'auto') {
                y = 0;
            } else if (pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();

                // Reading offsetParent causes forced async layout.
                // Do not do it unless needed.
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    y -= Ext.fly(offsetParent).getY();
                }
            }

            return [x, y];
        },

        getLocalY: function() {
            var me = this,
                offsetParent,
                y = me.getStyle('top');

            if (!y || y === 'auto') {
                y = 0;
            } else if (pxRe.test(y)) {
                y = parseFloat(y);
            } else {
                y = me.getY();

                // Reading offsetParent causes forced async layout.
                // Do not do it unless needed.
                offsetParent = me.dom.offsetParent;
                if (offsetParent) {
                    y -= Ext.fly(offsetParent).getY();
                }
            }

            return y;
        },

        /**
         * @method
         *
         * Returns an object with properties top, left, right and bottom representing the margins of this element unless sides is passed,
         * then it returns the calculated width of the sides (see {@link #getPadding}).
         * @param {String} [sides] Any combination of 'l', 'r', 't', 'b' to get the sum of those sides.
         * @return {Object/Number}
         */
        getMargin: (function() {
            var hash = {t: "top", l: "left", r: "right", b: "bottom"},
                allMargins = ['margin-top', 'margin-left', 'margin-right', 'margin-bottom'];

            return function(side) {
                var me = this,    
                    style, key, o;

                if (!side) {
                    style = me.getStyle(allMargins);
                    o = {};
                    if (style && typeof style === 'object') {
                        o = {};
                        for (key in margins) {
                            o[key] = o[hash[key]] = parseFloat(style[margins[key]]) || 0;
                        }
                    }
                } else {
                    o = me.addStyles(side, margins);
                }
                return o;
            };
        })(),

        /**
         * Gets the width of the padding(s) for the specified side(s).
         * @param {String} side Can be t, l, r, b or any combination of those to add
         * multiple values. For example, passing `'lr'` would get the padding **l**eft +
         * the padding **r**ight.
         * @return {Number} The padding of the sides passed added together.
         */
        getPadding: function(side) {
            return this.addStyles(side, paddings);
        },

        getParent: function() {
            return Ext.get(this.dom.parentNode);
        },

        /**
         * Gets the right X coordinate of the element (element X position + element width)
         * @param {Boolean} local True to get the local css position instead of page
         * coordinates
         * @return {Number}
         */
        getRight: function(local) {
            return (local ? this.getLocalX() : this.getX()) + this.getWidth();
        },

        /**
         * Returns the current scroll position of the element.
         * @return {Object} An object containing the scroll position in the format
         * `{left: (scrollLeft), top: (scrollTop)}`
         */
        getScroll: function() {
            var me = this,
                dom = me.dom,
                docElement = docEl,
                left, top,
                body = DOC.body;

            if (dom === DOC || dom === body) {
                // the scrollLeft/scrollTop may be either on the body or documentElement,
                // depending on browser. It is possible to use window.pageXOffset/pageYOffset
                // in most modern browsers but this complicates things when in rtl mode because
                // pageXOffset does not always behave the same as scrollLeft when direction is
                // rtl. (e.g. pageXOffset can be an offset from the right, while scrollLeft
                // is offset from the left, one can be positive and the other negative, etc.)
                // To avoid adding an extra layer of feature detection in rtl mode to deal with
                // these differences, it's best just to always use scrollLeft/scrollTop
                left = docElement.scrollLeft || (body ? body.scrollLeft : 0);
                top = docElement.scrollTop || (body ? body.scrollTop : 0);
            } else {
                left = dom.scrollLeft;
                top = dom.scrollTop;
            }

            return {
                left: left,
                top: top
            };
        },

        /**
         * Gets the x and y coordinates needed for scrolling an element into view within
         * a given container.  These coordinates translate into the scrollLeft and scrollTop
         * positions that will need to be set on an ancestor of the element in order to make
         * this element visible within its container.
         * @param {String/HTMLElement/Ext.Element} container The container
         * @param {Number} scrollX The container's current scroll position on the x axis
         * @param {Number} scrollY The container's current scroll position on the y axis
         * @return {Object} An object with "x" and "y" properties
         * @private
         */
        getScrollIntoViewXY: function(container, scrollX, scrollY) {
            var dom = this.dom,
                ct = Ext.getDom(container),
                offsets = this.getOffsetsTo(ct),

                width = dom.offsetWidth,
                height = dom.offsetHeight,
                left = offsets[0] + scrollX,
                top = offsets[1] + scrollY,
                bottom = top + height,
                right = left + width,

                viewHeight = ct.clientHeight,
                viewWidth = ct.clientWidth,
                viewLeft = scrollX,
                viewTop = scrollY,
                viewBottom = viewTop + viewHeight,
                viewRight = viewLeft + viewWidth;


            if (height > viewHeight || top < viewTop) {
                scrollY = top;
            } else if (bottom > viewBottom) {
                scrollY = bottom - viewHeight;
            }

            if (width > viewWidth || left < viewLeft) {
                scrollX = left;
            } else if (right > viewRight) {
                scrollX = right - viewWidth;
            }

            return {
                x: scrollX,
                y: scrollY
            };
        },

        /**
         * Gets the left scroll position
         * @return {Number} The left scroll position
         */
        getScrollLeft: function() {
            var dom = this.dom;

            if (dom === DOC || dom === DOC.body) {
                return this.getScroll().left;
            } else {
                return dom.scrollLeft;
            }
        },

        /**
         * Gets the top scroll position
         * @return {Number} The top scroll position
         */
        getScrollTop: function(){
            var dom = this.dom;

            if (dom === DOC || dom === DOC.body) {
                return this.getScroll().top;
            } else {
                return dom.scrollTop;
            }
        },

        /**
         * Returns the size of the element.
         * @param {Boolean} [contentSize] `true` to get the width/size minus borders and padding.
         * @return {Object} An object containing the element's size:
         * @return {Number} return.width
         * @return {Number} return.height
         */
        getSize: function(contentSize) {
            return {width: this.getWidth(contentSize), height: this.getHeight(contentSize)};
        },

        /**
         * Returns a named style property based on computed/currentStyle (primary) and
         * inline-style if primary is not available.
         *
         * @param {String/String[]} property The style property (or multiple property names
         * in an array) whose value is returned.
         * @param {Boolean} [inline=false] if `true` only inline styles will be returned.
         * @return {String/Object} The current value of the style property for this element
         * (or a hash of named style values if multiple property arguments are requested).
         * @method
         */
        getStyle: function (property, inline) {
            var me = this,
                dom = me.dom,
                multiple = typeof property !== 'string',
                hooks = me.styleHooks,
                prop = property,
                props = prop,
                len = 1,
                domStyle, camel, values, hook, out, style, i;

            if (multiple) {
                values = {};
                prop = props[0];
                i = 0;
                if (!(len = props.length)) {
                    return values;
                }
            }

            if (!dom || dom.documentElement) {
                return values || '';
            }

            domStyle = dom.style;

            if (inline) {
                style = domStyle;
            } else {
                // Caution: Firefox will not render "presentation" (i.e. computed styles) in
                // iframes that are display:none or those inheriting display:none. Similar
                // issues with legacy Safari.
                //
                style = dom.ownerDocument.defaultView.getComputedStyle(dom, null);

                // fallback to inline style if rendering context not available
                if (!style) {
                    inline = true;
                    style = domStyle;
                }
            }

            do {
                hook = hooks[prop];

                if (!hook) {
                    hooks[prop] = hook = { name: Element.normalize(prop) };
                }

                if (hook.get) {
                    out = hook.get(dom, me, inline, style);
                } else {
                    camel = hook.name;
                    out = style[camel];
                }

                if (!multiple) {
                    return out;
                }

                values[prop] = out;
                prop = props[++i];
            } while (i < len);

            return values;
        },

        getStyleValue: function(name) {
            return this.dom.style.getPropertyValue(name);
        },

        /**
         * Gets the top Y coordinate
         * @param {Boolean} local True to get the local css position instead of page
         * coordinates
         * @return {Number}
         */
        getTop: function(local) {
            return local ? this.getLocalY() : this.getY();
        },

        /**
         * Returns this element's touch action.  (see {@link #setTouchAction})
         *
         * The returned object is shared and should not be mutated.
         *
         * @returns {Object}
         */
        getTouchAction: function() {
            return Ext.dom.TouchAction.get(this.dom);
        },

        /**
         * Returns the value of the `value` attribute.
         * @param {Boolean} asNumber `true` to parse the value as a number.
         * @return {String/Number}
         */
        getValue: function(asNumber) {
            var value = this.dom.value;

            return asNumber ? parseInt(value, 10) : value;
        },

        /**
         * Returns the dimensions of the element available to lay content out in.  For
         * most elements this is the clientHeight/clientWidth.  If the element is
         * the document/document.body the window's innerHeight/innerWidth is returned
         *
         * If the element (or any ancestor element) has CSS style `display: none`, the
         * dimensions will be zero.
         *
         * @return {Object} Object describing width and height.
         * @return {Number} return.width
         * @return {Number} return.height
         */
        getViewSize: function() {
            var dom = this.dom;

            if (dom === DOC || dom === DOC.body) {
                return {
                    width: Element.getViewportWidth(),
                    height: Element.getViewportHeight()
                };
            }
            else {
                return {
                    width: dom.clientWidth,
                    height: dom.clientHeight
                };
            }
        },

        getVisibilityMode: function() {
            var me = this,
                data = me.getData(),
                mode = data.visibilityMode;

            if (mode === undefined) {
                data.visibilityMode = mode = Element.DISPLAY;
            }

            return mode;
        },

        /**
         * Returns the offset width of the element.
         * @param {Boolean} [contentWidth] `true` to get the width minus borders and padding.
         * @return {Number} The element's width.
         */
        getWidth: function(contentWidth, preciseWidth) {
            var me = this,
                dom = me.dom,
                hidden = me.isStyle('display', 'none'),
                rect, width, floating;

            if (hidden) {
                return 0;
            }

            // Gecko will in some cases report an offsetWidth that is actually less than the width of the
            // text contents, because it measures fonts with sub-pixel precision but rounds the calculated
            // value down. Using getBoundingClientRect instead of offsetWidth allows us to get the precise
            // subpixel measurements so we can force them to always be rounded up. See
            // https://bugzilla.mozilla.org/show_bug.cgi?id=458617
            // Rounding up ensures that the width includes the full width of the text contents.
            if (Ext.supports.BoundingClientRect) {
                rect = dom.getBoundingClientRect();
                width = (me.vertical && !Ext.supports.RotatedBoundingClientRect) ?
                        (rect.bottom - rect.top) : (rect.right - rect.left);
                width = preciseWidth ? width : Math.ceil(width);
            } else {
                width = dom.offsetWidth;
            }

            // IE9/10 Direct2D dimension rounding bug: https://sencha.jira.com/browse/EXTJSIV-603
            // there is no need make adjustments for this bug when the element is vertically
            // rotated because the width of a vertical element is its rotated height
            if (Ext.supports.Direct2DBug && !me.vertical) {
                // get the fractional portion of the sub-pixel precision width of the element's text contents
                floating = me.adjustDirect2DDimension(WIDTH);
                if (preciseWidth) {
                    width += floating;
                }
                // IE9 also measures fonts with sub-pixel precision, but unlike Gecko, instead of rounding the offsetWidth down,
                // it rounds to the nearest integer. This means that in order to ensure that the width includes the full
                // width of the text contents we need to increment the width by 1 only if the fractional portion is less than 0.5
                else if (floating > 0 && floating < 0.5) {
                    width++;
                }
            }

            if (contentWidth) {
                width -= me.getBorderWidth("lr") + me.getPadding("lr");
            }

            return (width < 0) ? 0 : width;
        },

        /**
         * Gets element X position in page coordinates
         *
         * @return {Number}
         */
        getX: function() {
            return this.getXY()[0];
        },

        /**
         * Gets element X and Y positions in page coordinates
         *
         * @return {Array} [x, y]
         */
        getXY: function() {
            var round = Math.round,
                dom = this.dom,
                body = DOC.body,
                x = 0,
                y = 0,
                bodyRect, rect;

            if(dom !== DOC && dom !== body){
                // IE (including IE10) throws an error when getBoundingClientRect
                // is called on an element not attached to dom
                try {
                    bodyRect = body.getBoundingClientRect();
                    rect = dom.getBoundingClientRect();

                    x = rect.left - bodyRect.left;
                    y = rect.top - bodyRect.top;
                } catch (ex) {}
            }

            return [round(x), round(y)];
        },

        /**
         * Gets element Y position in page coordinates
         *
         * @return {Number}
         */
        getY: function() {
            return this.getXY()[1];
        },

        /**
         * Returns this element's z-index
         * @return {Number}
         */
        getZIndex: function() {
            return parseInt(this.getStyle('z-index'), 10);
        },

        /**
         * Checks if the specified CSS class exists on this element's DOM node.
         * @param {String} name The CSS class to check for.
         * @return {Boolean} `true` if the class exists, else `false`.
         */
        hasCls: function(name) {
            var elementData = this.getData();

            if (!elementData.isSynchronized) {
                this.synchronize();
            }

            return elementData.classMap.hasOwnProperty(name);
        },

        /**
         * Hide this element - Uses display mode to determine whether to use "display",
         * "visibility", or "offsets". See {@link #setVisible}.
         * @return {Ext.dom.Element} this
         */
        hide: function() {
            this.setVisible(false);
            return this;
        },

        /**
         * Inserts this element after the passed element in the DOM.
         * @param {String/HTMLElement/Ext.dom.Element} el The element to insert after.
         * The `id` of the node, a DOM Node or an existing Element.
         * @return {Ext.dom.Element} This element.
         */
        insertAfter: function(el) {
            el = Ext.getDom(el);
            el.parentNode.insertBefore(this.dom, el.nextSibling);
            return this;
        },

        /**
         * Inserts this element before the passed element in the DOM.
         * @param {String/HTMLElement/Ext.dom.Element} el The element before which this element will be inserted.
         * The id of the node, a DOM Node or an existing Element.
         * @return {Ext.dom.Element} This element.
         */
        insertBefore: function(el) {
            el = Ext.getDom(el);
            el.parentNode.insertBefore(this.dom, el);
            return this;
        },

        /**
         * Inserts (or creates) an element as the first child of this element
         * @param {String/HTMLElement/Ext.dom.Element/Object} el The id or element to insert
         * or a DomHelper config to create and insert
         * @param {Boolean} [returnDom=false] True to return the raw DOM element instead
         * of Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The new child element (or HTMLElement if 
         * _returnDom_ is _true_).
         */
        insertFirst: function(el, returnDom) {
            el = el || {};
            if (el.nodeType || el.dom || typeof el === 'string') { // element
                el = Ext.getDom(el);
                this.dom.insertBefore(el, this.dom.firstChild);
                return !returnDom ? Ext.get(el) : el;
            }
            else { // dh config
                return this.createChild(el, this.dom.firstChild, returnDom);
            }
        },

        /**
         * Inserts an html fragment into this element
         * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
         * See {@link Ext.dom.Helper#insertHtml} for details.
         * @param {String} html The HTML fragment
         * @param {Boolean} [returnEl=false] True to return an Ext.dom.Element
         * @return {HTMLElement/Ext.dom.Element} The inserted node (or nearest related if more than 1 inserted)
         */
        insertHtml: function(where, html, returnEl) {
            var el = Ext.DomHelper.insertHtml(where, this.dom, html);
            return returnEl ? Ext.get(el) : el;
        },

        /**
         * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
         * @param {String/HTMLElement/Ext.dom.Element/Object/Array} el The id, element to insert or a DomHelper config
         * to create and insert *or* an array of any of those.
         * @param {String} [where='before'] 'before' or 'after'
         * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The inserted Ext.dom.Element (or 
         * HTMLElement if _returnDom_ is _true_). If an array is passed, the last 
         * inserted element is returned.
         */
        insertSibling: function(el, where, returnDom) {
            var me        = this,
                DomHelper = Ext.DomHelper,
                isAfter   = (where || 'before').toLowerCase() === 'after',
                rt, insertEl, eLen, e;

            if (Ext.isIterable(el)) {
                eLen = el.length;
                insertEl = Ext.fly(DOC.createDocumentFragment());

                // append all elements to a documentFragment               
                if (Ext.isArray(el)) {

                    for (e = 0; e < eLen; e++) {
                        rt = insertEl.appendChild(el[e], returnDom);
                    }
                }
                // Iterable, but not an Array, must be an HtmlCollection
                else {
                    for (e = 0; e < eLen; e++) {
                        insertEl.dom.appendChild(rt = el[0]);
                    }
                    if (returnDom === false) {
                        rt = Ext.get(rt);
                    }
                }

                // Insert fragment into document
                me.dom.parentNode.insertBefore(insertEl.dom, isAfter ? me.dom.nextSibling : me.dom);
                return rt;
            }

            el = el || {};

            if (el.nodeType || el.dom) {
                rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
                if (!returnDom) {
                    rt = Ext.get(rt);
                }
            } else {
                if (isAfter && !me.dom.nextSibling) {
                    rt = DomHelper.append(me.dom.parentNode, el, !returnDom);
                } else {
                    rt = DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
                }
            }
            return rt;
        },

        /**
         * Returns `true` if this element matches the passed simple selector
         * (e.g. 'div.some-class' or 'span:first-child').
         * @param {String/Function} selector The simple selector to test or a function which is passed
         * candidate nodes, and should return `true` for nodes which match.
         * @return {Boolean} `true` if this element matches the selector, else `false`.
         */
        is: function(selector) {
            var dom = this.dom,
                is;

            if (!selector) {
                // In Ext 4 is() called through to DomQuery methods, and would always
                // return true if the selector was ''.  The new query() method in v5 uses
                // querySelector/querySelectorAll() which consider '' to be an invalid
                // selector and throw an error as a result.  To maintain compatibility
                // with the various users of is() we have to return true if the selector
                // is an empty string.  For example: el.up('') should return the element's
                // direct parent.
                is = true;
            } else if (!dom.tagName) {
                // document and window objects can never match a selector
                is = false;
            } else if (Ext.isFunction(selector)) {
                is = selector(dom);
            } else {
                is = dom[Ext.supports.matchesSelector](selector);
            }

            return is;
        },

        /**
         * Returns `true` if this element is an ancestor of the passed element
         * @param {String/HTMLElement/Ext.dom.Element} el The element or id of the element
         * to search for in this elements descendants.
         * @return {Boolean}
         */
        isAncestor: function(el) {
            var ret = false,
                dom = this.dom,
                child = Ext.getDom(el);

            if (dom && child) {
                if (dom.contains) {
                    return dom.contains(child);
                } else if (dom.compareDocumentPosition) {
                    return !!(dom.compareDocumentPosition(child) & 16);
                } else {
                    while ((child = child.parentNode)) {
                        ret = child === dom || ret;
                    }
                }
            }
            return ret;
        },

        isPainted: (function() {
            return !Ext.browser.is.IE ? function() {
                var dom = this.dom;
                return Boolean(dom && dom.offsetParent);
            } : function() {
                var dom = this.dom;
                return Boolean(dom && (dom.offsetHeight !== 0 && dom.offsetWidth !== 0));
            };
        })(),

        /**
         * Returns true if this element is scrollable.
         * @return {Boolean}
         */
        isScrollable: function() {
            var dom = this.dom;
            return dom.scrollHeight > dom.clientHeight || dom.scrollWidth > dom.clientWidth;
        },

        /**
         * Checks if the current value of a style is equal to a given value.
         * @param {String} style property whose value is returned.
         * @param {String} value to check against.
         * @return {Boolean} `true` for when the current value equals the given value.
         */
        isStyle: function(style, val) {
            return this.getStyle(style) === val;
        },

        /**
         * Checks whether the element is currently visible using both visibility and display properties.
         * @param {Boolean} [deep=false] True to walk the dom and see if parent elements are hidden.
         * If false, the function only checks the visibility of the element itself and it may return
         * `true` even though a parent is not visible.
         * @return {Boolean} `true` if the element is currently visible, else `false`
         */
        isVisible: function(deep) {
            var dom = this.dom,
                end;

            if (!dom) {
                return false;
            }
            if (!visFly) {
                visFly = new Ext.dom.Fly();
            }

            for (end = dom.ownerDocument.documentElement; dom !== end; dom = dom.parentNode) {
                // We're invisible if we hit a nonexistent parentNode or a document
                // fragment or computed style visibility:hidden or display:none
                if (!dom || dom.nodeType === 11 || (visFly.attach(dom)).isStyle(VISIBILITY, HIDDEN) || visFly.isStyle(DISPLAY, NONE)) {
                    return false;
                }
                // Quit now unless we are being asked to check parent nodes.
                if (!deep) {
                    break;
                }
            }

            return true;
        },

        /**
         * Gets the last child, skipping text nodes
         * @param {String} [selector] Find the previous sibling that matches the passed simple selector.
         * See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Boolean} [returnDom=false] `true` to return a raw DOM node instead of an Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The last child Ext.dom.Element (or 
         * HTMLElement if _returnDom_ is _true_).  Or null if no match is found.
         */
        last: function(selector, returnDom) {
            return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
        },

        /**
         * @cfg listeners
         * @hide
         */
        matchNode: function(dir, start, selector, returnDom) {
            var dom = this.dom,
                n;

            if (!dom) {
                return null;
            }

            n = dom[start];
            while (n) {
                if (n.nodeType === 1 && (!selector || Ext.fly(n, '_matchNode').is(selector))) {
                    return !returnDom ? Ext.get(n) : n;
                }
                n = n[dir];
            }
            return null;
        },

        /**
         * Monitors this Element for the mouse leaving. Calls the function after the specified delay only if
         * the mouse was not moved back into the Element within the delay. If the mouse *was* moved
         * back in, the function is not called.
         * @param {Number} delay The delay **in milliseconds** to wait for possible mouse re-entry before calling the handler function.
         * @param {Function} handler The function to call if the mouse remains outside of this Element for the specified time.
         * @param {Object} [scope] The scope (`this` reference) in which the handler function executes. Defaults to this Element.
         * @return {Object} The listeners object which was added to this element so that monitoring can be stopped. Example usage:
         *
         *     // Hide the menu if the mouse moves out for 250ms or more
         *     this.mouseLeaveMonitor = this.menuEl.monitorMouseLeave(250, this.hideMenu, this);
         *
         *     ...
         *     // Remove mouseleave monitor on menu destroy
         *     this.mouseLeaveMonitor.destroy();
         *
         */
        monitorMouseLeave: function(delay, handler, scope) {
            var me = this,
                timer,
                listeners = {
                    mouseleave: function(e) {
                        if (Ext.isIE9m) {
                            e.enableIEAsync();
                        }
                        timer = Ext.defer(handler, delay, scope || me, [
                            e
                        ]);
                    },
                    mouseenter: function() {
                        clearTimeout(timer);
                    },
                    destroy: function() {
                        clearTimeout(timer);
                        me.un(listeners);
                    }
                };
            me.on(listeners);
            return listeners;
        },

        /**
         * Gets the next sibling, skipping text nodes
         * @param {String} [selector] Find the next sibling that matches the passed simple selector.
         * See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Boolean} [returnDom=false] `true` to return a raw dom node instead of an Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The next sibling Ext.dom.Element (or 
         * HTMLElement if _asDom_ is _true_).  Or null if no match is found.
         */
        next: function(selector, returnDom) {
            return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
        },

        /**
         * Gets the parent node for this element, optionally chaining up trying to match a selector
         * @param {String} [selector] Find a parent node that matches the passed simple selector.
         * See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Boolean} [returnDom=false] True to return a raw dom node instead of an Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The parent node (Ext.dom.Element or 
         * HTMLElement if _returnDom_ is _true_).  Or null if no match is found.
         */
        parent: function(selector, returnDom) {
            return this.matchNode('parentNode', 'parentNode', selector, returnDom);
        },

        /**
         * Initializes positioning on this element. If a desired position is not passed,
         * it will make the the element positioned relative IF it is not already positioned.
         * @param {String} [pos] Positioning to use "relative", "absolute" or "fixed"
         * @param {Number} [zIndex] The zIndex to apply
         * @param {Number} [x] Set the page X position
         * @param {Number} [y] Set the page Y position
         */
        position: function(pos, zIndex, x, y) {
            var me = this;

            if (me.dom.tagName !== 'BODY') {
                if (!pos && me.isStyle(POSITION, STATIC)) {
                    me.setStyle(POSITION, RELATIVE);
                } else if (pos) {
                    me.setStyle(POSITION, pos);
                }
                if (zIndex) {
                    me.setStyle(ZINDEX, zIndex);
                }
                if (x || y) {
                    me.setXY([x || false, y || false]);
                }
            }
        },

        /**
         * Gets the previous sibling, skipping text nodes
         * @param {String} [selector] Find the previous sibling that matches the passed simple selector.
         * See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Boolean} [returnDom=false] `true` to return a raw DOM node instead of an Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The previous sibling (Ext.dom.Element or 
         * HTMLElement if _returnDom_ is _true_).  Or null if no match is found.
         */
        prev: function(selector, returnDom) {
            return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
        },

        /**
         * Selects child nodes based on the passed CSS selector.
         * Delegates to document.querySelectorAll. More information can be found at
         * [http://www.w3.org/TR/css3-selectors/](http://www.w3.org/TR/css3-selectors/)
         *
         * All selectors, attribute filters and pseudos below can be combined infinitely
         * in any order. For example `div.foo:nth-child(odd)[@foo=bar].bar:first` would be
         * a perfectly valid selector.
         *
         * ## Element Selectors:
         *
         * * \* any element
         * * E an element with the tag E
         * * E F All descendant elements of E that have the tag F
         * * E > F or E/F all direct children elements of E that have the tag F
         * * E + F all elements with the tag F that are immediately preceded by an element with the tag E
         * * E ~ F all elements with the tag F that are preceded by a sibling element with the tag E
         *
         * ## Attribute Selectors:
         *
         * The use of @ and quotes are optional. For example, div[@foo='bar'] is also a valid attribute selector.
         *
         * * E[foo] has an attribute "foo"
         * * E[foo=bar] has an attribute "foo" that equals "bar"
         * * E[foo^=bar] has an attribute "foo" that starts with "bar"
         * * E[foo$=bar] has an attribute "foo" that ends with "bar"
         * * E[foo*=bar] has an attribute "foo" that contains the substring "bar"
         * * E[foo%=2] has an attribute "foo" that is evenly divisible by 2
         * * E[foo!=bar] has an attribute "foo" that does not equal "bar"
         *
         * ## Pseudo Classes:
         *
         * * E:first-child E is the first child of its parent
         * * E:last-child E is the last child of its parent
         * * E:nth-child(n) E is the nth child of its parent (1 based as per the spec)
         * * E:nth-child(odd) E is an odd child of its parent
         * * E:nth-child(even) E is an even child of its parent
         * * E:only-child E is the only child of its parent
         * * E:checked E is an element that is has a checked attribute that is true (e.g. a radio or checkbox)
         * * E:first the first E in the resultset
         * * E:last the last E in the resultset
         * * E:nth(n) the nth E in the resultset (1 based)
         * * E:odd shortcut for :nth-child(odd)
         * * E:even shortcut for :nth-child(even)
         * * E:not(S) an E element that does not match simple selector S
         * * E:has(S) an E element that has a descendant that matches simple selector S
         * * E:next(S) an E element whose next sibling matches simple selector S
         * * E:prev(S) an E element whose previous sibling matches simple selector S
         * * E:any(S1|S2|S2) an E element which matches any of the simple selectors S1, S2 or S3//\\
         *
         * ## CSS Value Selectors:
         *
         * * E{display=none} CSS value "display" that equals "none"
         * * E{display^=none} CSS value "display" that starts with "none"
         * * E{display$=none} CSS value "display" that ends with "none"
         * * E{display*=none} CSS value "display" that contains the substring "none"
         * * E{display%=2} CSS value "display" that is evenly divisible by 2
         * * E{display!=none} CSS value "display" that does not equal "none"
         *
         * @param {String} selector The CSS selector.
         * @param {Boolean} [asDom=true] `false` to return an array of Ext.dom.Element
         * @return {HTMLElement[]/Ext.dom.Element[]} An Array of elements (
         * HTMLElement or Ext.dom.Element if _asDom_ is _false_) that match the selector.  
         * If there are no matches, an empty Array is returned.
         */
        query: function(selector, asDom, /* private */ single) {
            var dom = this.dom,
                results, len, nlen, node, nodes, i, j;

            if (!dom) {
                return null;
            }

            asDom = (asDom !== false);

            selector = selector.split(",");

            if (!single) {
                // only allocate the results array if the full result set is being
                // requested.  selectNode() uses the 'single' param.
                results = [];
            }

            for (i = 0, len = selector.length; i <  len; i++) {
                if (typeof selector[i] === 'string') {
                    if (single) {
                        // take the "fast path" if single was requested (selectNode)
                        node = dom.querySelector(selector[i]);
                        return asDom ? node : Ext.get(node);
                    }

                    nodes = dom.querySelectorAll(selector[i]);

                    for (j = 0, nlen = nodes.length; j < nlen; j++) {
                        results.push(asDom ? nodes[j] : Ext.get(nodes[j]));
                    }
                }
            }

            return results;
        },

        /**
         * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
         * @param {String/String[]} className The CSS class to add, or an array of classes.
         * @return {Ext.dom.Element} this
         */
        radioCls: function(className) {
            var cn = this.dom.parentNode.childNodes,
                v;

            className = Ext.isArray(className) ? className : [className];
            for (var i = 0, len = cn.length; i < len; i++) {
                v = cn[i];
                if (v && v.nodeType === 1) {
                    Ext.fly(v).removeCls(className);
                }
            }
            return this.addCls(className);
        },

        redraw: function() {
            var dom = this.dom,
                domStyle = dom.style;

            domStyle.display = 'none';
            dom.offsetHeight;
            domStyle.display = '';
        },

        /**
         * @inheritdoc Ext.dom.Element#destroy
         * @deprecated 5.0.0 Please use {@link #destroy} instead.
         */
        remove: function () {
            this.destroy();
        },

        removeChild: function(element) {
            this.dom.removeChild(Ext.getDom(element));

            return this;
        },

        /**
         * Removes the given CSS class(es) from this Element.
         * @param {String/String[]} names The CSS classes to remove separated by space,
         * or an array of classes
         * @param {String} [prefix] Prefix to prepend to each class. The separator `-` will be 
         * appended to the prefix.
         * @param {String} [suffix] Suffix to append to each class. The separator `-` will be 
         * prepended to the suffix.
         * return {Ext.dom.Element} this
         */
        removeCls: function(names, prefix, suffix) {
            var me = this,
                elementData = me.getData(),
                hasNewCls, dom, map, classList, i, ln, name;

            if (!names) {
                return me;
            }

            if (!elementData.isSynchronized) {
                me.synchronize();
            }

            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;

            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';

            if (typeof names === 'string') {
                names = names.split(spacesRe);
            }

            for (i = 0, ln = names.length; i < ln; i++) {
                name = names[i];
                if (name) {
                    name = prefix + name + suffix;

                    if (map[name]) {
                        delete map[name];
                        Ext.Array.remove(classList, name);
                        hasNewCls = true;
                    }
                }
            }

            if (hasNewCls) {
                dom.className = classList.join(' ');
            }

            return me;
        },

        /**
         * Forces the browser to repaint this element.
         * @return {Ext.dom.Element} this
         */
        repaint: function() {
            var me = this;
            me.addCls(Ext.baseCSSPrefix + 'repaint');
            Ext.defer(function() {
                if(me.dom) {  //may have been removed already on slower UAs
                    Ext.fly(me.dom).removeCls(Ext.baseCSSPrefix + 'repaint');
                }
            }, 1);
            return me;
        },

        /**
         * Replaces the passed element with this element
         * @param {String/HTMLElement/Ext.dom.Element} el The element to replace.
         * The id of the node, a DOM Node or an existing Element.
         * @param {Boolean} [destroy=true] `false` to prevent destruction of the replaced
         * element
         * @return {Ext.dom.Element} This element
         */
        replace: function(el, destroy) {
            el = Ext.getDom(el);
            var parentNode = el.parentNode,
                id = el.id,
                dom = this.dom;

            //<debug>
            if (!parentNode) {
                Ext.raise('Cannot replace element "' + id +
                    '". It is not attached to a parent node.');
            }
            //</debug>

            if (destroy !== false && id && Ext.cache[id]) {
                parentNode.insertBefore(dom, el);
                Ext.get(el).destroy();
            } else {
                parentNode.replaceChild(dom, el);
            }

            return this;
        },

        /**
         * Replaces a CSS class on the element with another.
         * If the old name does not exist, the new name will simply be added.
         * @param {String} oldName The CSS class to replace.
         * @param {String} newName The replacement CSS class.
         * @param {String} [prefix=''] Prefix to prepend to each class to be replaced.
         * @param {String} [suffix=''] Suffix to append to each class to be replaced.
         * @return {Ext.dom.Element} this
         */
        replaceCls: function(oldName, newName, prefix, suffix) {
            var me = this,
                dom, map, classList, i, ln, name,
                elementData = me.getData(),
                change;

            if (!oldName && !newName) {
                return me;
            }

            oldName = oldName || [];
            newName = newName || [];

            if (!elementData.isSynchronized) {
                me.synchronize();
            }

            if (!suffix) {
                suffix = '';
            }

            dom = me.dom;
            map = elementData.classMap;
            classList = elementData.classList;

            prefix = prefix ? prefix + SEPARATOR : '';
            suffix = suffix ? SEPARATOR + suffix : '';

            if (typeof oldName === 'string') {
                oldName = oldName.split(spacesRe);
            }
            if (typeof newName === 'string') {
                newName = newName.split(spacesRe);
            }

            for (i = 0, ln = oldName.length; i < ln; i++) {
                name = prefix + oldName[i] + suffix;

                if (map[name]) {
                    delete map[name];
                    change = true;
                }
            }

            for (i = 0, ln = newName.length; i < ln; i++) {
                name = prefix + newName[i] + suffix;

                if (!map[name]) {
                    map[name] = true;
                    change = true;
                }
            }

            if (change) {
                elementData.classList = classList = Ext.Object.getKeys(map);
                dom.className = classList.join(' ');
            }

            return me;
        },

        /**
         * Replaces this element with the passed element
         * @param {String/HTMLElement/Ext.dom.Element/Object} el The new element (id of the
         * node, a DOM Node or an existing Element) or a DomHelper config of an element to create
         * @return {Ext.dom.Element} This element
         */
        replaceWith: function(el){
            var me = this,
                dom = me.dom,
                parent = dom.parentNode,
                cache = Ext.cache,
                newDom;

            me.clearListeners();

            if (el.nodeType || el.dom || typeof el === 'string') {
                el = Ext.get(el);
                newDom = parent.insertBefore(el.dom, dom);
            } else {
                // domhelper config
                newDom = Ext.DomHelper.insertBefore(dom, el);
            }
            parent.removeChild(dom);

            me.dom = newDom;
            if (!me.isFly) {
                delete cache[me.id];
                cache[me.id = Ext.id(newDom)] = me;
            }

            return me;
        },

        resolveListenerScope: function (defaultScope) {
            // Override this to pass along to our owning component (if we have one).
            var component = this.component;
            return component ? component.resolveListenerScope(defaultScope) : this;
        },

        /**
         * Scrolls this element the specified direction. Does bounds checking to make sure the scroll is
         * within this element's scrollable range.
         * @param {String} direction Possible values are:
         *
         * - `"l"` (or `"left"`)
         * - `"r"` (or `"right"`)
         * - `"t"` (or `"top"`, or `"up"`)
         * - `"b"` (or `"bottom"`, or `"down"`)
         *
         * @param {Number} distance How far to scroll the element in pixels
         * @param {Boolean/Object} [animate] true for the default animation or a standard Element
         * animation config object
         * @return {Boolean} Returns true if a scroll was triggered or false if the element
         * was scrolled as far as it could go.
         */
        scroll: function(direction, distance, animate) {
            if (!this.isScrollable()) {
                return false;
            }

            // Allow full word, or initial to be sent.
            // (Ext.dd package uses full word)
            direction = direction.charAt(0);
            var me = this,
                dom = me.dom,
                side = direction === 'r' || direction === 'l' ? 'left' : 'top',
                scrolled = false,
                currentScroll, constrainedScroll;

            if (direction === 'l' || direction === 't' || direction === 'u') {
                distance = -distance;
            }

            if (side === 'left') {
                currentScroll = dom.scrollLeft;
                constrainedScroll = me.constrainScrollLeft(currentScroll + distance);
            } else {
                currentScroll = dom.scrollTop;
                constrainedScroll = me.constrainScrollTop(currentScroll + distance);
            }

            if (constrainedScroll !== currentScroll) {
                this.scrollTo(side, constrainedScroll, animate);
                scrolled = true;
            }

            return scrolled;
        },

        /**
         * Scrolls this element by the passed delta values, optionally animating.
         *
         * All of the following are equivalent:
         *
         *      el.scrollBy(10, 10, true);
         *      el.scrollBy([10, 10], true);
         *      el.scrollBy({ x: 10, y: 10 }, true);
         *
         * @param {Number/Number[]/Object} deltaX Either the x delta, an Array specifying x and y deltas or
         * an object with "x" and "y" properties.
         * @param {Number/Boolean/Object} deltaY Either the y delta, or an animate flag or config object.
         * @param {Boolean/Object} animate Animate flag/config object if the delta values were passed separately.
         * @return {Ext.dom.Element} this
         */
        scrollBy: function(deltaX, deltaY, animate) {
            var me = this,
                dom = me.dom;

            // Extract args if deltas were passed as an Array.
            if (deltaX.length) {
                animate = deltaY;
                deltaY = deltaX[1];
                deltaX = deltaX[0];
            } else if (typeof deltaX != 'number') { // or an object
                animate = deltaY;
                deltaY = deltaX.y;
                deltaX = deltaX.x;
            }

            if (deltaX) {
                me.scrollTo('left', me.constrainScrollLeft(dom.scrollLeft + deltaX), animate);
            }
            if (deltaY) {
                me.scrollTo('top', me.constrainScrollTop(dom.scrollTop + deltaY), animate);
            }

            return me;
        },

        /**
         * @private
         */
        scrollChildIntoView: function(child, hscroll) {
            // scrollFly is used inside scrollInfoView, must use a method-unique fly here
            Ext.fly(child).scrollIntoView(this, hscroll);
        },

        /**
         * Scrolls this element into view within the passed container.
         *
         *       Ext.create('Ext.data.Store', {
         *           storeId:'simpsonsStore',
         *           fields:['name', 'email', 'phone'],
         *           data:{'items':[
         *               { 'name': 'Lisa',  "email":"lisa@simpsons.com",  "phone":"555-111-1224"  },
         *               { 'name': 'Bart',  "email":"bart@simpsons.com",  "phone":"555-222-1234" },
         *               { 'name': 'Homer', "email":"homer@simpsons.com",  "phone":"555-222-1244"  },
         *               { 'name': 'Marge', "email":"marge@simpsons.com", "phone":"555-222-1254"  },
         *               { 'name': 'Milhouse', "email":"milhouse@simpsons.com",  "phone":"555-222-1244"  },
         *               { 'name': 'Willy', "email":"willy@simpsons.com", "phone":"555-222-1254"  },
         *               { 'name': 'Skinner', "email":"skinner@simpsons.com",  "phone":"555-222-1244"  },
         *               { 'name': 'Hank (last row)', "email":"hank@simpsons.com", "phone":"555-222-1254"  }
         *           ]},
         *           proxy: {
         *               type: 'memory',
         *               reader: {
         *                   type: 'json',
         *                   rootProperty: 'items'
         *               }
         *           }
         *       });
         *
         *       var grid = Ext.create('Ext.grid.Panel', {
         *           title: 'Simpsons',
         *           store: Ext.data.StoreManager.lookup('simpsonsStore'),
         *           columns: [
         *               { text: 'Name',  dataIndex: 'name', width: 125 },
         *               { text: 'Email', dataIndex: 'email', flex: 1 },
         *               { text: 'Phone', dataIndex: 'phone' }
         *           ],
         *           height: 190,
         *           width: 400,
         *           renderTo: Ext.getBody(),
         *           tbar: [{
         *               text: 'Scroll row 7 into view',
         *               handler: function () {
         *                   var view = grid.getView();
         *
         *                   Ext.get(view.getRow(7)).scrollIntoView(view.getEl(), null, true);
         *               }
         *           }]
         *       });
         *
         * @param {String/HTMLElement/Ext.Element} [container=document.body] The container element
         * to scroll.  Should be a string (id), dom node, or Ext.Element.
         * @param {Boolean} [hscroll=true] False to disable horizontal scroll.
         * @param {Boolean/Object} [animate] true for the default animation or a standard Element
         * animation config object
         * @param {Boolean} [highlight=false] true to {@link #highlight} the element when it is in view.
         * @return {Ext.dom.Element} this
         */
        scrollIntoView: function(container, hscroll, animate, highlight) {
            container = Ext.getDom(container) || Ext.getBody().dom;

            return this.doScrollIntoView(
                container,
                hscroll,
                animate,
                highlight,
                'getScrollLeft',
                'scrollTo'
            );
        },

        /**
         * Scrolls this element the specified scroll point. It does NOT do bounds checking so
         * if you scroll to a weird value it will try to do it. For auto bounds checking, use #scroll.
         * @param {String} side Either "left" for scrollLeft values or "top" for scrollTop values.
         * @param {Number} value The new scroll value
         * @param {Boolean/Object} [animate] true for the default animation or a standard Element
         * animation config object
         * @return {Ext.dom.Element} this
         */
        scrollTo: function(side, value, animate) {
            //check if we're scrolling top or left
            var top = topRe.test(side),
                me = this,
                prop = top ? 'scrollTop' : 'scrollLeft',
                dom = me.dom,
                animCfg;

            if (!animate || !me.anim) {
                // just setting the value, so grab the direction
                dom[prop] = value;
                // corrects IE, other browsers will ignore
                dom[prop] = value;
            } else {
                animCfg = {
                    to: {}
                };
                animCfg.to[prop] = value;
                if (Ext.isObject(animate)) {
                    Ext.applyIf(animCfg, animate);
                }
                me.animate(animCfg);
            }
            return me;
        },

        /**
         * Selects descendant elements of this element based on the passed CSS selector to
         * enable {@link Ext.dom.Element Element} methods to be applied to many related
         * elements in one statement through the returned
         * {@link Ext.dom.CompositeElementLite CompositeElementLite} object.
         *
         * @param {String/HTMLElement[]} selector The CSS selector or an array of elements
         * @param {Boolean} composite Return a CompositeElement as opposed to a
         * CompositeElementLite. Defaults to false.
         * @return {Ext.dom.CompositeElementLite/Ext.dom.CompositeElement}
         */
        select: function(selector, composite) {
            var isElementArray, elements;

            if (typeof selector === "string") {
                elements = this.query(selector, !composite);
            }
            //<debug>
            else if (selector.length === undefined) {
                Ext.raise("Invalid selector specified: " + selector);
            }
            //</debug>
            else {
                // if selector is not a string, assume it is already an array of
                // HTMLElement
                elements = selector;
                isElementArray = true;
            }

            // if the selector parameter was a string we will have called through
            // to query, and it will have constructed either an array of
            // HTMLElement or Ext.Element, depending on the composite param we gave
            // it.  If this is the case we can take the fast path through the 
            // CompositeElementLite constructor to avoid calling getDom() or get()
            // on every element in the array.
            return composite ? new Ext.CompositeElement(elements, !isElementArray) :
                new Ext.CompositeElementLite(elements, true);
        },

        /**
         * Selects a single descendant element of this element using a CSS selector
         * (see {@link #query}).
         * @param {String} selector The selector query
         * @param {Boolean} [asDom=true] `false` to return an Ext.dom.Element
         * @return {HTMLElement/Ext.dom.Element} The DOM element (or Ext.dom.Element if 
         * _asDom_ is _false_) which matched the selector.
         */
        selectNode: function(selector, asDom) {
            return this.query(selector, asDom, true);
        },

        /**
         * Sets the passed attributes as attributes of this element (a `style` attribute 
         * can be a string, object or function).
         * 
         * Example component (though any Ext.dom.Element would suffice):
         * 
         *     var cmp = Ext.create({
         *         xtype: 'component',
         *         html: 'test',
         *         renderTo: Ext.getBody()
         *     });
         * 
         * Once the component is rendered, you can fetch a reference to its outer 
         * element to use `set`:
         * 
         *     cmp.el.set({
         *         foo: 'bar'
         *     });
         * 
         * This sets an attribute on the element of **foo="bar"**:
         * 
         *     <div class="x-component x-component-default x-border-box" id="component-1009" foo="bar">test</div>
         * 
         * To remove the attribute pass a value of **undefined**:
         * 
         *     cmp.el.set({
         *         foo: undefined
         *     });
         * 
         * **Note:**
         * 
         *  - You cannot remove an attribute by passing `undefined` when the 
         * `expandos` param is set to **false**.
         *  - Passing an attribute of `style` results in the request being handed off to 
         * {@link #method-applyStyles}.
         *  - Passing an attribute of `cls` results in the element's dom's 
         * [className](http://www.w3schools.com/jsref/prop_html_classname.asp) property 
         * being set directly.  For additional flexibility when setting / removing 
         * classes see: 
         *     - {@link #method-addCls}
         *     - {@link #method-removeCls}
         *     - {@link #method-replaceCls}
         *     - {@link #method-setCls}
         *     - {@link #method-toggleCls}
         * 
         * @param {Object} attributes The object with the attributes.
         * @param {Boolean} [useSet=true] `false` to override the default `setAttribute` 
         * to use [expandos](http://help.dottoro.com/ljvovanq.php).
         * @return {Ext.dom.Element} this
         */
        set: function(attributes, useSet) {
            var me = this,
                dom = me.dom,
                attribute, value;

            for (attribute in attributes) {
                if (attributes.hasOwnProperty(attribute)) {
                    value = attributes[attribute];

                    if (attribute === 'style') {
                        me.applyStyles(value);
                    }
                    else if (attribute === 'cls') {
                        dom.className = value;
                    }
                    else if (useSet !== false) {
                        if (value === undefined) {
                            dom.removeAttribute(attribute);
                        } else {
                            dom.setAttribute(attribute, value);
                        }
                    }
                    else {
                        dom[attribute] = value;
                    }
                }
            }

            return me;
        },

        /**
         * Sets the element's CSS bottom style.
         * @param {Number/String} bottom Number of pixels or CSS string value to set as
         * the bottom CSS property value
         * @return {Ext.dom.Element} this
         */
        setBottom: function(bottom) {
            this.dom.style[BOTTOM] = Element.addUnits(bottom);
            return this;
        },

        /**
         * Sets the specified CSS class on this element's DOM node.
         * @param {String/String[]} className The CSS class to set on this element.
         */
        setCls: function(className) {
            var me = this,
                elementData = me.getData(),
                i, ln, name, map, classList;

            if (!elementData.isSynchronized) {
                me.synchronize();
            }

            if (typeof className === 'string') {
                className = className.split(spacesRe);
            }

            elementData.classList = classList = className.slice();
            elementData.classMap = map = {};

            for (i = 0, ln = classList.length; i < ln; i++) {
                map[classList[i]] = true;
            }
            me.dom.className = classList.join(' ');
        },

        /**
         * Sets the CSS display property. Uses originalDisplay if the specified value is a
         * boolean true.
         * @param {Boolean/String} value Boolean value to display the element using its
         * default display, or a string to set the display directly.
         * @return {Ext.dom.Element} this
         */
        setDisplayed: function(value) {
            var me = this;

            if (typeof value === "boolean"){
                value = value ? me._getDisplay() : NONE;
            }
            me.setStyle(DISPLAY, value);

            if (me.shadow || me.shim) {
                me.setUnderlaysVisible(value !== NONE);
            }

            return me;
        },

        /**
         * Set the height of this Element.
         * @param {Number/String} height The new height.
         * @return {Ext.dom.Element} this
         */
        setHeight: function(height) {
            var me = this;

            me.dom.style[HEIGHT] = Element.addUnits(height);

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        /**
         * Sets the `innerHTML` of this element.
         * @param {String} html The new HTML.
         * @return {Ext.dom.Element} this
         */
        setHtml: function(html) {
            if (this.dom) {
                this.dom.innerHTML = html;
            }
            return this;
        },

        setId: function(id) {
            var me = this,
                currentId = me.id,
                cache = Ext.cache;

            if (currentId) {
                delete cache[currentId];
            }

            me.dom.id = id;

            /**
             * The DOM element ID
             * @property id
             * @type String
             */
            me.id = id;

            cache[id] = me;

            return me;
        },

        /**
         * Sets the element's left position directly using CSS style
         * (instead of {@link #setX}).
         * @param {Number/String} left Number of pixels or CSS string value to
         * set as the left CSS property value
         * @return {Ext.dom.Element} this
         */
        setLeft: function(left) {
            var me = this;

            me.dom.style[LEFT] = Element.addUnits(left);

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        setLocalX: function(x) {
            var me = this,
                style = me.dom.style;

            // clear right style just in case it was previously set by rtlSetLocalXY
            style.right = 'auto';
            style.left = (x === null) ? 'auto' : x + 'px';

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        setLocalXY: function(x, y) {
            var me = this,
                style = me.dom.style;

            // clear right style just in case it was previously set by rtlSetLocalXY
            style.right = 'auto';

            if (x && x.length) {
                y = x[1];
                x = x[0];
            }

            if (x === null) {
                style.left = 'auto';
            } else if (x !== undefined) {
                style.left = x + 'px';
            }

            if (y === null) {
                style.top = 'auto';
            } else if (y !== undefined) {
                style.top = y + 'px';
            }

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        setLocalY: function(y) {
            var me = this;

            me.dom.style.top = (y === null) ? 'auto' : y + 'px';

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        setMargin: function(margin) {
            var me = this,
                domStyle = me.dom.style;

            if (margin || margin === 0) {
                margin = me.self.unitizeBox((margin === true) ? 5 : margin);
                domStyle.setProperty('margin', margin, 'important');
            }
            else {
                domStyle.removeProperty('margin-top');
                domStyle.removeProperty('margin-right');
                domStyle.removeProperty('margin-bottom');
                domStyle.removeProperty('margin-left');
            }
        },

        /**
         * Set the maximum height of this Element.
         * @param {Number/String} height The new maximum height.
         * @return {Ext.dom.Element} this
         */
        setMaxHeight: function(height) {
            this.dom.style[MAX_HEIGHT] = Element.addUnits(height);
            return this;
        },

        /**
         * Set the maximum width of this Element.
         * @param {Number/String} width The new maximum width.
         * @return {Ext.dom.Element} this
         */
        setMaxWidth: function(width) {
            this.dom.style[MAX_WIDTH] = Element.addUnits(width);
            return this;
        },

        /**
         * Set the minimum height of this Element.
         * @param {Number/String} height The new minimum height.
         * @return {Ext.dom.Element} this
         */
        setMinHeight: function(height) {
            this.dom.style[MIN_HEIGHT] = Element.addUnits(height);
            return this;
        },

        /**
         * Set the minimum width of this Element.
         * @param {Number/String} width The new minimum width.
         * @return {Ext.dom.Element} this
         */
        setMinWidth: function(width) {
            this.dom.style[MIN_WIDTH] = Element.addUnits(width);
            return this;
        },

        /**
         * Set the opacity of the element
         * @param {Number} opacity The new opacity. 0 = transparent, .5 = 50% visibile, 1 = fully visible, etc
         * @return {Ext.dom.Element} this
         */
        setOpacity: function(opacity) {
            var me = this;

            if (me.dom) {
                me.setStyle('opacity', opacity);
            }

            return me;
        },

        setPadding: function(padding) {
            var me = this,
                domStyle = me.dom.style;

            if (padding || padding === 0) {
                padding = me.self.unitizeBox((padding === true) ? 5 : padding);
                domStyle.setProperty('padding', padding, 'important');
            }
            else {
                domStyle.removeProperty('padding-top');
                domStyle.removeProperty('padding-right');
                domStyle.removeProperty('padding-bottom');
                domStyle.removeProperty('padding-left');
            }
        },

        /**
         * Sets the element's CSS right style.
         * @param {Number/String} right Number of pixels or CSS string value to
         * set as the right CSS property value
         * @return {Ext.dom.Element} this
         */
        setRight: function(right) {
            this.dom.style[RIGHT] = Element.addUnits(right);
            return this;
        },

        /**
         * Sets the left scroll position
         * @param {Number} left The left scroll position
         * @return {Ext.dom.Element} this
         */
        setScrollLeft: function(left) {
            this.dom.scrollLeft = left;
            return this;
        },

        /**
         * Sets the top scroll position
         * @param {Number} top The top scroll position
         * @return {Ext.dom.Element} this
         */
        setScrollTop: function(top) {
            this.dom.scrollTop = top;
            return this;
        },

        /**
         * Set the size of this Element.
         *
         * @param {Number/String} width The new width. This may be one of:
         *
         * - A Number specifying the new width in pixels.
         * - A String used to set the CSS width style. Animation may **not** be used.
         * - A size object in the format `{width: widthValue, height: heightValue}`.
         *
         * @param {Number/String} height The new height. This may be one of:
         *
         * - A Number specifying the new height in pixels.
         * - A String used to set the CSS height style. Animation may **not** be used.
         * @return {Ext.dom.Element} this
         */
        setSize: function(width, height) {
            var me = this,
                style = me.dom.style;

            if (Ext.isObject(width)) {
                // in case of object from getSize()
                height = width.height;
                width = width.width;
            }

            style.width = Element.addUnits(width);
            style.height = Element.addUnits(height);

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        setSizeState: function(state) {
            var me = this,
                add, remove;

            if (state === true) {
                add = sizedCls;
                remove = [unsizedCls, stretchedCls];
            } else if (state === false) {
                add = unsizedCls;
                remove = [sizedCls, stretchedCls];
            } else if (state === null) {
                add = stretchedCls;
                remove = [sizedCls, unsizedCls];
            } else {
                remove = [sizedCls, unsizedCls, stretchedCls];
            }

            if (add) {
                me.addCls(add);
            }
            me.removeCls(remove);
            return me;
        },

        /**
         * Wrapper for setting style properties, also takes single object parameter of 
         * multiple styles.
         * 
         * Styles should be a valid DOM element style property.  
         * [Valid style property names](http://www.w3schools.com/jsref/dom_obj_style.asp) 
         * (_along with the supported CSS version for each_)
         * 
         *     // <div id="my-el">Phineas Flynn</div>
         *     
         *     var el = Ext.get('my-el');
         *     
         *     // two-param syntax
         *     el.setStyle('color', 'white');
         *     
         *     // single-param syntax
         *     el.setStyle({
         *         fontWeight: 'bold',
         *         backgroundColor: 'gray',
         *         padding: '10px'
         *     });
         * 
         * @param {String/Object} property The style property to be set, or an object of 
         * multiple styles.
         * @param {String} [value] The value to apply to the given property, or null if 
         * an object was passed.
         * @return {Ext.dom.Element} this
         */
        setStyle: function(prop, value) {
            var me = this,
                dom = me.dom,
                hooks = me.styleHooks,
                style = dom.style,
                name = prop,
                hook;

            // we don't promote the 2-arg form to object-form to avoid the overhead...
            if (typeof name === 'string') {
                hook = hooks[name];
                if (!hook) {
                    hooks[name] = hook = { name: Element.normalize(name) };
                }
                value = (value == null) ? '' : value; // map null && undefined to ''
                if (hook.set) {
                    hook.set(dom, value, me);
                } else {
                    style[hook.name] = value;
                }
                if (hook.afterSet) {
                    hook.afterSet(dom, value, me);
                }
            } else {
                for (name in prop) {
                    if (prop.hasOwnProperty(name)) {
                        hook = hooks[name];
                        if (!hook) {
                            hooks[name] = hook = { name: Element.normalize(name) };
                        }
                        value = prop[name];
                        value = (value == null) ? '' : value; // map null && undefined to ''
                        if (hook.set) {
                            hook.set(dom, value, me);
                        } else {
                            style[hook.name] = value;
                        }
                        if (hook.afterSet) {
                            hook.afterSet(dom, value, me);
                        }
                    }
                }
            }

            return me;
        },

        setText: function(text) {
            this.dom.textContent = text;
        },

        /**
         * Sets the element's top position directly using CSS style
         * (instead of {@link #setY}).
         * @param {Number/String} top Number of pixels or CSS string value to
         * set as the top CSS property value
         * @return {Ext.dom.Element} this
         */
        setTop: function(top) {
            var me = this;

            me.dom.style[TOP] = Element.addUnits(top);

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        /**
         * Sets the CSS {@link https://www.w3.org/TR/pointerevents/#the-touch-action-css-property touch-action}
         * property on this element and emulates its behavior on browsers where touch-action
         * is not supported.
         *
         * @param {Object} touchAction An object with touch-action names as the keys, and
         * boolean values to enable or disable specific touch actions. Accepted keys are:
         *
         * - `panX`
         * - `panY`
         * - `pinchZoom`
         * - `doubleTapZoom`
         *
         * All touch actions are enabled (`true`) by default, so it is usually only necessary
         * to specify which touch actions to disable.  For example, the following disables
         * only vertical scrolling and double-tap-zoom on an element
         *
         *     element.setTouchAction({
         *         panY: false,
         *         doubleTapZoom: false
         *     });
         *
         * @return {Ext.dom.Element} this
         */
        setTouchAction: function(touchAction) {
            Ext.dom.TouchAction.set(this.dom, touchAction);
        },

        setUnderlaysVisible: function(visible) {
            var shadow = this.shadow,
                shim = this.shim;

            if (shadow && !shadow.disabled) {
                if (visible) {
                    shadow.show();
                } else {
                    shadow.hide();
                }
            }

            if (shim && !shim.disabled) {
                if (visible) {
                    shim.show();
                } else {
                    shim.hide();
                }
            }
        },

        /**
         * @private
         */
        setVisibility: function(isVisible) {
            var domStyle = this.dom.style;

            if (isVisible) {
                domStyle.removeProperty('visibility');
            }
            else {
                domStyle.setProperty('visibility', 'hidden', 'important');
            }
        },

        /**
         * Use this to change the visibility mode between {@link #VISIBILITY}, 
         * {@link #DISPLAY}, {@link #OFFSETS}, or {@link #CLIP}.
         *
         * @param {Ext.dom.Element.VISIBILITY/Ext.dom.Element.DISPLAY/Ext.dom.Element.OFFSETS/Ext.dom.Element.CLIP} mode
         * The method by which the element will be {@link #hide hidden} (you can
         * also use the {@link #setVisible} or {@link #toggle} method to toggle element 
         * visibility).
         *
         * @return {Ext.dom.Element} this
         */
        setVisibilityMode: function(mode) {
            //<debug>
            if (mode !== 1 && mode !== 2 && mode !== 3 && mode !== 4) {
                Ext.raise("visibilityMode must be one of the following: " +
                    "Ext.Element.DISPLAY, Ext.Element.VISIBILITY, Ext.Element.OFFSETS, " +
                    "or Ext.Element.CLIP");
            }
            //</debug>
            this.getData().visibilityMode = mode;
            return this;
        },

        /**
         * Sets the visibility of the element based on the current visibility mode. Use
         * {@link #setVisibilityMode} to switch between the following visibility modes:
         *
         * - {@link #DISPLAY} (the default)
         * - {@link #VISIBILITY}
         * - {@link #OFFSETS}
         * - {@link #CLIP}
         *
         * @param {Boolean} visible Whether the element is visible.
         * @return {Ext.dom.Element} this
         */
        setVisible: function(visible) {
            var me = this,
                mode = me.getVisibilityMode(),
                addOrRemove = visible ? 'removeCls' : 'addCls';

            switch (mode) {
                case Element.DISPLAY:
                    me.removeCls([visibilityCls, offsetsCls, clipCls]);
                    me[addOrRemove](displayCls);
                    break;

                case Element.VISIBILITY:
                    me.removeCls([displayCls, offsetsCls, clipCls]);
                    me[addOrRemove](visibilityCls);
                    break;

                case Element.OFFSETS:
                    me.removeCls([visibilityCls, displayCls, clipCls]);
                    me[addOrRemove](offsetsCls);
                    break;
                
                case Element.CLIP:
                    me.removeCls([visibilityCls, displayCls, offsetsCls]);
                    me[addOrRemove](clipCls);
                    break;
            }

            if (me.shadow || me.shim) {
                me.setUnderlaysVisible(visible);
            }

            return me;
        },

        /**
         * Set the width of this Element.
         * @param {Number/String} width The new width.
         * @return {Ext.dom.Element} this
         */
        setWidth: function(width) {
            var me = this;

            me.dom.style[WIDTH] = Element.addUnits(width);

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        /**
         * Sets this Element's page-level x coordinate
         * @param {Number} x
         * @return {Ext.dom.Element} this
         */
        setX: function(x) {
            return this.setXY([x, false]);
        },

        /**
         * Sets this Element's page-level x and y coordinates
         * @param {Number[]} xy
         * @return {Ext.dom.Element} this
         */
        setXY: function(xy) {
            var me = this,
                pts = me.translatePoints(xy),
                style = me.dom.style,
                pos;

            me.position();

            // right position may have been previously set by rtlSetLocalXY 
            // so clear it here just in case.
            style.right = 'auto';
            for (pos in pts) {
                if (!isNaN(pts[pos])) {
                    style[pos] = pts[pos] + 'px';
                }
            }

            if (me.shadow || me.shim) {
                me.syncUnderlays();
            }

            return me;
        },

        /**
         * Sets this Element's page-level y coordinate
         * @param {Number} y
         * @return {Ext.dom.Element} this
         */
        setY: function(y) {
            return this.setXY([false, y]);
        },

        /**
         * Sets the z-index of this Element and synchronizes the z-index of shadow and/or
         * shim if present.
         *
         * @param {Number} zindex The new z-index to set
         * @return {Ext.dom.Element} this
         */
        setZIndex: function(zindex) {
            var me = this;

            if (me.shadow) {
                me.shadow.setZIndex(zindex);
            }

            if (me.shim) {
                me.shim.setZIndex(zindex);
            }

            return me.setStyle('z-index', zindex);
        },

        /**
         * Show this element - Uses display mode to determine whether to use "display",
         * "visibility", "offsets", or "clip". See {@link #setVisible}.
         *
         * @return {Ext.dom.Element} this
         */
        show: function() {
            this.setVisible(true);
            return this;
        },

        /**
         * @private
         * @param {String} firstClass
         * @param {String} secondClass
         * @param {Boolean} flag
         * @param {String} prefix
         * @return {Mixed}
         */
        swapCls: function(firstClass, secondClass, flag, prefix) {
            if (flag === undefined) {
                flag = true;
            }

            var me = this,
                addedClass = flag ? firstClass : secondClass,
                removedClass = flag ? secondClass : firstClass;

            if (removedClass) {
                me.removeCls(prefix ? prefix + '-' + removedClass : removedClass);
            }

            if (addedClass) {
                me.addCls(prefix ? prefix + '-' + addedClass : addedClass);
            }

            return me;
        },

        /**
         * @private
         */
        synchronize: function() {
            var me = this,
                dom = me.dom,
                hasClassMap = {},
                className = dom.className,
                classList, i, ln, name,
                elementData = me.getData();

            if (className && className.length > 0) {
                classList = dom.className.split(classNameSplitRegex);

                for (i = 0, ln = classList.length; i < ln; i++) {
                    name = classList[i];
                    hasClassMap[name] = true;
                }
            }
            else {
                classList = [];
            }

            elementData.classList = classList;
            elementData.classMap = hasClassMap;
            elementData.isSynchronized = true;

            return me;
        },

        /**
         * @private
         */
        syncUnderlays: function() {
            var me = this,
                shadow = me.shadow,
                shim = me.shim,
                dom = me.dom,
                xy, x, y, w, h;

            if (me.isVisible()) {
                xy = me.getXY();
                x = xy[0];
                y = xy[1];
                w = dom.offsetWidth;
                h = dom.offsetHeight;

                if (shadow && !shadow.hidden) {
                    shadow.realign(x, y, w, h);
                }

                if (shim && !shim.hidden) {
                    shim.realign(x, y, w, h);
                }
            }
        },

        /**
         * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
         * @param {String} className The CSS class to toggle.
         * @param {Boolean} [state] If specified as `true`, causes the class to be added. If specified as `false`, causes
         * the class to be removed.
         * @return {Ext.dom.Element} this
         */
        toggleCls: function(className, state){
            if (typeof state !== 'boolean') {
                state = !this.hasCls(className);
            }

            return state ? this.addCls(className) : this.removeCls(className);
        },

        /**
         * Toggles the element's visibility, depending on visibility mode.
         * @return {Ext.dom.Element} this
         */
        toggle: function() {
            this.setVisible(!this.isVisible());
            return this;
        },

        translate: function() {
            var transformStyleName = 'webkitTransform' in DOC.createElement('div').style ? 'webkitTransform' : 'transform';

            return function(x, y, z) {

                x = Math.round(x);
                y = Math.round(y);
                z = Math.round(z);
                this.dom.style[transformStyleName] = 'translate3d(' + (x || 0) + 'px, ' + (y || 0) + 'px, ' + (z || 0) + 'px)';
            };
        }(),

        /**
         * @private
         */
        unwrap: function() {
            var dom = this.dom,
                parentNode = dom.parentNode,
                grandparentNode,
                activeElement = Ext.fly(Ext.Element.getActiveElement()),
                cached, resumeFocus, grannyFly, tabIndex;

            cached = Ext.cache[activeElement.id];
            
            // If the element is in the cache, we need to get the instance so
            // we can suspend events on it. If it's not in the cache, it can't
            // have any events so we don't need to suspend on it.
            if (cached) {
                activeElement = cached;
            }

            if (this.contains(activeElement)) {
                if (cached) {
                    cached.suspendFocusEvents();
                }
                
                resumeFocus = true;
            }
            
            if (parentNode) {
                grandparentNode = parentNode.parentNode;
                
                // See wrap() for the explanation of this jiggery-trickery
                if (resumeFocus) {
                    tabIndex = grandparentNode.getAttribute('tabIndex');
                    
                    grannyFly = Ext.fly(grandparentNode);
                    grannyFly.set({ tabIndex: -1 });
                    grannyFly.suspendFocusEvents();
                    grannyFly.focus();
                }
                
                grandparentNode.insertBefore(dom, parentNode);
                grandparentNode.removeChild(parentNode);
            }
            else {
                grandparentNode = DOC.createDocumentFragment();
                grandparentNode.appendChild(dom);
            }
            
            if (resumeFocus) {
                if (cached) {
                    cached.focus();
                    cached.resumeFocusEvents();
                }
                else {
                    Ext.fly(activeElement).focus();
                }
                
                if (grannyFly) {
                    grannyFly.resumeFocusEvents();
                    grannyFly.set({ tabIndex: tabIndex });
                }
            }

            return this;
        },

        /**.
         * Walks up the dom looking for a parent node that matches the passed simple selector (e.g. 'div.some-class' or 'span:first-child').
         * This is a shortcut for findParentNode() that always returns an Ext.dom.Element.
         * @param {String} selector The simple selector to test. See {@link Ext.dom.Query} for information about simple selectors.
         * @param {Number/String/HTMLElement/Ext.dom.Element} [limit]
         * The max depth to search as a number or an element that causes the upward
         * traversal to stop and is **not** considered for inclusion as the result.
         * (defaults to 50 || document.documentElement)
         * @param {Boolean} [returnDom=false] True to return the DOM node instead of Ext.dom.Element
         * @return {Ext.dom.Element/HTMLElement} The matching DOM node (or HTMLElement if 
         * _returnDom_ is _true_).  Or null if no match was found.
         */
        up: function(simpleSelector, limit, returnDom) {
            return this.findParentNode(simpleSelector, limit, !returnDom);
        },

        /**
         * @inheritdoc Ext.dom.Element#setHtml
         * @deprecated 5.0.0 Please use {@link #setHtml} instead.
         */
        update: function (html) {
            return this.setHtml(html);
        },

        /**
         * Creates and wraps this element with another element
         * @param {Object} [config] DomHelper element config object for the wrapper element or null for an empty div
         * @param {Boolean} [returnDom=false] True to return the raw DOM element instead of Ext.dom.Element
         * @param {String} [selector] A CSS selector to select a descendant node within the created element to use as the wrapping element.
         * @return {HTMLElement/Ext.dom.Element} The newly created wrapper element
         */
        wrap: function(config, returnDom, selector) {
            var me = this,
                dom = me.dom,
                newEl = Ext.DomHelper.insertBefore(dom, config || {tag: "div"}, !returnDom),
                target = newEl,
                activeElement = Ext.Element.getActiveElement(),
                cached, resumeFocus, tabIndex;

            cached = Ext.cache[activeElement.id];
            
            // If the element is in the cache, we need to get the instance so
            // we can suspend events on it. If it's not in the cache, it can't
            // have any events so we don't need to suspend on it.
            if (cached) {
                activeElement = cached;
            }

            if (selector) {
                target = newEl.selectNode(selector, returnDom);
            }

            if (me.contains(activeElement)) {
                if (cached) {
                    cached.suspendFocusEvents();
                }
                
                // This is workaround for the nasty IE behavior w/r/t removing and adding
                // DOM nodes that contain focus. When this happens, focus will fall back
                // to the document body *after* the present code execution path finishes,
                // with no way to control this. Instead of trying to refocus the element
                // asynchronously in a callback, we're focusing the wrapper instead,
                // adding the dom to the wrapper, and then refocusing the dom;
                // all synchronous and dandy.
                // The only side effect of all this focus juggling is that focus/blur
                // events will fire asynchronously after this code path finishes (in IE),
                // but we deal with that by ignoring these events *on particular elements*.
                // Focus event publisher will look for focus suspension flag on the element,
                // and since the flag is cleared asynchronously in the immediate callback,
                // we have enough cycles to ignore unwanted events to get away with it
                // but not too many to step on someone else's toes (hopefully).
                tabIndex = newEl.dom.getAttribute('tabIndex');
                newEl.set({ tabIndex: -1 });
                
                newEl.suspendFocusEvents();
                newEl.focus();
                
                resumeFocus = true;
            }
            
            target.appendChild(dom);
            
            if (resumeFocus) {
                if (cached) {
                    cached.focus();
                    cached.resumeFocusEvents();
                }
                else {
                    Ext.fly(activeElement).focus();
                }
                
                newEl.resumeFocusEvents();
                
                // Most often tabIndex will be undefined, and we don't want to
                // make the wrapper focusable by accident.
                newEl.set({ tabIndex: tabIndex });
            }
            
            return newEl;
        },

        privates: {
            doAddListener: function(eventName, fn, scope, options, order, caller, manager) {
                var me = this,
                    gesturePublisher = Ext.$gesturePublisher,
                    originalName = eventName,
                    supports = Ext.supports,
                    supportsTouch = supports.TouchEvents,
                    supportsPointer = supports.PointerEvents,
                    observableDoAddListener, additiveEventName,
                    translatedEventName;

                // Even though the superclass method does conversion to lowercase, we need
                // to do it here because we need to use the lowercase name for lookup
                // in the event translation map.
                eventName = Ext.canonicalEventName(eventName);

                // Blocked events (such as emulated mouseover in mobile webkit) are prevented
                // from firing
                if (!me.blockedEvents[eventName]) {
                    observableDoAddListener = me.mixins.observable.doAddListener;
                    options = options || {};

                    if (Element.useDelegatedEvents === false) {
                        options.delegated = options.delegated || false;
                    }

                    if (options.translate !== false) {
                        // translate events where applicable.  This allows applications that
                        // were written for desktop to work on mobile devices and vice versa.
                        additiveEventName = me.additiveEvents[eventName];
                        if (additiveEventName) {
                            // additiveEvents means the translation is "additive" - meaning we
                            // need to attach the original event in addition to the translated
                            // one.  An example of this is devices that have both mousedown
                            // and touchstart
                            options.type = eventName;
                            eventName = additiveEventName;
                            observableDoAddListener.call(me, eventName, fn, scope, options, order, caller, manager);
                        }

                        translatedEventName = me.eventMap[eventName];
                        if (translatedEventName) {
                            // options.type may have already been set above
                            options.type = options.type || eventName;
                            if (manager) {
                                options.managedName = originalName;
                            }
                            eventName = translatedEventName;
                        }
                    }

                    if (observableDoAddListener.call(me, eventName, fn, scope, options, order, caller, manager)) {
                        if (me.longpressEvents[eventName] && (++me.longpressListenerCount === 1)) {
                            me.on('MSHoldVisual', 'preventMsHoldVisual', me);
                        }
                    }

                    if (manager && translatedEventName) {
                        delete options.managedName;
                    }

                    // after the listener has been added to the ListenerStack, it's original
                    // "type" (for translated events) will be stored on the listener object in
                    // the ListenerStack.  We can now delete type from the options object
                    // since it is not a user-supplied option
                    delete options.type;
                }
            },

            doRemoveListener: function(eventName, fn, scope) {
                var me = this,
                    gesturePublisher = Ext.$gesturePublisher,
                    supports = Ext.supports,
                    supportsTouch = supports.TouchEvents,
                    supportsPointer = supports.PointerEvents,
                    observableDoRemoveListener, translatedEventName, additiveEventName,
                    contextMenuListenerRemover, removed;

                // Even though the superclass method does conversion to lowercase, we need
                // to do it here because we need to use the lowercase name for lookup
                // in the event translation map.
                eventName = Ext.canonicalEventName(eventName);

                // Blocked events (such as emulated mouseover in mobile webkit) are prevented
                // from firing
                if (!me.blockedEvents[eventName]) {
                    observableDoRemoveListener = me.mixins.observable.doRemoveListener;

                    // translate events where applicable.  This allows applications that
                    // were written for desktop to work on mobile devices and vice versa.
                    additiveEventName = me.additiveEvents[eventName];
                    if (additiveEventName) {
                        // additiveEvents means the translation is "additive" - meaning we
                        // need to remove the original event in addition to the translated
                        // one.  An example of this is devices that have both mousedown
                        // and touchstart
                        eventName = additiveEventName;
                        observableDoRemoveListener.call(me, eventName, fn, scope);
                    }

                    translatedEventName = me.eventMap[eventName];
                    if (translatedEventName) {
                        removed = observableDoRemoveListener.call(me, translatedEventName, fn, scope);
                    }

                    // no "else" here because we need to ensure that we remove translate:false
                    // listeners
                    removed = observableDoRemoveListener.call(me, eventName, fn, scope) || removed;

                    if (removed) {
                        if (me.longpressEvents[eventName] && !--me.longpressListenerCount) {
                            me.un('MSHoldVisual', 'preventMsHoldVisual', me);
                        }
                    }
                }
            },

            _initEvent: function(eventName) {
                return (this.events[eventName] = new Ext.dom.ElementEvent(this, eventName));
            },

            _getDisplay: function() {
                var data = this.getData(),
                    display = data[ORIGINALDISPLAY];

                if (display === undefined) {
                    data[ORIGINALDISPLAY] = display = '';
                }
                return display;
            },

            /**
             * Returns the publisher for a given event
             * @param {String} eventName
             * @private
             * @return {Ext.event.publisher.Publisher}
             */
            _getPublisher: function(eventName) {
                var Publisher = Ext.event.publisher.Publisher,
                    publisher = Publisher.publishersByEvent[eventName];

                // Dom publisher acts as the default publisher for all events that are
                // not explicitly handled by another publisher.
                // ElementSize handles the 'resize' event, except on the window
                // object, where it is handled by Dom publisher.
                if (!publisher || (this.dom === window && eventName === 'resize')) {
                    publisher = Publisher.publishers.dom;
                }

                return publisher;
            },
            
            isFocusSuspended: function() {
                return !!this.getData().suspendFocusEvents;
            },

            preventMsHoldVisual: function(e) {
                e.preventDefault();
            },

            suspendFocusEvents: function() {
                if (!this.isFly) {
                    this.suspendEvent('focus', 'blur');
                }
                
                this.getData().suspendFocusEvents = true;
            },

            resumeFocusEvents: function() {
                function resumeFn() {
                    var data;
                    
                    if (!this.destroyed) {
                        data = this.getData();
                        
                        if (data) {
                            data.suspendFocusEvents = false;
                        }
                        
                        if (!this.isFly) {
                            this.resumeEvent('focus', 'blur');
                        }
                    }
                }
                
                if (!this.destroyed && this.getData().suspendFocusEvents) {
                    if (Ext.isIE) {
                        Ext.asap(resumeFn, this);
                    }
                    else {
                        resumeFn.call(this);
                    }
                }
            }
        },

        deprecated: {
            '5.0': {
                methods: {
                    /**
                     * @method cssTranslate
                     * Translates an element using CSS 3 in 2D.
                     * @removed 5.0.0
                     */
                    cssTranslate: null,

                    /**
                     * @method getHTML
                     * @inheritdoc Ext.dom.Element#getHtml
                     * @deprecated 5.0.0 Please use {@link #getHtml} instead.
                     */
                    getHTML: 'getHtml',

                    /**
                     * @method getOuterHeight
                     * Retrieves the height of the element account for the top and bottom margins.
                     * @removed 5.0.0
                     */
                    getOuterHeight: null,

                    /**
                     * @method getOuterWidth
                     * Retrieves the width of the element accounting for the left and right margins.
                     * @removed 5.0.0
                     */
                    getOuterWidth: null,

                    /**
                     * Returns an object defining the area of this Element which can be passed to
                     * {@link Ext.util.Positionable#setBox} to set another Element's size/location to match this element.
                     *
                     * @param {Boolean} [asRegion] If true an Ext.util.Region will be returned
                     * @return {Object/Ext.util.Region} box An object in the following format:
                     *
                     *     {
                     *         left: <Element's X position>,
                     *         top: <Element's Y position>,
                     *         width: <Element's width>,
                     *         height: <Element's height>,
                     *         bottom: <Element's lower bound>,
                     *         right: <Element's rightmost bound>
                     *     }
                     *
                     * The returned object may also be addressed as an Array where index 0 contains
                     * the X position and index 1 contains the Y position. So the result may also be
                     * used for {@link #setXY}
                     * @deprecated 5.0.0 use {@link Ext.util.Positionable#getBox} to get a box object, and
                     * {@link Ext.util.Positionable#getRegion} to get a {@link Ext.util.Region Region}.
                     */
                    getPageBox: function(getRegion) {
                        var me = this,
                            dom = me.dom,
                            isDoc = dom.nodeName === 'BODY',
                            w = isDoc ? Element.getViewportWidth() : dom.offsetWidth,
                            h = isDoc ? Element.getViewportHeight() : dom.offsetHeight,
                            xy = me.getXY(),
                            t = xy[1],
                            r = xy[0] + w,
                            b = xy[1] + h,
                            l = xy[0];

                        if (getRegion) {
                            return new Ext.util.Region(t, r, b, l);
                        }
                        else {
                            return {
                                left: l,
                                top: t,
                                width: w,
                                height: h,
                                right: r,
                                bottom: b
                            };
                        }
                    },

                    /**
                     * @method getScrollParent
                     * Gets the Scroller instance of the first parent that has one.
                     * @removed 5.0.0
                     */
                    getScrollParent: null,

                    /**
                     * @method isDescendent
                     * Determines if this element is a descendant of the passed in Element.
                     * @removed 5.0.0
                     */
                    isDescendent: null,

                    /**
                     * Returns `true` if the value of the given property is visually transparent. This
                     * may be due to a 'transparent' style value or an rgba value with 0 in the alpha
                     * component.
                     * @param {String} prop The style property whose value is to be tested.
                     * @return {Boolean} `true` if the style property is visually transparent.
                     * @deprecated 5.0.0
                     */
                    isTransparent: function(prop) {
                        var value = this.getStyle(prop);

                        return value ? transparentRe.test(value) : false;
                    },

                    /**
                     * @method purgeAllListeners
                     * @inheritdoc Ext.dom.Element#clearListeners
                     * @deprecated 5.0.0 Please use {@link #clearListeners} instead.
                     */
                    purgeAllListeners: 'clearListeners',

                    /**
                     * @method removeAllListeners
                     * @inheritdoc Ext.dom.Element#clearListeners
                     * @deprecated 5.0.0 Please use {@link #clearListeners} instead.
                     */
                    removeAllListeners: 'clearListeners',

                    /**
                     * @method setHTML
                     * @inheritdoc Ext.dom.Element#setHtml
                     * @deprecated 5.0.0 Please use {@link #setHtml} instead.
                     */
                    setHTML: 'setHtml',

                    /**
                     * @method setTopLeft
                     * Sets the element's top and left positions directly using CSS style.
                     * @removed 5.0.0
                     */
                    setTopLeft: null
                }
            }
        }
    };
}, function(Element) {
    var DOC = document,
        docEl = DOC.documentElement,
        prototype = Element.prototype,
        supports = Ext.supports,
        pointerdown = 'pointerdown',
        pointermove = 'pointermove',
        pointerup = 'pointerup',
        pointercancel = 'pointercancel',
        MSPointerDown = 'MSPointerDown',
        MSPointerMove = 'MSPointerMove',
        MSPointerUp = 'MSPointerUp',
        MSPointerCancel = 'MSPointerCancel',
        mousedown = 'mousedown',
        mousemove = 'mousemove',
        mouseup = 'mouseup',
        mouseover = 'mouseover',
        mouseout = 'mouseout',
        mouseenter = 'mouseenter',
        mouseleave = 'mouseleave',
        touchstart = 'touchstart',
        touchmove = 'touchmove',
        touchend = 'touchend',
        touchcancel = 'touchcancel',
        click = 'click',
        dblclick = 'dblclick',
        tap = 'tap',
        doubletap = 'doubletap',
        eventMap = prototype.eventMap = {},
        additiveEvents = prototype.additiveEvents = {},
        oldId = Ext.id,
        eventOptions;

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @member Ext
     * @param {Object/HTMLElement/Ext.dom.Element} [obj] The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    Ext.id = function (obj, prefix) {
        var el = Ext.getDom(obj, true),
            sandboxPrefix, id;

        if (!el) {
            id = oldId(obj, prefix);
        } else if (!(id = el.id)) {
            id = oldId(null, prefix || Element.prototype.identifiablePrefix);

            if (Ext.isSandboxed) {
                sandboxPrefix = Ext.sandboxPrefix ||
                    (Ext.sandboxPrefix = Ext.sandboxName.toLowerCase() + '-');
                id = sandboxPrefix + id;
            }

            el.id = id;
        }

        return id;
    };

    if (supports.PointerEvents) {
        eventMap[mousedown] = pointerdown;
        eventMap[mousemove] = pointermove;
        eventMap[mouseup] = pointerup;
        eventMap[touchstart] = pointerdown;
        eventMap[touchmove] = pointermove;
        eventMap[touchend] = pointerup;
        eventMap[touchcancel] = pointercancel;

        // On devices that support pointer events we block pointerover, pointerout,
        // pointerenter, and pointerleave when triggered by touch input (see
        // Ext.event.publisher.Dom#blockedPointerEvents).  This is because mouseover
        // behavior is typically not desired when touching the screen.  This covers the
        // use case where user code requested a pointer event, however mouseover/mouseout
        // events are not cancellable, period.
        // http://www.w3.org/TR/pointerevents/#mapping-for-devices-that-do-not-support-hover
        // To ensure mouseover/out handlers don't fire when touching the screen, we need
        // to translate them to their pointer equivalents
        eventMap[mouseover] = 'pointerover';
        eventMap[mouseout] = 'pointerout';
        eventMap[mouseenter] = 'pointerenter';
        // No decent way to feature detect this, pointerleave relatedTarget is
        // incorrect on IE11, so force it to use mouseleave here.
        // See: https://connect.microsoft.com/IE/feedback/details/851111/ev-relatedtarget-in-pointerleave-indicates-departure-element-not-destination-element
        if (!Ext.isIE11) {
            eventMap[mouseleave] = 'pointerleave';
        }
    } else if (supports.MSPointerEvents) {
        // IE10
        eventMap[pointerdown] = MSPointerDown;
        eventMap[pointermove] = MSPointerMove;
        eventMap[pointerup] = MSPointerUp;
        eventMap[pointercancel] = MSPointerCancel;
        eventMap[mousedown] = MSPointerDown;
        eventMap[mousemove] = MSPointerMove;
        eventMap[mouseup] = MSPointerUp;
        eventMap[touchstart] = MSPointerDown;
        eventMap[touchmove] = MSPointerMove;
        eventMap[touchend] = MSPointerUp;
        eventMap[touchcancel] = MSPointerCancel;

        // translate mouseover/out so they can be prevented on touch screens.
        // (see above comment in the PointerEvents section)
        eventMap[mouseover] = 'MSPointerOver';
        eventMap[mouseout] = 'MSPointerOut';
    } else if (supports.TouchEvents) {
        eventMap[pointerdown] = touchstart;
        eventMap[pointermove] = touchmove;
        eventMap[pointerup] = touchend;
        eventMap[pointercancel] = touchcancel;
        eventMap[mousedown] = touchstart;
        eventMap[mousemove] = touchmove;
        eventMap[mouseup] = touchend;
        eventMap[click] = tap;
        eventMap[dblclick] = doubletap;

        if (Ext.isWebKit && Ext.os.is.Desktop) {
            // Touch enabled webkit browsers on windows8 fire both mouse events and touch
            // events. so we have to attach listeners for both kinds when either one is
            // requested.  There are a couple rules to keep in mind:
            // 1. When the mouse is used, only a mouse event is fired
            // 2. When interacting with the touch screen touch events are fired.
            // 3. After a touchstart/touchend sequence, if there was no touchmove in
            // between, the browser will fire a mousemove/mousedown/mousup sequence
            // immediately after.  This can cause problems because if we are listening
            // for both kinds of events, handlers may run twice.  To work around this
            // issue we filter out the duplicate emulated mouse events by checking their
            // coordinates and timing (see Ext.event.publisher.Gesture#onDelegatedEvent)
            eventMap[touchstart] = mousedown;
            eventMap[touchmove] = mousemove;
            eventMap[touchend] = mouseup;
            eventMap[touchcancel] = mouseup;

            additiveEvents[mousedown] = mousedown;
            additiveEvents[mousemove] = mousemove;
            additiveEvents[mouseup] = mouseup;
            additiveEvents[touchstart] = touchstart;
            additiveEvents[touchmove] = touchmove;
            additiveEvents[touchend] = touchend;
            additiveEvents[touchcancel] = touchcancel;

            additiveEvents[pointerdown] = mousedown;
            additiveEvents[pointermove] = mousemove;
            additiveEvents[pointerup] = mouseup;
            additiveEvents[pointercancel] = mouseup;
        }
    } else {
        // browser does not support either pointer or touch events, map all pointer and
        // touch events to their mouse equivalents
        eventMap[pointerdown] = mousedown;
        eventMap[pointermove] = mousemove;
        eventMap[pointerup] = mouseup;
        eventMap[pointercancel] = mouseup;
        eventMap[touchstart] = mousedown;
        eventMap[touchmove] = mousemove;
        eventMap[touchend] = mouseup;
        eventMap[touchcancel] = mouseup;
    }

    if (Ext.isWebKit) {
        // These properties were carried forward from touch-2.x. This translation used
        // do be done by DomPublisher.  TODO: do we still need this?
        eventMap.transitionend = Ext.browser.getVendorProperyName('transitionEnd');
        eventMap.animationstart = Ext.browser.getVendorProperyName('animationStart');
        eventMap.animationend = Ext.browser.getVendorProperyName('animationEnd');
    }

    if (!Ext.supports.MouseWheel && !Ext.isOpera) {
        eventMap.mousewheel = 'DOMMouseScroll';
    }

    eventOptions = prototype.$eventOptions = Ext.Object.chain(prototype.$eventOptions);
    eventOptions.translate = eventOptions.capture = eventOptions.delegate = eventOptions.delegated =
            eventOptions.stopEvent = eventOptions.preventDefault = eventOptions.stopPropagation =
            // Ext.Element also needs "element" as one of its event options.  Even though
            // it does not directly process an element option, it may receive a listeners
            // object that was passed through from a Component with the "element" option
            // included. Including "element" in the event options ensures we don't attempt
            // to process "element" as an event name.
            eventOptions.element = 1;


    prototype.styleHooks.opacity = {
        name: 'opacity',
        afterSet: function(dom, value, el) {
            var shadow = el.shadow;
            if (shadow) {
                shadow.setOpacity(value);
            }
        }
    };

    /**
     * @private
     * Returns the `X,Y` position of this element without regard to any RTL
     * direction settings.
     */
    prototype.getTrueXY = prototype.getXY;

    /**
     * @member Ext
     * @method select
     */
    Ext.select = Element.select;

    /**
     * @member Ext
     * @method query
     */
    Ext.query = Element.query;

    Ext.apply(Ext, {
        /**
         * @member Ext
         * @method get
         */
        get: function(element) {
            return Element.get(element);
        },

        /**
         * @member Ext
         * @method getDom
         * Return the dom node for the passed String (id), dom node, or Ext.Element.
         * Here are some examples:
         *
         *     // gets dom node based on id
         *     var elDom = Ext.getDom('elId');
         *
         *     // gets dom node based on the dom node
         *     var elDom1 = Ext.getDom(elDom);
         *
         *     // If we don't know if we are working with an
         *     // Ext.Element or a dom node use Ext.getDom
         *     function(el){
         *         var dom = Ext.getDom(el);
         *         // do something with the dom node
         *     }
         *
         * __Note:__ the dom node to be found actually needs to exist (be rendered, etc)
         * when this method is called to be successful.
         *
         * @param {String/HTMLElement/Ext.dom.Element} el
         * @return {HTMLElement}
         */
        getDom: function(el) {
            if (!el || !DOC) {
                return null;
            }

            // We could be passed an Element whos dom has been nulled on destruction; use 'dom' in rather than truthiness.
            return typeof el === 'string' ? Ext.getElementById(el) : 'dom' in el ? el.dom : el;
        },

        /**
         * @member Ext
         * Returns the current document body as an {@link Ext.dom.Element}.
         * @return {Ext.dom.Element} The document body.
         */
        getBody: function() {
            if (!Ext._bodyEl) {
                if (!DOC.body) {
                    throw new Error("[Ext.getBody] document.body does not yet exist");
                }

                Ext._bodyEl = Ext.get(DOC.body);
            }

            return Ext._bodyEl;
        },

        /**
         * @member Ext
         * Returns the current document head as an {@link Ext.dom.Element}.
         * @return {Ext.dom.Element} The document head.
         */
        getHead: function() {
            if (!Ext._headEl) {
                Ext._headEl = Ext.get(DOC.head || DOC.getElementsByTagName('head')[0]);
            }

            return Ext._headEl;
        },

        /**
         * @member Ext
         * Returns the current HTML document object as an {@link Ext.dom.Element}.
         * Typically used for attaching event listeners to the document.  Note: since
         * the document object is not an HTMLElement many of the Ext.dom.Element methods
         * are not applicable and may throw errors if called on the returned
         * Element instance.
         * @return {Ext.dom.Element} The document.
         */
        getDoc: function() {
            if (!Ext._docEl) {
                Ext._docEl = Ext.get(DOC);
            }

            return Ext._docEl;
        },

        /**
         * @member Ext
         * Returns the current window object as an {@link Ext.dom.Element}.
         * Typically used for attaching event listeners to the window.  Note: since
         * the window object is not an HTMLElement many of the Ext.dom.Element methods
         * are not applicable and may throw errors if called on the returned
         * Element instance.
         * @return {Ext.dom.Element} The window.
         */
        getWin: function() {
            if (!Ext._winEl) {
                Ext._winEl = Ext.get(window);
            }

            return Ext._winEl;
        },

        /**
         * @member Ext
         * Removes an HTMLElement from the document.  If the HTMLElement was previously
         * cached by a call to Ext.get(), removeNode will call the {@link Ext.Element#destroy
         * destroy} method of the {@link Ext.dom.Element} instance, which removes all DOM
         * event listeners, and deletes the cache reference.
         * @param {HTMLElement} node The node to remove
         * @method
         */
        removeNode: function(node) {
            node = node.dom || node;

            var id = node && node.id,
                el = Ext.cache[id],
                parent;

            if (el) {
                el.destroy();
            } else if(node && (node.nodeType === 3 || node.tagName.toUpperCase() !== 'BODY')) {
                parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            }
        }
    });

    // TODO: make @inline work - SDKTOOLS-686
    // @inline
    Ext.isGarbage = function(dom) {
        // determines if the dom element is in the document or in the detached body element
        // use by collectGarbage and Ext.get()
        return dom &&
            // window, document, documentElement, and body can never be garbage.
            dom.nodeType === 1 && dom.tagName !== 'BODY' && dom.tagName !== 'HTML' &&
            // if the element does not have a parent node, it is definitely not in the
            // DOM - we can exit immediately
            (!dom.parentNode ||
            // If the element has an offsetParent we can bail right away, it is
            // definitely in the DOM. If offsetParent is null, the element is detached.
            // If offsetParent is undefined, the element doesn't support offsetParent
            // (e.g. SVGElement) and is not necessarily garbage; parentNode check above
            // should be sufficient in this case.
            (dom.offsetParent === null &&
            // if the element does not have an offsetParent it can mean the element is
            // either not in the dom or it is hidden.  The next step is to check to see
            // if it can be found by id using either document.all or getElementById(),
            // whichever is faster for the current browser.  Normally we would not
            // include IE-specific checks in the core package, however,  in this
            // case the function will be inlined and therefore cannot be overridden in
            // the ext package.
                ((Ext.isIE8 ? DOC.all[dom.id] : DOC.getElementById(dom.id)) !== dom) &&
                // finally if the element was not found in the dom by id, we need to check
                // the detachedBody element
                !(Ext.detachedBodyEl && Ext.detachedBodyEl.isAncestor(dom))));
    };

    if (Ext.os.is.Android || (Ext.os.is.Windows && Ext.supports.Touch)) {
        Ext.onReady(function() {
            // Some mobile devices (android and windows) fire window resize events
            // When the virtual keyboard is displayed. This causes unexpected visual
            // results due to extra layouts of the viewport.  Here we attach a couple
            // of event listeners that will help us detect if the virtual keyboard
            // is open so tha getViewportWidth/getViewportHeight can report the
            // original size as the viewport size while the keyboard is open
            var win = Ext.getWin();

            Element._documentWidth = Element._viewportWidth = docEl.clientWidth;
            Element._documentHeight = Element._viewportHeight = docEl.clientHeight;

            win.on({
                // Focus in/out listeners track the last focus change so we can detect
                // the proximity of the last focus change relative to window resize events
                // alowing us to guess with reasonable certainty that a virtual keyboard
                // is being shown.
                focusin: '_onWindowFocusChange',
                focusout: '_onWindowFocusChange',
                // This pointerup listener is needed because in windowsthe virtual keyboard
                // can be hidden manually while the editable element retains focus by tapping
                // a hide button on the virtual keyboard itself. The virtual keyboard can then
                // be re-shown by tapping on the editable element.  In this case the editable
                // element does not fire a focusin event since it already has the focus, but
                // we still need to track that an event occurred which will cause the virtual
                // keyboard to show momentarily.
                pointerup: '_onWindowFocusChange',
                capture: true,
                delegated: false,
                delay: 1,
                scope: Element
            });

            win.on({
                // Resize listener for tracking virtual keyboard state.
                resize: '_onWindowResize',
                priority: 2000,
                scope: Element
            });

        });
    }
});
