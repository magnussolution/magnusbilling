describe("Ext.plugin.PullRefresh", function() {
    var store, proxy, list, plugin, model, supportsTouch, supportsTouchScroll;

    beforeEach(function() {
        // make sure we are testing "touch" scrolling
        supportsTouch = Ext.supports.Touch;
        supportsTouchScroll = Ext.supports.touchScroll;
        Ext.supports.Touch = true;
        Ext.supports.touchScroll = 2;

        store = new Ext.data.Store({
            fields: ['id', 'title'],

            data: [
                {id: 11, title: 'First Item'},
                {id: 12, title: 'Second Item'},
                {id: 13, title: 'Third Item'},
                {id: 14, title: 'Fourth Item'},
                {id: 15, title: 'Fifth Item'}
            ],

            proxy: {
                type: 'ajax',
                url: 'notreal'
            }
        });

        proxy = store.getProxy();
        model = store.getModel();

        list = new Ext.List({
            plugins: ['pullrefresh'],
            store: store,
            displayField: 'title'
        });

        plugin = list.getPlugins()[0];
    });

    afterEach(function() {
        list.destroy();
        list = null;
        
        Ext.supports.Touch = supportsTouch;
        Ext.supports.touchScroll = supportsTouchScroll;
    });

    describe("fetching latest items", function() {
        var operation;

        beforeEach(function() {
            spyOn(proxy, 'read').andCallFake(function(op) {
                operation = op;
            });
        });

        it("should send a read request via the Store's Proxy", function() {
            plugin.fetchLatest();

            expect(proxy.read).toHaveBeenCalled();
        });

        describe("the Operation", function() {
            beforeEach(function() {
                plugin.fetchLatest();
            });

            it("should be a read Operation", function() {
                expect(operation.getAction()).toBe('read');
            });

            it("should specify page 1", function() {
                expect(operation.getPage()).toBe(1);
            });

            it("should set start to 0", function() {
                expect(operation.getStart()).toBe(0);
            });

            it("should set page size to the Store's page size", function() {
                expect(operation.getLimit()).toBe(store.getPageSize());
            });
        });
    });

    describe("when latest fetched items come back", function() {
        describe("if there are no new items", function() {
            var operation;
            beforeEach(function() {
                operation = new Ext.data.operation.Read({
                    model: model,
                    records: []
                });
            });

            it("should leave all of the Store items unmolested", function() {
                plugin.onLatestFetched(operation);

                expect(store.getCount()).toBe(5);
            });
        });

        describe("if the fetched items overlap with records already in the store", function() {
            var newRecords, operation;

            beforeEach(function() {
                newRecords = [];

                var raw = [
                    {id: 1, title: 'New First Item'},
                    {id: 2, title: 'New Second Item'},
                    {id: 3, title: 'New Third Item'},
                    {id: 4, title: 'New Fourth Item'},
                    {id: 5, title: 'New Fifth Item'},
                    {id: 6, title: 'New Sixth Item'},
                    {id: 7, title: 'New Seventh Item'},
                    {id: 8, title: 'New Eighth Item'},
                    {id: 9, title: 'New Ninth Item'},
                    {id: 10, title: 'New Tenth Item'},
                    {id: 11, title: 'Updated First Item'},
                    {id: 12, title: 'Updated Second Item'}
                ];

                Ext.each(raw, function(data, i) {
                    newRecords[i] = new model(data);
                }, this);

                operation = new Ext.data.operation.Read({
                    records: newRecords,
                    model: model
                });

                plugin.onLatestFetched(newRecords, operation);
            });

            it("should have the correct number of items in the Store", function() {
                expect(store.getCount()).toBe(15);
            });

            it("should update the data for any items that came back in the response but were already present", function() {
                expect(store.getById(11).get('title')).toBe('Updated First Item');
                expect(store.getById(12).get('title')).toBe('Updated Second Item');
            });
        });

        describe("if the fetched items do not overlap with records already in the store", function() {
            var newRecords, operation;

            beforeEach(function() {
                newRecords = [];

                var raw = [
                    {id: 1, title: 'New First Item'},
                    {id: 2, title: 'New Second Item'},
                    {id: 3, title: 'New Third Item'},
                    {id: 4, title: 'New Fourth Item'},
                    {id: 5, title: 'New Fifth Item'}
                ];

                Ext.each(raw, function(data, i) {
                    newRecords[i] = new model(data);
                }, this);

                operation = new Ext.data.operation.Read({
                    records: newRecords,
                    model: model
                });
            });

            it("should insert any new items at the front of the Store", function() {
                plugin.onLatestFetched(newRecords, operation);

                expect(store.getCount()).toBe(10);
                expect(store.getAt(0).getId()).toBe(1);
                expect(store.getAt(1).getId()).toBe(2);
                expect(store.getAt(2).getId()).toBe(3);
                expect(store.getAt(3).getId()).toBe(4);
                expect(store.getAt(4).getId()).toBe(5);
            });

            it("should record that a break occurred after the last new item", function() {

            });
        });
    });
});