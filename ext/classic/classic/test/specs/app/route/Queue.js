describe("Ext.app.route.Queue", function() {
    var token  = 'foo/bar',
        routes = [],
        controller, queue;

    beforeEach(function () {
        controller = new Ext.app.Controller({
            handleFooBar : function() {}
        });
        queue      = new Ext.app.route.Queue({
            token : token
        });
        routes     = [
            new Ext.app.route.Route({
                url        : 'foo/bar',
                controller : controller,
                action     : 'handleFooBar'
            }),
            new Ext.app.route.Route({
                url        : 'foo/bar',
                controller : controller,
                action     : 'handleFooBar'
            })
        ];
    });

    afterEach(function() {
        controller = null;
        queue      = null;
        routes     = [];
    });

    it("should create queue MixedCollection", function() {
        expect(queue.queue).toBeDefined();
    });

    it("should queue route", function() {
        var i      = 0,
            length = routes.length,
            route, args;

        for (; i < length; i++) {
            route = routes[i];
            args  = route.recognize(token);

            if (args) {
                queue.queueAction(route, args);
            }
        }

        expect(queue.queue.length).toEqual(2);
    });

    it("should run the queue", function() {
        var i      = 0,
            length = routes.length,
            route, args;

        for (; i < length; i++) {
            route = routes[i];
            args  = route.recognize(token);

            if (args) {
                queue.queueAction(route, args);
            }
        }

        queue.runQueue();

        expect(queue.queue.length).toEqual(0);
    });
});
