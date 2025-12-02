Ext.testHelper = {
    defaultTarget: document.createElement('div'),

    createTouchList: function(touches) {
        var touchList = [],
            i, ln, touch;

        for (i = 0, ln = touches.length; i < ln; i++) {
            touch = touches[i];

            touchList.push(this.createTouch(touch));
        }

        return touchList;
    },

    createTouch: function(touch) {
        return Ext.merge({
            target: this.defaultTarget,
            timeStamp: Ext.Date.now(),
            time: Ext.Date.now(),
            pageX: 0,
            pageY: 0,
            identifier: 0,
            point: new Ext.util.Point(touch.pageX || 0, touch.pageY || 0)
        }, touch || {});
    },

    createTouchEvent: function(event) {
        var touchEvent = Ext.merge({
            type: 'touchstart',
            target: this.defaultTarget,
            timeStamp: Ext.Date.now(),
            time: Ext.Date.now(),
            touches: [],
            changedTouches: [],
            targetTouches: [],
            pageX: 0,
            pageY: 0
        }, event || {});

        touchEvent.touches = this.createTouchList(touchEvent.touches);
        touchEvent.changedTouches = this.createTouchList(touchEvent.changedTouches);
        touchEvent.targetTouches = this.createTouchList(touchEvent.targetTouches);

        return touchEvent;
    },

    createTouchEvents: function(events) {
        var ret = [],
            i, ln, event;

        for (i = 0, ln = events.length; i < ln; i++) {
            event = events[i];

            ret.push(this.createTouchEvent(event));
        }

        return ret;
    },

    recognize: function(recognizer, events) {
        var currentTouchesCount = 0,
            i, ln, e;

        events = this.createTouchEvents(events);

        mainLoop: for (i = 0, ln = events.length; i < ln; i++) {
            e = events[i];

            switch (e.type) {
                case 'touchstart':
                    var changedTouchesCount = e.changedTouches.length,
                        isStarted = currentTouchesCount > 0;

                    currentTouchesCount += changedTouchesCount;

                    if (!isStarted) {
                        if (recognizer.onStart(e) === false) {
                            break mainLoop;
                        }
                    }

                    if (recognizer.onTouchStart(e) === false) {
                        break mainLoop;
                    }

                    break;

                case 'touchmove':
                    if (recognizer.onTouchMove(e) === false) {
                        break mainLoop;
                    }
                    break;

                case 'touchend':
                    changedTouchesCount = e.changedTouches.length;

                    currentTouchesCount -= changedTouchesCount;

                    if (recognizer.onTouchEnd(e) === false) {
                        break mainLoop;
                    }

                    if (this.currentTouchesCount === 0) {
                        if (recognizer.onEnd(e) === false) {
                            break mainLoop;
                        }
                    }
                    break;
            }
        }

        return events;
    },

    pointerEvents: {
        start: 'pointerdown',
        move: 'pointermove',
        end: 'pointerup',
        cancel: 'pointercancel'
    },

    msPointerEvents: {
        start: 'MSPointerDown',
        move: 'MSPointerMove',
        end: 'MSPointerUp',
        cancel: 'MSPointerCancel'
    },

    touchEvents: {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend',
        cancel: 'touchcancel'
    },

    mouseEvents: {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'
    },

    fireEvent: function(type, target, cfg) {
        var scroll = Ext.getDoc().getScroll(),
            pointerType, touch, id, touches, centre, activeTouches;

        if (!cfg) {
            cfg = {};
        }

        cfg.id = cfg.id || 1;

        if (cfg.x == null || cfg.y == null) {
            // Default to the middle of the target
            centre = Ext.fly(target).getAnchorXY('c');

            if (cfg.x == null) {
                cfg.x = centre[0];
            }

            if (cfg.y == null) {
                cfg.y = centre[1];
            }
        }

        pointerType = cfg.pointerType || (document.createTouch ? 'touch' : 'mouse');

        if (Ext.supports.PointerEvents || Ext.supports.MSPointerEvents) {
            jasmine.firePointerEvent(
                target,
                (Ext.supports.PointerEvents ? this.pointerEvents[type] : this.msPointerEvents[type]),
                cfg.id,
                (cfg.x || 0) - scroll.left,
                (cfg.y || 0) - scroll.top,
                cfg.button || 0,
                false,
                false,
                false,
                pointerType
            );
        } else if (pointerType === 'mouse') {
            jasmine.fireMouseEvent(
                target,
                this.mouseEvents[type],
                (cfg.x || 0) - scroll.left,
                (cfg.y || 0) - scroll.top,
                cfg.button ? cfg.button : 0
            );
        } else if (document.createTouch) {
            activeTouches = this.activeTouches || (this.activeTouches = {});

            touch = activeTouches[cfg.id] = {
                identifier: cfg.id,
                pageX: cfg.x,
                pageY: cfg.y
            };

            if (type === 'end' || type === 'cancel') {
                delete activeTouches[cfg.id];
            }

            touches = [];

            for (id in activeTouches) {
                touches.push(activeTouches[id]);
            }

            jasmine.fireTouchEvent(
                target,
                this.touchEvents[type],
                touches,
                [touch]
            );
        } else {
            throw 'Cannot simulate event. pointerType: "' + pointerType + '" is not supported on this device.';
        }
    },

    tap: function(target, cfg) {
        this.fireEvent('start', target, cfg);
        this.fireEvent('end', target, cfg);
    },

    touchStart: function(target, cfg) {
        this.fireEvent('start', target, cfg);
    },

    touchMove: function(target, cfg) {
        this.fireEvent('move', target, cfg);
    },

    touchEnd: function(target, cfg) {
        this.fireEvent('end', target, cfg);
    },

    touchCancel: function(target, cfg) {
        this.fireEvent('cancel', target, cfg);
    },

    // jazzman automatically invokes this method after each spec
    reset: function() {
        this.activeTouches = null;
    }
};