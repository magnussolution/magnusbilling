xdescribe("Ext.env.Feature", function(){
    describe("on created", function(){
        it("should create a default instance of itself in Ext.feature", function(){
            expect(Ext.feature).toBeDefined();
            expect(Ext.feature instanceof Ext.env.Feature).toBe(true);
        });
    });

    describe("class methods", function(){
        var featureEnv;

        beforeEach(function(){
            featureEnv = new Ext.env.Feature();
        });

        describe("getTestElement()", function(){
            it("should return a valid DOM element", function(){
                expect(featureEnv.getTestElement().nodeType).toBeDefined();
            });

            it("should return the passed argument itself if it's not a string", function(){
                var test = {};

                expect(featureEnv.getTestElement(test)).toBe(test);
            });

            it("should return a div element if not explicitly specified", function(){
                expect(featureEnv.getTestElement().tagName).toBe('DIV');
            });

            it("should return the correct element type if explicitly specified", function(){
                expect(featureEnv.getTestElement('input').tagName).toBe('INPUT');
            });

            it("should reuse the same element object", function(){
                var element = featureEnv.getTestElement('input');

                expect(featureEnv.getTestElement('input')).toBe(element);
            });
        });

        describe("isStyleSupported()", function() {
            it("should invoke getTestElement and pass the given element type if specified", function(){
                spyOn(featureEnv, 'getTestElement').andCallThrough();

                featureEnv.isStyleSupported('someStyle', 'someTag');

                expect(featureEnv.getTestElement).toHaveBeenCalledWith('someTag');
            });

            it("should return true if the style property exists on the element", function(){
                spyOn(featureEnv, 'getTestElement').andReturn({
                    style: {
                        someStyle: null
                    }
                });

                var ret = featureEnv.isStyleSupported('someStyle');
                expect(featureEnv.getTestElement).toHaveBeenCalled();
                expect(ret).toBe(true);
            });

            it("should return false if the style property does not exist on the element", function(){
                spyOn(featureEnv, 'getTestElement').andReturn({
                    style: {}
                });

                expect(featureEnv.isStyleSupported('someStyle')).toBe(false);
            });
        });

        describe("isEventSupported()", function(){
            it("should invoke getTestElement and pass Ext.global if tag is not specified by default", function() {
                spyOn(featureEnv, 'getTestElement').andCallThrough();

                featureEnv.isEventSupported('someEvent');

                expect(featureEnv.getTestElement).toHaveBeenCalledWith(Ext.global);
            });

            it("should return true if the event property exists", function() {
                spyOn(featureEnv, 'getTestElement').andReturn({
                    onsomeevent: function() {}
                });

                expect(featureEnv.isEventSupported('SOMEEVENT')).toBe(true);
            });

            it("should return false if the event property doesn't exist", function() {
                spyOn(featureEnv, 'getTestElement').andReturn({
                    onsomeotherevent: function() {}
                });

                expect(featureEnv.isEventSupported('someevent')).toBe(false);
            });
        });

        describe("has", function(){
            it("should return true if the property exists in 'has' and it is truthy", function(){
                featureEnv.has.SomeFeature = true;
                featureEnv.has.SomeOtherFeature = null;

                expect(featureEnv.has('SomeFeature')).toBe(true);
                expect(featureEnv.has('SomeOtherFeature')).toBe(false);
            });

            it("should return true if the property does not exist in 'has'", function(){
                expect(featureEnv.has('SomeFeature')).toBe(false);
            });
        });

        describe("registerTest()", function(){
            it("should invoke the test function with the scope of Ext.env.Feature instance", function(){
                var fn = jasmine.createSpy();
                featureEnv.registerTest('test', fn);

                expect(fn).toHaveBeenCalled();
                expect(fn.callCount).toBe(1);
                expect(fn.mostRecentCall.object).toBe(featureEnv);
            });

            it("should store the test result in 'has'", function(){
                var fn = jasmine.createSpy().andReturn(true);
                featureEnv.registerTest('test', fn);

                expect(featureEnv.has('test')).toBe(true);
            });

            it("should be a flexSetter", function() {
                var foo = jasmine.createSpy(),
                    bar = jasmine.createSpy();

                var tests = {
                    foo: foo,
                    bar: bar
                };

                featureEnv.registerTest(tests);

                expect(foo).toHaveBeenCalled();
                expect(bar).toHaveBeenCalled();
            });
        });
    });
});
