/**
 */
Ext.define('Ext.grid.plugin.PagingToolbar', {
    extend: 'Ext.AbstractPlugin',
    alias: ['plugin.pagingtoolbar', 'plugin.gridpagingtoolbar'],
    mixins: ['Ext.mixin.Hookable'],

    requires: [
        'Ext.grid.PagingToolbar'
    ],

    config: {
        grid: null,

        currentPage: 1,
        totalPages: 0,
        pageSize: 0,
        totalCount: 0,
        loadPages: null,

        toolbar: {
            xtype: 'pagingtoolbar',
            docked: 'bottom'
        }
    },

    init: function(grid) {
        this.setGrid(grid);
        grid.add(this.getToolbar());
    },

    destroy: function(){
        this.setGrid(null);
        this.callParent();
    },

    updateGrid: function(grid, oldGrid) {
        var me = this;

        me.gridListeners = me.storeListeners = Ext.destroy(me.gridListeners, me.storeListeners);

        if (oldGrid) {
            me.unbindHook(oldGrid, 'onScrollBinder', 'checkPageChange');
        }

        if (grid) {
            me.gridListeners = grid.on({
                updatevisiblecount: 'onUpdateVisibleCount',
                storechange: 'onStoreChanged',
                destroyable: true,
                scope: me
            });

            me.bindStore(grid.getStore());
            me.bindHook(grid, 'onScrollBinder', 'checkPageChange');
        }
    },

    bindStore: function(store){
        var me = this;

        Ext.destroy(me.storeListeners);
        me.getToolbar().setDisabled(!!store);

        if(!store){
            return;
        }

        me.storeListeners = store.on({
            add: 'onTotalCountChange',
            remove: 'onTotalCountChange',
            refresh: 'onTotalCountChange',
            clear: 'onTotalCountChange',
            destroyable: true,
            scope: me
        });

        /* we have two scenarios:
         1. pageSize = 0, which means that we have the entire data in the store
         and we just need to show current page in the toolbar

         2. we have pageSize > 0 which means that we probably don't have the
         entire data in the store and we need to load it page by page
         */
        me.setLoadPages(store.pageSize > 0);

        if(store.isLoaded()){
            me.onTotalCountChange(store);
        }
    },

    onStoreChanged: function(grid, store){
        this.bindStore(store);
    },

    /**
     * @private
     */
    getPageData: function() {
        var grid = this.getGrid(),
            store = grid.getStore(),
            totalCount = store.getTotalCount() || store.getCount(),
            pageSize = this.getLoadPages() ? store.pageSize : grid.visibleCount,
            pageCount = Math.ceil(totalCount / pageSize);

        return {
            totalCount : totalCount,
            totalPages: Ext.Number.isFinite(pageCount) ? pageCount : 1,
            currentPage : store.currentPage,
            pageSize: pageSize
        };
    },

    checkPageChange: function() {
        var me = this,
            grid = me.getGrid(),
            pageSize = me.getPageSize(),
            currentPage = me.getCurrentPage(),
            topVisibleIndex = grid.topVisibleIndex,
            newPage = Math.ceil( (topVisibleIndex + pageSize) / pageSize); // on the first page topVisibleIndex is 0

        if (grid.getStore() && !me.getLoadPages() && newPage > 0 && newPage !== currentPage) {
            me.preventGridScroll = true;
            me.setCurrentPage(newPage);
            me.preventGridScroll = false;
        }
    },

    applyToolbar: function(toolbar, oldToolbar) {
        return Ext.factory(toolbar, Ext.Toolbar, oldToolbar);
    },

    updateToolbar: function(toolbar) {
        var me = this;

        if (toolbar) {
            toolbar.getSliderField().on({
                change: 'onPageChange',
                drag: 'onPageSliderDrag',
                scope: me
            });

            toolbar.getNextButton().on({
                tap: 'onNextPageTap',
                scope: me
            });

            toolbar.getPrevButton().on({
                tap: 'onPreviousPageTap',
                scope: me
            });
        }
    },

    onPageChange: function(field, value) {
        this.setCurrentPage(value);
    },

    onPageSliderDrag: function(field, slider, value) {
        this.setCurrentPage(Ext.isArray(value) ? value[0] : value);
    },

    onNextPageTap: function() {
        var nextPage = this.getCurrentPage() + 1;
        if (nextPage <= this.getTotalPages()) {
            this.setCurrentPage(nextPage);
        }
    },

    onPreviousPageTap: function() {
        var previousPage = this.getCurrentPage() - 1;
        if (previousPage > 0) {
            this.setCurrentPage(previousPage);
        }
    },

    onTotalCountChange: function(store) {
        var me = this,
            data = me.getPageData();

        me.bulkConfigs = true;
        me.setConfig(data);
        me.bulkConfigs = false;
        me.syncSummary();
    },

    onUpdateVisibleCount: function(grid, visibleCount) {
        var store = grid.getStore(),
            totalCount;

        if(store && !this.getLoadPages()){
            visibleCount -= 1;
            this.setPageSize(visibleCount);
            totalCount = store.getTotalCount() || store.getCount();
            this.setTotalPages( Math.ceil(totalCount / visibleCount) );
        }
    },

    updateTotalPages: function() {
        if(!this.isConfiguring) {
            this.syncSummary();
        }
    },

    updateCurrentPage: function(page) {
        var me = this;

        if(!me.isConfiguring) {
            if(me.getLoadPages()){
                me.getGrid().getStore().loadPage(page);
            }else{
                me.syncSummary();
            }
        }
    },

    updateTotalCount: function(totalCount) {
        if(!this.isConfiguring) {
            this.syncSummary();
        }
    },

    getPageTopRecord: function(page) {
        var grid = this.getGrid(),
            store = grid && grid.getStore(),
            pageSize = this.getPageSize(),
            pageTopRecordIndex = (page - 1) * pageSize;

        return store && store.getAt(pageTopRecordIndex);
    },

    privates: {
        syncSummary: function() {
            var me = this,
                grid = me.getGrid(),
                toolbar = me.getToolbar(),
                sliderField = toolbar.getSliderField(),
                currentPage = me.getCurrentPage(),
                totalPages = me.getTotalPages(),
                pageTopRecord;

            if(me.bulkConfigs){
                return;
            }

            // TODO: Calling setHtml causes a performance issue while live scrolling,
            // this might be worth looking into.
            toolbar.getSummaryComponent().element.dom.innerHTML = currentPage + ' / ' + totalPages;

            sliderField.setMaxValue(totalPages || 1);
            sliderField.setValue(currentPage);

            pageTopRecord = me.getPageTopRecord(currentPage);
            if (grid && !me.preventGridScroll && pageTopRecord) {
                grid.scrollToRecord(pageTopRecord);
            }

            toolbar.getNextButton().setDisabled(currentPage === totalPages);
            toolbar.getPrevButton().setDisabled(currentPage === 1);
        }
    }
});
