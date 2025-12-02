describe("Ext.toolbar.Toolbar", function(){
    var toolbar;

    function createToolbar(cfg) {
        toolbar = new Ext.toolbar.Toolbar(Ext.apply({
            width: 200,
            renderTo: Ext.getBody()
        }, cfg || {}));
    }

    afterEach(function () {
        Ext.destroy(toolbar);
        toolbar = null;
    });
    
    it("should default to using a hbox layout", function() {
        createToolbar();
        expect(toolbar.getLayout() instanceof Ext.layout.container.HBox);
    });

    describe('overflow', function () {
        describe('when enableOverflow is false', function () {
            it('should not create a menu', function () {
                // false is the default value.
                createToolbar({
                    enableOverflow: false
                });
                expect(toolbar.layout.overflowHandler).toBeNull();
            });
        });

        describe('when enableOverflow is true', function () {
            it('should create an overflow menu', function () {
                createToolbar({
                    enableOverflow: true
                });
                expect(toolbar.layout.overflowHandler.menu).toBeDefined();
            });

            it('should create an overflow menu with type "menu"', function () {
                createToolbar({
                    enableOverflow: true
                });
                expect(toolbar.layout.overflowHandler.type).toBe('menu');
            });
        });

        describe('overflow item values', function() {
            it('should sync the values between master and clone fields', function() {
                var menu, barfield, menufield;
                createToolbar({
                    enableOverflow: true,
                    width: 100,
                    items : [{
                        text : 'Foo'
                    },{
                        text : 'Bar'
                    },{
                        text : 'Test'
                    },{
                        xtype: 'textfield'
                    }]
                });
                menu = toolbar.layout.overflowHandler.menu;
                menu.show();
                
                menufield = menu.down('textfield');
                barfield = menufield.masterComponent;

                menufield.setValue('Foo');
                
                expect(menufield.getValue()).toBe(barfield.getValue());
            });

            it('should sync the radio field value master and clone when master has been checked', function() {
                var menu, barfield, menufield;
                createToolbar({
                    enableOverflow: true,
                    width: 100,
                    items : [{
                        text : 'Foo'
                    },{
                        text : 'Bar'
                    },{
                        text : 'Test'
                    },{
                        xtype: 'radio',
                        name : 'foo'
                    }]
                });
                menu = toolbar.layout.overflowHandler.menu;
                menu.show();

                barfield = toolbar.down('radio');
                menufield = barfield.overflowClone;
                
                barfield.setValue(true);
                
                expect(menufield.getValue()).toBe(barfield.getValue());
            });

            it('should sync the radio field value master and clone when clone has been clicked', function() {
                var menu, barfield, menufield;
                createToolbar({
                    enableOverflow: true,
                    width: 100,
                    items : [{
                        text : 'Foo'
                    },{
                        text : 'Bar'
                    },{
                        text : 'Test'
                    },{
                        xtype: 'radio',
                        name : 'foo'
                    }]
                });
                menu = toolbar.layout.overflowHandler.menu;
                menu.show();

                barfield = toolbar.down('radio');
                menufield = barfield.overflowClone;
                
                jasmine.fireMouseEvent(menu.el, 'click');
                jasmine.fireMouseEvent(menufield.el, 'click');

                expect(menufield.getValue()).toBe(true);
                
                expect(menufield.getValue()).toBe(barfield.getValue());
            });
        });
    });

    describe('defaultButtonUI', function() {
        it("should use the defaultButtonUI for child buttons with no ui configured on the instance", function() {
            // This test causes layout failure in IE8, but otherwise tests out fine.
            // Since it's not about layout, silencing the error is OK.
            spyOn(Ext.log, 'error');
            
            createToolbar({
                height: 30,
                defaultButtonUI: 'foo',
                items: [{
                    text: 'Bar'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('foo-small');
        });

        it("should not use the defaultButtonUI for child buttons with ui configured on the instance", function() {
            // See above
            spyOn(Ext.log, 'error');
            
            createToolbar({
                height: 30,
                defaultButtonUI: 'foo',
                items: [{
                    text: 'Bar',
                    ui: 'bar'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('bar-small');
        });

        it("should not use the defaultButtonUI for child buttons with ui of 'default' configured on the instance", function() {
            createToolbar({
                defaultButtonUI: 'foo',
                items: [{
                    text: 'Bar',
                    ui: 'default'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('default-small');
        });

        it("should use the defaultButtonUI for segmented buttons with no defaultUI configured on the instance", function() {
            createToolbar({
                defaultButtonUI: 'foo',
                items: [{
                    xtype: 'segmentedbutton',
                    items: [{
                        text: 'Bar'
                    }]
                }]
            });

            expect(toolbar.items.getAt(0).getDefaultUI()).toBe('foo');
            expect(toolbar.items.getAt(0).items.getAt(0).ui).toBe('foo-small');
        });

        it("should not use the defaultButtonUI for segmented buttons with defaultUI configured on the instance", function() {
            createToolbar({
                defaultButtonUI: 'foo',
                items: [{
                    xtype: 'segmentedbutton',
                    defaultUI: 'bar',
                    items: [{
                        text: 'Bar'
                    }]
                }]
            });

            expect(toolbar.items.getAt(0).getDefaultUI()).toBe('bar');
            expect(toolbar.items.getAt(0).items.getAt(0).ui).toBe('bar-small');
        });

        it("should not use the defaultButtonUI for segmented buttons with defaultUI of 'default' configured on the instance", function() {
            createToolbar({
                defaultButtonUI: 'foo',
                items: [{
                    xtype: 'segmentedbutton',
                    defaultUI: 'default',
                    items: [{
                        text: 'Bar'
                    }]
                }]
            });

            expect(toolbar.items.getAt(0).getDefaultUI()).toBe('default');
            expect(toolbar.items.getAt(0).items.getAt(0).ui).toBe('default-small');
        });
    });

    describe('defaultFieldUI', function() {
        it("should use the defaultFieldUI for child fields with no ui configured on the instance", function() {
            createToolbar({
                defaultFieldUI: 'foo',
                items: [{
                    xtype: 'textfield'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('foo');
        });

        it("should not use the defaultFieldUI for child fields with ui configured on the instance", function() {
            createToolbar({
                defaultFieldUI: 'foo',
                items: [{
                    xtype: 'textfield',
                    ui: 'bar'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('bar');
        });

        it("should not use the defaultFieldUI for child fields with ui of 'default' configured on the instance", function() {
            createToolbar({
                defaultFieldUI: 'foo',
                items: [{
                    xtype: 'textfield',
                    ui: 'default'
                }]
            });

            expect(toolbar.items.getAt(0).ui).toBe('default');
        });
    });
    
    describe("FocusableContainer", function() {
        it("should be on with buttons", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }, {
                    xtype: 'button'
                }]
            });
            
            expect(toolbar.tabGuardBeforeEl).toHaveAttr('tabIndex', '0');
            expect(toolbar.tabGuardAfterEl).toHaveAttr('tabIndex', '0');
        });
        
        it("should be off with input fields", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }, {
                    xtype: 'textfield'
                }]
            });
            
            expect(toolbar.tabGuardBeforeEl).not.toHaveAttr('tabIndex');
            expect(toolbar.tabGuardAfterEl).not.toHaveAttr('tabIndex');
        });
        
        it("should be off with sliders", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }, {
                    xtype: 'slider'
                }]
            });
            
            expect(toolbar.tabGuardBeforeEl).not.toHaveAttr('tabIndex');
            expect(toolbar.tabGuardAfterEl).not.toHaveAttr('tabIndex');
        });
    });
    
    describe("ARIA", function() {
        it("should have toolbar role with buttons", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }]
            });
            
            expect(toolbar).toHaveAttr('role', 'toolbar');
        });
        
        it("should have group role with input fields", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }, {
                    xtype: 'textfield'
                }]
            });
            
            expect(toolbar).toHaveAttr('role', 'group');
        });
        
        it("should have group role with sliders", function() {
            createToolbar({
                items: [{
                    xtype: 'button'
                }, {
                    xtype: 'slider'
                }]
            });
            
            expect(toolbar).toHaveAttr('role', 'group');
        });
    });
});
