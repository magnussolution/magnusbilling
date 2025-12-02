describe("Ext.plugin.ListPaging", function() {
    var store, list, plugin;
    
    beforeEach(function() {
        store = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            pageSize: 5,
            data: [
                {id: 1, name: 'First Item'},
                {id: 2, name: 'Second Item'},
                {id: 3, name: 'Third Item'},
                {id: 4, name: 'Fourth Item'},
                {id: 5, name: 'Fifth Item'},
                {id: 6, name: 'Sixth Item'}
            ]
        });
        
        list = Ext.create('Ext.List', {
            plugins: 'listpaging',
            store: store,
            itemTpl: 'Yeah'
        });
        
        plugin = list.getPlugins()[0];
    });
    
    afterEach(function() {
        store.destroy();
        list.destroy();
        store = list = null;
    });
    
    describe("initializing", function() {
        it("should save a reference to the List", function() {
            expect(plugin.getList()).toEqual(list);
        });
        
        it("should save a reference to the List's Scroller", function() {
            expect(plugin.getScroller()).toEqual(list.getScrollable());
        });
    });
    
    describe("loading the next page", function() {
        beforeEach(function() {
            spyOn(store, 'nextPage').andReturn({});
        });
        
        it("should call nextPage on the attached store", function() {
            plugin.loadNextPage();
            expect(store.nextPage).toHaveBeenCalled();
        });
        
        it("should mark the plugin as loading", function() {
            expect(plugin.getLoading()).toEqual(false);
            
            plugin.loadNextPage();
            
            expect(plugin.getLoading()).toEqual(true);
        });
        
        //this happens when using the ListPaging and PullRefresh plugins together on the same list
        xdescribe("if additional records had been inserted before loading the next page", function() {
            var loadOptions;
            
            beforeEach(function() {
                loadOptions = {};
                
                store.insert(0, new (store.getModel())({id: 6, name: 'Sixth item'}));
                
                spyOn(store, 'load').andCallFake(function(options) {
                    loadOptions = options;
                });
                
                plugin.loadNextPage();
            });
            
            it("should set the right start index", function() {
                expect(loadOptions.start).toEqual(6);
            });
            
            it("should set the right limit", function() {
                expect(loadOptions.limit).toEqual(store.getPageSize());
            });
        });
    });
});