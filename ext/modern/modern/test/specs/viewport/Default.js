describe("Ext.viewport.Default", function() {
    var addWindowListenerSpy,
        Viewport = Ext.viewport.Default;

    Viewport.override({
        addWindowListener: function() {
            if (!addWindowListenerSpy) return this.callOverridden(arguments);
            addWindowListenerSpy.apply(this, arguments);
        },

        getWindowOrientation: function() {
            return 0;
        },

        waitUntil: function(condition, onSatisfied) {
            onSatisfied.call(this);
        }
    });

    beforeEach(function() {
        addWindowListenerSpy = jasmine.createSpy();
    });

    describe("constructor()", function(){
        it("should attach initial listeners", function(){
            var viewport = new Viewport();

            expect(addWindowListenerSpy).toHaveBeenCalled();

            viewport.destroy();
        });
    });

    describe("methods", function(){
        var viewport;

        beforeEach(function() {
            viewport = new Viewport();
        });

        afterEach(function(){
            viewport.destroy();
        });

        describe("onWindowReady()", function() {
            it("should set isReady flag to true", function() {
                viewport.onDomReady();

                expect(viewport.isReady).toBe(true);
            });
        });

        describe("doAddListener()", function(){
            it("should invoke the listener immediately if eventName is 'ready' and isReady flag equals 'true'", function(){
                var fn = jasmine.createSpy();

                viewport.isReady = true;
                viewport.addListener('ready', fn);

                expect(fn).toHaveBeenCalled();
            });

            it("should proxy to observable mixin's doAddListener() otherwise", function(){
                var fn = jasmine.createSpy();

                viewport.isReady = false;
                viewport.addListener('ready', fn);

                expect(fn).not.toHaveBeenCalled();
                expect(viewport.events.ready.listeners.length).toBe(1);
            });
        });

        describe("onResize()", function(){
            it("should invoke getWindowWidth() and getWindowHeight()", function(){
                spyOn(viewport, 'getWindowWidth');
                spyOn(viewport, 'getWindowHeight');

                viewport.onResize();

                expect(viewport.getWindowWidth).toHaveBeenCalled();
                expect(viewport.getWindowHeight).toHaveBeenCalled();
            });

            it("should NOT fire a 'resize' event if the size doesn't change", function(){
                spyOn(viewport, 'fireEvent');

                viewport.onResize();

                expect(viewport.fireEvent).not.toHaveBeenCalled();
            });
        });

        describe("determineOrientation()", function(){
            describe("if supportOrientation is true", function(){
                beforeEach(function() {
                    spyOn(viewport, 'supportsOrientation').andReturn(true);
                });

                it("should invoke getWindowOrientation()", function(){
                    spyOn(viewport, 'getWindowOrientation');

                    viewport.determineOrientation();

                    expect(viewport.getWindowOrientation).toHaveBeenCalled();
                });

                it("should return viewport.PORTRAIT if orientation equals 0", function(){
                    spyOn(viewport, 'getWindowOrientation').andReturn(0);

                    var orientation = viewport.determineOrientation();
                    expect(orientation).toBe(viewport.PORTRAIT);
                });

                it("should return viewport.PORTRAIT if orientation equals 180", function(){
                    spyOn(viewport, 'getWindowOrientation').andReturn(180);

                    var orientation = viewport.determineOrientation();
                    expect(orientation).toBe(viewport.PORTRAIT);
                });

                it("should return viewport.LANDSCAPE if orientation equals 90", function(){
                    spyOn(viewport, 'getWindowOrientation').andReturn(90);

                    var orientation = viewport.determineOrientation();
                    expect(orientation).toBe(viewport.LANDSCAPE);
                });

                it("should return viewport.LANDSCAPE if orientation equals -90", function(){
                    spyOn(viewport, 'getWindowOrientation').andReturn(-90);

                    var orientation = viewport.determineOrientation();
                    expect(orientation).toBe(viewport.LANDSCAPE);
                });

                it("should return viewport.LANDSCAPE if orientation equals 270", function(){
                    spyOn(viewport, 'getWindowOrientation').andReturn(270);

                    var orientation = viewport.determineOrientation();
                    expect(orientation).toBe(viewport.LANDSCAPE);
                });
            });

            describe("if supportOrientation is false", function(){
                beforeEach(function() {
                    spyOn(viewport, 'supportsOrientation').andReturn(false);
                });

                it("should return a value other then null", function(){
                    var orientation = viewport.determineOrientation();
                    expect(orientation).not.toBeNull();
                });
            });
        });

        describe("onOrientationChange()", function(){
            it("should invoke determineOrientation()", function(){
                spyOn(viewport, 'determineOrientation');

                viewport.onOrientationChange();

                expect(viewport.determineOrientation).toHaveBeenCalled();
            });

            it("should NOT fire an 'orientationchange' event if the orientation didn't change", function(){
                spyOn(viewport, 'fireEvent');

                viewport.onOrientationChange();

                expect(viewport.fireEvent).not.toHaveBeenCalled();
            });

            it("should fire an 'orientationchange' event and pass the new orientation, width and height as arguments, if the orientation did change", function(){
                var newOrientation = viewport.LANDSCAPE;

                viewport.setOrientation(viewport.PORTRAIT);

                spyOn(viewport, 'determineOrientation').andReturn(newOrientation);
                spyOn(viewport, 'fireEvent');

                viewport.updateSize = function() {
                    this.windowWidth = 100;
                    this.windowHeight = 200;

                    return this;
                };
                viewport.onOrientationChange();

                expect(viewport.fireEvent).toHaveBeenCalledWith('orientationchange', viewport, newOrientation, 100, 200);
            });
        });
    });
});
