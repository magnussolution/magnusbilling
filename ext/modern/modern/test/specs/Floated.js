/* global Ext, spyOn, jasmine, expect */

describe("Ext.Widget.floated", function() {

    var w;

    function makeWidget(cfg) {
        w = Ext.create(Ext.apply({
            hidden: false
        }, cfg));
        return w;
    }

    function expectXY(el, x, y) {
        if (el.isComponent) {
            el = el.element;
        }
        var box = Ext.fly(el).getBox();
        expect(box.x).toBe(x);
        expect(box.y).toBe(y);
    }

    afterEach(function() {
        w = Ext.Viewport = Ext.floatRoot = Ext.Widget.$mousedownListeners = Ext.destroy(w, Ext.Viewport, Ext.floatRoot, Ext.Widget.$mousedownListeners);

        // Restore body element to cleanliness after Viewport has mangled it.
        Ext.Object.eachValue(document.body.attributes, function(attr) {
            document.body.removeAttribute(attr.name);
        });
        document.body.style = '';
    });

    describe("Basic render on show", function() {
        it('should apply the correct CSS classes', function() {
            makeWidget({
                xtype: 'panel',
                border: true,
                title: 'Test',
                height: 100,
                width: 200,
                floated: true,
                shadow: true
            });
            w.show();

            expect(w.element.hasCls(w.floatedCls)).toBe(true);
            expect(w.element.hasCls(w.shadowCls)).toBe(true);
        });
        it('should apply the correct translation', function() {
            makeWidget({
                xtype: 'panel',
                border: true,
                title: 'Test',
                height: 100,
                width: 200,
                floated: true,
                x: 100,
                y: 200
            });
            w.show();
            expectXY(w, 100, 200);
        });
    });

    describe('converting from inner to floated', function() {
        it('should append the newly floated item to the closest float-root element', function() {
            w = new Ext.Container({
                xtype: 'container',
                height: 40,
                width: 600,
                items: {
                    itemId: 'item',
                    xtype: 'panel',
                    title: 'Inner Panel',
                    html: 'Inner Panel HTML'
                }
            });
            w.render(document.body);
            var item = w.child('#item');

            // Container's innerElement contains the item
            expect(item.el.dom.parentNode === w.innerElement.dom).toBe(true);

            item.setFloated(true);

            // The global float root contains the item
            expect(item.el.dom.parentNode === Ext.getFloatRoot().dom).toBe(true);

            // The global float root must always be on top
            expect(Ext.getFloatRoot().dom.nextSibling).toBe(null);

            item.setFloated(false);

            // Container's innerElement must again the item
            expect(item.el.dom.parentNode === w.innerElement.dom).toBe(true);
        });
    });

    describe('hierarchical floateds', function() {
        var floatedPanel,
            floatedPanelChild,
            floatedPanelSecondChild,
            otherFloatedPanel,
            otherFloatedPanelChild,
            otherFloatedPanelSecondChild;

        function setup() {
            w = new Ext.viewport.Viewport.setup({
                items: [{
                    id: 'test-centered-panel',
                    xtype: 'panel',
                    floating: true,
                    title: 'Centered Panel',
                    height: 400,
                    width: 600,
                    border: true,
                    centered: true,
                    items: [{
                       xtype: 'fieldset',
                       title: 'Some fields',
                       items: [{
                           fieldLabel: 'Testing form fields',
                           xtype: 'textfield'
                       }]
                    }, {
                        xtype: 'panel',
                        height: 200,
                        width: 400,
                        border: true,
                        floated: true,
                        hidden: false,
                        id: 'floated-panel',
                        title: 'Floated panel',
                        x: 100,
                        y: 100,
                        shadow: true,
                        items: [{
                            border: true,
                            xtype: 'panel',
                            floated: true,
                            hidden: false,
                            id: 'floated-panel-child',
                            title: 'Floated panel child',
                            height: 100,
                            width: 300,
                            x: 150,
                            y: 150
                        }, {
                            border: true,
                            xtype: 'panel',
                            floated: true,
                            hidden: false,
                            id: 'floated-panel-second-child',
                            title: 'Floated panel second child',
                            height: 100,
                            width: 300,
                            x: 180,
                            y: 180
                        }]
                    }, {
                        xtype: 'panel',
                        height: 200,
                        width: 400,
                        border: true,
                        floated: true,
                        hidden: false,
                        relative: true,
                        id: 'other-floated-panel',
                        title: 'Other Floated panel',
                        x: 200,
                        y: 200,
                        shim: true,
                        items: [{
                            border: true,
                            xtype: 'panel',
                            floated: true,
                            hidden: false,
                            id: 'other-floated-panel-child',
                            title: 'Other floated panel child',
                            height: 100,
                            width: 300,
                            x: 50,
                            y: 50
                        }, {
                            border: true,
                            xtype: 'panel',
                            floated: true,
                            hidden: false,
                            id: 'other-floated-panel-second-child',
                            title: 'Other floated panel second child',
                            height: 100,
                            width: 300,
                            x: 80,
                            y: 80
                        }]
                    }]
                }]
            });
            floatedPanel = w.down('#floated-panel');
            floatedPanelChild = w.down('#floated-panel-child');
            floatedPanelSecondChild = w.down('#floated-panel-second-child');
            otherFloatedPanel = w.down('#other-floated-panel');
            otherFloatedPanelChild = w.down('#other-floated-panel-child');
            otherFloatedPanelSecondChild = w.down('#other-floated-panel-second-child');
        }

        it('should arrange the floated components in nested floatRoot elements', function() {
            var f;

            setup();

            // Global float root should be immediately after the viewport body
            expect(Ext.Viewport.element.dom.lastChild).toBe(Ext.floatRoot.dom);

            // Ensure correct start nesting positions.
            // Global float root contains the wrapping floatRoot elements of both global floateds
            // in initial order.
            f = Ext.floatRoot.query('.x-float-wrap');
            expect(f[0]).toBe(floatedPanel.floatWrap.dom);
            expect(f[1]).toBe(otherFloatedPanel.floatWrap.dom);

            // The floated panel's floatRoot wrapper should always have the floated panel
            // as the first node, followed by the children in order
            expect(floatedPanel.floatWrap.dom.firstChild).toBe(floatedPanel.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[1]).toBe(floatedPanelChild.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[2]).toBe(floatedPanelSecondChild.el.dom);

            // The other floated panel's floatRoot wrapper should always have the other floated panel's shim
            // as the first node, then the other floated panel, followed by the children in order
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelSecondChild.el.dom);
        });

        it('should start with correct positions', function() {
            setup();

            expectXY(floatedPanel, 100, 100);
            expectXY(floatedPanelChild, 150, 150);
            expectXY(floatedPanelSecondChild, 180, 180);
            expectXY(otherFloatedPanel, 200, 200);
            expectXY(otherFloatedPanel.getShim().el, 200, 200);
            expectXY(otherFloatedPanelChild, 250, 250);
            expectXY(otherFloatedPanelSecondChild, 280, 280);
        });

        it('should reset position on unfloat', function() {
            setup();
            var otherFloatedPanelRegion = otherFloatedPanel.innerElement.getConstrainRegion();

            // Unfloat the second chlid. This will insert it into the Other floated panel's layout
            // as the first inner item.
            otherFloatedPanelSecondChild.setFloated(false);

            // Should be the first inner item in Other floated panel, so will
            // be right at the top/left position
            expectXY(otherFloatedPanelSecondChild, otherFloatedPanelRegion.x, otherFloatedPanelRegion.y);
        });

        it('should move mousedowned floated components to above their siblings', function() {
            setup();
            var r = floatedPanelChild.el.getRegion(),
                cfg = {
                    id: floatedPanelChild.id,
                    x: r.left + r.right / 2,
                    y: r.top + r.bottom / 2
                },
                toFrontDone;

            floatedPanelChild.on({
                tofront: function() {
                    toFrontDone = true;
                }
            });

            // Mousedown on the lowest in the hierarchy.
            // It should flip to the top.
            Ext.testHelper.touchStart(floatedPanelChild.el, cfg);
            Ext.testHelper.touchEnd(floatedPanelChild.el, cfg);

            // tofront event should have fired
            expect(toFrontDone).toBe(true);

            // The two top level float roots should be swapped to bring floated panel
            // (along with its descendants) to the top
            expect(Ext.floatRoot.dom.firstChild).toBe(otherFloatedPanel.floatWrap.dom);
            expect(Ext.floatRoot.dom.childNodes[1]).toBe(floatedPanel.floatWrap.dom);

            // Floated panel should have had its child panels reorders
            // floatedPanelChild should be on top (last element)
            expect(floatedPanel.floatWrap.dom.firstChild).toBe(floatedPanel.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[1]).toBe(floatedPanelSecondChild.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[2]).toBe(floatedPanelChild.el.dom);

            // The inner details of Other floated panel must not have been affected
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelSecondChild.el.dom);
        });

        it('should move a component to above its siblings on a toFront call', function() {
            var toFrontDone;

            setup();

            floatedPanelChild.on({
                tofront: function() {
                    toFrontDone = true;
                }
            });

            // It should flip to the top.
            floatedPanelChild.toFront();

            // tofront event should have fired
            expect(toFrontDone).toBe(true);

            // The two top level float roots should be swapped to bring floated panel
            // (along with its descendants) to the top
            expect(Ext.floatRoot.dom.firstChild).toBe(otherFloatedPanel.floatWrap.dom);
            expect(Ext.floatRoot.dom.childNodes[1]).toBe(floatedPanel.floatWrap.dom);

            // Floated panel should have had its child panels reorders
            // floatedPanelChild should be on top (last element)
            expect(floatedPanel.floatWrap.dom.firstChild).toBe(floatedPanel.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[1]).toBe(floatedPanelSecondChild.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[2]).toBe(floatedPanelChild.el.dom);

            // The inner details of Other floated panel must not have been affected
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelSecondChild.el.dom);
        });

        it('should allow a toFront operation to be vetoed', function() {
            var toFrontDone = false;

            setup();

            // veto toFront operation
            floatedPanelChild.on({
                beforetofront: function() {
                    return false;
                },
                tofront: function() {
                    toFrontDone = true;
                }
            });

            // This should not succeed
            floatedPanelChild.toFront();

            // tofront event should not have fired
            expect(toFrontDone).toBe(false);

            // Below is the same set of conditions as the "should arrange the floated components in nested floatRoot elements"
            // test above. Initial conditions should NOT have changed

            // Global float root should be immediately after the viewport body
            expect(Ext.Viewport.element.dom.lastChild).toBe(Ext.floatRoot.dom);

            // Ensure correct start nesting positions.
            // Global float root contains the wrapping floatRoot elements of both global floateds
            // in initial order.
            expect(Ext.floatRoot.dom.firstChild).toBe(floatedPanel.floatWrap.dom);
            expect(Ext.floatRoot.dom.childNodes[1]).toBe(otherFloatedPanel.floatWrap.dom);

            // The floated panel's floatRoot wrapper should always have the floated panel
            // as the first node, followed by the children in order
            expect(floatedPanel.floatWrap.dom.firstChild).toBe(floatedPanel.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[1]).toBe(floatedPanelChild.el.dom);
            expect(floatedPanel.floatWrap.dom.childNodes[2]).toBe(floatedPanelSecondChild.el.dom);

            // The other floated panel's floatRoot wrapper should always have the other floated panel's shim
            // as the first node, then the other floated panel, followed by the children in order
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelSecondChild.el.dom);
        });

        it('should give alwaysOnTop floated components a higher z-index', function() {
            setup();

            // Initial conditions
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelSecondChild.el.dom);

            otherFloatedPanelChild.setAlwaysOnTop(true);

            // otherFloatedPanelChild must be the last element in the stack
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelSecondChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelChild.el.dom);

            // This should have no effect
            otherFloatedPanelSecondChild.toFront();

            // otherFloatedPanelChild must STILL be the last element in the stack
            expect(otherFloatedPanel.floatWrap.dom.firstChild).toBe(otherFloatedPanel.getShim().el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[1]).toBe(otherFloatedPanel.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[2]).toBe(otherFloatedPanelSecondChild.el.dom);
            expect(otherFloatedPanel.floatWrap.dom.childNodes[3]).toBe(otherFloatedPanelChild.el.dom);
        });
        
        it('should destroy correctly, removing all traces from the DOM', function() {
            setup();
            
            floatedPanel.destroy();
            otherFloatedPanel.destroy();

            // Nothing in the floatRoot now.
            expect(Ext.floatRoot.dom.childNodes.length).toBe(0);
        });

        it('should size the modal mask correctly, and move it to below the topmost floated when floated set to false', function() {
            var mask;

            setup();

            otherFloatedPanelSecondChild.setModal(true);
            mask = otherFloatedPanelSecondChild.floatParentNode.getData().modalMask;

            // The mask must be immediately before the panel in the DOM
            expect(mask.dom.nextSibling).toBe(otherFloatedPanelSecondChild.el.dom);
            expect(mask.getSize()).toEqual(otherFloatedPanelSecondChild.parent.el.getSize());

            otherFloatedPanelChild.toFront();
            otherFloatedPanelChild.setModal(true);

            // The mask must be immediately before the panel in the DOM
            expect(mask.dom.nextSibling).toBe(otherFloatedPanelChild.el.dom);
            expect(mask.getSize()).toEqual(otherFloatedPanelChild.parent.el.getSize());
            
            // The mask must NOT be immediately before the panel in the DOM
            otherFloatedPanelChild.setModal(false);
            expect(otherFloatedPanelChild.el.dom.previousSibling).not.toBe(mask.dom);
            
            // The mask must have dropped to just below the other, lower modal
            expect(otherFloatedPanelSecondChild.el.dom.previousSibling).toBe(mask.dom);
            
            // Mak it so that there are NO visible modals.
            otherFloatedPanelSecondChild.setModal(false);

            // So the mask ust be stashed safely in the detached body
            expect(mask.dom.parentNode).toBe(Ext.getDetachedBody().dom);            
        });

        it('should size the modal mask correctly, and move it to below the topmost floated when hidden', function() {
            var mask;

            setup();

            otherFloatedPanelSecondChild.setModal(true);
            mask = otherFloatedPanelSecondChild.floatParentNode.getData().modalMask;

            // The mask must be immediately before the panel in the DOM
            expect(mask.dom.nextSibling).toBe(otherFloatedPanelSecondChild.el.dom);
            expect(mask.getSize()).toEqual(otherFloatedPanelSecondChild.parent.el.getSize());

            otherFloatedPanelChild.toFront();
            otherFloatedPanelChild.setModal(true);

            // The mask must be immediately before the panel in the DOM
            expect(mask.dom.nextSibling).toBe(otherFloatedPanelChild.el.dom);
            expect(mask.getSize()).toEqual(otherFloatedPanelChild.parent.el.getSize());

            // Hide topmost modal
            otherFloatedPanelChild.hide(false);
            
            // The mask must have dropped to just below the other, lower modal
            expect(otherFloatedPanelSecondChild.el.dom.previousSibling).toBe(mask.dom);
            
            // Mak it so that there are NO visible modals.
            otherFloatedPanelSecondChild.setModal(false);

            // So the mask ust be stashed safely in the detached body
            expect(mask.dom.parentNode).toBe(Ext.getDetachedBody().dom);            
        });
    });
});