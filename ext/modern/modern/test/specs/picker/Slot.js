describe('Ext.picker.Slot', function () {
    var picker, viewport, slot;

    afterEach(function () {
        Ext.Viewport = viewport = picker = slot = Ext.destroy(slot, picker, viewport, Ext.Viewport);
    });

    function makePicker (value, dataSize) {
        var dataSize = dataSize || 100;

        viewport = Ext.Viewport = new Ext.viewport.Default();
        picker = Ext.create('Ext.picker.Picker', {
            slots: [{
                name: 'slot1',
                data : (function() {
                    var data = [], i;
                    for(i=0; i<dataSize; i++) {
                        data.push({text: i, value: i});
                    }
                    return data;
                })()        
            }],
            value: value ? value : null
        });
        slot = picker.getAt(0);
        viewport.add(picker);       
    } 

    function getBarIndex (bar) {
        var y = slot.getScrollable().getPosition().y,
            barHeight = bar.dom.getBoundingClientRect().height;

        return Math.round(y/barHeight);
    }

    describe("initial value", function () {
        beforeEach(function () {
            makePicker({slot1: 45});
        });

        it("should be set when the element is initially resized", function () {
            var scrollComplete = false,
                spy;
            
            picker.show();

            spy = spyOn(slot, 'onResize').andCallThrough();
            slot.getScrollable().on('scrollend', function () {
                scrollComplete = true;
            });     

            waitsFor(function() {
                return scrollComplete;
            }, 'slot to scroll selection into view', 800);
            runs(function () {
                expect(spy).toHaveBeenCalled();
                expect(spy.callCount).toBe(1);
            });
            
        });

        it("should be scrolled into view and aligned with bar", function () {
            var scrollComplete = false,
                bar, barIndex;

            picker.show();

            slot.getScrollable().on('scrollend', function () {
                scrollComplete = true;
            });                     

            waitsFor(function () {
                return scrollComplete;
            }, 'slot to scroll selection into view', 800);
            runs(function () {
                bar = picker.bar;
                barIndex = getBarIndex(bar);
                // bar should be aligned with the selected item
                expect(barIndex).toBe(45);
            });
        });

        it("should scroll to selection if view is scrolled, no new selection is made, and picker is re-shown", function () {
            var scrollComplete = false,
                bar, barIndex, scrollable, curY;

            picker.show();

            bar = picker.bar;
            scrollable = slot.getScrollable();
            scrollable.on('scrollend', function () {
                scrollComplete = true;
            });

            waitsFor(function () {
                return scrollComplete;
            }, 'slot to scroll selection into view', 800);
            runs(function () {
                scrollComplete = false;
                // item 45 should be seleted (the default)
                // now let's mimic a scroll to the very top of the list
                scrollable.scrollTo(0, 0);
            });

            waitsFor(function () {
                return scrollComplete;
            }, 'scroll to top of scrollable area', 800);
            runs(function () {
                scrollComplete = false;
                curY = scrollable.getPosition().y;
                // scrolling is done, we should be at the top of the scroller
                expect(curY).toBe(0);
                // now let's simulate the scroll to the top, but the picker is dimissed with no selection made
                picker.hide();
                // now let's re-open the picker
                picker.show();
            });

            waitsFor(function () {
                return scrollComplete;
            }, 'slot to scroll selection into view', 800);
            runs(function () {
                // at this point, the original selection should be scrolled into view, regardless of the previous scroll pos
                barIndex = getBarIndex(bar);
                
                // bar should be aligned with the selected item
                expect(barIndex).toBe(45);
                
                Ext.destroy(scrollable);
            });
        });
    });

    describe("selection", function () {
        it("should make selection if value is found in store", function () {
            var scrollComplete = false,
                scrollable;

            makePicker({slot1: 45});
            spyOn(slot, 'select');
            scrollable = slot.getScrollable();
            scrollable.on('scrollend', function () {
                scrollComplete = true;
            });

            picker.show();

            waitsFor(function () {
                return scrollComplete;
            });
            runs(function () {
                expect(slot.select).toHaveBeenCalled();
            });         
        });

        it("should not make selection if value is not found in store", function () {
            makePicker({slot1: 255});
            spyOn(slot, 'select');

            picker.show();

            waitsFor(function () {
                // since the default index will be 0, no scrolling will occur
                // so we need to wait until view items are available and selectedIndex is set to 0
                return slot.getViewItems().length && slot.selectedIndex === 0;
            });
            runs(function () {
                expect(slot.select).not.toHaveBeenCalled();
            });
        });
    });
});
