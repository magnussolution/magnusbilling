/* global Ext, spyOn, expect */

describe("Ext.app.Application", function() {
    var Class, app, initCalled, launchCalled, required;

    beforeEach(function() {
        this.addMatchers({
            toBeFunction: function(expected) {
                var actual = this.actual;

                return expected ? Ext.isFunction(actual) && actual === expected
                     :            Ext.isFunction(actual)
                     ;
            }
        });

        Ext.app.addNamespaces('TestApplication');

        Ext.define('TestApplication.controller.Foo', {
            extend: 'Ext.app.Controller',

            id: 'Foo',

            initialized: false,
            launched:    false,

            init: function() {
                this.initialized = true;
            },

            onLaunch: function() {
                this.launched = true;
            }
        });

        Ext.define('TestApplication.view.Viewport', {
            create: function() {}
        });

        Class = Ext.define('TestApplication.Application', {
            extend: 'Ext.app.Application',

            name: 'TestApplication',
            
            namespaces: [
                'TestApplication.Foo',
                'TestApplication.Bar'
            ],

            controllers: [
                'Foo'
            ],

            autoCreateViewport: true,

            __handleRequires: function(requires, callback) {
                required = requires;
                callback();
            },

            init: function() {
                initCalled = true;
            },

            launch: function() {
                launchCalled = true;
            }
        });
    });
    
    afterEach(function() {
        required = null;
        Ext.app.clearNamespaces();

        if (Ext.isIE) {
            window.TestApplication = undefined;
        } else {
            delete window.TestApplication;
        }

        Ext.undefine('TestApplication.controller.Foo');
        Ext.undefine('TestApplication.view.Viewport');
        Ext.undefine('TestApplication.Application');
    });

    describe("resolves global namespaces upon class creation", function() {
        it("has TestApplication namespace", function() {
            expect(Ext.app.namespaces['TestApplication']).toBeTruthy();
        });
        
        it("has TestApplication.Foo namespace", function() {
            expect(Ext.app.namespaces['TestApplication.Foo']).toBeTruthy();
        });
        
        it("has TestApplication.Bar namespace", function() {
            expect(Ext.app.namespaces['TestApplication.Bar']).toBeTruthy();
        });
    });
    
    describe("resolves class names", function() {
        it("resolves Viewport when autoCreateViewport is true", function() {
            expect(required).toEqual([
                'TestApplication.view.Viewport'
            ]);
        });
        
        describe("when appFolder is set", function() {
            beforeEach(function() {

                // This class name is generated and required by an Application
                // named "Foo" with autoCreateViewport: true
                // So we must define it to prevent a failed load.
                Ext.define('Foo.view.Viewport', {
                    extend: 'Ext.container.Viewport'
                });

                Ext.define('TestApplication.AbstractApplication', {
                    extend: 'Ext.app.Application',
                
                    appFolder: 'foo'
                });
            
                Ext.define('TestApplication.Application2', {
                    extend: 'TestApplication.AbstractApplication',
                
                    name: 'Foo',
                
                    autoCreateViewport: true,

                    __handleRequires: function(requires, callback) {
                        callback();
                    }
                });
            });

            afterEach(function() {
                Ext.undefine('TestApplication.AbstractApplication');
                Ext.undefine('TestApplication.Application2');
                Ext.undefine('Foo.view.Viewport');
                delete Ext.global.Foo;
            });
            
            it("resolves Viewport path", function() {
                var path = Ext.Loader.config.paths.Foo;
                
                expect(path).toBe('foo');
            });
        });
    });
    
    it("is constructable", function() {
        app = new TestApplication.Application();

        expect(app).toBeDefined();
    });

    it("adds getApplication method...", function() {
        expect(app.getApplication).toBeFunction();
    });

    it("... which returns Application instance", function() {
        var a = app.getApplication();

        expect(a).toEqual(app);
    });

    it("inits itself as a Controller", function() {
        expect(app._initialized).toBeTruthy();
    });

    it("inits dependent Controllers and sets their id", function() {
        var ctrl = app.getController('Foo');

        expect(ctrl.initialized).toBeTruthy();
        expect(ctrl.getId()).toBe('Foo');
    });

    it("calls onLaunch on dependent Controllers", function() {
        var ctrl = app.getController('Foo');

        expect(ctrl.launched).toBeTruthy();
    });

    it("calls its init() method", function() {
        expect(initCalled).toBeTruthy();
    });

    it("calls its launch() method", function() {
        expect(launchCalled).toBeTruthy();
    });

    it("fires launch event", function() {
        var fired = false;

        new TestApplication.Application({
            listeners: {
                launch: function() { fired = true; }
            }
        });

        expect(fired).toBeTruthy();
    });

    it("inits QuickTips", function() {
        spyOn(Ext.tip.QuickTipManager, 'init');

        new TestApplication.Application();

        expect(Ext.tip.QuickTipManager.init).toHaveBeenCalled();
    });

    it("inits Viewport when autoCreateViewport is true", function() {
        spyOn(TestApplication.view.Viewport, 'create');

        new TestApplication.Application();

        expect(TestApplication.view.Viewport.create).toHaveBeenCalled();
    });

    it("should init Ext.util.History", function() {
        app = new TestApplication.Application();

        return expect(Ext.util.History.ready).toEqual(true);
    });

    describe("should handle default hash", function() {
        var History = Ext.util.History;

        beforeEach(function() {
            History.useTopWindow = false;
        });

        afterEach(function() {
            History.useTopWindow = true;
        });

        it("adds defaultToken", function() {
            app = new TestApplication.Application({
                defaultToken : 'foo'
            });

            expect(History.getToken()).toEqual('foo');
        });

        it("already has a token", function() {
            if (!History.getToken()) {
                History.add('foo');
            }

            app = new TestApplication.Application({
                defaultToken : 'bar'
            });

            expect(History.getToken()).toEqual('foo');
        });
    });

    describe("getController", function() {
        var ctorLog;

        beforeEach(function() {
            ctorLog = [];

            Ext.define('CtrlApplication.controller.DeclaredWithId', {
                extend: 'Ext.app.Controller',
                id: 'declaredCustomWithId',
                constructor: function() {
                    this.callParent(arguments);
                    ctorLog.push(this.$className);
                }
            });

            Ext.define('CtrlApplication.controller.DeclaredAutoIdShort', {
                extend: 'Ext.app.Controller',
                constructor: function() {
                    this.callParent(arguments);
                    ctorLog.push(this.$className);
                }
            });

            Ext.define('CtrlApplication.controller.DeclaredAutoIdLong', {
                extend: 'Ext.app.Controller',
                constructor: function() {
                    this.callParent(arguments);
                    ctorLog.push(this.$className);
                }
            });

            Ext.define('CtrlApplication.controller.NotDeclared', {
                extend: 'Ext.app.Controller',
                constructor: function() {
                    this.callParent(arguments);
                    ctorLog.push(this.$className);
                }
            });

            Ext.define('CtrlApplication.Application', {
                extend: 'Ext.app.Application',

                name: 'CtrlApplication',

                controllers: [
                    'DeclaredWithId',
                    'DeclaredAutoIdShort',
                    'CtrlApplication.controller.DeclaredAutoIdLong'
                ]
            });

            app = new CtrlApplication.Application();
        });

        afterEach(function() {
            Ext.undefine('CtrlApplication.controller.DeclaredWithId');
            Ext.undefine('CtrlApplication.controller.DeclaredAutoIdShort');
            Ext.undefine('CtrlApplication.controller.DeclaredAutoIdLong');
            Ext.undefine('CtrlApplication.controller.NotDeclared');

            Ext.undefine('CtrlApplication.Application');

            if (Ext.isIE) {
                window.CtrlApplication = undefined;
            } else {
                delete window.CtrlApplication;
            }

            ctorLog = null;
        });

        function times(key) {
            var count = 0;
            Ext.Array.forEach(ctorLog, function(name) {
                if (name === key) {
                    ++count;
                }
            });
            return count;
        }

        describe("in controllers collection", function() {
            it("should be able to get a controller with an explicit id by id or class name", function() {
                expect(app.getController('declaredCustomWithId').$className).toBe('CtrlApplication.controller.DeclaredWithId');
                expect(app.getController('CtrlApplication.controller.DeclaredWithId').$className).toBe('CtrlApplication.controller.DeclaredWithId');
                expect(times('CtrlApplication.controller.DeclaredWithId')).toBe(1);
            });

            it("should be able to get a controller declared with a short name by short & long name", function() {
                expect(app.getController('DeclaredAutoIdShort').$className).toBe('CtrlApplication.controller.DeclaredAutoIdShort');
                expect(app.getController('CtrlApplication.controller.DeclaredAutoIdShort').$className).toBe('CtrlApplication.controller.DeclaredAutoIdShort');
                expect(times('CtrlApplication.controller.DeclaredAutoIdShort')).toBe(1);
            });

            it("should be able to get a controller declared with a long name by short & long name", function() {
                expect(app.getController('DeclaredAutoIdLong').$className).toBe('CtrlApplication.controller.DeclaredAutoIdLong');
                expect(app.getController('CtrlApplication.controller.DeclaredAutoIdLong').$className).toBe('CtrlApplication.controller.DeclaredAutoIdLong');
                expect(times('CtrlApplication.controller.DeclaredAutoIdLong')).toBe(1);
            });

            it("should be able to get a not declared controller by short & long name", function() {
                expect(app.getController('NotDeclared').$className).toBe('CtrlApplication.controller.NotDeclared');
                expect(app.getController('CtrlApplication.controller.NotDeclared').$className).toBe('CtrlApplication.controller.NotDeclared');
                expect(times('CtrlApplication.controller.NotDeclared')).toBe(1);
            });
        });
    });
});