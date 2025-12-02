/* global Ext, expect */

describe('Ext.Component', function() {
    var component;

    function makeComponent(config) {
        return component = new Ext.Component(config);
    }

    var hasCls = function(cls) {
        if (component) {
            var compCls = component.getCls() || [];

            return compCls.indexOf(cls) !== -1;
        }

        return false;
    };

    var elHasCls = function(cls) {
        var el = component.element;

        return el.hasCls(cls);
    };

    afterEach(function() {
        component = Ext.destroy(component);
    });

    describe('configuration', function() {
        it('should not fire show/hide events during configuration', function() {
            var beforeShowCalled = false,
                showCalled = false,
                beforeHideCalled = false,
                hideCalled = false,
                InstrumentedComponent = Ext.define(null, {
                    extend: 'Ext.Component',

                    fireEvent: function(eventName) {
                        if (eventName === 'beforeshow') {
                            beforeShowCalled = true;
                        }
                        if (eventName === 'show') {
                            showCalled = true;
                        }
                        if (eventName === 'beforehide') {
                            beforeHideCalled = true;
                        }
                        if (eventName === 'hide') {
                            hideCalled = true;
                        }
                        this.callParent(arguments);
                    }
                });

            component = new InstrumentedComponent();
            Ext.destroy(component);
            // "hide" is fired during destroy
            hideCalled = false;
            component = new InstrumentedComponent({hidden: true});

            expect(beforeShowCalled).toBe(false);
            expect(showCalled).toBe(false);
            expect(beforeHideCalled).toBe(false);
            expect(hideCalled).toBe(false);
        });
    });

    describe("bind", function() {
        describe("defaultBindProperty", function() {
            it("should bind with a string", function() {
                makeComponent({
                    renderTo: Ext.getBody(),
                    viewModel: {
                        data: {
                            theHtml: 'foo'
                        }
                    },
                    bind: '{theHtml}'
                });
                component.getViewModel().notify();
                expect(component.getInnerHtmlElement().dom.innerHTML).toBe('foo');
            });

            it("should throw an exception if we have no default bind", function() {
                expect(function() {
                    makeComponent({
                        defaultBindProperty: '',
                        viewModel: {
                            data: {
                                theHtml: 'foo'
                            }
                        },
                        bind: '{theHtml}'
                    });
                    component.getBind();
                }).toThrow();
                
                // The caught exception above was thrown after the component was
                // constructed and registered with ComponentManager, so we have to clean up
                Ext.ComponentMgr.clearAll();
            });
        });
    });

    describe("'cls' methods", function() {
        var spy;

        describe("configuration", function() {
            it("should convert a string into an array", function() {
                makeComponent({
                    cls: 'one'
                });

                expect(component.getCls()).toEqual(['one']);
            });

            it("should accept an array", function() {
                makeComponent({
                    cls: ['one', 'two']
                });

                expect(component.getCls()).toEqual(['one', 'two']);
            });
        });

        /**
         * Ext.Component#addCls
         */
        describe("addCls", function() {
            beforeEach(function() {
                makeComponent();
                spy = spyOn(component, "updateCls");
            });

            describe("no prefix/suffix", function() {
                it("should convert the cls to an array and add it to the component", function() {
                    component.addCls('one');
                    expect(spy).toHaveBeenCalledWith(['one'], null);
                    expect(component.getCls()).toEqual(['one']);

                    component.addCls('two');
                    expect(spy).toHaveBeenCalledWith(['one', 'two'], ['one']);
                    expect(component.getCls()).toEqual(['one', 'two']);
                });

                it("should add each of the cls to the component", function() {
                    component.addCls(['one', 'two']);
                    expect(spy).toHaveBeenCalledWith(['one', 'two'], null);
                    expect(component.getCls()).toEqual(['one', 'two']);

                    component.addCls(['two', 'three']);
                    expect(spy).toHaveBeenCalledWith(['one', 'two', 'three'], ['one', 'two']);
                    expect(component.getCls()).toEqual(['one', 'two', 'three']);
                });

                it("should allow for adding both strings and arrays", function() {
                    component.addCls('one');
                    expect(spy).toHaveBeenCalledWith(['one'], null);
                    expect(component.getCls()).toEqual(['one']);

                    component.addCls(['two', 'three']);
                    expect(spy).toHaveBeenCalledWith(['one', 'two', 'three'], ['one']);
                    expect(component.getCls()).toEqual(['one', 'two', 'three']);
                });

                it("should allow for adding both strings and arrays (reverse)", function() {
                    component.addCls(['two', 'three']);
                    expect(spy).toHaveBeenCalledWith(['two', 'three'], null);
                    expect(component.getCls()).toEqual(['two', 'three']);

                    component.addCls('one');
                    expect(spy).toHaveBeenCalledWith(['two', 'three', 'one'], ['two', 'three']);
                    expect(component.getCls()).toEqual(['two', 'three', 'one']);
                });
            });

            describe("prefix", function() {
                it("should convert the cls to an array and add it to the component", function() {
                    component.addCls('one', 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one'], null);
                    expect(component.getCls()).toEqual(['x-one']);

                    component.addCls('two', 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one', 'x-two'], ['x-one']);
                    expect(component.getCls()).toEqual(['x-one', 'x-two']);
                });

                it("should add each of the cls to the component", function() {
                    component.addCls(['one', 'two'], 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one', 'x-two'], null);
                    expect(component.getCls()).toEqual(['x-one', 'x-two']);

                    component.addCls(['two', 'three'], 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one', 'x-two', 'x-three'], ['x-one', 'x-two']);
                    expect(component.getCls()).toEqual(['x-one', 'x-two', 'x-three']);
                });

                it("should allow for adding both strings and arrays", function() {
                    component.addCls('one', 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one'], null);
                    expect(component.getCls()).toEqual(['x-one']);

                    component.addCls(['two', 'three'], 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-one', 'x-two', 'x-three'], ['x-one']);
                    expect(component.getCls()).toEqual(['x-one', 'x-two', 'x-three']);
                });

                it("should allow for adding both strings and arrays (reverse)", function() {
                    component.addCls(['two', 'three'], 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-two', 'x-three'], null);
                    expect(component.getCls()).toEqual(['x-two', 'x-three']);

                    component.addCls('one', 'x-');
                    expect(spy).toHaveBeenCalledWith(['x-two', 'x-three', 'x-one'], ['x-two', 'x-three']);
                    expect(component.getCls()).toEqual(['x-two', 'x-three', 'x-one']);
                });
            });

            describe("suffix", function() {
                it("should convert the cls to an array and add it to the component", function() {
                    component.addCls('one', null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y'], null);
                    expect(component.getCls()).toEqual(['one-y']);

                    component.addCls('two', null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y', 'two-y'], ['one-y']);
                    expect(component.getCls()).toEqual(['one-y', 'two-y']);
                });

                it("should add each of the cls to the component", function() {
                    component.addCls(['one', 'two'], null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y', 'two-y'], null);
                    expect(component.getCls()).toEqual(['one-y', 'two-y']);

                    component.addCls(['two', 'three'], null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y', 'two-y', 'three-y'], ['one-y', 'two-y']);
                    expect(component.getCls()).toEqual(['one-y', 'two-y', 'three-y']);
                });

                it("should allow for adding both strings and arrays", function() {
                    component.addCls('one', null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y'], null);
                    expect(component.getCls()).toEqual(['one-y']);

                    component.addCls(['two', 'three'], null, '-y');
                    expect(spy).toHaveBeenCalledWith(['one-y', 'two-y', 'three-y'], ['one-y']);
                    expect(component.getCls()).toEqual(['one-y', 'two-y', 'three-y']);
                });

                it("should allow for adding both strings and arrays (reverse)", function() {
                    component.addCls(['two', 'three'], null, '-y');
                    expect(spy).toHaveBeenCalledWith(['two-y', 'three-y'], null);
                    expect(component.getCls()).toEqual(['two-y', 'three-y']);

                    component.addCls('one', null, '-y');
                    expect(spy).toHaveBeenCalledWith(['two-y', 'three-y', 'one-y'], ['two-y', 'three-y']);
                    expect(component.getCls()).toEqual(['two-y', 'three-y', 'one-y']);
                });
            });

            describe("prefix + suffix", function() {
                it("should convert the cls to an array and add it to the component", function() {
                    component.addCls('one', 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y'], null);
                    expect(component.getCls()).toEqual(['x-one-y']);

                    component.addCls('two', 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y', 'x-two-y'], ['x-one-y']);
                    expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);
                });

                it("should add each of the cls to the component", function() {
                    component.addCls(['one', 'two'], 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y', 'x-two-y'], null);
                    expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);

                    component.addCls(['two', 'three'], 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y', 'x-two-y', 'x-three-y'], ['x-one-y', 'x-two-y']);
                    expect(component.getCls()).toEqual(['x-one-y', 'x-two-y', 'x-three-y']);
                });

                it("should allow for adding both strings and arrays", function() {
                    component.addCls('one', 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y'], null);
                    expect(component.getCls()).toEqual(['x-one-y']);

                    component.addCls(['two', 'three'], 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-one-y', 'x-two-y', 'x-three-y'], ['x-one-y']);
                    expect(component.getCls()).toEqual(['x-one-y', 'x-two-y', 'x-three-y']);
                });

                it("should allow for adding both strings and arrays (reverse)", function() {
                    component.addCls(['two', 'three'], 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-two-y', 'x-three-y'], null);
                    expect(component.getCls()).toEqual(['x-two-y', 'x-three-y']);

                    component.addCls('one', 'x-', '-y');
                    expect(spy).toHaveBeenCalledWith(['x-two-y', 'x-three-y', 'x-one-y'], ['x-two-y', 'x-three-y']);
                    expect(component.getCls()).toEqual(['x-two-y', 'x-three-y', 'x-one-y']);
                });
            });
        });

        /**
         * Ext.Component#removeCls
         */
        describe("removeCls", function() {
            describe("no prefix/suffix", function() {
                describe("removing nothing", function() {
                    beforeEach(function() {
                        makeComponent();
                        spy = spyOn(component, "updateCls");
                    });

                    it("should do nothing", function() {
                        expect(component.getCls()).toEqual(null);

                        component.removeCls('one');

                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing single cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'one'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one']);

                        component.removeCls('one');

                        expect(spy).toHaveBeenCalledWith(null, ['one']);
                        expect(component.getCls()).toEqual(null);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one']);

                        component.removeCls(['one']);

                        expect(spy).toHaveBeenCalledWith(null, ['one']);
                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing mulitple cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['one', 'two']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one', 'two']);

                        component.removeCls('two');

                        expect(spy).toHaveBeenCalledWith(['one'], ['one', 'two']);
                        expect(component.getCls()).toEqual(['one']);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one', 'two']);

                        component.removeCls(['one']);

                        expect(spy).toHaveBeenCalledWith(['two'], ['one', 'two']);
                        expect(component.getCls()).toEqual(['two']);
                    });

                    it("should remove the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['one', 'two']);

                        component.removeCls(['one', 'two']);

                        expect(spy).toHaveBeenCalledWith(null, ['one', 'two']);
                        expect(component.getCls()).toEqual(null);
                    });
                });
            });

            describe("prefix", function() {
                describe("removing nothing", function() {
                    beforeEach(function() {
                        makeComponent();
                    });

                    it("should do nothing", function() {
                        expect(component.getCls()).toEqual(null);

                        component.removeCls('one', 'x-');

                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing single cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'x-one'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one']);

                        component.removeCls('one', 'x-');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one']);
                        expect(component.getCls()).toEqual(null);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one']);

                        component.removeCls(['one'], 'x-');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one']);
                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing mulitple cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['x-one', 'x-two']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one', 'x-two']);

                        component.removeCls('two', 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-one'], ['x-one', 'x-two']);
                        expect(component.getCls()).toEqual(['x-one']);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one', 'x-two']);

                        component.removeCls(['one'], 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-two'], ['x-one', 'x-two']);
                        expect(component.getCls()).toEqual(['x-two']);
                    });

                    it("should remove the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['x-one', 'x-two']);

                        component.removeCls(['one', 'two'], 'x-');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one', 'x-two']);
                        expect(component.getCls()).toEqual(null);
                    });
                });
            });

            describe("suffix", function() {
                describe("removing nothing", function() {
                    beforeEach(function() {
                        makeComponent();
                    });

                    it("should do nothing", function() {
                        expect(component.getCls()).toEqual(null);

                        component.removeCls('one', null, '-y');

                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing single cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'one-y'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one-y']);

                        component.removeCls('one', null, '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['one-y']);
                        expect(component.getCls()).toEqual(null);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one-y']);

                        component.removeCls(['one'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['one-y']);
                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing mulitple cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['one-y', 'two-y']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one-y', 'two-y']);

                        component.removeCls('two', null, '-y');

                        expect(spy).toHaveBeenCalledWith(['one-y'], ['one-y', 'two-y']);
                        expect(component.getCls()).toEqual(['one-y']);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one-y', 'two-y']);

                        component.removeCls(['one'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(['two-y'], ['one-y', 'two-y']);
                        expect(component.getCls()).toEqual(['two-y']);
                    });

                    it("should remove the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['one-y', 'two-y']);

                        component.removeCls(['one', 'two'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['one-y', 'two-y']);
                        expect(component.getCls()).toEqual(null);
                    });
                });
            });

            describe("prefix + suffix", function() {
                describe("removing nothing", function() {
                    beforeEach(function() {
                        makeComponent();
                    });

                    it("should do nothing", function() {
                        expect(component.getCls()).toEqual(null);

                        component.removeCls('one', 'x-', '-y');

                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing single cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'x-one-y'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one-y']);

                        component.removeCls('one', 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one-y']);
                        expect(component.getCls()).toEqual(null);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one-y']);

                        component.removeCls(['one'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one-y']);
                        expect(component.getCls()).toEqual(null);
                    });
                });

                describe("removing mulitple cls", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['x-one-y', 'x-two-y']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should remove the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);

                        component.removeCls('two', 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-one-y'], ['x-one-y', 'x-two-y']);
                        expect(component.getCls()).toEqual(['x-one-y']);
                    });

                    it("should remove the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);

                        component.removeCls(['one'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-two-y'], ['x-one-y', 'x-two-y']);
                        expect(component.getCls()).toEqual(['x-two-y']);
                    });

                    it("should remove the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);

                        component.removeCls(['one', 'two'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(null, ['x-one-y', 'x-two-y']);
                        expect(component.getCls()).toEqual(null);
                    });
                });
            });
        });

        /**
         * Ext.Component#setCls
         */
        describe("setCls", function() {
            describe("with no existing cls", function() {
                beforeEach(function() {
                    makeComponent();
                    spy = spyOn(component, "updateCls");
                });

                it("should set the cls (string)", function() {
                    expect(component.getCls()).toEqual(null);

                    component.setCls('one');

                    expect(spy).toHaveBeenCalledWith(['one'], null);
                    expect(component.getCls()).toEqual(['one']);
                });

                it("should set the cls (array)", function() {
                    expect(component.getCls()).toEqual(null);

                    component.setCls(['one', 'two']);

                    expect(spy).toHaveBeenCalledWith(['one', 'two'], null);
                    expect(component.getCls()).toEqual(['one', 'two']);
                });
            });

            describe("with existing cls (string)", function() {
                beforeEach(function() {
                    makeComponent({
                        cls: 'one'
                    });
                    spy = spyOn(component, "updateCls");
                });

                it("should set the cls (string)", function() {
                    expect(component.getCls()).toEqual(['one']);

                    component.setCls('two');

                    expect(spy).toHaveBeenCalledWith(['two'], ['one']);
                    expect(component.getCls()).toEqual(['two']);
                });

                it("should set the cls (array)", function() {
                    expect(component.getCls()).toEqual(['one']);

                    component.setCls(['two', 'three']);

                    expect(spy).toHaveBeenCalledWith(['two', 'three'], ['one']);
                    expect(component.getCls()).toEqual(['two', 'three']);
                });
            });

            describe("with existing cls (array)", function() {
                beforeEach(function() {
                    makeComponent({
                        cls: ['one', 'two']
                    });
                    spy = spyOn(component, "updateCls");
                });

                it("should set the cls (string)", function() {
                    expect(component.getCls()).toEqual(['one', 'two']);

                    component.setCls('three');

                    expect(spy).toHaveBeenCalledWith(['three'], ['one', 'two']);
                    expect(component.getCls()).toEqual(['three']);
                });

                it("should set the cls (array)", function() {
                    expect(component.getCls()).toEqual(['one', 'two']);

                    component.setCls(['four', 'three']);

                    expect(spy).toHaveBeenCalledWith(['four', 'three'], ['one', 'two']);
                    expect(component.getCls()).toEqual(['four', 'three']);
                });
            });
        });

        /**
         * Ext.Component#replaceCls
         */
        describe("replaceCls", function() {
            describe("no prefix/suffix", function() {
                describe("with no existing cls", function() {
                    beforeEach(function() {
                        makeComponent();
                        spy = spyOn(component, "updateCls");
                    });

                    it("should set the cls (string)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls('two', 'one');

                        expect(spy).toHaveBeenCalledWith(['one'], null);
                        expect(component.getCls()).toEqual(['one']);
                    });

                    it("should set the cls (array)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls(['one', 'two'], ['three', 'four']);

                        expect(spy).toHaveBeenCalledWith(['three', 'four'], null);
                        expect(component.getCls()).toEqual(['three', 'four']);
                    });
                });

                describe("with existing cls (string)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'one'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one']);

                        component.replaceCls('one', 'two');

                        expect(spy).toHaveBeenCalledWith(['two'], ['one']);
                        expect(component.getCls()).toEqual(['two']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one']);

                        component.replaceCls(['one'], ['two']);

                        expect(spy).toHaveBeenCalledWith(['two'], ['one']);
                        expect(component.getCls()).toEqual(['two']);
                    });

                    it("should replace the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['one']);

                        component.replaceCls(['one'], ['two', 'three']);

                        expect(spy).toHaveBeenCalledWith(['two', 'three'], ['one']);
                        expect(component.getCls()).toEqual(['two', 'three']);
                    });
                });

                describe("with existing cls (array)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['one', 'two']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one', 'two']);

                        component.replaceCls('one', 'three');

                        expect(spy).toHaveBeenCalledWith(['two', 'three'], ['one', 'two']);
                        expect(component.getCls()).toEqual(['two', 'three']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one', 'two']);

                        component.replaceCls(['one', 'two'], ['four', 'three']);

                        expect(spy).toHaveBeenCalledWith(['four', 'three'], ['one', 'two']);
                        expect(component.getCls()).toEqual(['four', 'three']);
                    });
                });
            });

            describe("prefix", function() {
                describe("with no existing cls", function() {
                    beforeEach(function() {
                        makeComponent();
                        spy = spyOn(component, "updateCls");
                    });

                    it("should set the cls (string)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls('two', 'one', 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-one'], null);
                        expect(component.getCls()).toEqual(['x-one']);
                    });

                    it("should set the cls (array)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls(['one', 'two'], ['three', 'four'], 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-three', 'x-four'], null);
                        expect(component.getCls()).toEqual(['x-three', 'x-four']);
                    });
                });

                describe("with existing cls (string)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'x-one'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one']);

                        component.replaceCls('one', 'two', 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-two'], ['x-one']);
                        expect(component.getCls()).toEqual(['x-two']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one']);

                        component.replaceCls(['one'], ['two'], 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-two'], ['x-one']);
                        expect(component.getCls()).toEqual(['x-two']);
                    });

                    it("should replace the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['x-one']);

                        component.replaceCls(['one'], ['two', 'three'], 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-two', 'x-three'], ['x-one']);
                        expect(component.getCls()).toEqual(['x-two', 'x-three']);
                    });
                });

                describe("with existing cls (array)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['x-one', 'x-two']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one', 'x-two']);

                        component.replaceCls('one', 'three', 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-two', 'x-three'], ['x-one', 'x-two']);
                        expect(component.getCls()).toEqual(['x-two', 'x-three']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one', 'x-two']);

                        component.replaceCls(['one', 'two'], ['four', 'three'], 'x-');

                        expect(spy).toHaveBeenCalledWith(['x-four', 'x-three'], ['x-one', 'x-two']);
                        expect(component.getCls()).toEqual(['x-four', 'x-three']);
                    });
                });
            });

            describe("suffix", function() {
                describe("with no existing cls", function() {
                    beforeEach(function() {
                        makeComponent();
                        spy = spyOn(component, "updateCls");
                    });

                    it("should set the cls (string)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls('two', 'one', null, '-y');

                        expect(spy).toHaveBeenCalledWith(['one-y'], null);
                        expect(component.getCls()).toEqual(['one-y']);
                    });

                    it("should set the cls (array)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls(['one', 'two'], ['three', 'four'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(['three-y', 'four-y'], null);
                        expect(component.getCls()).toEqual(['three-y', 'four-y']);
                    });
                });

                describe("with existing cls (string)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'one-y'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one-y']);

                        component.replaceCls('one', 'two', null, '-y');

                        expect(spy).toHaveBeenCalledWith(['two-y'], ['one-y']);
                        expect(component.getCls()).toEqual(['two-y']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one-y']);

                        component.replaceCls(['one'], ['two'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(['two-y'], ['one-y']);
                        expect(component.getCls()).toEqual(['two-y']);
                    });

                    it("should replace the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['one-y']);

                        component.replaceCls(['one'], ['two', 'three'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(['two-y', 'three-y'], ['one-y']);
                        expect(component.getCls()).toEqual(['two-y', 'three-y']);
                    });
                });

                describe("with existing cls (array)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['one-y', 'two-y']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['one-y', 'two-y']);

                        component.replaceCls('one', 'three', null, '-y');

                        expect(spy).toHaveBeenCalledWith(['two-y', 'three-y'], ['one-y', 'two-y']);
                        expect(component.getCls()).toEqual(['two-y', 'three-y']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['one-y', 'two-y']);

                        component.replaceCls(['one', 'two'], ['four', 'three'], null, '-y');

                        expect(spy).toHaveBeenCalledWith(['four-y', 'three-y'], ['one-y', 'two-y']);
                        expect(component.getCls()).toEqual(['four-y', 'three-y']);
                    });
                });
            });

            describe("prefix+suffix", function() {
                describe("with no existing cls", function() {
                    beforeEach(function() {
                        makeComponent();
                        spy = spyOn(component, "updateCls");
                    });

                    it("should set the cls (string)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls('two', 'one', 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-one-y'], null);
                        expect(component.getCls()).toEqual(['x-one-y']);
                    });

                    it("should set the cls (array)", function() {
                        expect(component.getCls()).toEqual(null);

                        component.replaceCls(['one', 'two'], ['three', 'four'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-three-y', 'x-four-y'], null);
                        expect(component.getCls()).toEqual(['x-three-y', 'x-four-y']);
                    });
                });

                describe("with existing cls (string)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: 'x-one-y'
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one-y']);

                        component.replaceCls('one', 'two', 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-two-y'], ['x-one-y']);
                        expect(component.getCls()).toEqual(['x-two-y']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one-y']);

                        component.replaceCls(['one'], ['two'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-two-y'], ['x-one-y']);
                        expect(component.getCls()).toEqual(['x-two-y']);
                    });

                    it("should replace the cls (array, multiple)", function() {
                        expect(component.getCls()).toEqual(['x-one-y']);

                        component.replaceCls(['one'], ['two', 'three'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-two-y', 'x-three-y'], ['x-one-y']);
                        expect(component.getCls()).toEqual(['x-two-y', 'x-three-y']);
                    });
                });

                describe("with existing cls (array)", function() {
                    beforeEach(function() {
                        makeComponent({
                            cls: ['x-one-y', 'x-two-y']
                        });
                        spy = spyOn(component, "updateCls");
                    });

                    it("should replace the cls (string)", function() {
                        expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);

                        component.replaceCls('one', 'three', 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-two-y', 'x-three-y'], ['x-one-y', 'x-two-y']);
                        expect(component.getCls()).toEqual(['x-two-y', 'x-three-y']);
                    });

                    it("should replace the cls (array)", function() {
                        expect(component.getCls()).toEqual(['x-one-y', 'x-two-y']);
                        component.replaceCls(['one', 'two'], ['four', 'three'], 'x-', '-y');

                        expect(spy).toHaveBeenCalledWith(['x-four-y', 'x-three-y'], ['x-one-y', 'x-two-y']);
                        expect(component.getCls()).toEqual(['x-four-y', 'x-three-y']);
                    });
                });
            });
        });

        describe("toggleCls", function() {
            describe("add cls", function() {
                it("add to component's element", function() {
                    makeComponent();

                    component.toggleCls('one');

                    expect(component.element).toHaveCls('one');
                });

                it("add cls to component's cls cache", function() {
                    makeComponent();

                    component.toggleCls('one');

                    expect(hasCls('one')).toBe(true);
                });

                it("force add cls to component", function() {
                    makeComponent({
                        cls : 'one'
                    });

                    //normally since the component already has the cls it would remove
                    //but since we are passing `true`, it will force it to add
                    component.toggleCls('one', true);

                    expect(hasCls('one')).toBe(true);
                });
            });

            describe("remove cls", function() {
                it("remove from component's element", function() {
                    makeComponent({
                        cls : 'one'
                    });

                    component.toggleCls('one');

                    expect(component.element).not.toHaveCls('one');
                });

                it("remove cls from component's cls cache", function() {
                    makeComponent({
                        cls : 'one'
                    });

                    component.toggleCls('one');

                    expect(hasCls('one')).toBe(false);
                });
            });
        });
    });

    describe("visibility", function() {
        describe("isHidden", function() {
            describe("deep=undefined", function() {
                describe("as a root", function() {
                    it("should return true if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isHidden()).toBe(true);
                    });

                    it("should return false if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isHidden()).toBe(false);
                    });
                });

                describe("in a container", function() {
                    it("should return true if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden()).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden()).toBe(true);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden()).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden()).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isHidden()).toBe(false);
                        ct.destroy();
                    });
                });
            });

            describe("deep=false", function() {
                describe("as a root", function() {
                    it("should return true if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isHidden(false)).toBe(true);
                    });

                    it("should return false if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isHidden(false)).toBe(false);
                    });
                });

                describe("in a container", function() {
                    it("should return true if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(false)).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(false)).toBe(true);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(false)).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(false)).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isHidden(false)).toBe(false);
                        ct.destroy();
                    });
                });
            });

            describe("deep=true", function() {
                describe("as a root", function() {
                    it("should return true if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isHidden(true)).toBe(true);
                    });

                    it("should return false if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isHidden(true)).toBe(false);
                    });
                });

                describe("in a container", function() {
                    it("should return true if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(true)).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(true)).toBe(true);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(true)).toBe(false);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isHidden(true)).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isHidden(true)).toBe(true);
                        ct.destroy();
                    });
                });
            });
        });

        describe("isVisible", function() {
            describe("deep=undefined", function() {
                describe("as a root", function() {
                    it("should return false if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isVisible()).toBe(false);
                    });

                    it("should return true if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isVisible()).toBe(true);
                    });
                });

                describe("in a container", function() {
                    it("should return false if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible()).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible()).toBe(false);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible()).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible()).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isVisible()).toBe(true);
                        ct.destroy();
                    });
                });
            });

            describe("deep=false", function() {
                describe("as a root", function() {
                    it("should return false if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isVisible(false)).toBe(false);
                    });

                    it("should return true if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isVisible(false)).toBe(true);
                    });
                });

                describe("in a container", function() {
                    it("should return false if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(false)).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(false)).toBe(false);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(false)).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(false)).toBe(true);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isVisible(false)).toBe(true);
                        ct.destroy();
                    });
                });
            });

            describe("deep=true", function() {
                describe("as a root", function() {
                    it("should return false if the component is hidden", function() {
                        makeComponent({
                            hidden: true
                        });
                        expect(component.isVisible(true)).toBe(false);
                    });

                    it("should return true if the component is not hidden", function() {
                        makeComponent();
                        expect(component.isVisible(true)).toBe(true);
                    });
                });

                describe("in a container", function() {
                    it("should return false if the component is hidden but the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(true)).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component',
                                hidden: true
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(true)).toBe(false);
                        ct.destroy();
                    });

                    it("should return true if the component is not hidden and the container is not", function() {
                        var ct = new Ext.Container({
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(true)).toBe(true);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and the container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'component'
                            }
                        });
                        component = ct.getItems().first();
                        expect(component.isVisible(true)).toBe(false);
                        ct.destroy();
                    });

                    it("should return false if the component is not hidden and a high level container is hidden", function() {
                        var ct = new Ext.Container({
                            hidden: true,
                            items: {
                                xtype: 'container',
                                items: {
                                    xtype: 'container',
                                    items: {
                                        xtype: 'component',
                                        itemId: 'c'
                                    }
                                }
                            }
                        });
                        component = ct.down('#c');
                        expect(component.isVisible(true)).toBe(false);
                        ct.destroy();
                    });
                });
            });
        });
    });

    describe('modal positioned', function() {
        var ct;
        afterEach(function() {
            Ext.destroy(ct);
        });

        it("should set the mask's zIndex one less that its own zIndex", function() {
            makeComponent({
                centered: true,
                modal: true
            });
            ct = new Ext.Container({
                items: component,
                renderTo: document.body
            });
            component.show();

            // Mask must be below component
            expect(Number(component.getModal().el.dom.style.zIndex)).toBe(Number(component.el.dom.style.zIndex) - 1);
        });
    });

    describe('setData call', function() {
        it("should convert a string into an array", function () {
            makeComponent({
                tpl : 'first name is {fname}'
            });

            component.setData({
                fname : null
            });

            expect(component.innerHtmlElement.dom.innerHTML).toEqual('first name is ');
        });
    });

    describe('destroy', function () {
        it("should fire the 'destroy' event", function () {
            var cmp = makeComponent({}),
                isFired;

            cmp.on('destroy', function () {
                isFired = true;
            });
            cmp.destroy();

            expect(isFired).toBe(true);
        });

        it("should destroy the animations when destroying the component", function() {
            var cmp = makeComponent({
                renderTo: Ext.getBody(),
                showAnimation: {
                    type: 'slideIn',
                    duration: 250,
                    easing: 'ease-out'
                },

                hideAnimation: {
                    type: 'slideOut',
                    duration: 250,
                    easing: 'ease-in'
                },
                modal: true,
                floated: true,
                html: 'Test'
            }),
            showAnim = cmp.getShowAnimation(),
            hideAnim = cmp.getHideAnimation();

            cmp.show();
            cmp.hide();

            spyOn(showAnim, 'destroy');
            spyOn(hideAnim, 'destroy');
            cmp.destroy();
            expect(showAnim.destroy).toHaveBeenCalled();
            expect(hideAnim.destroy).toHaveBeenCalled();
        });
    });

});
