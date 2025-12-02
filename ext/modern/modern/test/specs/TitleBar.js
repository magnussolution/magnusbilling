describe('Ext.TitleBar', function() {
    var toolbar,
        createToolbar = function(config) {
            config = Ext.apply(config, {
                
            });

            toolbar = Ext.create('Ext.TitleBar', config);
        };

    afterEach(function() {
        if (toolbar) {
            toolbar.destroy();
        }
    });

    // configs
    describe("configurations", function() {
        describe("title", function() {
            describe("method", function() {
                beforeEach(function() {
                    createToolbar({
                        title: 'testing'
                    });
                });

                it("should return text", function() {
                    expect(toolbar.getTitle()).toEqual('testing');
                });
            });
        });
    });
    // end configs
});























































