describe('Ext.Toolbar', function() {
    var toolbar;
    
    function createToolbar(config) {
        config = Ext.apply({
            
        }, config);

        toolbar = Ext.create('Ext.Toolbar', config);
    };

    afterEach(function() {
        if (toolbar) {
            toolbar.destroy();
        }
        
        toolbar = null;
    });

    // deprecated
    describe('deprecated configurations + methods', function() {

    }); 
    // end deprecated

    // configs
    describe("configurations", function() {
        describe("title", function() {
            describe("configuration", function() {
                describe("with string", function() {
                    beforeEach(function() {
                        createToolbar({title:'test'});
                    });

                    it("should create a title instance", function() {
                        expect(toolbar.getTitle() instanceof Ext.Title).toBeTruthy();
                    });

                    it("should have the correct title", function() {
                        expect(toolbar.getTitle().getTitle()).toEqual('test');
                    });
                });

                describe("with config", function() {
                    beforeEach(function() {
                        createToolbar({
                            title: {
                                title: 'test'
                            }
                        });
                    });

                    it("should create a title instance", function() {
                        expect(toolbar.getTitle() instanceof Ext.Title).toBeTruthy();
                    });

                    it("should have the correct title", function() {
                        expect(toolbar.getTitle().getTitle()).toEqual('test');
                    });
                });
            });

            describe("method", function() {
                
            });
        });
    });
    // end configs
});
