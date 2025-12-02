describe("Ext.app.route.Route", function() {
    var actionExecuted = false,
        beforeExecuted = false,
        numArgs        = 0,
        numBeforeArgs  = 0,
        token          = 'foo/bar',
        controller;

    beforeEach(function () {
        controller = new Ext.app.Controller({
            beforeHandleRoute : function() {
                numBeforeArgs  += arguments.length;
                beforeExecuted = true;

                var action = arguments[arguments.length - 1];

                action.resume();
            },

            beforeHandleRouteBlock : function() {
                numBeforeArgs  += arguments.length;
                beforeExecuted = true;

                var action = arguments[arguments.length - 1];

                action.stop(); //stop the current route
            },

            handleRoute : function() {
                numArgs        = arguments.length;
                actionExecuted = true;
            }
        });
    });

    afterEach(function () {
        controller     = null;
        actionExecuted = false;
        beforeExecuted = false;
        numArgs        = 0;
        numBeforeArgs  = 0;
    });

    describe("should recognize tokens", function() {
        it("recognize 'foo/bar'", function() {
            var route = new Ext.app.route.Route({
                controller : controller,
                action     : 'handleRoute',
                url        : 'foo/bar'
            });

            expect(route.recognize(token)).toBeTruthy();
        });

        describe("optional parameters", function() {
            it("recognize 'foo/:id'", function() {
                //:id is a param
                var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    url        : 'foo/:id'
                });

                expect(route.recognize('foo/123')).toBeTruthy();
            });

            it("recognize 'foo/:id' using condition for :id", function () {
                var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    url        : 'foo:id',
                    conditions : {
                        //makes :id param optional
                        ':id' : '(?:(?:/){1}([%a-zA-Z0-9\-\_\s,]+))?'
                    }
                });

                expect(route.recognize('foo/123')).toBeTruthy();
            });
        });
    });

    describe("should fire action", function() {
        it("fires action", function () {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    url        : 'foo/bar'
                }),
                args = route.recognize(token);

            route.execute(token, args);

            expect(actionExecuted).toEqual(true);
        });

        it("fires using caseInsensitve", function() {
            var route = new Ext.app.route.Route({
                    controller      : controller,
                    action          : 'handleRoute',
                    url             : 'foo/bar',
                    caseInsensitive : true
                }),
                args = route.recognize('FoO/bAr');

            route.execute(token, args);

            expect(actionExecuted).toEqual(true);
        });
    });

    describe("handle before action", function () {
        it("show continue action execution", function () {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    before     : 'beforeHandleRoute',
                    url        : 'foo/bar'
                }),
                args  = route.recognize(token);

            route.execute(token, args);

            expect(beforeExecuted && actionExecuted).toEqual(true);
        });

        it("show block action execution", function () {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    before     : 'beforeHandleRouteBlock',
                    url        : 'foo/bar'
                }),
                args = route.recognize(token);

            route.execute(token, args);

            expect(beforeExecuted && !actionExecuted).toEqual(true);
        });
    });

    it("should execute callback in route.execute call", function() {
        var route                 = new Ext.app.route.Route({
                controller : controller,
                action     : 'handleRoute',
                url        : 'foo/bar'
            }),
            args                  = route.recognize(token),
            localCallbackExecuted = false;

        route.execute(token, args, function() {
            localCallbackExecuted = true;
        });

        expect(localCallbackExecuted).toEqual(true);
    });

    describe("number of arguments", function() {
        it("with a before action", function() {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    before     : 'beforeHandleRoute',
                    url        : 'foo/:bar'
                }),
                args = route.recognize(token);

            route.execute(token, args);

            expect(numBeforeArgs + numArgs).toBe(3);
        });

        it("without a before action", function() {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    url        : 'foo/:bar'
                }),
                args = route.recognize(token);

            route.execute(token, args);

            expect(numBeforeArgs + numArgs).toBe(1);
        });
    });
    
    describe("controller activity", function() {
        it("should not recognize if the controller is inactive", function() {
            var route = new Ext.app.route.Route({
                    controller : controller,
                    action     : 'handleRoute',
                    url        : 'foo/:bar'
                });

            controller.deactivate();
            expect(route.recognize(token)).toBe(false);
        });
        
        it("should recognize if the controller is inactive & the allowInactive flag is set", function() {
            var route = new Ext.app.route.Route({
                    controller   : controller,
                    action       : 'handleRoute',
                    url          : 'foo/:bar',
                    allowInactive: true
                });

            controller.deactivate();
            expect(route.recognize(token)).not.toBe(false);
        });
    });
});
