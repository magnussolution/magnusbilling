describe("Modern Ext.Widget", function() {

    var w;

    function makeWidget(cfg) {
        w = new Ext.Widget(cfg);
        return w;
    }

    afterEach(function() {
        w = Ext.destroy(w);
    });

    describe("view controllers", function() {
        var Controller, spy
        beforeEach(function() {
            // Suppress console warning about mapping being overridden
            spyOn(Ext.log, 'warn');

            spy = jasmine.createSpy();
            
            Controller = Ext.define('spec.TestController', {
                extend: 'Ext.app.ViewController',
                alias: 'controller.test',

                init: spy,

                someFn: function() {}
            });
        });
        
        afterEach(function() {
            Ext.undefine('spec.TestController');
            spy = Controller = null;
            Ext.Factory.controller.instance.clearCache();
        });
        
        describe("initializing", function() {
            it("should accept an alias string", function() {
                makeWidget({
                    controller: 'test'
                }); 
                var controller = w.getController();   
                expect(controller instanceof spec.TestController).toBe(true);
                expect(controller.getView()).toBe(w);
            });
            
            it("should accept a controller config", function() {
                makeWidget({
                    controller: {
                        type: 'test'
                    }
                });    
                var controller = w.getController();   
                expect(controller instanceof spec.TestController).toBe(true);
                expect(controller.getView()).toBe(w);
            }); 
            
            it("should accept a controller instance", function() {
                var controller = new spec.TestController();
                makeWidget({
                    controller: controller
                });
                expect(w.getController()).toBe(controller);
                expect(controller.getView()).toBe(w);
            });

            it("should be able to pass null", function() {
                makeWidget({
                    controller: null
                });
                expect(w.getController()).toBeNull();
            });

            it("should call the controller init method and pass the view", function() {
                makeWidget({
                    controller: 'test'
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[0]).toBe(w);
            });
        });  
        
        it("should destroy the controller when destroying the component", function() {
            makeWidget({
                controller: 'test'
            });
            var controller = w.getController();
            spyOn(controller, 'destroy');
            w.destroy();
            expect(controller.destroy).toHaveBeenCalled();
        });

        describe("lookupController", function() {
            describe("skipThis: false", function() {
                it("should return null when there is no controller attached to the view", function() {
                    makeWidget();
                    expect(w.lookupController(false)).toBeNull();
                });

                it("should return null when there is no controller in the hierarchy", function() {
                    var ct = new Ext.container.Container({
                        items: {
                            xtype: 'component'
                        }
                    });
                    expect(ct.items.first().lookupController(false)).toBeNull();
                    ct.destroy();
                });

                it("should return the controller attached to the component when it is at the root", function() {
                    var controller = new spec.TestController();
                    makeWidget({
                        controller: controller
                    });
                    expect(w.lookupController(false)).toBe(controller);
                });

                it("should return the controller attached to the component when it is in a hierarchy", function() {
                    var controller = new spec.TestController();
                    var ct = new Ext.container.Container({
                        items: {
                            xtype: 'component',
                            controller: controller
                        }
                    });
                    expect(ct.items.first().lookupController(false)).toBe(controller);
                    ct.destroy();
                });

                it("should return a controller above it in the hierarchy", function() {
                    var controller = new spec.TestController();

                    var ct = new Ext.container.Container({
                        controller: controller,
                        items: {
                            xtype: 'component'
                        }
                    });
                    expect(ct.items.first().lookupController(false)).toBe(controller);
                    ct.destroy();
                });

                it("should return the closest controller in the hierarchy", function() {
                    var controller1 = new spec.TestController(),
                        controller2 = new spec.TestController();

                    var ct = new Ext.container.Container({
                        controller: controller1,
                        items: {
                            xtype: 'container',
                            controller: controller2,
                            items: {
                                xtype: 'component',
                                itemId: 'x'
                            }
                        }
                    });
                    expect(ct.down('#x').lookupController(false)).toBe(controller2);
                    ct.destroy();
                });
            });

            describe("skipThis: true", function() {
                it("should return null when there is no controller attached to the view", function() {
                    makeWidget();
                    expect(w.lookupController(true)).toBeNull();
                });

                it("should return null when there is no controller in the hierarchy", function() {
                    var ct = new Ext.container.Container({
                        items: {
                            xtype: 'component'
                        }
                    });
                    expect(ct.items.first().lookupController(true)).toBeNull();
                    ct.destroy();
                });

                it("should not return the controller attached to the component when it is at the root", function() {
                    var controller = new spec.TestController();
                    makeWidget({
                        controller: controller
                    });
                    expect(w.lookupController(true)).toBeNull();
                });

                it("should not return the controller attached to the component when it is in a hierarchy and no controllers exist above it", function() {
                    var controller = new spec.TestController();
                    var ct = new Ext.container.Container({
                        items: {
                            xtype: 'component',
                            controller: controller
                        }
                    });
                    expect(ct.items.first().lookupController(true)).toBeNull();
                    ct.destroy();
                });

                it("should return a controller above it in the hierarchy", function() {
                    var controller = new spec.TestController();

                    var ct = new Ext.container.Container({
                        controller: controller,
                        items: {
                            xtype: 'component'
                        }
                    });
                    expect(ct.items.first().lookupController(true)).toBe(controller);
                    ct.destroy();
                });

                it("should return the closest controller in the hierarchy", function() {
                    var controller1 = new spec.TestController(),
                        controller2 = new spec.TestController();

                    var ct = new Ext.container.Container({
                        controller: controller1,
                        items: {
                            xtype: 'container',
                            controller: controller2,
                            items: {
                                xtype: 'component',
                                itemId: 'x'
                            }
                        }
                    });
                    expect(ct.down('#x').lookupController(true)).toBe(controller2);
                    ct.destroy();
                });
            });

            it("should default to skipThis: false", function() {
                var controller = new spec.TestController();
                makeWidget({
                    controller: controller
                });
                expect(w.lookupController()).toBe(controller);
            });
        });
    });

    describe("viewmodel", function() {
        var spy, order, called;

        beforeEach(function() {
            called = false;
            Ext.define('spec.ViewModel', {
                extend: 'Ext.app.ViewModel',
                alias: 'viewmodel.test',
                constructor: function() {
                    this.callParent(arguments);
                    order.push(this.getId());
                    called = true;
                }
            });
            order = [];
        });

        afterEach(function() {
            Ext.undefine('spec.ViewModel');
            Ext.Factory.viewModel.instance.clearCache();
            order = null;
            called = false;
        });

        it("should accept a string alias", function() {
            makeWidget({
                viewModel: 'test'
            });
            expect(w.getViewModel() instanceof spec.ViewModel).toBe(true);
        });

        it("should accept an object config", function() {
            makeWidget({
                viewModel: {
                    type: 'test'
                }
            });
            expect(w.getViewModel() instanceof spec.ViewModel).toBe(true);
        });

        it("should accept an object instance", function() {
            var vm = new spec.ViewModel();
            makeWidget({
                viewModel: vm
            });
            expect(w.getViewModel()).toBe(vm);
        });

        describe("calling initViewController", function() {
            var TestController = Ext.define(null, {
                extend: 'Ext.app.ViewController'
            });

            it("should call initViewController when creating an instance", function() {
                var ctrl = new TestController();
                spyOn(ctrl, 'initViewModel');
                makeWidget({
                    controller: ctrl,
                    viewModel: {
                        type: 'test'
                    },
                    bind: {
                        width: '{foo}'
                    }
                });
                expect(ctrl.initViewModel.callCount).toBe(1);
                expect(ctrl.initViewModel).toHaveBeenCalledWith(w.getViewModel());
            });
        });

        describe("hierarchy", function() {
            var ct, inner;

            function vm(id) {
                return {
                    type: 'test',
                    id: id
                };
            }

            function makeHierarchy(bind) {
                ct = new Ext.container.Container({
                    viewModel: vm('top'),
                    id: 'top',
                    items: {
                        xtype: 'container',
                        id: 'middle',
                        viewModel: vm('middle'),
                        items: {
                            xtype: 'component',
                            id: 'bottom',
                            viewModel: vm('bottom'),
                            bind: bind || null
                        }
                    }
                });
                inner = ct.items.first();
                w = inner.items.first();
            }

            afterEach(function() {
                ct.destroy();
                ct = inner = null;
            });

            it("should initialize viewmodels top down", function() {
                makeHierarchy();
                w.getViewModel();
                expect(order).toEqual(['top', 'middle', 'bottom']);
            });
        });

        describe("session", function() {
            it("should attach the view model to the session", function() {
                var session = new Ext.data.Session();
                makeWidget({
                    session: session,
                    viewModel: {}
                });
                expect(w.getViewModel().getSession()).toBe(session);
            });

            it("should attach the view model to a session higher up in the hierarchy", function() {
                var session = new Ext.data.Session();
                var ct = new Ext.container.Container({
                    session: session,
                    items: {
                        xtype: 'component',
                        viewModel: true
                    }
                });
                expect(ct.items.first().getViewModel().getSession()).toBe(session);
                ct.destroy();
            });

            it("should use an attached session at the same level instead of a higher one", function() {
                var session1 = new Ext.data.Session(),
                    session2 = new Ext.data.Session();

                var ct = new Ext.container.Container({
                    session: session1,
                    items: {
                        xtype: 'component',
                        session: session2,
                        viewModel: {}
                    }
                });
                expect(ct.items.first().getViewModel().getSession()).toBe(session2);
                ct.destroy();
            });
        });

        describe("destruction", function() {
            it("should destroy the viewModel when the component is destroyed", function() {
                makeWidget({
                    viewModel: {}
                });
                var vm = w.getViewModel();
                w.destroy();
                expect(vm.destroyed).toBe(true);
            }); 
        });
    });

    describe("session", function() {
        it("should not have a session by default", function() {
            makeWidget();
            expect(w.getSession()).toBeNull();
        });

        it("should use a passed session", function() {
            var session = new Ext.data.Session();
            makeWidget({
                session: session
            });
            expect(w.getSession()).toBe(session);
        });

        it("should create a session when session: true is specified", function() {
            makeWidget({
                session: true
            });
            expect(w.getSession().isSession).toBe(true);
        });

        it("should destroy the session when the component is destroyed", function() {
            var session = new Ext.data.Session(),
                spy = spyOn(session, 'destroy').andCallThrough();

            makeWidget({
                session: session
            });
            w.destroy();
            expect(spy).toHaveBeenCalled();
        });

        it("should not destroy the session with autoDestroy: false", function() {
            var session = new Ext.data.Session({
                autoDestroy: false
            });
            var spy = spyOn(session, 'destroy').andCallThrough();
            makeWidget({
                session: session
            });
            w.destroy();
            expect(spy).not.toHaveBeenCalled();
            session.destroy();
        });

        describe("hierarchy", function() {
            it("should use a parent session", function() {
                var session = new Ext.data.Session();

                var ct = new Ext.container.Container({
                    session: session,
                    items: {
                        xtype: 'component'
                    }
                });
                expect(ct.items.first().lookupSession()).toBe(session);
                
                ct.destroy();
            });

            it("should spawn a session from the parent if specifying session: true", function() {
                var session = new Ext.data.Session();

                var ct = new Ext.container.Container({
                    session: session,
                    items: {
                        xtype: 'component',
                        session: true
                    }
                });

                var child = ct.items.first().getSession();
                expect(child.getParent()).toBe(session);
                
                ct.destroy();
            });
        });
    });

    describe("bind", function() {
        it("should be able to bind to multiple properties", function() {
            makeWidget({
                viewModel: {
                    data: {
                        width: 200,
                        height: 200
                    }
                },
                bind: {
                    width: '{width}',
                    height: '{height}'
                }
            });
            w.getViewModel().notify();
            expect(w.getWidth()).toBe(200);
            expect(w.getHeight()).toBe(200);
        });

        describe("twoWayBindable", function() {
            var Cls, viewModel;

            beforeEach(function() {
                Cls = Ext.define(null, {
                    extend: 'Ext.Component',
                    config: {
                        customA: 1,
                        customB: null,
                        customC: undefined,
                        customD: 'foo'
                    },
                    twoWayBindable: ['customB', 'customC', 'customD']
                });
            });

            afterEach(function() {
                viewModel = Cls = null;
            });

            function makeCls(cfg) {
                w = new Cls(Ext.apply({
                }, cfg));
                viewModel = w.getViewModel();
            }

            it("should not be twoWayBindable by default", function() {
                makeCls({
                    viewModel: {
                        data: {
                            a: 1
                        }
                    },
                    bind: {
                        customA: '{a}'
                    }
                });
                viewModel.notify();
                w.setCustomA('Foo');
                expect(viewModel.get('a')).toBe(1);
            });

            it("should not cause an error if a twoWayBindable is not bound", function() {
                expect(function() {
                    makeCls({
                        viewModel: {},
                        bind: {}
                    });
                }).not.toThrow();
            });

            describe("when the binding has not fired", function() {
                it("should not publish when the value is undefined", function() {
                    makeCls({
                        viewModel: {
                            data: {
                                c: 100
                            }
                        },
                        bind: {
                            customC: '{c}'
                        }
                    });
                    expect(viewModel.get('c')).toBe(100);
                    viewModel.notify();
                    expect(w.getCustomC()).toBe(100);
                });

                it("should not publish when the value is null", function() {
                    makeCls({
                        viewModel: {
                            data: {
                                b: 200
                            }
                        },
                        bind: {
                            customB: '{b}'
                        }
                    });
                    expect(viewModel.get('b')).toBe(200);
                    viewModel.notify();
                    expect(w.getCustomB()).toBe(200);
                });

                it("should not publish when the value is equal to the class default", function() {
                    makeCls({
                        viewModel: {
                            data: {
                                d: 'bar'
                            }
                        },
                        bind: {
                            customD: '{d}'
                        }
                    });
                    expect(viewModel.get('d')).toBe('bar');
                    viewModel.notify();
                    expect(w.getCustomD()).toBe('bar');
                });

                it("should not publish when the value is equal to the instance config value", function() {
                    makeCls({
                        customD: 'baz',
                        viewModel: {
                            data: {
                                d: 'bar'
                            }
                        },
                        bind: {
                            customD: '{d}'
                        }
                    });
                    expect(viewModel.get('d')).toBe('bar');
                    viewModel.notify();
                    expect(w.getCustomD()).toBe('bar');
                });

                it("should publish any other value", function() {
                    makeCls({
                        viewModel: {
                            data: {
                                d: 'bar'
                            }
                        },
                        bind: {
                            customD: '{d}'
                        }
                    });
                    w.setCustomD('new');
                    expect(viewModel.get('d')).toBe('new');
                });
            });

            describe("when the binding has fired", function() {
                it("should publish undefined", function() {
                    makeCls({
                        viewModel: {
                            b: 'x'
                        },
                        bind: {
                            customB: '{b}'
                        }
                    });
                    viewModel.notify();
                    w.setCustomB(undefined);
                    // ViewModel converts undefined to null
                    expect(viewModel.get('b')).toBeNull();
                });

                it("should publish null", function() {
                    makeCls({
                        viewModel: {
                            b: 'x'
                        },
                        bind: {
                            customB: '{b}'
                        }
                    });
                    viewModel.notify();
                    w.setCustomB(null);
                    expect(viewModel.get('b')).toBeNull();
                });

                it("should publish the class default", function() {
                    makeCls({
                        viewModel: {
                            data: {
                                d: 'bar'
                            }
                        },
                        bind: {
                            customD: '{d}'
                        }
                    });
                    viewModel.notify();
                    w.setCustomD('foo');
                    expect(viewModel.get('d')).toBe('foo');
                });

                it("should publish the instance config value", function() {
                    makeCls({
                        customD: 'baz',
                        viewModel: {
                            data: {
                                d: 'bar'
                            }
                        },
                        bind: {
                            customD: '{d}'
                        }
                    });
                    viewModel.notify();
                    w.setCustomD('baz');
                    expect(viewModel.get('d')).toBe('baz');
                });
            });
        });

        describe("on destruction", function() {
            beforeEach(function() {
                Ext.define('spec.BindCls', {
                    extend: 'Ext.Component',
                    xtype: 'bindcls',
                    config: {
                        test: null
                    }
                })
            });

            afterEach(function() {
                Ext.undefine('spec.BindCls');
            });

            it("should remove bindings when children are destroyed", function() {
                var ct = new Ext.Container({
                    viewModel: {
                        data: {
                            foo: 1
                        }
                    },
                    renderTo: Ext.getBody(),
                    items: {
                        xtype: 'bindcls',
                        bind: {
                            test: '{foo}'
                        }
                    }
                }), vm = ct.getViewModel();

                var c = ct.items.first();
                spyOn(c, 'setTest');
                vm.notify();
                expect(c.setTest.callCount).toBe(1);
                c.setTest.reset();
                vm.set('foo', 2);
                // The bind is queued up
                c.destroy();
                vm.notify();
                expect(c.setTest).not.toHaveBeenCalled();

                ct.destroy();
            });
        });
    });

});