describe("Ext.util.TaskRunner", function() {
    var spy, runner, task;

    describe("idle event", function() {
        beforeEach(function() {
            spy = jasmine.createSpy('idle');
            
            Ext.on('idle', spy);
        });
        
        afterEach(function() {
            Ext.un('idle', spy);
            
            if (runner) {
                runner.destroy();
            }
            
            task = runner = spy = null;
        });
        
        // https://sencha.jira.com/browse/EXTJS-19133
        it("it should not fire idle event when configured", function() {
            runs(function() {
                runner = new Ext.util.TaskRunner({
                    fireIdleEvent: false
                });
                
                task = runner.newTask({
                    fireIdleEvent: false,
                    interval: 10,
                    run: Ext.emptyFn
                });
                
                task.start();
            });
            
            // This should be enough to trip the event, happens fairly often in IE
            waits(300);
            
            runs(function() {
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe("args", function() {
        beforeEach(function() {
            spy = jasmine.createSpy();
            runner = new Ext.util.TaskRunner();
        });

        afterEach(function() {
            if (runner) {
                runner.destroy();
            }

            task = runner = spy = null;
        });

        it("should pass the args Array as parameters of the run method", function() {
            task = runner.newTask({
                interval: 10,
                run: spy,
                args: ['Foo']
            });
            
            task.start();

            waitsFor(function() {
                return spy.callCount;
            });

            runs(function() {
                expect(spy.mostRecentCall.args).toEqual(['Foo']);
            });
        });

        it("should add the current count when configured with addCountToArgs true", function() {
            task = runner.newTask({
                interval: 10,
                run: spy,
                addCountToArgs: true,
                args: ['Foo']
            });
            
            task.start();

            waitsFor(function() {
                return spy.callCount;
            });

            runs(function() {
                expect(spy.mostRecentCall.args).toEqual(['Foo', 1]);
            });
        });

        it("should respect the repeat number when configured with args", function() {
            task = runner.newTask({
                interval: 10,
                run: spy,
                args: ['Foo'],
                repeat: 2
            });
            
            task.start();

            waitsFor(function(){
                return task.stopped;
            });

            runs(function() {
                expect(spy.callCount).toBe(2);
            });
        });
    });
});
