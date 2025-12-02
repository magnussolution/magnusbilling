describe('Ext.Button', function() {
    var button;
    
    function createButton(config) {
        config = Ext.apply({
        }, config);
        
        button = new Ext.Button(config);
    };

    afterEach(function() {
        if (button) {
            button.destroy();
        }
        
        button = null;
    });

    describe("pressed", function() {
        function createRenderButton(config) {
            Ext.apply(config, {
                renderTo: Ext.getBody(),
                text: 'Foo'
            });
            createButton(config);
        }

        describe("configuration", function() {
            describe("pressed state", function() {
                it("should not be pressed by default", function() {
                    createRenderButton();
                    expect(button.isPressed()).toBe(false);
                });

                it("should not be pressed with pressed: false", function() {
                    createRenderButton({
                        pressed: false
                    });
                    expect(button.isPressed()).toBe(false);
                });

                it("should be pressed with pressed: true", function() {
                    createRenderButton({
                        pressed: true
                    });
                    expect(button.isPressed()).toBe(true);
                });
            });

            describe("pressedCls", function() {
                it("should not have the pressedCls by default", function() {
                    createRenderButton();
                    expect(button.element).not.toHaveCls(button.getPressedCls());
                });

                it("should not have the pressedCls with pressed: false", function() {
                    createRenderButton({
                        pressed: false
                    });
                    expect(button.element).not.toHaveCls(button.getPressedCls());
                });

                it("should have the pressedCls with pressed: true", function() {
                    createRenderButton({
                        pressed: true
                    });
                    expect(button.element).toHaveCls(button.getPressedCls());
                });

                it("should accept a custom pressedCls", function() {
                    createRenderButton({
                        pressed: true,
                        pressedCls: 'foo'
                    });
                    expect(button.element).toHaveCls('foo');
                });
            });

            describe("events", function() {
                it("should not fire events with pressed: false", function() {
                    var spy = jasmine.createSpy();
                    createRenderButton({
                        pressed: false,
                        listeners: {
                            beforepressedchange: spy,
                            pressedchange: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });

                it("should not fire events with pressed: true", function() {
                    var spy = jasmine.createSpy();
                    createRenderButton({
                        pressed: true,
                        listeners: {
                            beforepressedchange: spy,
                            pressedchange: spy
                        }
                    });
                    expect(spy).not.toHaveBeenCalled();
                });
            }); 
        });

        describe("dynamic", function() {
            describe("setPressed", function() {
                describe("when pressed: false", function() {
                    describe("setPressed(false)", function() {
                        it("should leave the pressed state as false", function() {
                            createRenderButton({
                                pressed: false
                            });
                            button.setPressed(false);
                            expect(button.isPressed()).toBe(false);
                        });

                        it("should not add the pressedCls", function() {
                            createRenderButton({
                                pressed: false
                            });
                            button.setPressed(false);
                            expect(button.element).not.toHaveCls(button.getPressedCls());
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();
                                createRenderButton({
                                    pressed: false,
                                    listeners: {
                                        beforepressedchange: spy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(false);
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe("setPressed(true)", function() {
                        it("should set the pressed state to true", function() {
                            createRenderButton({
                                pressed: false
                            });
                            button.setPressed(true);
                            expect(button.isPressed()).toBe(true);
                        });

                        it("should add the pressedCls", function() {
                            createRenderButton({
                                pressed: false
                            });
                            button.setPressed(true);
                            expect(button.element).toHaveCls(button.getPressedCls());
                        });

                        describe("events", function() {
                            it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                                var order = [],
                                    beforeSpy = jasmine.createSpy().andCallFake(function() {
                                        order.push('beforechange');
                                    }),
                                    spy = jasmine.createSpy().andCallFake(function() {
                                        order.push('change');
                                    });

                                createRenderButton({
                                    pressed: false,
                                    listeners: {
                                        beforepressedchange: beforeSpy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(true);

                                expect(beforeSpy.callCount).toBe(1);
                                expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                                expect(beforeSpy.mostRecentCall.args[1]).toBe(true);
                                expect(beforeSpy.mostRecentCall.args[2]).toBe(false);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(true);
                                expect(spy.mostRecentCall.args[2]).toBe(false);

                                expect(order).toEqual(['beforechange', 'change']);
                            });

                            it("should not set the pressed state if beforepressedchange returns false", function() {
                                var beforeSpy = jasmine.createSpy().andReturn(false),
                                    spy = jasmine.createSpy();

                                createRenderButton({
                                    pressed: false,
                                    listeners: {
                                        beforepressedchange: beforeSpy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(true);

                                expect(beforeSpy.callCount).toBe(1);
                                expect(spy).not.toHaveBeenCalled();
                                expect(button.isPressed()).toBe(false);
                            });
                        });
                    });
                });

                describe("when pressed: true", function() {
                    describe("setPressed(true)", function() {
                        it("should leave the pressed state as true", function() {
                            createRenderButton({
                                pressed: true
                            });
                            button.setPressed(true);
                            expect(button.isPressed()).toBe(true);
                        });

                        it("should not remove the pressedCls", function() {
                            createRenderButton({
                                pressed: true
                            });
                            button.setPressed(true);
                            expect(button.element).toHaveCls(button.getPressedCls());
                        });

                        describe("events", function() {
                            it("should not fire events", function() {
                                var spy = jasmine.createSpy();
                                createRenderButton({
                                    pressed: true,
                                    listeners: {
                                        beforepressedchange: spy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(true);
                                expect(spy).not.toHaveBeenCalled();
                            });
                        });
                    });

                    describe("setPressed(false)", function() {
                        it("should set the pressed state to false", function() {
                            createRenderButton({
                                pressed: true
                            });
                            button.setPressed(false);
                            expect(button.isPressed()).toBe(false);
                        });

                        it("should remove the pressedCls", function() {
                            createRenderButton({
                                pressed: true
                            });
                            button.setPressed(false);
                            expect(button.element).not.toHaveCls(button.getPressedCls());
                        });

                        describe("events", function() {
                            it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                                var order = [],
                                    beforeSpy = jasmine.createSpy().andCallFake(function() {
                                        order.push('beforechange');
                                    }),
                                    spy = jasmine.createSpy().andCallFake(function() {
                                        order.push('change');
                                    });

                                createRenderButton({
                                    pressed: true,
                                    listeners: {
                                        beforepressedchange: beforeSpy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(false);

                                expect(beforeSpy.callCount).toBe(1);
                                expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                                expect(beforeSpy.mostRecentCall.args[1]).toBe(false);
                                expect(beforeSpy.mostRecentCall.args[2]).toBe(true);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(false);
                                expect(spy.mostRecentCall.args[2]).toBe(true);

                                expect(order).toEqual(['beforechange', 'change']);
                            });

                            it("should not set the pressed state if beforepressedchange returns false", function() {
                                var beforeSpy = jasmine.createSpy().andReturn(false),
                                    spy = jasmine.createSpy();

                                createRenderButton({
                                    pressed: true,
                                    listeners: {
                                        beforepressedchange: beforeSpy,
                                        pressedchange: spy
                                    }
                                });
                                button.setPressed(false);

                                expect(beforeSpy.callCount).toBe(1);
                                expect(spy).not.toHaveBeenCalled();
                                expect(button.isPressed()).toBe(true);
                            });
                        });
                    });
                });
            });

            describe("toggle", function() {
                describe("when not pressed", function() {
                    it("should set the pressed state to true", function() {
                        createRenderButton({
                            pressed: false
                        });
                        button.toggle();
                        expect(button.isPressed()).toBe(true);
                    });

                    it("should add the pressedCls", function() {
                        createRenderButton({
                            pressed: false
                        });
                        button.toggle();
                        expect(button.element).toHaveCls(button.getPressedCls());
                    });

                    describe("events", function() {
                        it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                            var order = [],
                                beforeSpy = jasmine.createSpy().andCallFake(function() {
                                    order.push('beforechange');
                                }),
                                spy = jasmine.createSpy().andCallFake(function() {
                                    order.push('change');
                                });

                            createRenderButton({
                                pressed: false,
                                listeners: {
                                    beforepressedchange: beforeSpy,
                                    pressedchange: spy
                                }
                            });
                            button.toggle();

                            expect(beforeSpy.callCount).toBe(1);
                            expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                            expect(beforeSpy.mostRecentCall.args[1]).toBe(true);
                            expect(beforeSpy.mostRecentCall.args[2]).toBe(false);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(true);
                            expect(spy.mostRecentCall.args[2]).toBe(false);

                            expect(order).toEqual(['beforechange', 'change']);
                        });

                        it("should not set the pressed state if beforepressedchange returns false", function() {
                            var beforeSpy = jasmine.createSpy().andReturn(false),
                                spy = jasmine.createSpy();

                            createRenderButton({
                                pressed: false,
                                listeners: {
                                    beforepressedchange: beforeSpy,
                                    pressedchange: spy
                                }
                            });
                            button.toggle();

                            expect(beforeSpy.callCount).toBe(1);
                            expect(spy).not.toHaveBeenCalled();
                            expect(button.isPressed()).toBe(false);
                        });
                    });
                });

                describe("when pressed", function() {
                    it("should set the pressed state to false", function() {
                        createRenderButton({
                            pressed: true
                        });
                        button.toggle();
                        expect(button.isPressed()).toBe(false);
                    });

                    it("should remove the pressedCls", function() {
                        createRenderButton({
                            pressed: true
                        });
                        button.toggle();
                        expect(button.element).not.toHaveCls(button.getPressedCls());
                    });

                    describe("events", function() {
                        it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                            var order = [],
                                beforeSpy = jasmine.createSpy().andCallFake(function() {
                                    order.push('beforechange');
                                }),
                                spy = jasmine.createSpy().andCallFake(function() {
                                    order.push('change');
                                });

                            createRenderButton({
                                pressed: true,
                                listeners: {
                                    beforepressedchange: beforeSpy,
                                    pressedchange: spy
                                }
                            });
                            button.toggle();

                            expect(beforeSpy.callCount).toBe(1);
                            expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                            expect(beforeSpy.mostRecentCall.args[1]).toBe(false);
                            expect(beforeSpy.mostRecentCall.args[2]).toBe(true);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(false);
                            expect(spy.mostRecentCall.args[2]).toBe(true);

                            expect(order).toEqual(['beforechange', 'change']);
                        });

                        it("should not set the pressed state if beforepressedchange returns false", function() {
                            var beforeSpy = jasmine.createSpy().andReturn(false),
                                spy = jasmine.createSpy();

                            createRenderButton({
                                pressed: true,
                                listeners: {
                                    beforepressedchange: beforeSpy,
                                    pressedchange: spy
                                }
                            });
                            button.toggle();

                            expect(beforeSpy.callCount).toBe(1);
                            expect(spy).not.toHaveBeenCalled();
                            expect(button.isPressed()).toBe(true);
                        });
                    });
                });
            });

            describe("user interaction", function() {
                function clickIt() {
                    // Ideally this would fire using events, however for now it's
                    // difficult to simulate across devices
                    button.onTap();
                }

                describe("with enableToggle: false", function() {
                    it("should not set the pressed state on tap", function() {
                        createRenderButton({
                            enableToggle: false
                        });
                        clickIt();
                        expect(button.getPressed()).toBe(false);
                    });

                    describe("events", function() {
                        it("should not fire events", function() {
                            var spy = jasmine.createSpy();

                            createRenderButton({
                                enableToggle: false,
                                listeners: {
                                    beforepressedchange: spy,
                                    pressedchange: spy
                                }
                            });
                            clickIt();
                            expect(spy).not.toHaveBeenCalled();
                        });
                    });
                });

                describe("with enableToggle: true", function() {
                    function createToggleRenderButton(config) {
                        Ext.apply(config, {
                            enableToggle: true
                        });
                        createRenderButton(config);
                    }

                    describe("when not pressed", function() {
                        describe("with allowDepress: false", function() {
                            it("should set the pressed state to true", function() {
                                createToggleRenderButton({
                                    pressed: false,
                                    allowDepress: false
                                });
                                clickIt();
                                expect(button.isPressed()).toBe(true);
                            });

                            it("should add the pressedCls", function() {
                                createToggleRenderButton({
                                    pressed: false,
                                    allowDepress: false
                                });
                                clickIt();
                                expect(button.element).toHaveCls(button.getPressedCls());
                            });

                            describe("events", function() {
                                it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                                    var order = [],
                                        beforeSpy = jasmine.createSpy().andCallFake(function() {
                                            order.push('beforechange');
                                        }),
                                        spy = jasmine.createSpy().andCallFake(function() {
                                            order.push('change');
                                        });

                                    createToggleRenderButton({
                                        pressed: false,
                                        allowDepress: false,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                                    expect(beforeSpy.mostRecentCall.args[1]).toBe(true);
                                    expect(beforeSpy.mostRecentCall.args[2]).toBe(false);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(true);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);

                                    expect(order).toEqual(['beforechange', 'change']);
                                });

                                it("should not set the pressed state if beforepressedchange returns false", function() {
                                    var beforeSpy = jasmine.createSpy().andReturn(false),
                                        spy = jasmine.createSpy();

                                    createToggleRenderButton({
                                        pressed: false,
                                        allowDepress: false,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(spy).not.toHaveBeenCalled();
                                    expect(button.isPressed()).toBe(false);
                                });
                            });
                        });

                        describe("with allowDepress: true", function() {
                            it("should set the pressed state to true", function() {
                                createToggleRenderButton({
                                    pressed: false,
                                    allowDepress: true
                                });
                                clickIt();
                                expect(button.isPressed()).toBe(true);
                            });

                            it("should add the pressedCls", function() {
                                createToggleRenderButton({
                                    pressed: false,
                                    allowDepress: true
                                });
                                clickIt();
                                expect(button.element).toHaveCls(button.getPressedCls());
                            });

                            describe("events", function() {
                                it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                                    var order = [],
                                        beforeSpy = jasmine.createSpy().andCallFake(function() {
                                            order.push('beforechange');
                                        }),
                                        spy = jasmine.createSpy().andCallFake(function() {
                                            order.push('change');
                                        });

                                    createToggleRenderButton({
                                        pressed: false,
                                        allowDepress: true,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                                    expect(beforeSpy.mostRecentCall.args[1]).toBe(true);
                                    expect(beforeSpy.mostRecentCall.args[2]).toBe(false);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(true);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);

                                    expect(order).toEqual(['beforechange', 'change']);
                                });

                                it("should not set the pressed state if beforepressedchange returns false", function() {
                                    var beforeSpy = jasmine.createSpy().andReturn(false),
                                        spy = jasmine.createSpy();

                                    createToggleRenderButton({
                                        pressed: false,
                                        allowDepress: true,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(spy).not.toHaveBeenCalled();
                                    expect(button.isPressed()).toBe(false);
                                });
                            });
                        });
                    });

                    describe("when pressed", function() {
                        describe("with allowDepress: false", function() {
                            it("should not alter the pressed state", function() {
                                createToggleRenderButton({
                                    pressed: true,
                                    allowDepress: false
                                });
                                clickIt();
                                expect(button.isPressed()).toBe(true);
                            });

                            it("should leave the pressedCls", function() {
                                createToggleRenderButton({
                                    pressed: true,
                                    allowDepress: false
                                });
                                clickIt();
                                expect(button.element).toHaveCls(button.getPressedCls());
                            });

                            describe("events", function() {
                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();

                                    createToggleRenderButton({
                                        pressed: true,
                                        allowDepress: false,
                                        listeners: {
                                            beforepressedchange: spy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with allowDepress: true", function() {
                            it("should set the pressed state to false", function() {
                                createToggleRenderButton({
                                    pressed: true,
                                    allowDepress: true
                                });
                                clickIt();
                                expect(button.isPressed()).toBe(false);
                            });

                            it("should remove the pressedCls", function() {
                                createToggleRenderButton({
                                    pressed: true,
                                    allowDepress: true
                                });
                                clickIt();
                                expect(button.element).not.toHaveCls(button.getPressedCls());
                            });

                            describe("events", function() {
                                it("should fire the beforepressedchange and pressedchange events, in that order", function() {
                                    var order = [],
                                        beforeSpy = jasmine.createSpy().andCallFake(function() {
                                            order.push('beforechange');
                                        }),
                                        spy = jasmine.createSpy().andCallFake(function() {
                                            order.push('change');
                                        });

                                    createToggleRenderButton({
                                        pressed: true,
                                        allowDepress: true,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(beforeSpy.mostRecentCall.args[0]).toBe(button);
                                    expect(beforeSpy.mostRecentCall.args[1]).toBe(false);
                                    expect(beforeSpy.mostRecentCall.args[2]).toBe(true);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(false);
                                    expect(spy.mostRecentCall.args[2]).toBe(true);

                                    expect(order).toEqual(['beforechange', 'change']);
                                });

                                it("should not set the pressed state if beforepressedchange returns false", function() {
                                    var beforeSpy = jasmine.createSpy().andReturn(false),
                                        spy = jasmine.createSpy();

                                    createToggleRenderButton({
                                        pressed: true,
                                        allowDepress: true,
                                        listeners: {
                                            beforepressedchange: beforeSpy,
                                            pressedchange: spy
                                        }
                                    });
                                    clickIt();

                                    expect(beforeSpy.callCount).toBe(1);
                                    expect(spy).not.toHaveBeenCalled();
                                    expect(button.isPressed()).toBe(true);
                                });
                            });
                        });
                    });
                });
            });

            describe("pressedCls", function() {
                describe("when not pressed", function() {
                    it("should add the pressedCls when being pressed", function() {
                        createRenderButton({
                            pressed: false
                        });
                        button.setPressedCls('someCls');
                        expect(button.element).not.toHaveCls('someCls');
                        button.setPressed(true);
                        expect(button.element).toHaveCls('someCls');
                    });
                });

                describe("when pressed", function() {
                    it("should update the pressed cls", function() {
                        createRenderButton({
                            pressed: true,
                            pressedCls: 'oldCls'
                        });
                        expect(button.element).toHaveCls('oldCls');
                        button.setPressedCls('newCls');
                        expect(button.element).not.toHaveCls('oldCls');
                        expect(button.element).toHaveCls('newCls');
                    });
                });
            });
        });
    });

    describe("configurations", function() {
        describe("autoHandler", function() {
            describe("configuration", function() {

                it("should set the autoHandler configuration", function() {
                    createButton({autoEvent: 'test'});

                    expect(button.getAutoEvent()).not.toBeNull();
                });

                it("should set a handler", function() {
                    createButton({autoEvent: 'test'});

                    expect(button.getHandler()).not.toBeNull();
                });

                it("should set a scope", function() {
                    createButton({autoEvent: 'test'});

                    expect(button.getScope()).not.toBeNull();
                });

                describe("transforming", function() {
                    it("should transform a string into an object", function() {
                        createButton({autoEvent: 'test'});

                        var ae = button.getAutoEvent();

                        expect(ae).not.toBeNull();
                        expect(typeof ae).toEqual("object");
                    });

                    it("should set the name of the object", function() {
                        createButton({autoEvent: 'test'});

                        var ae = button.getAutoEvent();

                        expect(ae.name).toEqual('test');
                    });

                    it("should set the scope of the object", function() {
                        createButton({autoEvent: 'test'});

                        var ae = button.getAutoEvent();

                        expect(ae.scope).not.toBeNull();
                    });
                });
            });

            describe("method", function() {
                it("should set the autoHandler configuration", function() {
                    createButton();
                    button.setAutoEvent('test');

                    expect(button.getAutoEvent()).not.toBeNull();
                });

                it("should set a handler", function() {
                    createButton();
                    button.setAutoEvent('test');

                    expect(button.getHandler()).not.toBeNull();
                });

                it("should set a scope", function() {
                    createButton();
                    button.setAutoEvent('test');

                    expect(button.getScope()).not.toBeNull();
                });

                describe("transforming", function() {
                    it("should transform a string into an object", function() {
                        createButton();
                        button.setAutoEvent('test');

                        var ae = button.getAutoEvent();

                        expect(ae).not.toBeNull();
                        expect(typeof ae).toEqual("object");
                    });

                    it("should set the name of the object", function() {
                        createButton();
                        button.setAutoEvent('test');

                        var ae = button.getAutoEvent();

                        expect(ae.name).toEqual('test');
                    });

                    it("should set the scope of the object", function() {
                        createButton();
                        button.setAutoEvent('test');

                        var ae = button.getAutoEvent();

                        expect(ae.scope).not.toBeNull();
                    });
                });
            });
        });


        describe("badgeText", function() {
            describe("configuration", function() {
                beforeEach(function() {
                    createButton({badgeText: 'test'});
                });

                it("should set the badgeText", function() {
                    expect(button.getBadgeText()).toEqual('test');
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                    });
                    it("should create a badgeEl", function() {
                        expect(button.badgeElement).not.toBeNull();
                    });
                    it("should have the badgeText value in the badgeEl", function() {
                        expect(button.badgeElement.dom.innerHTML).toEqual('test');
                    });
                });
            });

            describe("methods", function() {
                beforeEach(function() {
                    createButton();
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());

                        button.setBadgeText('test');
                    });

                    it("should set the badgeText", function() {
                         expect(button.getBadgeText()).toEqual('test');
                    });

                    it("should create a badgeEl", function() {
                        expect(button.badgeElement).not.toBeNull();
                    });

                    describe("when removing badgeText", function() {
                        beforeEach(function() {
                            button.setBadgeText(null);
                        });

                        it("should remove the badgeText configuration", function() {

                            expect(button.getBadgeText()).toBeNull();
                        });
                    });

                    it("should have the badgeText value in the badgeEl", function() {
                        expect(button.badgeElement.dom.innerHTML).toEqual('test');
                    });
                });
            });
        });


        describe("text", function() {
            describe("configuration", function() {
                beforeEach(function() {
                    createButton({
                        text: 'test'
                    });
                });

                it("should set the text", function() {
                    expect(button.getText()).toEqual('test');
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                    });

                    it("should create a textEl", function() {
                        expect(button.textElement).not.toBeNull();
                    });
                });
            });

            describe("methods", function() {
                beforeEach(function() {
                    createButton();
                });

                it("should set the text", function() {
                    button.setText('test');
                    expect(button.getText()).toEqual('test');
                });

                describe("after render", function() {

                    it("should create a textEl", function() {
                        expect(button.textElement).not.toBeNull();
                    });

                    describe("when removing text", function() {
                        beforeEach(function() {
                            button.setText(null);
                        });

                        it("should remove the text configuration", function() {
                            expect(button.getText()).toBeNull();
                        });
                    });
                });
            });
        });


        describe("icon", function() {
            describe("configuration", function() {
                beforeEach(function() {
                    createButton({
                        icon: 'test'
                    });
                });

                it("should set the icon", function() {
                    expect(button.getIcon()).toEqual('test');
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                    });

                    it("should create a iconEl", function() {
                        expect(button.iconElement).not.toBeNull();
                    });
                });
            });

            describe("methods", function() {
                beforeEach(function() {
                    createButton({
                        icon: 'test'
                    });

                });

                it("should set the icon", function() {
                    button.setIcon('test');
                    expect(button.getIcon()).toEqual('test');
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                    });

                    it("should create a iconEl", function() {
                        expect(button.iconElement).not.toBeNull();
                    });

                    describe("when remove the icon", function() {
                        beforeEach(function() {
                            button.setIcon(null);
                        });

                        it("should remove the icon configuration", function() {
                            expect(button.getIcon()).toBeNull();
                        });
                    });

                    it("should call refreshIconAlign when updating the icon", function() {
                        spyOn(button, "refreshIconAlign");

                        button.setIcon('another');

                        expect(button.refreshIconAlign.calls.length).toBe(1);
                    });

                    it("should have the new background-image on the iconEl", function() {
                        button.setIcon('another');

                        expect(button.iconElement.getStyle('background-image')).toMatch('another');
                    });

                    it("should remove any old cls on the iconEl", function() {
                        button.setIcon('another');

                        expect(button.iconElement.getStyle('background-image')).toMatch('another');

                        button.setIcon('new');

                        expect(button.iconElement.getStyle('background-image')).not.toMatch('another');
                        expect(button.iconElement.getStyle('background-image')).toMatch('new');
                    });
                });
            });
        });


        describe("iconCls", function() {
            describe("configuration", function() {
                beforeEach(function() {
                    createButton({
                        iconCls: 'test'
                    });
                });

                it("should set the iconCls", function() {
                    expect(button.getIconCls()).toEqual('test');
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                    });

                    it("should insert the iconEl", function() {
                        expect(button.iconElement.parentNode).not.toBeNull();
                    });
                });
            });

            describe("methods", function() {
                beforeEach(function() {
                    createButton();
                });

                it("should set the iconCls", function() {
                    button.setIconCls('test');
                    expect(button.getIconCls()).toEqual('test');
                });

                  it("should create an iconEl", function() {
                    expect(button.iconElement).not.toBeNull();
                });

                describe("after render", function() {
                    beforeEach(function() {
                        button.renderTo(Ext.getBody());
                        button.setIconCls('test');
                    });

                    describe("when removing iconCls", function() {
                        beforeEach(function() {
                            button.setIconCls(null);
                        });

                        it("should remove the iconCls configuration", function() {
                            expect(button.getIconCls()).toBeNull();
                        });

                        it("should remove the iconCls", function() {
                            expect(button.element.hasCls('test')).toBeFalsy();
                        });
                    });

                    it("should call refreshIconAlign one time when updating the iconCls", function() {
                        spyOn(button, "refreshIconAlign");

                        button.setIconCls('another');

                        expect(button.refreshIconAlign.calls.length).toBe(1);
                    });

                    it("should have the new cls on the iconEl", function() {
                        button.setIconCls('another');

                        expect(button.iconElement.hasCls('another')).toBeTruthy();
                    });

                    it("should remove any old cls on the iconEl", function() {
                        button.setIconCls('another');

                        expect(button.iconElement.hasCls('another')).toBeTruthy();

                        button.setIconCls('new');

                        expect(button.iconElement.hasCls('another')).toBeFalsy();
                        expect(button.iconElement.hasCls('new')).toBeTruthy();
                    });
                });
            });
        });


        describe("iconAlign", function() {
            var value = 'right',
                cls   = Ext.baseCSSPrefix + 'iconalign-' + value;

            describe("with icon", function() {
                describe("configuration", function() {
                    beforeEach(function() {
                        createButton({iconAlign: value, icon: 'test', text: 'test'});
                    });

                    it("should set the iconAlign", function() {
                        expect(button.getIconAlign()).toEqual(value);
                    });

                    describe("after render", function() {
                        beforeEach(function() {
                            button.renderTo(Ext.getBody());
                        });

                        it("should add the iconAlign class", function() {
                            expect(button.element.hasCls(cls)).toBeTruthy();
                        });
                    });
                });

                describe("methods", function() {
                    beforeEach(function() {
                        createButton({icon: 'test', text: 'test'});
                    });

                    it("should set the iconAlign", function() {
                        button.setIconAlign(value);
                        expect(button.getIconAlign()).toEqual(value);
                    });

                    describe("after render", function() {
                        beforeEach(function() {
                            button.renderTo(Ext.getBody());

                            button.setIconAlign(value);
                        });

                        it("should add the iconAlign cls", function() {
                            expect(button.element.hasCls(cls)).toBeTruthy();
                        });

                        describe("when removing iconAlign", function() {
                            beforeEach(function() {
                                button.setIconAlign(null);
                            });

                            it("should remove the iconAlign configuration", function() {
                                expect(button.getIconAlign()).toBeNull();
                            });

                            it("should remove the iconAlign cls", function() {
                                expect(button.element.hasCls(cls)).not.toBeTruthy();
                            });
                        });
                    });
                });
            });

            describe("without icon", function() {
                describe("configuration", function() {
                    beforeEach(function() {
                        createButton({iconAlign: 'right'});
                    });

                    describe("after render", function() {
                        beforeEach(function() {
                            button.renderTo(Ext.getBody());
                        });

                        it("should add the iconAlign cls", function() {
                            expect(button.element.hasCls(cls)).toBeFalsy();
                        });
                    });
                });

                describe("methods", function() {
                    beforeEach(function() {
                        createButton();
                    });

                    describe("after render", function() {
                        beforeEach(function() {
                            button.renderTo(Ext.getBody());
                            button.setIconAlign(value);
                        });

                        it("should add the iconAlign cls", function() {
                            expect(button.element.hasCls(cls)).toBeFalsy();
                        });

                        describe("when adding icon", function() {
                            beforeEach(function() {
                                button.setText('another');
                                button.setIcon('another');
                            });

                            it("should add the iconAlign configuration", function() {
                                expect(button.getIconAlign()).toEqual(value);
                            });

                            it("should add the iconAlign cls", function() {
                                expect(button.element.hasCls(cls)).toBeTruthy();
                            });
                        });
                    });
                });
            });
        });
    });

    describe("#refreshIconAlign", function() {
        beforeEach(function() {
            createButton();
        });

        it("should call #updateIconAlign", function() {
            spyOn(button, "updateIconAlign");

            button.refreshIconAlign();

            expect(button.updateIconAlign).toHaveBeenCalled();
        });
    });

    describe("#onTap", function() {
        beforeEach(function() {
            createButton();
        });

        it("should return false if disabled", function() {
            button.disabled = true;

            expect(button.onTap()).toBeFalsy();
        });

        it("should call fireAction", function() {
            spyOn(button, 'fireAction');

            button.onTap();

            expect(button.fireAction).toHaveBeenCalled();
        });
    });

    describe("#doTap", function() {
        beforeEach(function() {
            createButton();
        });

        describe("no handler", function() {
            it("should return false", function() {
                expect(button.doTap(button)).toBeFalsy();
            });
        });

        describe("with handler", function() {
            describe("string", function() {
                it("should call the function", function() {
                    button.testFoo = function() {};
                    spyOn(button, 'testFoo');

                    button.setHandler('testFoo');

                    button.doTap(button);

                    expect(button.testFoo).toHaveBeenCalled();
                });
            });

            describe("reference", function() {
                it("should call the function", function() {
                    button.testFoo = function() {};
                    spyOn(button, 'testFoo');

                    button.setHandler(button.testFoo);

                    button.doTap(button);

                    expect(button.testFoo).toHaveBeenCalled();
                });
            });
        });
    });

    describe("el", function() {
        beforeEach(function() {
            createButton();
            button.renderTo(Ext.getBody());
        });

        describe("tap", function() {
            it("should call onTap", function() {
                spyOn(button, "onTap");

                button.el.fireAction('tap', [], Ext.emptyFn);

                expect(button.onTap).toHaveBeenCalled();
            });
        });

        (Ext.supports.Touch ? describe : xdescribe)("touchstart", function() {
            it("should call onPress", function() {
                spyOn(button, "onPress");

                button.el.fireAction('touchstart', [], Ext.emptyFn);

                expect(button.onPress).toHaveBeenCalled();
            });
        });

        (Ext.supports.Touch ? describe : xdescribe)("touchend", function() {
            it("should call onRelease", function() {
                spyOn(button, "onRelease");

                button.el.fireAction('touchend', [], Ext.emptyFn);

                expect(button.onRelease).toHaveBeenCalled();
            });
        });
    });
});
