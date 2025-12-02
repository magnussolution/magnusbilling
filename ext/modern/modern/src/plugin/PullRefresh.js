/**
 * This plugin adds pull to refresh functionality to the List.
 *
 * ## Example
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: ['name', 'img', 'text'],
 *         data: [
 *             {
 *                 name: 'rdougan',
 *                 img: 'https://www.sencha.com/forum/images/statusicon/forum_new-48.png',
 *                 text: 'JavaScript development'
 *             }
 *         ]
 *     });
 *
 *     Ext.create('Ext.dataview.List', {
 *         fullscreen: true,
 *
 *         store: store,
 *
 *         plugins: [
 *             {
 *                 xclass: 'Ext.plugin.PullRefresh',
 *                 pullText: 'Pull down for more new Tweets!'
 *             }
 *         ],
 *
 *         itemTpl: [
 *             '<img src="{img}" alt="{name} photo" />',
 *             '<div class="tweet"><b>{name}:</b> {text}</div>'
 *         ]
 *     });
 */
Ext.define('Ext.plugin.PullRefresh', {
    extend: 'Ext.Component',
    alias: 'plugin.pullrefresh',

    config: {
        width: '100%',
        /**
         * @cfg {Ext.dataview.List} list
         * The list to which this PullRefresh plugin is connected.
         * This will usually by set automatically when configuring the list with this plugin.
         * @accessor
         */
        list: null,

        /**
         * @cfg {String} pullText The text that will be shown while you are pulling down.
         * @accessor
         */
        pullText: 'Pull down to refresh...',

        /**
         * @cfg {String} releaseText The text that will be shown after you have pulled down enough to show the release message.
         * @accessor
         */
        releaseText: 'Release to refresh...',

        /**
         * @cfg {String} loadingText The text that will be shown while the list is refreshing.
         * @accessor
         */
        loadingText: 'Loading...',

        /**
         * @cfg {String} loadedText The text that will be when data has been loaded.
         * @accessor
         */
        loadedText: 'Loaded.',

        /**
         * @cfg {String} lastUpdatedText The text to be shown in front of the last updated time.
         * @accessor
         */
        lastUpdatedText: 'Last Updated:&nbsp;',

        /**
         * @cfg {Boolean} autoSnapBack Determines whether the pulldown should automatically snap back after data has been loaded.
         * If false call {@link #snapBack}() to manually snap the pulldown back.
         */
        autoSnapBack: true,

        /**
         * @cfg {Number} snappingAnimationDuration The duration for snapping back animation after the data has been refreshed
         * @accessor
         */
        snappingAnimationDuration: 300,
        /**
         * @cfg {String} lastUpdatedDateFormat The format to be used on the last updated date.
         */
        lastUpdatedDateFormat: 'm/d/Y h:iA',

        /**
         * @cfg {Number} overpullSnapBackDuration The duration for snapping back when pulldown has been lowered further then its height.
         */
        overpullSnapBackDuration: 300,

        /**
         * @cfg {Ext.XTemplate/String/Array} pullTpl The template being used for the pull to refresh markup.
         * Will be passed a config object with properties state, message and updated
         *
         * @accessor
         */
        pullTpl: [
            '<div class="' + Ext.baseCSSPrefix + 'list-pullrefresh-arrow"></div>',
            '<div class="' + Ext.baseCSSPrefix + 'loading-spinner">',
                '<span class="' + Ext.baseCSSPrefix + 'loading-top"></span>',
                '<span class="' + Ext.baseCSSPrefix + 'loading-right"></span>',
                '<span class="' + Ext.baseCSSPrefix + 'loading-bottom"></span>',
                '<span class="' + Ext.baseCSSPrefix + 'loading-left"></span>',
            '</div>',
            '<div class="' + Ext.baseCSSPrefix + 'list-pullrefresh-wrap">',
            '<h3 class="' + Ext.baseCSSPrefix + 'list-pullrefresh-message">{message}</h3>',
            '<div class="' + Ext.baseCSSPrefix + 'list-pullrefresh-updated">{updated}</div>',
            '</div>'
        ].join(''),

        translatable: true
    },

    /**
     * @private
     */
    $state: 'pull',

    refreshCls: Ext.baseCSSPrefix + 'list-pullrefresh',

    /**
     * @private
     */
    getState: function() {
        return this.$state
    },

    /**
     * @private
     */
    setState: function(value) {
        this.$state = value;
        this.updateView();
    },

    /**
     * @private
     */
    $isSnappingBack: false,

    /**
     * @private
     */
    getIsSnappingBack: function() {
        return this.$isSnappingBack;
    },

    /**
     * @private
     */
    setIsSnappingBack: function(value) {
        this.$isSnappingBack = value;
    },

    /**
     * @private
     */
    init: function(list) {
        this.setList(list);
        this.initScrollable();
    },

    getElementConfig: function() {
        return {
            reference: 'element',
            classList: ['x-unsized'],
            children: [{
                reference: 'innerElement',
                className: this.refreshCls
            }]
        };
    },

    /**
     * @private
     */
    initScrollable: function() {
        var me = this,
            list = me.getList(),
            scroller = list.getScrollable();

        if (!scroller) {
            return;
        }

        me.lastUpdated = new Date();

        list.insert(0, me);

        scroller.on({
            scroll: me.onScrollChange,
            scope: me
        });

        me.updateView();
    },

    /**
     * @private
     */
    applyPullTpl: function(config) {
        if (config instanceof Ext.XTemplate) {
            return config
        } else {
            return new Ext.XTemplate(config);
        }
    },

    /**
     * @private
     */
    updateList: function(newList, oldList) {
        var me = this;

        if (newList) {
            newList.on({
                order: 'after',
                scrollablechange: me.initScrollable,
                scope: me
            });
        }

        if (oldList) {
            oldList.un({
                order: 'after',
                scrollablechange: me.initScrollable,
                scope: me
            });
        }
    },

    /**
     * @private
     */
    getPullHeight: function() {
        return this.innerElement.getHeight();
    },

    /**
     * @private
     * Attempts to load the newest posts via the attached List's Store's Proxy
     */
    fetchLatest: function() {
        this.getList().getStore().fetch({
            page: 1,
            start: 0,
            callback: this.onLatestFetched,
            scope: this
        });
    },

    /**
     * @private
     * Called after fetchLatest has finished grabbing data. Matches any returned records against what is already in the
     * Store. If there is an overlap, updates the existing records with the new data and inserts the new items at the
     * front of the Store. If there is no overlap, insert the new records anyway and record that there's a break in the
     * timeline between the new and the old records.
     */
    onLatestFetched: function(newRecords) {
        var me = this,
            store = me.getList().getStore(),
            oldRecords = store.getData(),
            length = newRecords.length,
            toInsert = [],
            newRecord, oldRecord, i;

        for (i = 0; i < length; i++) {
            newRecord = newRecords[i];
            oldRecord = oldRecords.getByKey(newRecord.getId());

            if (oldRecord) {
                oldRecord.set(newRecord.getData());
            } else {
                toInsert.push(newRecord);
            }

            oldRecord = undefined;
        }

        store.insert(0, toInsert);
        me.setState('loaded');
        me.fireEvent('latestfetched', me, toInsert);

        if (me.getAutoSnapBack()) {
            me.snapBack();
        }
    },

    /**
     * Snaps the List back to the top after a pullrefresh is complete
     * @param {Boolean} force Force the snapback to occur regardless of state {optional}
     */
    snapBack: function(force) {
        var me = this,
            list, scroller;

        if (this.getState() !== 'loaded' && force !== true) {
            return;
        }

        list = me.getList();
        scroller = list.getScrollable();

        me.setIsSnappingBack(true);
        scroller.doScrollTo(null, 0, {
            callback: Ext.bind(me.onSnapBackEnd, me),
            duration: me.getSnappingAnimationDuration()
        });
    },

    /**
     * @private
     * Called when PullRefresh has been snapped back to the top
     */
    onSnapBackEnd: function() {
        var list = this.getList(),
            scroller = list.getScrollable();

        // TODO
        //scroller.setMinUserPosition({x:0, y:0});
        this.setState('pull');
        this.setIsSnappingBack(false);
    },

    /**
     * @private
     * Called when the Scroller updates from the list
     * @param scroller
     * @param x
     * @param y
     */
    onScrollChange: function(scroller, x, y) {
        if (y > 0) {
            return;
        }

        var me = this,
            pullHeight = me.getPullHeight(),
            isSnappingBack = me.getIsSnappingBack(),
            state = me.getState();

        if (state === 'loaded' && !isSnappingBack) {
            me.snapBack();
        }


        if (state !== 'loading' && state !== 'loaded') {
            if (-y >= pullHeight + 10) {
                me.setState('release');
                scroller.getElement().onBefore({
                    dragend: 'onScrollerDragEnd',
                    single: true,
                    scope: me
                });
            } else if (state === "release" && (-y < pullHeight + 10)) {
                me.setState('pull');
                scroller.getElement().unBefore({
                    dragend: 'onScrollerDragEnd',
                    single: true,
                    scope: me
                });
            }
        }
        me.getTranslatable().translate(0, -y);
    },

    /**
     * @private
     * Called when the user is done dragging, this listener is only added when the user has pulled far enough for a refresh
     */
    onScrollerDragEnd: function() {
        var me = this,
            pullHeight, list, scroller;

        if (me.getState() === 'loading') {
            return;
        }

        list = me.getList();
        scroller = list.getScrollable();
        pullHeight = me.getPullHeight();

        me.setState('loading');

        /*
        TODO
        scroller.setMinUserPosition({
            x: 0,
            y: -pullHeight
        });

        scroller.doScrollTo(0, -pullHeight, {
            callback: Ext.bind(me.fetchLatest, me),
            easingY: {
                duration: me.getOverpullSnapBackDuration()
            }
        }, true);
        */
    },

    /**
     * @private
     * Updates the content based on the PullRefresh Template
     */
    updateView: function() {
        var me = this,
            innerElement = me.innerElement,
            state = me.getState(),
            lastUpdatedText = me.getLastUpdatedText() + Ext.util.Format.date(me.lastUpdated, me.getLastUpdatedDateFormat()),
            templateConfig = {state: state, updated: lastUpdatedText},
            stateFn = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase(),
            fn = 'get' + stateFn + 'Text';

        if (me[fn] && Ext.isFunction(me[fn])) {
            templateConfig.message = me[fn].call(me);
        }

        innerElement.removeCls(['loaded', 'loading', 'release', 'pull'], me.refreshCls);
        innerElement.addCls(state, me.refreshCls);
        me.getPullTpl().overwrite(innerElement, templateConfig);
    }
});