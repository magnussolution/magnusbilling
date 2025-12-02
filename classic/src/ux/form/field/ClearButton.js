(function() {
    /**
     * @class Ext.ux.form.field.ClearButton
     *
     * Plugin for text components that shows a "clear" button over the text field.
     * When the button is clicked the text field is set empty.
     * Icon image and positioning can be controlled using CSS.
     * Works with Ext.form.field.Text, Ext.form.field.TextArea, Ext.form.field.ComboBox and Ext.form.field.Date.
     *
     * Plugin alias is 'clearbutton' (use "plugins: 'clearbutton'" in GridPanel config).
     *
     * @author <a href="mailto:stephen.friedrich@fortis-it.de">Stephen Friedrich</a>
     * @author <a href="mailto:fabian.urban@fortis-it.de">Fabian Urban</a>
     *
     * @copyright (c) 2011 Fortis IT Services GmbH
     * @license Ext.ux.form.field.ClearButton is released under the
     * <a target="_blank" href="http://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0</a>.
     *
     */
    Ext.define('Ext.ux.form.field.ClearButton', {
        alias: 'plugin.clearbutton',
        pluginId: 'clearbutton',
        /**
         * @cfg {Boolean} Hide the clear button when the field is empty (default: true).
         */
        hideClearButtonWhenEmpty: true,
        /**
         * @cfg {Boolean} Hide the clear button until the mouse is over the field (default: true).
         */
        hideClearButtonWhenMouseOut: true,
        /**
         * @cfg {Boolean} When the clear buttons is hidden/shown, this will animate the button to its new state (using opacity) (default: true).
         */
        animateClearButton: true,
        /**
         * @cfg {Boolean} Empty the text field when ESC is pressed while the text field is focused.
         */
        clearOnEscape: false,
        /**
         * @cfg {String} CSS class used for the button div.
         * Also used as a prefix for other classes (suffixes: '-mouse-over-input', '-mouse-over-button', '-mouse-down', '-on', '-off')
         */
        clearButtonCls: 'ext-ux-clearbutton',
        /**
         * The text field (or text area, combo box, date field) that we are attached to
         */
        textField: null,
        /**
         * Will be set to true if animateClearButton is true and the browser supports CSS 3 transitions
         * @private
         */
        animateWithCss3: false,
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Set up and tear down
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        constructor: function(cfg) {
            Ext.apply(this, cfg);
            this.callParent(arguments);
        },
        /**
         * Called by plug-in system to initialize the plugin for a specific text field (or text area, combo box, date field).
         * Most all the setup is delayed until the component is rendered.
         */
        init: function(textField) {
            this.textField = textField;
            if (!textField.rendered) {
                textField.on('afterrender', this.handleAfterRender, this);
            } else {
                // probably an existing input element transformed to extjs field
                this.handleAfterRender();
            }
        },
        /**
         * After the field has been rendered sets up the plugin (create the Element for the clear button, attach listeners).
         * @private
         */
        handleAfterRender: function(textField) {
            this.isTextArea = (this.textField.inputEl.dom.type.toLowerCase() == 'textarea');
            this.createClearButtonEl();
            this.addListeners();
            this.repositionClearButton();
            this.updateClearButtonVisibility();
            this.addEscListener();
        },
        /**
         * Creates the Element and DOM for the clear button
         */
        createClearButtonEl: function() {
            var animateWithClass = this.animateClearButton && this.animateWithCss3;
            this.clearButtonEl = this.textField.bodyEl.createChild({
                tag: 'div',
                cls: this.clearButtonCls
            });
            if (this.animateClearButton) {
                this.animateWithCss3 = this.supportsCssTransition(this.clearButtonEl);
            }
            if (this.animateWithCss3) {
                this.clearButtonEl.addCls(this.clearButtonCls + '-off');
            } else {
                this.clearButtonEl.setStyle('visibility', 'hidden');
            }
        },
        /**
         * Returns true iff the browser supports CSS 3 transitions
         * @param el an element that is checked for support of the "transition" CSS property (considering any
         *           vendor prefixes)
         */
        supportsCssTransition: function(el) {
            var styles = ['transitionProperty', 'WebkitTransitionProperty', 'MozTransitionProperty', 'OTransitionProperty', 'msTransitionProperty', 'KhtmlTransitionProperty'];
            var style = el.dom.style;
            for (var i = 0, length = styles.length; i < length; ++i) {
                if (style[styles[i]] !== 'undefined') {
                    // Supported property will result in empty string
                    return true;
                }
            }
            return false;
        },
        /**
         * If config option "clearOnEscape" is true, then add a key listener that will clear this field
         */
        addEscListener: function() {
            if (!this.clearOnEscape) {
                return;
            }
            // Using a KeyMap did not work: ESC is swallowed by combo box and date field before it reaches our own KeyMap
            this.textField.inputEl.on('keydown', function(e) {
                if (e.getKey() == Ext.EventObject.ESC) {
                    if (this.textField.isExpanded) {
                        // Let combo box or date field first remove the popup
                        return;
                    }
                    // No idea why the defer is necessary, but otherwise the call to setValue('') is ignored
                    Ext.Function.defer(this.textField.setValue, 1, this.textField, ['']);
                    e.stopEvent();
                }
            }, this);
        },
        /**
         * Adds listeners to the field, its input element and the clear button to handle resizing, mouse over/out events, click events etc.
         */
        addListeners: function() {
            // listeners on input element (DOM/El level)
            var textField = this.textField;
            var bodyEl = textField.bodyEl;
            bodyEl.on('mouseover', this.handleMouseOverInputField, this);
            bodyEl.on('mouseout', this.handleMouseOutOfInputField, this);
            // listeners on text field (component level)
            textField.on('destroy', this.handleDestroy, this);
            textField.on('resize', this.repositionClearButton, this);
            textField.on('change', function() {
                this.repositionClearButton();
                this.updateClearButtonVisibility();
            }, this);
            // listeners on clear button (DOM/El level)
            var clearButtonEl = this.clearButtonEl;
            clearButtonEl.on('mouseover', this.handleMouseOverClearButton, this);
            clearButtonEl.on('mouseout', this.handleMouseOutOfClearButton, this);
            clearButtonEl.on('mousedown', this.handleMouseDownOnClearButton, this);
            clearButtonEl.on('mouseup', this.handleMouseUpOnClearButton, this);
            clearButtonEl.on('click', this.handleMouseClickOnClearButton, this);
        },
        /**
         * When the field is destroyed, we also need to destroy the clear button Element to prevent memory leaks.
         */
        handleDestroy: function() {
            this.clearButtonEl.destroy();
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Mouse event handlers
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Tada - the real action: If user left clicked on the clear button, then empty the field
         */
        handleMouseClickOnClearButton: function(event, htmlElement, object) {
            if (!this.isLeftButton(event)) {
                return;
            }
            if (Ext.isFunction(this.textField.onClearButtonClick)) {
                this.textField.onClearButtonClick.call(this.textField.clearButtonScope || this.textField, this.textField);
            } else {
                this.textField.setValue('');
            }
            this.textField.focus();
        },
        handleMouseOverInputField: function(event, htmlElement, object) {
            this.clearButtonEl.addCls(this.clearButtonCls + '-mouse-over-input');
            if (event.getRelatedTarget() == this.clearButtonEl.dom) {
                // Moused moved to clear button and will generate another mouse event there.
                // Handle it here to avoid duplicate updates (else animation will break)
                this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-over-button');
                this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-down');
            }
            this.updateClearButtonVisibility();
        },
        handleMouseOutOfInputField: function(event, htmlElement, object) {
            this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-over-input');
            if (event.getRelatedTarget() == this.clearButtonEl.dom) {
                // Moused moved from clear button and will generate another mouse event there.
                // Handle it here to avoid duplicate updates (else animation will break)
                this.clearButtonEl.addCls(this.clearButtonCls + '-mouse-over-button');
            }
            this.updateClearButtonVisibility();
        },
        handleMouseOverClearButton: function(event, htmlElement, object) {
            event.stopEvent();
            if (this.textField.bodyEl.contains(event.getRelatedTarget())) {
                // has been handled in handleMouseOutOfInputField() to prevent double update
                return;
            }
            this.clearButtonEl.addCls(this.clearButtonCls + '-mouse-over-button');
            this.updateClearButtonVisibility();
        },
        handleMouseOutOfClearButton: function(event, htmlElement, object) {
            event.stopEvent();
            if (this.textField.bodyEl.contains(event.getRelatedTarget())) {
                // will be handled in handleMouseOverInputField() to prevent double update
                return;
            }
            this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-over-button');
            this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-down');
            this.updateClearButtonVisibility();
        },
        handleMouseDownOnClearButton: function(event, htmlElement, object) {
            if (!this.isLeftButton(event)) {
                return;
            }
            this.clearButtonEl.addCls(this.clearButtonCls + '-mouse-down');
        },
        handleMouseUpOnClearButton: function(event, htmlElement, object) {
            if (!this.isLeftButton(event)) {
                return;
            }
            this.clearButtonEl.removeCls(this.clearButtonCls + '-mouse-down');
        },
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Utility methods
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Repositions the clear button element based on the textfield.inputEl element
         * @private
         */
        repositionClearButton: function() {
            var clearButtonEl = this.clearButtonEl;
            if (!clearButtonEl) {
                return;
            }
            var clearButtonPosition = this.calculateClearButtonPosition(this.textField);
            clearButtonEl.dom.style.right = clearButtonPosition.right + 'px';
            clearButtonEl.dom.style.top = clearButtonPosition.top + 'px';
        },
        /**
         * Calculates the position of the clear button based on the textfield.inputEl element
         * @private
         */
        calculateClearButtonPosition: function(textField) {
            var positions = textField.inputEl.getBox(true, true);
            var top = positions.y;
            var right = positions.x;
            if (this.fieldHasScrollBar()) {
                right += Ext.getScrollBarWidth();
            }
            if (this.textField.triggerWrap) {
                right += this.textField.triggerWrap.getWidth();
            }
            return {
                right: right,
                top: top
            };
        },
        /**
         * Checks if the field we are attached to currently has a scrollbar
         */
        fieldHasScrollBar: function() {
            if (!this.isTextArea) {
                return false;
            }
            var inputEl = this.textField.inputEl;
            var overflowY = inputEl.getStyle('overflow-y');
            if (overflowY == 'hidden' || overflowY == 'visible') {
                return false;
            }
            if (overflowY == 'scroll') {
                return true;
            }
            //noinspection RedundantIfStatementJS
            if (inputEl.dom.scrollHeight <= inputEl.dom.clientHeight) {
                return false;
            }
            return true;
        },
        /**
         * Small wrapper around clearButtonEl.isVisible() to handle setVisible animation that may still be in progress.
         */
        isButtonCurrentlyVisible: function() {
            if (this.animateClearButton && this.animateWithCss3) {
                return this.clearButtonEl.hasCls(this.clearButtonCls + '-on');
            }
            // This should not be necessary (see Element.setVisible/isVisible), but else there is confusion about visibility
            // when moving the mouse out and _quickly_ over then input again.
            var cachedVisible = Ext.core.Element.data(this.clearButtonEl.dom, 'isVisible');
            if (typeof(cachedVisible) == 'boolean') {
                return cachedVisible;
            }
            return this.clearButtonEl.isVisible();
        },
        /**
         * Checks config options and current mouse status to determine if the clear button should be visible.
         */
        shouldButtonBeVisible: function() {
            if (this.hideClearButtonWhenEmpty && Ext.isEmpty(this.textField.getValue())) {
                return false;
            }
            var clearButtonEl = this.clearButtonEl;
            //noinspection RedundantIfStatementJS
            if (this.hideClearButtonWhenMouseOut && !clearButtonEl.hasCls(this.clearButtonCls + '-mouse-over-button') && !clearButtonEl.hasCls(this.clearButtonCls + '-mouse-over-input')) {
                return false;
            }
            return true;
        },
        /**
         * Called after any event that may influence the clear button visibility.
         */
        updateClearButtonVisibility: function() {
            var oldVisible = this.isButtonCurrentlyVisible();
            var newVisible = this.shouldButtonBeVisible();
            var clearButtonEl = this.clearButtonEl;
            if (oldVisible != newVisible) {
                if (this.animateClearButton && this.animateWithCss3) {
                    this.clearButtonEl.removeCls(this.clearButtonCls + (oldVisible ? '-on' : '-off'));
                    clearButtonEl.addCls(this.clearButtonCls + (newVisible ? '-on' : '-off'));
                } else {
                    clearButtonEl.stopAnimation();
                    clearButtonEl.setVisible(newVisible, this.animateClearButton);
                }
                // Set background-color of clearButton to same as field's background-color (for those browsers/cases
                // where the padding-right (see below) does not work)
                clearButtonEl.setStyle('background-color', this.textField.inputEl.getStyle('background-color'));
                // Adjust padding-right of the input tag to make room for the button
                // IE (up to v9) just ignores this and Gecko handles padding incorrectly with  textarea scrollbars
                if (!(this.isTextArea && Ext.isGecko) && !Ext.isIE) {
                    // See https://bugzilla.mozilla.org/show_bug.cgi?id=157846
                    var deltaPaddingRight = clearButtonEl.getWidth() - this.clearButtonEl.getMargin('l');
                    var currentPaddingRight = this.textField.inputEl.getPadding('r');
                    var factor = (newVisible ? +1 : -1);
                    this.textField.inputEl.dom.style.paddingRight = (currentPaddingRight + factor * deltaPaddingRight) + 'px';
                }
            }
        },
        isLeftButton: function(event) {
            return event.button === 0;
        }
    });
})();