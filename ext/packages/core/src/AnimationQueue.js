/**
 * @private
 */
Ext.define('Ext.AnimationQueue', {
    singleton: true,

    constructor: function() {
        var me = this;

        me.queue = [];
        me.taskQueue = [];
        me.runningQueue = [];
        me.idleQueue = [];
        me.isRunning = false;
        me.isIdle = true;

        me.run = Ext.Function.bind(me.run, me);

        // iOS has a nasty bug which causes pending requestAnimationFrame to not release
        // the callback when the WebView is switched back and forth from / to being background process
        // We use a watchdog timer to workaround this, and restore the pending state correctly if this happens
        // This timer has to be set as an interval from the very beginning and we have to keep it running for
        // as long as the app lives, setting it later doesn't seem to work
        if (Ext.os.is.iOS) {
            Ext.interval(me.watch, 500, me);
        }
    },

    /**
     *
     * @param {Function} fn
     * @param {Object} [scope]
     * @param {Object} [args]
     */
    start: function(fn, scope, args) {
        var me = this;

        me.queue.push(arguments);

        if (!me.isRunning) {
            if (me.hasOwnProperty('idleTimer')) {
                clearTimeout(me.idleTimer);
                delete me.idleTimer;
            }

            if (me.hasOwnProperty('idleQueueTimer')) {
                clearTimeout(me.idleQueueTimer);
                delete me.idleQueueTimer;
            }

            me.isIdle = false;
            me.isRunning = true;
            //<debug>
            me.startCountTime = Ext.now();
            me.count = 0;
            //</debug>
            me.doStart();
        }
    },

    watch: function() {
        if (this.isRunning && Ext.now() - this.lastRunTime >= 500) {
            this.run();
        }
    },

    run: function() {
        var me = this;

        if (!me.isRunning) {
            return;
        }

        var queue = me.runningQueue,
            now = Ext.now(),
            i, ln;

        me.lastRunTime = now;
        me.frameStartTime = now;

        queue.push.apply(queue, me.queue); // take a snapshot of the current queue and run it

        for (i = 0, ln = queue.length; i < ln; i++) {
            me.invoke(queue[i]);
        }

        queue.length = 0;

        //<debug>
        var elapse = me.frameStartTime - me.startCountTime,
            count = ++me.count;

        if (elapse >= 200) {
            me.onFpsChanged(count * 1000 / elapse, count, elapse);
            me.startCountTime = me.frameStartTime;
            me.count = 0;
        }
        //</debug>

        me.doIterate();
    },

    //<debug>
    onFpsChanged: Ext.emptyFn,

    onStop: Ext.emptyFn,
    //</debug>

    doStart: function() {
        this.animationFrameId = Ext.Function.requestAnimationFrame(this.run);
        this.lastRunTime = Ext.now();
    },

    doIterate: function() {
        this.animationFrameId = Ext.Function.requestAnimationFrame(this.run);
    },

    doStop: function() {
        Ext.Function.cancelAnimationFrame(this.animationFrameId);
    },

    /**
     *
     * @param {Function} fn
     * @param {Object} [scope]
     * @param {Object} [args]
     */
    stop: function(fn, scope, args) {
        var me = this;

        if (!me.isRunning) {
            return;
        }

        var queue = me.queue,
            ln = queue.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = queue[i];
            if (item[0] === fn && item[1] === scope && item[2] === args) {
                queue.splice(i, 1);
                i--;
                ln--;
            }
        }

        if (ln === 0) {
            me.doStop();
            //<debug>
            me.onStop();
            //</debug>
            me.isRunning = false;

            me.idleTimer = Ext.defer(me.whenIdle, 100, me);
        }
    },

    onIdle: function(fn, scope, args) {
        var listeners = this.idleQueue,
            i, ln, listener;

        for (i = 0, ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                return;
            }
        }

        listeners.push(arguments);

        if (this.isIdle) {
            this.processIdleQueue();
        }
    },

    unIdle: function(fn, scope, args) {
        var listeners = this.idleQueue,
            i, ln, listener;

        for (i = 0, ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                listeners.splice(i, 1);
                return true;
            }
        }

        return false;
    },

    queueTask: function(fn, scope, args) {
        this.taskQueue.push(arguments);
        this.processTaskQueue();
    },

    dequeueTask: function(fn, scope, args) {
        var listeners = this.taskQueue,
            i, ln, listener;

        for (i = 0, ln = listeners.length; i < ln; i++) {
            listener = listeners[i];
            if (fn === listener[0] && scope === listener[1] && args === listener[2]) {
                listeners.splice(i, 1);
                i--;
                ln--;
            }
        }
    },

    invoke: function(listener) {
        var fn = listener[0],
            scope = listener[1],
            args = listener[2];

        fn = (typeof fn == 'string' ? scope[fn] : fn);

        if (Ext.isArray(args)) {
            fn.apply(scope, args);
        }
        else {
            fn.call(scope, args);
        }
    },

    whenIdle: function() {
        this.isIdle = true;
        this.processIdleQueue();
    },

    processIdleQueue: function() {
        if (!this.hasOwnProperty('idleQueueTimer')) {
            this.idleQueueTimer = Ext.defer(this.processIdleQueueItem, 1, this);
        }
    },

    processIdleQueueItem: function() {
        delete this.idleQueueTimer;

        if (!this.isIdle) {
            return;
        }

        var listeners = this.idleQueue,
            listener;

        if (listeners.length > 0) {
            listener = listeners.shift();
            this.invoke(listener);
            this.processIdleQueue();
        }
    },

    processTaskQueue: function() {
        if (!this.hasOwnProperty('taskQueueTimer')) {
            this.taskQueueTimer = Ext.defer(this.processTaskQueueItem, 15, this);
        }
    },

    processTaskQueueItem: function() {
        delete this.taskQueueTimer;

        var listeners = this.taskQueue,
            listener;

        if (listeners.length > 0) {
            listener = listeners.shift();
            this.invoke(listener);
            this.processTaskQueue();
        }
    }
    //<debug>
    ,

    /**
     *
     * @param {Number} fps Frames per second.
     * @param {Number} count Actual number of frames rendered during interval.
     * @param {Number} interval Interval duration.
     */
    showFps: function () {
        var styleTpl = {
            color: 'white',
            'background-color': 'black',
            'text-align': 'center',
            'font-family': 'sans-serif',
            'font-size': '8px',
            'font-weight': 'normal',
            'font-style': 'normal',
            'line-height': '20px',
            '-webkit-font-smoothing': 'antialiased',

            'zIndex': 100000,
            position: 'absolute'
        };

        Ext.getBody().append([
            // --- Average ---
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: 0,
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Average'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'red',
                    'font-size': '18px',
                    'line-height': '50px',

                    bottom: 0,
                    left: 0,
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__averageFps',
                html: '0'
            },
            // --- Min ---
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '50px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Min (Last 1k)'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'orange',
                    'font-size': '18px',
                    'line-height': '50px',

                    bottom: 0,
                    left: '50px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__minFps',
                html: '0'
            },
            // --- Max ---
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '100px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Max (Last 1k)'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'maroon',
                    'font-size': '18px',
                    'line-height': '50px',

                    bottom: 0,
                    left: '100px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__maxFps',
                html: '0'
            },
            // --- Current ---
            {
                style: Ext.applyIf({
                    bottom: '50px',
                    left: '150px',
                    width: '50px',
                    height: '20px'
                }, styleTpl),
                html: 'Current'
            },
            {
                style: Ext.applyIf({
                    'background-color': 'green',
                    'font-size': '18px',
                    'line-height': '50px',

                    bottom: 0,
                    left: '150px',
                    width: '50px',
                    height: '50px'
                }, styleTpl),
                id: '__currentFps',
                html: '0'
            }
        ]);

        Ext.AnimationQueue.resetFps();
    },

    resetFps: function () {
        var currentFps = Ext.get('__currentFps'),
            averageFps = Ext.get('__averageFps'),
            minFps = Ext.get('__minFps'),
            maxFps = Ext.get('__maxFps'),
            min = 1000,
            max = 0,
            count = 0,
            sum = 0;

        if (!currentFps) {
            return;
        }

        Ext.AnimationQueue.onFpsChanged = function (fps) {
            count++;

            if (!(count % 10)) {
                min = 1000;
                max = 0;
            }

            sum += fps;
            min = Math.min(min, fps);
            max = Math.max(max, fps);
            currentFps.setHtml(Math.round(fps));
            // All-time average since last reset.
            averageFps.setHtml(Math.round(sum / count));
            minFps.setHtml(Math.round(min));
            maxFps.setHtml(Math.round(max));
        };
    }

}, function () {
    /*
        Global FPS indicator. Add ?showfps to use in any application. Note that this REQUIRES true requestAnimationFrame
        to be accurate.
     */
    var paramsString = window.location.search.substr(1),
        paramsArray = paramsString.split("&");

    if (Ext.Array.contains(paramsArray, "showfps")) {
        Ext.onReady(Ext.Function.bind(this.showFps, this));
    }
//</debug>
});
