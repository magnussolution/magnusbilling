describe('Ext.navigation.View', function() {
    var view,
        createView = function(config) {
            config = Ext.apply(config, {
                renderTo: Ext.getBody(),
                width: 300,
                height: 400
            });

            view = Ext.create('Ext.navigation.View', config);
        },
        listener = function(){};

    afterEach(function() {
        if (view) {
            view.destroy();
        }
    });

    // configs
    describe("items", function() {
        var spy = jasmine.createSpy();

        afterEach(function(){
            spy.reset();
        });

        it("should be able to render without children", function() {
            createView();
            expect(view.getActiveItem()).toBeUndefined();
        });

        it("should be able to activate a child item", function() {
            createView({
                items: [{
                    html: 'item 1'
                },{
                    html: 'item 2'
                }],
                listeners: {
                    activeitemchange: spy
                }
            });
            // in EXTJS-21865 this throws an error
            view.setActiveItem(1);
            waitsFor(function(){
                return !!spy.callCount;
            });
            runs(function(){
                expect(view.getActiveItem().getHtml()).toEqual('item 2');
            });
        });

        it("should be able to add a new child item", function(){
            createView({
                items: [{
                    html: 'item 1'
                }],
                listeners: {
                    add: spy
                }
            });
            // in EXTJS-21865 this throws an error
            view.add({
                html: 'item 4'
            });
            waitsFor(function(){
                return !!spy.callCount;
            });
            runs(function() {
                expect(view.getActiveItem().getHtml()).toEqual('item 4');
            });
        });

        it("should be able to remove all items and add a new item", function(){
            createView({
                items: [{
                    html: 'item 1'
                },{
                    html: 'item 2'
                },{
                    html: 'item 3'
                }],
                listeners: {
                    add: spy
                }
            });
            view.removeAll();
            view.add({
                html: 'item 4'
            });
            waitsFor(function(){
                return !!spy.callCount;
            });
            runs(function() {
                expect(view.getActiveItem().getHtml()).toEqual('item 4');
            });
        });
    });
    // end configs
});