/**
 * A 'Toast' is a simple modal message that is displayed on the screen and then automatically closed by a timeout or by a user tapping
 * outside of the toast itself. Think about it like a text only alert box that will self destruct. **A Toast should not be instantiated manually**
 * but creating by calling 'Ext.toast(message, timeout)'. This will create one reusable toast container and content will be swapped out as
 * toast messages are queued or displayed.
 *
 * # Simple Toast
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!'); // Toast will close in 1000 milliseconds (default)
 *
 * # Toast with Timeout
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!', 5000); // Toast will close in 5000 milliseconds
 *
 * # Toast with config
 *
 *      @example miniphone
 *      Ext.toast({message: 'Hello Sencha!', timeout: 2000}); // Toast will close in 2000 milliseconds
 *
 * # Multiple Toasts queued
 *
 *      @example miniphone
 *      Ext.toast('Hello Sencha!');
 *      Ext.toast('Hello Sencha Again!');
 *      Ext.toast('Hello Sencha One More Time!');
 */
Ext.define('Ext.Toast', {
    extend: 'Ext.Sheet',
    requires: [
        'Ext.util.InputBlocker'
    ],

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        ui: 'dark',

        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'toast',

        /**
         * @cfg
         * @inheritdoc
         */
        showAnimation: {
            type: 'popIn',
            duration: 250,
            easing: 'ease-out'
        },

        /**
         * @cfg
         * @inheritdoc
         */
        hideAnimation: {
            type: 'popOut',
            duration: 250,
            easing: 'ease-out'
        },

        /**
         * Override the default `zIndex` so it is normally always above positioned components.
         */
        zIndex: 999,

        /**
         * @cfg {String} message
         * The message to be displayed in the {@link Ext.Toast}.
         * @accessor
         */
        message: '',

        /**
         * @cfg {Number} timeout
         * The amount of time in milliseconds to wait before destroying the toast automatically
         */
        timeout: 1000,

        /**
         * @cfg{Boolean/Object} animation
         * The animation that should be used between toast messages when they are queued up
         */
        messageAnimation: true,

        /**
         * @cfg
         * @inheritdoc
         */
        hideOnMaskTap: true,

        /**
         * @hide
         */
        modal: false,

        /**
         * @cfg
         * @inheritdoc
         */
        layout: {
            type: 'vbox',
            pack: 'center'
        }
    },

    initialize: function() {
        this.callParent(arguments);
        Ext.getDoc().on({
            scope: this,
            tap: 'onDocumentTap',
            capture: true
        });
    },

    /**
     * @private
     */
    applyMessage: function (value) {
        var config = {
            html: value,
            cls: this.getBaseCls() + '-text'
        };

        return Ext.factory(config, Ext.Component, this._message);
    },

    /**
     * @private
     */
    updateMessage: function (newMessage) {
        if (newMessage) {
            this.add(newMessage);
        }
    },

    /**
     * @private
     */
    startTimer: function () {
        var timeout = this.getTimeout();
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
        }

        if (!Ext.isEmpty(timeout)) {
            this._timeoutID = setTimeout(Ext.bind(this.onTimeout, this), timeout);
        } else {
            this.onTimeout();
        }
    },

    stopTimer: function () {
        clearTimeout(this._timeoutID);
        this._timeoutID = null;
    },

    /**
     * @method
     * @private
     */
    next: Ext.emptyFn,

    getIsAnimating: function () {
        var messageContainer = this.getMessage();
        return (messageContainer && Ext.Animator.hasRunningAnimations(messageContainer)) || Ext.Animator.hasRunningAnimations(this);
    },

    /**
     * @private
     */
    show: function (config) {
        var me = this,
            message = config.message,
            timeout = config.timeout,
            messageContainer = me.getMessage(),
            msgAnimation = me.getMessageAnimation();

        // If the toast has already been rendered and is visible on the screen
        if (me.isRendered() && me.isHidden() === false) {
            messageContainer.onAfter({
                // After the hide is complete
                hiddenchange: function () {
                    me.setMessage(message);
                    me.setTimeout(timeout);
                    messageContainer.onAfter({
                        scope: me,
                        // After the show is complete
                        hiddenchange: function () {
                            me.startTimer();
                        },
                        single: true
                    });
                    messageContainer.show(msgAnimation);
                },
                scope: me,
                single: true
            });

            messageContainer.hide(msgAnimation);
        } else {
            Ext.util.InputBlocker.blockInputs();

            //if it has not been added to a container, add it to the Viewport.
            if (!me.getParent() && Ext.Viewport) {
                Ext.Viewport.add(me);
            }

            me.setMessage(message);
            me.setTimeout(timeout);
            me.startTimer();
            me.callParent(arguments);
        }
    },

    onDocumentTap: function() {
        this.hide();
    },

    /**
     * @private
     */
    hide: function (animation) {
        var isAnimating = this.getIsAnimating();

        // If the message is animating cancel this hide
        if (isAnimating) {
            return;
        }

        var isEmpty = this.next();
        this.stopTimer();
        if (isEmpty) {
            this.callParent(arguments);
        }
    },

    /**
     * @private
     */
    onTimeout: function () {
        if (this._timeoutID !== null) {
            this.hide();
        }
    }
}, function (Toast) {
    var _queue = [];

    function getInstance() {
        if (!Ext.Toast._instance) {
            Ext.Toast._instance = Ext.create('Ext.Toast');
        }
        return Ext.Toast._instance;
    }

    Toast.prototype.next = function () {
        var config = _queue.shift();

        if (config) {
            this.show(config);
        }

        return !config;
    };

    Ext.toast = function (message, timeout) {
        var toast = getInstance(),
            config = message;

        if (Ext.isString(message)) {
            config = {
                message: message,
                timeout: timeout
            };
        }

        //<debug>
        if (!config) {
            throw new Error("Toast requires a message");
        }
        //</debug>

        if (config.timeout === undefined) {
            config.timeout = Ext.Toast.prototype.config.timeout;
        }

        _queue.push(config);

        if (!toast.isRendered() || toast.isHidden()) {
            toast.next();
        }

        return toast;
    }
});

