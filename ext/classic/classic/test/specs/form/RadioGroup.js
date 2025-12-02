describe("Ext.form.RadioGroup", function() {
    var group;

    function makeGroup(items, cfg) {
        group = new Ext.form.RadioGroup(Ext.apply({
            renderTo: Ext.getBody(),
            items: items
        }, cfg));
    }

    afterEach(function() {
        Ext.destroy(group);
        group = null;
    });

    describe("setValue", function() {
        it("should check the matching item", function() {
            makeGroup([{
                name: 'foo',
                inputValue: 'a'
            }, {
                name: 'foo',
                inputValue: 'b'
            }, {
                name: 'foo',
                inputValue: 'c'
            }]);

            group.setValue({
                foo: 'b'
            });

            expect(group.getValue()).toEqual({
                foo: 'b'
            });
        });

        describe("with a view model", function() {
            it("should be able to set the value with inline data", function() {
                var vm = new Ext.app.ViewModel({
                    data: {
                        theValue: {
                            foo: 'b'
                        }
                    }
                });

                makeGroup([{
                    name: 'foo',
                    inputValue: 'a'
                }, {
                    name: 'foo',
                    inputValue: 'b'
                }, {
                    name: 'foo',
                    inputValue: 'c'
                }], {
                    viewModel: vm,
                    bind: {
                        value: '{theValue}'
                    }
                });

                vm.notify();

                expect(group.getValue()).toEqual({
                    foo: 'b'
                });
            });

            it("should be able to set the value with a defined viewmodel", function() {
                Ext.define('spec.Bar', {
                    extend: 'Ext.app.ViewModel',
                    alias: 'viewmodel.bar',
                    data: {
                        theValue: {
                            foo: 'b'
                        }
                    }
                });

                makeGroup([{
                    name: 'foo',
                    inputValue: 'a'
                }, {
                    name: 'foo',
                    inputValue: 'b'
                }, {
                    name: 'foo',
                    inputValue: 'c'
                }], {
                    viewModel: {
                        type: 'bar'
                    },
                    bind: {
                        value: '{theValue}'
                    }
                });

                group.getViewModel().notify();

                expect(group.getValue()).toEqual({
                    foo: 'b'
                });
                Ext.undefine('spec.Bar');
                Ext.Factory.viewModel.instance.clearCache();
            });
        });
    });
    
    describe("ARIA", function() {
        beforeEach(function() {
            makeGroup([{
                name: 'foo'
            }, {
                name: 'bar'
            }, {
                name: 'baz'
            }]);
        });
        
        describe("ariaEl", function() {
            it("should have containerEl as ariaEl", function() {
                expect(group.ariaEl).toBe(group.containerEl);
            });
        });
        
        describe("attributes", function() {
            it("should have radiogroup role", function() {
                expect(group).toHaveAttr('role', 'radiogroup');
            });
            
            it("should have aria-invalid", function() {
                expect(group).toHaveAttr('aria-invalid', 'false');
            });
            
            describe("aria-required", function() {
                it("should be false when allowBlank", function() {
                    expect(group).toHaveAttr('aria-required', 'false');
                });
                
                it("should be true when !allowBlank", function() {
                    var group2 = new Ext.form.RadioGroup({
                        renderTo: Ext.getBody(),
                        allowBlank: false,
                        items: [{
                            name: 'foo'
                        }, {
                            name: 'bar'
                        }]
                    });
                    
                    expect(group2).toHaveAttr('aria-required', 'true');
                    
                    Ext.destroy(group2);
                    group2 = null;
                });
            });
        });
        
        describe("state", function() {
            describe("aria-invalid", function() {
                beforeEach(function() {
                    group.markInvalid(['foo']);
                });
                
                it("should set aria-invalid to tru in markInvalid", function() {
                    expect(group).toHaveAttr('aria-invalid', 'true');
                });
                
                it("should set aria-invalid to false in clearInvalid", function() {
                    group.clearInvalid();
                    
                    expect(group).toHaveAttr('aria-invalid', 'false');
                });
            });
        });
    });
});