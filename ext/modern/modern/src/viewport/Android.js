/**
 * @private
 * Android version of viewport.
 */
Ext.define('Ext.viewport.Android', {
    extend: 'Ext.viewport.Default',

    config: {
        translatable: {
            translationMethod: 'csstransform'
        }
    },

    constructor: function() {
        this.callParent(arguments);

        this.on({
            orientationchange: 'hideKeyboardIfNeeded',
            scope: this,
            // run our handler before user code
            priority: 1001
        });
    },

    getWindowWidth: function () {
        return this.element.getWidth();
    },

    getWindowHeight: function () {
        return this.element.getHeight();
    },

    getDummyInput: function() {
        var input = this.dummyInput,
            focusedElement = this.focusedElement,
            box = Ext.fly(focusedElement).getBox();

        if (!input) {
            this.dummyInput = input = document.createElement('input');
            input.style.position = 'absolute';
            input.style.opacity = '0';
            input.style.pointerEvents = 'none';
            document.body.appendChild(input);
        }

        input.style.left = box.left + 'px';
        input.style.top = box.top + 'px';
        input.style.display = '';

        return input;
    },

    doBlurInput: function(e) {
        var target = e.target,
            focusedElement = this.focusedElement,
            dummy;

        if (focusedElement && !this.isInputRegex.test(target.tagName)) {
            dummy = this.getDummyInput();
            delete this.focusedElement;
            dummy.focus();

            Ext.defer(function() {
                dummy.style.display = 'none';
            }, 100);
        }
    },

    hideKeyboardIfNeeded: function() {
        var focusedElement = this.focusedElement;

        if (focusedElement) {
            delete this.focusedElement;

            if (Ext.os.version.lt('4')) {
                focusedElement.style.display = 'none';
            }
            else {
                focusedElement.blur();
            }

            Ext.defer(function() {
                focusedElement.style.display = '';
            }, 1000);
        }
    },

    doFireOrientationChangeEvent: function() {
        this.orientationChanging = true;

        this.waitUntil(function() {
            return this.getWindowOuterHeight() !== this.windowOuterHeight;
        }, function() {
            this.windowOuterHeight = this.getWindowOuterHeight();
            this.updateSize();
            this.orientationChanging = false;

        }, function() {
            //<debug>
            Ext.Logger.error("Timeout waiting for viewport's outerHeight to change before firing orientationchange", this);
            //</debug>
        });

        return this;
    },

    getActualWindowOuterHeight: function() {
        return Math.round(this.getWindowOuterHeight() / window.devicePixelRatio);
    },

    maximize: function() {
        var stretchHeights = this.stretchHeights,
            orientation = this.orientation,
            height;

        height = stretchHeights[orientation];

        if (!height) {
            stretchHeights[orientation] = height = this.getActualWindowOuterHeight();
        }

        if (!this.addressBarHeight) {
            this.addressBarHeight = height - this.getWindowHeight();
        }

        this.setHeight(height);

        var isHeightMaximized = Ext.Function.bind(this.isHeightMaximized, this, [height]);

        this.scrollToTop();
        this.waitUntil(isHeightMaximized, this.fireMaximizeEvent, this.fireMaximizeEvent);
    },

    isHeightMaximized: function(height) {
        this.scrollToTop();
        return this.getWindowHeight() === height;
    },

    doPreventZooming: function (e) {
        // Don't prevent right mouse event
        if ('button' in e && e.button !== 0) {
            return;
        }

        var target = e.target;

        if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName) && !this.focusedElement) {
            e.preventDefault();
        }
    }

}, function() {
    if (!Ext.os.is.Android) {
        return;
    }

    var version = Ext.os.version,
        userAgent = Ext.browser.userAgent,
        // These Android devices have a nasty bug which causes JavaScript timers to be completely frozen
        // when the browser's viewport is being panned.
        isBuggy = /(htc|desire|incredible|ADR6300)/i.test(userAgent) && version.lt('2.3');

    if (isBuggy) {
        this.override({
            constructor: function(config) {
                if (!config) {
                    config = {};
                }

                config.autoMaximize = false;

                this.watchDogTick = Ext.Function.bind(this.watchDogTick, this);

                Ext.interval(this.watchDogTick, 1000);

                return this.callParent([config]);
            },

            watchDogTick: function() {
                this.watchDogLastTick = Ext.Date.now();
            },

            doPreventPanning: function() {
                var now = Ext.Date.now(),
                    lastTick = this.watchDogLastTick,
                    deltaTime = now - lastTick;

                // Timers are frozen
                if (deltaTime >= 2000) {
                    return;
                }

                return this.callParent(arguments);
            },

            doPreventZooming: function() {
                var now = Ext.Date.now(),
                    lastTick = this.watchDogLastTick,
                    deltaTime = now - lastTick;

                // Timers are frozen
                if (deltaTime >= 2000) {
                    return;
                }

                return this.callParent(arguments);
            }
        });
    }

    if (version.match('2')) {
        this.override({
            onReady: function() {
                this.addWindowListener('resize', Ext.Function.bind(this.onWindowResize, this));

                this.callParent(arguments);
            },

            scrollToTop: function() {
                document.body.scrollTop = 100;
            },

            onWindowResize: function() {
                var oldWidth = this.windowWidth,
                    oldHeight = this.windowHeight,
                    width = this.getWindowWidth(),
                    height = this.getWindowHeight();

                if (this.getAutoMaximize() && !this.isMaximizing && !this.orientationChanging
                    && window.scrollY === 0
                    && oldWidth === width
                    && height < oldHeight
                    && ((height >= oldHeight - this.addressBarHeight) || !this.focusedElement)) {
                        this.scrollToTop();
                }
            }
        });
    }
    else if (version.gtEq('3.1')) {
        this.override({
            isHeightMaximized: function(height) {
                this.scrollToTop();
                return this.getWindowHeight() === height - 1;
            }
        });
    }
    else if (version.match('3')) {
        this.override({
            isHeightMaximized: function() {
                this.scrollToTop();
                return true;
            }
        });
    }

    if (version.gtEq('4')) {
        this.override({
            doBlurInput: Ext.emptyFn
        });
    }
});
