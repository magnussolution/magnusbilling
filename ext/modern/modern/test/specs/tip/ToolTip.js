/* global Ext, jasmine, expect, spyOn */

describe("Ext.tip.ToolTip", function() {
    var tip,
        target,
        describeDesktop = Ext.is.Desktop ? describe : xdescribe,
        itDesktop = Ext.is.Desktop ? it : xit;

    function createTip(config) {
        config = Ext.apply({}, config, {target: target, width: 50, height: 50, html: 'X'});
        tip = new Ext.tip.ToolTip(Ext.apply({
            showOnTap: true
        }, config));
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

        if (Ext.Viewport) {
            Ext.Viewport = Ext.destroy(Ext.Viewport);
        }
    });

    afterEach(function() {
        if (tip) {
            tip.destroy();
            tip = null;
        }
        target.destroy();
    });

    function mouseOverTarget(targetEl) {
        targetEl = Ext.get(targetEl || target);

        var xy = targetEl.getXY();

        jasmine.fireMouseEvent(targetEl, 'mouseover', xy[0], xy[1]);

        // Ensure we also trigger show on platforms which have no mouseover event.
        if (Ext.supports.Touch) {
            Ext.testHelper.tap(targetEl, {x:xy[0], y:xy[1]});
        }
    }
    function mouseOutTarget() {
        jasmine.fireMouseEvent(target, 'mouseout', 1000, 1000);
    }

    describe("basic", function() {
        it("should accept an id for the 'target' config", function() {
            createTip({target: 'tipTarget'});
            expect(tip.getTarget().dom).toBe(target.dom);
        });

        it("should accept an Ext.Element for the 'target' config", function() {
            createTip({target: target});
            expect(tip.getTarget().dom).toBe(target.dom);
        });

        it("should accept an HTMLElement for the 'target' config", function() {
            createTip({target: target.dom});
            expect(tip.getTarget().dom).toBe(target.dom);
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
    });

    describe("show/hide", function() {
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

        itDesktop("should hide the tooltip after mousing out of the target element", function() {
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
                Ext.testHelper.tap(Ext.getBody(), {x:0, y:0});
                expect(this.spy).toHaveBeenCalled();
            });
        });
    });

    describe("mouseOffset", function() {
        it("should display the tooltip [15,18] from the mouse pointer by default", function() {
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false});
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
                createTip({showDelay: 1, anchorToTarget: false, mouseOffset: [20, 30]});
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

    describeDesktop("trackMouse", function() {
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
            createTip({align: 't-b?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] + target.getHeight() + tip.anchorSize.y);
        });

        it("should allow anchoring the right of the tooltip to the target", function() {
            createTip({align: 'r-l?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should allow anchoring the bottom of the tooltip to the target", function() {
            createTip({align: 'b-t?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should allow anchoring the left of the tooltip to the target", function() {
            createTip({align: 'l-r?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] + target.getWidth() + tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from top to left if not enough space below the target", function() {
            target.setY(Ext.Element.getViewportHeight() - 75);
            createTip({align: 't-b?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from top to bottom if not enough space below the target and axisLock: true", function() {
            target.setY(Ext.Element.getViewportHeight() - 75);
            createTip({align: 't-b?', anchor: true, axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should flip from bottom to left if not enough space above the target", function() {
            target.setY(25);
            createTip({align: 'b-t?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from bottom to top if not enough space above the target and axisLock: true", function() {
            target.setY(25);
            createTip({align: 'b-t?', anchor: true, axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] + target.getHeight() + tip.anchorSize.y);
        });

        it("should flip from right to left if not enough space to the left of the target", function() {
            target.setX(25);
            createTip({align: 'r-l?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });

        it("should flip from right to left if not enough space to the left of the target and axisLock: true", function() {
            target.setX(25);
            createTip({align: 'r-l?', anchor: true, axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] + target.getWidth() + tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from left to right if not enough space to the right of the target and axisLock: true", function() {
            target.setX(Ext.Element.getViewportWidth() - 75);
            createTip({align: 'l-r?', anchor: true, axisLock: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0] - tip.el.getWidth() - tip.anchorSize.y, tgtXY[1]);
        });

        it("should flip from left to bottom if not enough space to the right of the target", function() {
            target.setX(Ext.Element.getViewportWidth() - 75);
            createTip({align: 'l-r?', anchor: true});
            tip.show();
            var tgtXY = target.getXY();
            expect(tip.el).toBePositionedAt(tgtXY[0], tgtXY[1] - tip.el.getHeight() - tip.anchorSize.y);
        });
    });

    describe("anchorToTarget=false", function() {
        it("should allow anchoring the top of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, align: 't-b?', anchor: true});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - tip.getWidth() / 2, xy[1] + 18 + tip.anchorSize.y);
            });
        });

        it("should allow anchoring the right of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, align: 'r-l?', anchor: true});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - 15 - tip.el.getWidth() - tip.anchorSize.y, xy[1] - tip.getHeight() / 2);
            });
        });

        it("should allow anchoring the bottom of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, align: 'b-t?', anchor: true});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] - tip.el.getWidth() / 2, xy[1] - 18 - tip.el.getHeight() - tip.anchorSize.y);
            });
        });

        it("should allow anchoring the left of the tooltip to the mouse pointer", function() {
            var xy = target.getXY();
            runs(function() {
                createTip({showDelay: 1, anchorToTarget: false, align: 'l-r?', anchor: true});
                mouseOverTarget();
            });
            waitsFor(function() {
                return tip.isVisible();
            }, "ToolTip was never shown");
            runs(function() {
                expect(tip.el).toBePositionedAt(xy[0] + 15 + tip.anchorSize.y, xy[1] - tip.getWidth() / 2);
            });
        });
    });

    describe("delegate", function() {
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
            mouseOverTarget(delegatedTarget);
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
            mouseOverTarget(delegatedTarget);
            expect(tip.currentTarget.dom).toBe(delegatedTarget.dom);
        });

        it("should unset the triggerElement property when hiding", function() {
            createTip({delegate: '.hasTip'});
            mouseOverTarget(delegatedTarget);
            tip.hide();
            expect(tip.currentTarget.dom).toBeNull();
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

            tip.setShowDelay(1);

            mouseOverTarget();
            
            waitsFor(function() {
                return tip.isVisible();
            }, 1000, 'tooltip to show');
        });
    });
});
