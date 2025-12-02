describe("Ext.app.route.Router", function() {
    var Router         = Ext.app.route.Router,
        actionExecuted = false,
        beforeExecuted = false,
        numArgs        = 0,
        numBeforeArgs  = 0,
        token          = 'foo/bar',
        token2         = 'foo2/:id',
        controller, other;

    beforeEach(function () {
        controller = new Ext.app.Controller({
            beforeHandleRoute : function (callback) {
                numBeforeArgs  += arguments.length;
                beforeExecuted = true;

                var action = arguments[arguments.length - 1];

                action.resume();
            },
            handleRoute       : function () {
                numArgs        += arguments.length;
                actionExecuted = true;
            }
        });
        
        other = new Ext.app.Controller({
            handleRoute: Ext.emptyFn
        });
    });

    afterEach(function () {
        other = controller = null;
        actionExecuted = false;
        beforeExecuted = false;
        numArgs        = 0;
        numBeforeArgs  = 0;

        Router.queueRoutes = true;
        Router.routes      = [];
    });

    it("should init Ext.util.History", function() {
        expect(Ext.util.History.ready).toBe(true);
    });

    describe("should connect route", function() {
        it("connect simple route", function() {
            Router.connect('foo/bar', 'handleRoute', controller);
            Router.connect('foo/bar', 'handleRoute', controller);

            return expect(Router.routes.length).toBe(2);
        });

        it("connect complex route", function() {
            Router.connect('foo/bar', {
                action     : 'handleRoute',
                before     : 'beforeHandleRoute',
                controller : controller
            });
            Router.connect('foo/bar', {
                action     : 'handleRoute',
                before     : 'beforeHandleRoute',
                controller : controller
            });
            Router.connect('foo/bar', {
                action     : 'handleRoute',
                before     : 'beforeHandleRoute',
                controller : controller
            });

            expect(Router.routes.length).toBe(3);
        });

        it("connect using draw method", function () {
            Router.draw(function (map) {
                map.connect('foo/bar', {controller : controller, action : 'handleRoute'});
                map.connect('foo/bar', {controller : controller, action : 'handleRoute'});
            });

            expect(Router.routes.length).toBe(2);
        });
    });

    it("should clear routes", function() {
        Router.connect('foo/bar', 'handleRoute', controller);
        Router.connect('foo/baz', 'handleRoute', controller);

        Router.clear();

        expect(Router.routes.length).toBe(0);
    });
    
    it("should disconnect routes for a controller", function() {
        Router.connect('foo/bar', 'handleRoute', controller);
        Router.connect('foo/bar', 'handleRoute', other);
        
        Router.disconnectAll(other);
        expect(Router.routes.length).toBe(1);
    });

    describe("should recognize token", function () {
        it("recognize 'foo/bar'", function () {
            Router.connect(token, 'handleRoute', controller);
            //connect a route that will not match
            Router.connect(token + '/boom', 'handleRoute', controller);

            expect(Router.recognize(token)).toBeDefined();
        });
    });
    
    it("should fire the unmatchedroute event if no matching routes are found", function() {
        Router.connect('foo', 'handleRoute', controller);
        Router.application = new Ext.util.Observable();
        
        spyOn(Router.application, 'fireEvent');
        Router.onStateChange('bar');
        expect(Router.application.fireEvent).toHaveBeenCalledWith('unmatchedroute', 'bar');
    });

    it("should execute multiple tokens", function() {
        //action should have 0 arguments
        Router.connect(token, 'handleRoute', controller);
        //before should have 2 arguments, action should have 1
        Router.connect(token2, {
            action : 'handleRoute',
            before : 'beforeHandleRoute'
        }, controller);

        Router.onStateChange('foo/bar|foo2/2');

        expect(numBeforeArgs + numArgs).toBe(3);
    });

    it("should execute on History change", function() {
        Router.queueRoutes = false;

        Router.connect('foo/bar', 'handleRoute', controller);

        Router.onStateChange(token);

        expect(actionExecuted).toBe(true);
    });
});
