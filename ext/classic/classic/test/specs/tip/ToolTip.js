/* global Ext, jasmine, expect, spyOn, describe, xdescribe */

describe("Ext.tip.ToolTip", function() {

    var tip,
        target,
        describeNotTouch = Ext.supports.TouchEvents ? xdescribe : describe;

    function createTip(config) {
        config = Ext.apply({target: target, width: 50, height: 50, html: 'X'}, config);
        tip = new Ext.tip.ToolTip(config);
        return tip;
    }

    beforeEach(function() {
        // force scroll to top, to avoid issues with positions getting calculted incorrectly as the scroll jumps around
       // window.scrollTo(0, 0);

        target = Ext.getBody().insertHtml(
            'beforeEnd',
            '<a href="#" id="tipTarget" style="position:absolute; left:100px; top:100px; width: 50px; height: 50px;background-color:red">x</a>',
            true
        );
                
    });

    afterEach(function() {
        if (tip) {
            tip.destroy();
            tip = null;
        }
        target.destroy();
    });

    function mouseOverTarget() {
        jasmine.fireMouseEvent(target, 'mouseover', target.getX(), target.getY());
    }
    function mouseOutTarget() {
        jasmine.fireMouseEvent(target, 'mouseout', 1000, 1000);
    }

    describe("basic", function() {
        it("should extend Ext.tip.Tip", function() {
            expect(createTip() instanceof Ext.tip.Tip).toBeTruthy();
        });

        it("should accept an id for the 'target' config", function() {
            createTip({target: 'tipTarget'});
            expect(tip.target.dom).toBe(target.dom);
        });

        it("should accept an Ext.Element for the 'target' config", function() {
            createTip({target: target});
            expect(tip.target.dom).toBe(target.dom);
        });

        it("should accept an HTMLElement for the 'target' config", function() {
            createTip({target: target.dom});
            expect(tip.target.dom).toBe(target.dom);
        });

        it('should show with no errors thrown', function() {
            createTip({
                target: null
            });
            expect(function() {
                tip.show();
            }).not.toThrow();
        });
    });

    describe("disable", function() {
        it("should not show when not using a delay", function() {
            createTip({
                target: 'tipTarget',
                showDelay: 0
            });
            tip.disable();
            mouseOverTarget();
            expect(tip.isVisible()).toBe(false);
        });

        it("should not show when disabled during a delay and not rendered", function() {
            createTip({
                target: 'tipTarget',
                showDelay: 1000
            });
            mouseOverTarget();
            tip.disable();
            var spy = jasmine.createSpy();
            tip.on('show', spy);
            waits(1500);
            runs(function() {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        it("should not show when disabled during a delay and already rendered", function() {
            createTip({
                target: 'tipTarget',
                showDelay: 1000,
                renderTo: Ext.getBody()
            });
            tip.hide();
            mouseOverTarget();
            tip.disable();
            var spy = jasmine.createSpy();
            tip.on('show', spy);
            waits(1500);
            runs(function() {
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describeNotTouch("show/hide", function() {
        it("should show the tooltip after mousing over the target element", function() {
            runs(function() {
                createTip({showDelay: 1});
                var delaySpy = spyOn(tip, 'delayShow').andCallThrough();
                expect(tip.isVisible()).toBeFalsy();
                mouseOverTarget();
                expect(delaySpy).toHaveBeenCalled();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
        });

        it("should hide the tooltip after mousing out of the target element", function() {
            runs(function() {
                createTip({showDelay: 1, hideDelay: 15});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                jasmine.fireMouseEvent(target, 'mouseout', target.getX(), target.getY());
            });
            waitsFor(function() {
                return !tip.isVisible();
            }, "ToolTip was never hidden");
        });

        it("should hide the tooltip after a delay", function() {
            runs(function() {
                createTip({showDelay: 1, dismissDelay: 15});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            waitsFor(function() {
                return !tip.isVisible();
            }, "ToolTip was never hidden");
        });

        it("should prevent the tooltip from automatically hiding if autoHide is false", function() {
            runs(function() {
                createTip({showDelay: 1, autoHide: false});
                this.spy = spyOn(tip, 'hide');
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            waits(100);
            runs(function() {
                expect(this.spy).not.toHaveBeenCalled();
            });
        });

        it("should allow clicking outside the tip to close it if autoHide is false", function() {
            runs(function() {
                createTip({showDelay: 1, autoHide: false});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                this.spy = spyOn(tip, 'hide').andCallThrough();
                jasmine.fireMouseEvent(Ext.getBody(), 'mousedown', 0, 0);
                expect(this.spy).toHaveBeenCalled();
            });
        });
    });

    describeNotTouch("mouseOffset", function() {
        it("should display the tooltip [15,18] from the mouse pointer by default", function() {
            runs(function() {
                createTip({showDelay: 1});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(target.getX() + 15, target.getY() + 18);
            });
        });

        it("should allow configuring the mouseOffset", function() {
            runs(function() {
                createTip({showDelay: 1, mouseOffset: [20, 30]});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(target.getX() + 20, target.getY() + 30);
            });
        });
    });
    
    describe("showAt", function(){
        it("should at the specified position", function(){
            createTip();
            tip.showAt([100, 100]);
            expect(tip.el).toBePositionedAt(100, 100);    
        });  
    });

    describeNotTouch("trackMouse", function() {
        it("should move the tooltip along with the mouse if 'trackMouse' is true", function() {
            var x = target.getX(),
                y = target.getY();
            runs(function() {
                createTip({showDelay: 1, trackMouse: true});
                jasmine.fireMouseEvent(target, 'mouseover', x, y);
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(x + 15, y + 18);
                for(var i = 0; i < 5; i++) {
                    jasmine.fireMouseEvent(target, 'mousemove', ++x, ++y);
                    expect(tip.el).toBePositionedAt(x + 15, y + 18);
                }
            });
        });
    });

    describe("anchor", function() {
        it("should allow anchoring the top of the tooltip to the target", function() {
            createTip({anchor: 'top'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] + target.getHeight() + tip.anchorSize.y);
        });

        it("should allow anchoring the right of the tooltip to the target", function() {
            createTip({anchor: 'right'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should allow anchoring the bottom of the tooltip to the target", function() {
            createTip({anchor: 'bottom'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should allow anchoring the left of the tooltip to the target", function() {
            createTip({anchor: 'left'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] + target.getWidth() + tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from top to left if not enough space below the target", function() {
            target.setY(Ext.Element.getViewportHeight() - 75);
            createTip({anchor: 'top'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from top to bottom if not enough space below the target and axisLock: true", function() {
            target.setY(Ext.Element.getViewportHeight() - 75);
            createTip({anchor: 'top', axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should flip from bottom to left if not enough space above the target", function() {
            target.setY(25);
            createTip({anchor: 'bottom'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from bottom to top if not enough space above the target and axisLock: true", function() {
            target.setY(25);
            createTip({anchor: 'bottom', axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] + target.getHeight() + tip.anchorSize.y);
        });

        it("should flip from right to left if not enough space to the left of the target", function() {
            target.setX(25);
            createTip({anchor: 'right'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should flip from right to left if not enough space to the left of the target and axisLock: true", function() {
            target.setX(25);
            createTip({anchor: 'right', axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] + target.getWidth() + tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from left to right if not enough space to the right of the target and axisLock: true", function() {
            target.setX(Ext.Element.getViewportWidth() - 75);
            createTip({anchor: 'left', axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from left to bottom if not enough space to the right of the target", function() {
            target.setX(Ext.Element.getViewportWidth() - 75);
            createTip({anchor: 'left'});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });
    });

    describeNotTouch("anchorToTarget=false", function() {
        it("should allow anchoring the top of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, anchor: 'top'});
                jasmine.fireMouseEvent(target, 'mouseover', xy[0], xy[1]);
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - 15, xy[1] + 18 + tip.anchorSize.y);
            });
        });

        it("should allow anchoring the right of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, anchor: 'right'});
                jasmine.fireMouseEvent(target, 'mouseover', xy[0], xy[1]);
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - tip.el.getWidth() - 15 - tip.anchorSize.y, xy[1] - 18);
            });
        });

        it("should allow anchoring the bottom of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, anchor: 'bottom'});
                jasmine.fireMouseEvent(target, 'mouseover', xy[0], xy[1]);
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - 15, xy[1] - 18 - tip.anchorSize.y - tip.el.getHeight());
            });
        });
        
        it("should allow anchoring the left of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, anchor: 'left'});
                jasmine.fireMouseEvent(target, 'mouseover', xy[0], xy[1]);
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] + 15 + tip.anchorSize.y, xy[1] - 18);
            });
        });
    });

    describeNotTouch("delegate", function() {
        var delegatedTarget;

        beforeEach(function() {
            target.insertHtml('beforeEnd', '<span class="hasTip" id="delegatedTarget">x</span><span class="noTip">x</span>');
            delegatedTarget = Ext.get('delegatedTarget');
        });

        afterEach(function() {
            delegatedTarget.destroy();
        });

        it("should show the tooltip for descendants matching the selector", function() {
            createTip({delegate: '.hasTip'});
            var spy = spyOn(tip, 'delayShow');
            jasmine.fireMouseEvent(delegatedTarget, 'mouseover', delegatedTarget.getX(), delegatedTarget.getY());
            expect(spy).toHaveBeenCalled();
        });

        it("should not show the tooltip for descendants that do not match the selector", function() {
            createTip({delegate: '.hasTip'});
            var spy = spyOn(tip, 'delayShow');
            mouseOverTarget();
            expect(spy).not.toHaveBeenCalled();
        });

        it("should set the triggerElement property to the active descendant element when shown", function() {
            createTip({delegate: '.hasTip'});
            jasmine.fireMouseEvent(delegatedTarget, 'mouseover', delegatedTarget.getX(), delegatedTarget.getY());
            expect(tip.triggerElement).toBe(delegatedTarget.dom);
        });

        it("should unset the triggerElement property when hiding", function() {
            createTip({delegate: '.hasTip'});
            jasmine.fireMouseEvent(delegatedTarget, 'mouseover', delegatedTarget.getX(), delegatedTarget.getY());
            tip.hide();
            expect(tip.triggerElement).toBe(null);
        });
    });

    describe("no target", function() {
        function showTip(e) {
            tip.pointerEvent = e;
            tip.show();
            expect(tip.getXY()).toEqual([100 + tip.mouseOffset[0], 100 + tip.mouseOffset[1]]);
        }

        afterEach(function() {
            Ext.getBody().un({
                touchstart: showTip,
                mouseover: showTip
            });
        });

        it("should show at the 'pointerEvent' position if there's no target", function() {
            createTip({target: null, html: 'Shown by pointer event', showOnTap: true});
            if (Ext.supports.TouchEvents) {
                Ext.getBody().on({
                    touchstart: showTip,
                    single: true
                });
                Ext.testHelper.touchStart(document.body, {x:100, y:100});
            } else {
                Ext.getBody().on({
                    mouseover: showTip,
                    single: true
                });
                jasmine.fireMouseEvent(document.body, 'mouseover', 100, 100);
            }
        });
    });

    describe('alwaysOnTop', function() {
        var alwaysOnTopWindow,
            extraWindow,
            centerWindow,
            combo;

        afterEach(function() {
            Ext.destroy(
                alwaysOnTopWindow,
                extraWindow,
                centerWindow,
                combo
            );
        });

        it('should move the tooltip to the top above any other alwaysOnTop floater', function() {
            var states = Ext.create('Ext.data.Store', {
                fields: ['abbr', 'name'],
                data: [{
                    "abbr": 'a', "name": 'TestName'
                }, {
                    "abbr": 'b', "name":'TestName2'
                }]
            });

            alwaysOnTopWindow = Ext.create('Ext.window.Window', {
                floating: true,
                title: 'Top Window (Always On Top)',
                shadow: false,
                height: 170,
                width: 200,
                x: 200,
                y: 0,
                alwaysOnTop: true,
                renderTo: Ext.getBody()
            }).show();
            extraWindow = Ext.create('Ext.window.Window', {
                title: 'Some Extra Window',
                height: 100,
                width: 450,
                x: 200,
                y: 250,
                items: [{
                    xtype: "textfield"
                }]
            }).show();
            
            // This will not be the topmost window.
            // The "Top Window" will be above its mask and visible
            // That "Top Window" should not automatically attract focus
            // upon zIndex stack sort unless
            centerWindow = Ext.create('Ext.window.Window', {
                title: 'Center Window',
                height: 170,
                width: 200,
                modal: true,
                x: 200,
                y: 300,
                items: [{
                    xtype: "combo",
                    allowBlank: false,
                    store: states,
                    displayField: 'name',
                    valueField: 'abbr',
                    listConfig : {
                        getInnerTpl : function() {
                            return '<div data-qtip="<b>Name:</b>{name} <br/><b>Abbreviation:</b>{abbr} <br/>">{name} ({abbr})</div>';
                        }
                    }
                }]
            }).show();

            // We use a QuickTip instance for convenience
            tip = new Ext.tip.QuickTip({
                showDelay: 100,
                autoHide: true,
                dismissDelay: 100
            });

            combo = centerWindow.down('combobox');
            combo.focus();
            combo.expand();

            // Mouseover the dropdown.
            jasmine.fireMouseEvent(Ext.fly(combo.getPicker().getNode(0)).down('[data-qtip]'), 'mouseover');

            // Tip should show, and should be topmost in stack.
            // Bug was that the alwaysOnTop window stayed on top and the tip
            // remained below.
            waitsFor(function() {
                return tip.isVisible(true) && centerWindow.zIndexManager.getActive() === tip;
            });

            // After its dismissDelay, tip should hide, and focus should remain in the combobox
            waitsFor(function() {
                return !tip.isVisible();
            });

            // Picker should be visible.
            // Bug was that the alwaysOnTop" window, on being moved back to the top
            // on tooltip hide, was acquiring focus and causing combo collapse.
            runs(function() {
                expect(combo.getPicker().isVisible()).toBe(true);
            });

        });
    });

    describe('cancel show', function() {
        it('should show when rehovering after a show has been canceked', function() {
            createTip({
                target: document.body,
                delegate: '#tipTarget',
                showDelay: 1000
            });
            mouseOverTarget();

            mouseOutTarget();

            tip.showDelay = 1;

            mouseOverTarget();
            
            waitsFor(function() {
                return tip.isVisible();
            }, 1000, 'tooltip to show');
        });
    });
});
