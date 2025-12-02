describe("Ext.scroll.Scroller", function() {
    var scroller, el;

    function makeScroller(config) {
        scroller = new Ext.scroll.Scroller(Ext.apply({
            element: el
        }, config));
    }

    beforeEach(function() {
        el = Ext.getBody().createChild({
            style: 'height:100px;width:100px;'
        });
    });

    afterEach(function() {
        if (scroller) {
            scroller.destroy();
            scroller = null;
        }
        if (el) {
            el.destroy();
            el = null;
        }
    });

    describe("configuring the element", function() {
        var element;

        afterEach(function() {
            if (element && !element.destroyed) {
                Ext.fly(element).destroy();
            }
        });

        it("should accept an HTMLElement", function() {
            element = document.createElement('div');
            document.body.appendChild(element, true);

            scroller = new Ext.scroll.Scroller({
                element: element
            });

            expect(scroller.getElement().isElement).toBe(true);
            expect(scroller.getElement().dom).toBe(element);
        });

        it("should accept an Element ID", function() {
            element = document.createElement('div');
            element.id = 'theEl';
            document.body.appendChild(element, true);

            scroller = new Ext.scroll.Scroller({
                element: 'theEl'
            });

            expect(scroller.getElement().isElement).toBe(true);
            expect(scroller.getElement().dom).toBe(element);
        });

        it("should accept an Ext.dom.Element", function() {
            element = Ext.getBody().createChild();

            scroller = new Ext.scroll.Scroller({
                element: element
            });

            expect(scroller.getElement()).toBe(element);
        });

        it("should throw an error if element with given id not found", function() {
            expect(function() {
                scroller = new Ext.scroll.Scroller({
                    element: 'foobarelement'
                });
            }).toThrow("Cannot create Ext.scroll.Scroller instance. Element with id 'foobarelement' not found.");
        });
    });

    describe("x", function() {
        it("should set overflow-x:auto on the element by default", function() {
            makeScroller();

            expect(el.dom.style.overflowX).toBe('auto');
        });

        it("should set overflow-x:auto on the element when x is true", function() {
            makeScroller({
                x: true
            });

            expect(el.dom.style.overflowX).toBe('auto');
        });

        it("should set overflow-x:auto on the element when x is 'auto'", function() {
            makeScroller({
                x: 'auto'
            });

            expect(el.dom.style.overflowX).toBe('auto');
        });

        it("should set overflow-x:scroll on the element when x is 'scroll'", function() {
            makeScroller({
                x: 'scroll'
            });

            expect(el.dom.style.overflowX).toBe('scroll');
        });

        it("should set overflow-x:hidden the element when x is false", function() {
            makeScroller({
                x: false
            });

            expect(el.dom.style.overflowX).toBe('hidden');
        });
    });

    describe("y", function() {
        it("should set overflow-y:auto on the element by default", function() {
            makeScroller();

            expect(el.dom.style.overflowY).toBe('auto');
        });

        it("should set overflow-y:auto on the element when y is true", function() {
            makeScroller({
                y: true
            });

            expect(el.dom.style.overflowY).toBe('auto');
        });

        it("should set overflow-y:auto on the element when y is 'auto'", function() {
            makeScroller({
                y: 'auto'
            });

            expect(el.dom.style.overflowY).toBe('auto');
        });

        it("should set overflow-y:scroll on the element when y is 'scroll'", function() {
            makeScroller({
                y: 'scroll'
            });

            expect(el.dom.style.overflowY).toBe('scroll');
        });

        it("should set overflow-y:hidden on the element when y is false", function() {
            makeScroller({
                y: false
            });

            expect(el.dom.style.overflowY).toBe('hidden');
        });
    });

    describe("direction", function() {
        it("should set overflow-x:auto and overflow-y:auto on the element when direction is 'auto'", function() {
            makeScroller({
                direction: 'auto'
            });

            expect(el.dom.style.overflowX).toBe('auto');
            expect(el.dom.style.overflowY).toBe('auto');
        });

        it("should set overflow-x:scroll and overflow-y:scroll on the element when direction is 'both'", function() {
            makeScroller({
                direction: 'both'
            });

            expect(el.dom.style.overflowX).toBe('scroll');
            expect(el.dom.style.overflowY).toBe('scroll');
        });

        it("should set overflow-y:auto on the element when direction is 'vertical'", function() {
            makeScroller({
                direction: 'vertical'
            });

            expect(el.dom.style.overflowY).toBe('auto');
            expect(el.dom.style.overflowX).toBe('hidden');
        });

        it("should set overflow-x:auto on the element when direction is 'horizontal'", function() {
            makeScroller({
                direction: 'horizontal'
            });

            expect(el.dom.style.overflowX).toBe('auto');
            expect(el.dom.style.overflowY).toBe('hidden');
        });
    });

    describe("getSize", function() {
        beforeEach(function() {
            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);
        });

        it("should return the content size with x:auto and y:auto", function() {
            makeScroller();
            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:scroll and y:scroll", function() {
            makeScroller({
                x: 'scroll',
                y: 'scroll'
            });
            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:false and y:false", function() {
            makeScroller({
                x: false,
                y: false
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:false and y:auto", function() {
            makeScroller({
                x: false,
                y: true
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:auto and y:false", function() {
            makeScroller({
                x: true,
                y: false
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:false and y:scroll", function() {
            makeScroller({
                x: false,
                y: 'scroll'
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should return the content size with x:scroll and y:false", function() {
            makeScroller({
                x: 'scroll',
                y: false
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });
    });

    describe("setSize", function() {
        it("should set the size", function() {
            makeScroller();
            scroller.setSize({
                x: 300,
                y: 200
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should unset the size", function() {
            makeScroller();
            scroller.setSize({
                x: 300,
                y: 200
            });

            scroller.setSize(null);

            expect(scroller.getSize()).toEqual({
                x: 100,
                y: 100
            });
        });

        it("should set the size on both axes to a single number", function() {
            makeScroller();
            scroller.setSize(200);

            expect(scroller.getSize()).toEqual({
                x: 200,
                y: 200
            });
        });

        it("should set the x size", function() {
            makeScroller();
            scroller.setSize({
                x: 200
            });

            expect(scroller.getSize()).toEqual({
                x: 200,
                y: 100 - Ext.getScrollbarSize().height
            });
        });

        it("should set the y size", function() {
            makeScroller();
            scroller.setSize({
                y: 200
            });

            expect(scroller.getSize()).toEqual({
                x: 100 - Ext.getScrollbarSize().width,
                y: 200
            });
        });

        it("should not change the existing y size when setting the x size", function() {
            makeScroller();

            scroller.setSize({
                y: 300
            });

            scroller.setSize({
                x: 200
            });

            expect(scroller.getSize()).toEqual({
                x: 200,
                y: 300
            });
        });

        it("should not change the existing x size when setting the y size", function() {
            makeScroller();

            scroller.setSize({
                x: 300
            });

            scroller.setSize({
                y: 200
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 200
            });
        });

        it("should reset the x size using 0", function() {
            makeScroller();

            scroller.setSize(300);

            scroller.setSize({
                x: 0
            });

            expect(scroller.getSize()).toEqual({
                x: 100 - Ext.getScrollbarSize().width,
                y: 300
            });
        });

        it("should reset the y size using 0", function() {
            makeScroller();

            scroller.setSize(300);

            scroller.setSize({
                y: 0
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 100 - Ext.getScrollbarSize().height
            });
        });

        it("should reset the x size using null", function() {
            makeScroller();

            scroller.setSize(300);

            scroller.setSize({
                x: null
            });

            expect(scroller.getSize()).toEqual({
                x: 100 - Ext.getScrollbarSize().width,
                y: 300
            });
        });

        it("should reset the y size using null", function() {
            makeScroller();

            scroller.setSize(300);

            scroller.setSize({
                y: null
            });

            expect(scroller.getSize()).toEqual({
                x: 300,
                y: 100 - Ext.getScrollbarSize().height
            });
        });
    });

    describe("getClientSize", function() {
        beforeEach(function() {
            el.destroy();

            el = Ext.getBody().createChild({
                style: {
                    height: '200px',
                    width: '200px',
                    borderColor: 'red',
                    borderStyle: 'solid',
                    borderWidth: '10px 20px',
                    padding: '30px 40px'
                }
            });
        });

        function makeNumbers() {
            var content = [],
                i;

            for (i = 0; i < 100; ++i) {
                content.push(i);
            }

            return content;
        }

        it("should return the clientWidth of the element", function() {
            el.setHtml(makeNumbers().join('<br />'));

            makeScroller();

            var size = scroller.getClientSize();
            expect(size.x).toBe(200 - (20 * 2) - Ext.getScrollbarSize().width);
            expect(size.y).toBe(200 - (10 * 2));
        });

        it("should return the clientHeight of the element", function() {
            el.setHtml(makeNumbers().join(''));

            makeScroller();

            var size = scroller.getClientSize();
            expect(size.x).toBe(200 - (20 * 2));
            expect(size.y).toBe(200 - (10 * 2) - Ext.getScrollbarSize().height);
        });

        it("should read by the clientWidth and clientHeight of the element", function() {
            var content = makeNumbers();
            content[0] = makeNumbers().join('');
            el.setHtml(content.join('<br />'));

            makeScroller();

            var size = scroller.getClientSize();
            expect(size.x).toBe(200 - (20 * 2) - Ext.getScrollbarSize().width);
            expect(size.y).toBe(200 - (10 * 2) - Ext.getScrollbarSize().height);
        });
    });

    describe("getPosition", function() {
        beforeEach(function() {
            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);
        });

        it("should return the current position", function() {
            makeScroller();

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });

            scroller.scrollTo(20, 40);

            expect(scroller.getPosition()).toEqual({
                x: 20,
                y: 40
            });
        });
    });

    describe("scrollTo", function() {
        function makeOverflow(cfg) {
            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);

            makeScroller(cfg);
        }

        function makeNoOverflow(cfg) {
            el.appendChild({
                style: 'height:100px;width:100px;'
            }, true);

            makeScroller(cfg);
        }

        it("should scroll on the x axis", function() {
            makeOverflow();

            scroller.scrollTo(50, 0);

            expect(scroller.getPosition()).toEqual({
                x: 50,
                y: 0
            });
        });

        it("should scroll on the x axis when the x axis is disabled", function() {
            makeOverflow({
                x: false
            });

            scroller.scrollTo(50, 0);

            expect(scroller.getPosition()).toEqual({
                x: 50,
                y: 0
            });
        });

        it("should not scroll on the x axis if the content does not overflow horizontally", function() {
            makeNoOverflow();

            scroller.scrollTo(50, 0);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });
        });

        it("should constrain to the max x position", function() {
            makeOverflow();

            scroller.scrollTo(250, 0);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().width,
                y: 0
            });
        });

        it("should scroll on the y axis", function() {
            makeOverflow();

            scroller.scrollTo(0, 50);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 50
            });
        });

        it("should scroll on the y axis when the y axis is disabled", function() {
            makeOverflow({
                y: false
            });

            scroller.scrollTo(0, 50);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 50
            });
        });

        it("should not scroll on the y axis if the content does not overflow vertically", function() {
            makeNoOverflow();

            scroller.scrollTo(0, 50);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });
        });

        it("should constrain to the max y position", function() {
            makeOverflow();

            scroller.scrollTo(0, 250);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 100 + Ext.getScrollbarSize().height
            });
        });

        it("should scroll on both axes", function() {
            makeOverflow();

            scroller.scrollTo(50, 60);

            expect(scroller.getPosition()).toEqual({
                x: 50,
                y: 60
            });
        });

        it("should constrain to max x and y", function() {
            makeOverflow();

            scroller.scrollTo(300, 300);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().width,
                y: 100 + Ext.getScrollbarSize().height
            });
        });

        it("should scroll to max x using Infinity", function() {
            makeOverflow();

            scroller.scrollTo(Infinity, 0);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().height,
                y: 0
            });
        });

        it("should scroll to max y using Infinity", function() {
            makeOverflow();

            scroller.scrollTo(0, Infinity);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 100 + Ext.getScrollbarSize().width
            });
        });

        it("should scroll to max x and y using Infinity", function() {
            makeOverflow();

            scroller.scrollTo(Infinity, Infinity);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().height,
                y: 100 + Ext.getScrollbarSize().width
            });
        });

        it("should ignore x if null is passed", function() {
            makeOverflow();

            scroller.scrollTo(10, 10);

            scroller.scrollTo(null, 20);

            expect(scroller.getPosition()).toEqual({
                x: 10,
                y: 20
            });
        });

        it("should ignore y if null is passed", function() {
            makeOverflow();

            scroller.scrollTo(10, 10);

            scroller.scrollTo(20, null);

            expect(scroller.getPosition()).toEqual({
                x: 20,
                y: 10
            });
        });

        it("should ignore x and y if both null", function() {
            makeOverflow();

            scroller.scrollTo(10, 10);

            scroller.scrollTo(null, null);

            expect(scroller.getPosition()).toEqual({
                x: 10,
                y: 10
            });
        });

        it("should scroll to negative offset from max x", function() {
            makeOverflow();

            scroller.scrollTo(-20, 0);

            expect(scroller.getPosition()).toEqual({
                x: 180 + Ext.getScrollbarSize().height,
                y: 0
            });
        });

        it("should scroll to negative offset from max y", function() {
            makeOverflow();

            scroller.scrollTo(0, -20);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 80 + Ext.getScrollbarSize().width
            });
        });

        it("should scroll to negative offset from max x and y", function() {
            makeOverflow();

            scroller.scrollTo(-20, -20);

            expect(scroller.getPosition()).toEqual({
                x: 180 + Ext.getScrollbarSize().height,
                y: 80 + Ext.getScrollbarSize().width
            });
        });
    });

    describe("scrollBy", function() {
        beforeEach(function() {
            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);
        });

        it("should set the scroll position", function() {
            makeScroller();

            scroller.scrollBy(20, 10);

            expect(scroller.getPosition()).toEqual({
                x: 20,
                y: 10
            });

            scroller.scrollBy(-10, -5);

            expect(scroller.getPosition()).toEqual({
                x: 10,
                y: 5
            });
        });

        it("should ignore x if null is passed", function() {
            makeScroller();

            scroller.scrollTo(10, 10);

            scroller.scrollBy(null, 10);

            expect(scroller.getPosition()).toEqual({
                x: 10,
                y: 20
            });
        });

        it("should ignore y if null is passed", function() {
            makeScroller();

            scroller.scrollTo(10, 10);

            scroller.scrollBy(10, null);

            expect(scroller.getPosition()).toEqual({
                x: 20,
                y: 10
            });
        });

        it("should ignore x and y if both null", function() {
            makeScroller();

            scroller.scrollTo(10, 10);

            scroller.scrollBy(null, null);

            expect(scroller.getPosition()).toEqual({
                x: 10,
                y: 10
            });
        });

        it("should constrain to the max x position", function() {
            makeScroller();

            scroller.scrollBy(250, 0);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().height,
                y: 0
            });
        });

        it("should constrain to the min x position", function() {
            makeScroller();

            scroller.scrollBy(-10, 0);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });
        });

        it("should constrain to the max y position", function() {
            makeScroller();

            scroller.scrollBy(0, 250);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 100 + Ext.getScrollbarSize().width
            });
        });

        it("should constrain to the min y position", function() {
            makeScroller();

            scroller.scrollBy(0, -10);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });
        });

        it("should constrain to max x and y", function() {
            makeScroller();

            scroller.scrollBy(300, 300);

            expect(scroller.getPosition()).toEqual({
                x: 200 + Ext.getScrollbarSize().height,
                y: 100 + Ext.getScrollbarSize().width
            });
        });

        it("should constrain to min x and y", function() {
            makeScroller();

            scroller.scrollBy(-10, -10);

            expect(scroller.getPosition()).toEqual({
                x: 0,
                y: 0
            });
        });
    });

    describe("getMaxPosition and getMaxUserPosition", function() {
        beforeEach(function() {
            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);
        });

        describe("with x:true and y:true", function() {
            beforeEach(function() {
                makeScroller();
            });

            it("should return the maxPosition", function() {
                expect(scroller.getMaxPosition()).toEqual({
                    x: 200 + Ext.getScrollbarSize().height,
                    y: 100 + Ext.getScrollbarSize().width
                });
            });

            it("should return the maxUserPosition", function() {
                expect(scroller.getMaxUserPosition()).toEqual({
                    x: 200 + Ext.getScrollbarSize().height,
                    y: 100 + Ext.getScrollbarSize().width
                });
            });
        });

        describe("with x:true and y:false", function() {
            beforeEach(function() {
                makeScroller({
                    x: true,
                    y: false
                });
            });

            it("should return the maxPosition", function() {
                expect(scroller.getMaxPosition()).toEqual({
                    x: 200,
                    y: 100 + Ext.getScrollbarSize().width
                });
            });

            it("should return the maxUserPosition", function() {
                expect(scroller.getMaxUserPosition()).toEqual({
                    x: 200,
                    y: 0
                });
            });
        });

        describe("with x:false and y:true", function() {
            beforeEach(function() {
                makeScroller({
                    x: false,
                    y: true
                })
            });

            it("should return the maxPosition", function() {
                expect(scroller.getMaxPosition()).toEqual({
                    x: 200 + Ext.getScrollbarSize().height,
                    y: 100
                });
            });

            it("should return the maxUserPosition", function() {
                expect(scroller.getMaxUserPosition()).toEqual({
                    x: 0,
                    y: 100
                });
            });
        });

        describe("with x:false and y:false", function() {
            beforeEach(function() {
                makeScroller({
                    x: false,
                    y: false
                });
            });

            it("should return the maxPosition", function() {
                expect(scroller.getMaxPosition()).toEqual({
                    x: 200,
                    y: 100
                });
            });

            it("should return the maxUserPosition", function() {
                expect(scroller.getMaxUserPosition()).toEqual({
                    x: 0,
                    y: 0
                });
            });
        });
    });

    describe("partnership", function() {
        var scrollSpy, scrollSpy2, scrollSpy3, el2, el3, scroller2, scroller3;

        function makeScroller2() {
            el2 = Ext.getBody().createChild({
                style: 'height:100px;width:100px;',
                cn: [{
                    style: 'height:200px;width:300px;'
                }]
            });

            scroller2 = new Ext.scroll.Scroller({
                element: el2
            });

            scroller2.on('scroll', scrollSpy2);
        }

        function makeScroller3() {
            el3 = Ext.getBody().createChild({
                style: 'height:100px;width:100px;',
                cn: [{
                    style: 'height:200px;width:300px;'
                }]
            });

            scroller3 = new Ext.scroll.Scroller({
                element: el3
            });

            scroller3.on('scroll', scrollSpy3);
        }

        beforeEach(function() {
            scrollSpy = jasmine.createSpy();
            scrollSpy2 = jasmine.createSpy();
            scrollSpy3 = jasmine.createSpy();

            el.appendChild({
                style: 'height:200px;width:300px;'
            }, true);

            makeScroller();

            scroller.on('scroll', scrollSpy);
        });

        afterEach(function() {
            if (scroller2) {
                scroller2.destroy();
                scroller2 = null;
            }
            if (scroller3) {
                scroller3.destroy();
                scroller3 = null;
            }
            if (el2) {
                el2.destroy();
                el2 = null;
            }
            if (el3) {
                el3.destroy();
                el3 = null;
            }
        });

        describe("single partner", function() {
            beforeEach(function() {
                makeScroller2();
            });

            describe("both axes enabled", function() {
                beforeEach(function() {
                    scroller.addPartner(scroller2);
                });

                it("should sync the partner's scroll position when the scroller is scrolled", function() {
                    // The partner should take action upon scroll start and end
                    spyOn(scroller2, 'fireScrollStart').andCallThrough();
                    spyOn(scroller2, 'fireScrollEnd').andCallThrough();

                    scroller.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy.wasCalled
                                // The passive side should also have fired its start and end scroll events
                            &&     scroller2.fireScrollStart.callCount === 1
                            &&     scroller2.fireScrollEnd.callCount === 1;
                    }, 'scroller2 to have started scrolling, scrolled, and ended scrolling');

                    runs(function() {
                        expect(scroller2.getPosition()).toEqual({
                            x: 10,
                            y: 20
                        });
                    });
                });

                it("should sync the scroller's scroll position when the partner is scrolled", function() {
                    // The scroller should take action upon scroll start and end
                    spyOn(scroller, 'fireScrollStart').andCallThrough();
                    spyOn(scroller, 'fireScrollEnd').andCallThrough();

                    scroller2.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy2.wasCalled
                                // The passive side should also have fired its start and end scroll events
                            &&     scroller.fireScrollStart.callCount === 1
                            &&     scroller.fireScrollEnd.callCount === 1;
                    }, 'scroller to have started scrolling, scrolled, and ended scrolling');

                    runs(function() {
                        expect(scroller.getPosition()).toEqual({
                            x: 10,
                            y: 20
                        });
                    });
                });
            });

            describe("x-axis only", function() {
                beforeEach(function() {
                    scroller.addPartner(scroller2, 'x');
                });

                it("should sync the partner's scroll position when the scroller is scrolled", function() {
                    scroller.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy.wasCalled;
                    });

                    runs(function() {
                        expect(scroller2.getPosition()).toEqual({
                            x: 10,
                            y: 0
                        });
                    });
                });

                it("should sync the scroller's scroll position when the partner is scrolled", function() {
                    scroller2.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy2.wasCalled;
                    });

                    runs(function() {
                        expect(scroller.getPosition()).toEqual({
                            x: 10,
                            y: 0
                        });
                    });
                });
            });

            describe("y-axis only", function() {
                beforeEach(function() {
                    scroller.addPartner(scroller2, 'y');
                });

                it("should sync the partner's scroll position when the scroller is scrolled", function() {
                    scroller.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy.wasCalled;
                    });

                    runs(function() {
                        expect(scroller2.getPosition()).toEqual({
                            x: 0,
                            y: 20
                        });
                    });
                });

                it("should sync the scroller's scroll position when the partner is scrolled", function() {
                    scroller2.scrollTo(10, 20);

                    waitsFor(function() {
                        return scrollSpy2.wasCalled;
                    });

                    runs(function() {
                        expect(scroller.getPosition()).toEqual({
                            x: 0,
                            y: 20
                        });
                    });
                });
            });

            it("should remove the partner", function() {
                scroller.addPartner(scroller2);
                scroller.removePartner(scroller2);

                scroller.scrollTo(10, 20);

                waitsFor(function() {
                    return scrollSpy.wasCalled;
                });

                runs(function() {
                    expect(scroller2.getPosition()).toEqual({
                        x: 0,
                        y: 0
                    });
                    scroller2.scrollTo(40, 30);
                });

                waitsFor(function() {
                    return scrollSpy2.wasCalled;
                });

                runs(function() {
                    expect(scroller.getPosition()).toEqual({
                        x: 10,
                        y: 20
                    });
                });
            });
        });

        describe("multiple partners", function() {
            beforeEach(function() {
                makeScroller2();
                makeScroller3();

                scroller.addPartner(scroller2);
                scroller.addPartner(scroller3);
            });

            it("should sync multiple partners when the scroller is scrolled", function() {
                scroller.scrollTo(10, 15);

                waitsFor(function() {
                    return scrollSpy.wasCalled;
                });

                runs(function() {
                    expect(scroller2.getPosition()).toEqual({
                        x: 10,
                        y: 15
                    });

                    expect(scroller3.getPosition()).toEqual({
                        x: 10,
                        y: 15
                    });
                });
            });

            it("should sync scroll position when a partner is scrolled", function() {
                scroller3.scrollTo(50, 60);

                waitsFor(function() {
                    return scrollSpy3.wasCalled;
                });

                runs(function() {
                    expect(scroller.getPosition()).toEqual({
                        x: 50,
                        y: 60
                    });
                });
            });

            it("should remove a partner", function() {
                scroller.removePartner(scroller2);

                scroller2.scrollTo(15, 20);

                waitsFor(function() {
                    return scrollSpy2.wasCalled;
                });

                runs(function() {
                    expect(scroller.getPosition()).toEqual({
                        x: 0,
                        y: 0
                    });

                    // scroller3 still attached
                    scroller3.scrollTo(30, 45);
                });

                waitsFor(function() {
                    return(scrollSpy3.wasCalled);
                });

                runs(function() {
                    expect(scroller.getPosition()).toEqual({
                        x: 30,
                        y: 45
                    });
                });
            });
        });
    });
});
