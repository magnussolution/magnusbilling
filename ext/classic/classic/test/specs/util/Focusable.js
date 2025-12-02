describe("Ext.util.Focusable", function() {
    var c, container;
    
    function stdComponent(config) {
        return Ext.apply({
            xtype: 'component',
            renderTo: Ext.getBody(),
            width: 100,
            height: 100,
            focusable: true,
            tabIndex: 0,
            getFocusEl: function() {
                return this.el;
            }
        }, config);
    }
    
    function makeComponent(config) {
        var cmpCfg = stdComponent(config);
        
        c = new Ext.Component(cmpCfg);
        
        return c;
    }
    
    function makeContainer(config) {
        container = new Ext.container.Container(Ext.apply({
            renderTo: Ext.getBody(),
            width: 100,
            height: 200
        }, config));
    }
    
    afterEach(function() {
        if (container) {
            container.destroy();
        }
        
        if (c) {
            c.destroy();
        }
        
        c = container = null;
    });
    
    describe("tabIndex handling", function() {
        describe("component not focusable", function() {
            it("should not render tabindex attribute when tabIndex property is undefined", function() {
                makeComponent({
                    focusable: undefined,
                    tabIndex: undefined
                });
                
                expect(c).not.toHaveAttr('tabIndex');
            });
            
            it("should not render tabindex attribute when tabIndex property is defined", function() {
                makeComponent({
                    focusable: undefined,
                    tabIndex: 0
                });
                
                expect(c).not.toHaveAttr('tabIndex');
            });
        });
        
        describe("component is focusable", function() {
            it("should not render tabindex attribute when tabIndex property is undefined", function() {
                makeComponent({
                    focusable: true,
                    tabIndex: undefined
                });
                
                expect(c).not.toHaveAttr('tabIndex');
            });
            
            it("should render tabindex attribute when tabIndex property is defined", function() {
                makeComponent({
                    focusable: true,
                    tabIndex: 0
                });
                
                expect(c).toHaveAttr('tabIndex', '0');
            });
        });
    });
    
    describe("isFocusable", function() {
        describe("component", function() {
            describe("not rendered", function() {
                beforeEach(function() {
                    makeComponent({
                        renderTo: undefined
                    });
                });
                
                it("should return false", function() {
                    expect(c.isFocusable()).toBe(false);
                });
            });
            
            describe("rendered", function() {
                beforeEach(function() {
                    makeComponent();
                });
                
                describe("focusable === true", function() {
                    it("should return true when visible", function() {
                        expect(c.isFocusable()).toBe(true);
                    });
                    
                    it("should return false when disabled", function() {
                        c.disable();
                        
                        expect(c.isFocusable()).toBe(false);
                    });
                    
                    it("should return false when invisible", function() {
                        c.hide();
                        
                        expect(c.isFocusable()).toBe(false);
                    });
                });
                
                describe("focusable === false", function() {
                    beforeEach(function() {
                        c.focusable = false;
                    });
                    
                    it("should return false", function() {
                        expect(c.isFocusable()).toBe(false);
                    });
                
                    it("should disregard deep parameter", function() {
                        spyOn(c, 'getFocusEl').andCallThrough();
                        
                        expect(c.isFocusable(true)).toBe(false);
                        expect(c.getFocusEl).not.toHaveBeenCalled();
                    });
                });
            });
        });
        
        describe("container", function() {
            describe("not rendered", function() {
                beforeEach(function() {
                    makeContainer({
                        renderTo: undefined,
                        items: [
                            stdComponent({
                                renderTo: undefined
                            })
                        ]
                    });
                });
                
                it("should return false with deep === false", function() {
                    expect(container.isFocusable()).toBe(false);
                });
                
                it("should return false with deep === true", function() {
                    expect(container.isFocusable(true)).toBe(false);
                });
            });
            
            describe("rendered", function() {
                var fooCmp;
                
                beforeEach(function() {
                    makeContainer({
                        items: [
                            stdComponent({
                                renderTo: undefined,
                                itemId: 'foo'
                            })
                        ],
                        
                        focusable: true,
                        tabIndex: 0
                    });
                    
                    fooCmp = container.down('#foo');
                });
                
                describe("deep === false", function() {
                    describe("focusable === false", function() {
                        beforeEach(function() {
                            container.focusable = false;
                        });
                        
                        it("should return false", function() {
                            expect(container.isFocusable()).toBe(false);
                        });
                    });
                    
                    describe("focusable === true, no tabIndex", function() {
                        beforeEach(function() {
                            container.setTabIndex(undefined);
                        });
                        
                        it("should return false", function() {
                            expect(container.isFocusable()).toBe(false);
                        });
                    });
                    
                    describe("focusable === true, tabIndex === 0", function() {
                        it("should return true when container is visible", function() {
                            expect(container.isFocusable()).toBe(true);
                        });
                        
                        it("should return false when container is hidden", function() {
                            container.hide();
                            
                            expect(container.isFocusable()).toBe(false);
                        });
                        
                        it("should return false when container is disabled", function() {
                            container.disable();
                            
                            expect(container.isFocusable()).toBe(false);
                        });
                    });
                });
                
                describe("deep === true", function() {
                    beforeEach(function() {
                        container.defaultFocus = '#foo';
                    });
                    
                    describe("container not focusable", function() {
                        beforeEach(function() {
                            container.focusable = false;
                        });
                        
                        it("should return true when delegate is focusable", function() {
                            expect(container.isFocusable(true)).toBe(true);
                        });
                        
                        it("should return false when delegate is not focusable", function() {
                            fooCmp.focusable = false;
                            
                            expect(container.isFocusable(true)).toBe(false);
                        });
                        
                        it("should return false when delegate is hidden", function() {
                            fooCmp.hide();
                            
                            expect(container.isFocusable(true)).toBe(false);
                        });
                        
                        it("should return false when delegate is disabled", function() {
                            fooCmp.disable();
                            
                            expect(container.isFocusable(true)).toBe(false);
                        });
                        
                        it("should return false when delegate is destroyed", function() {
                            fooCmp.destroy();
                            
                            expect(container.isFocusable(true)).toBe(false);
                        });
                        
                        describe("dynamic delegate", function() {
                            beforeEach(function() {
                                container.remove(fooCmp);
                                fooCmp.destroy();
                                fooCmp = null;
                            });
                            
                            it("should return false when delegate is removed", function() {
                                expect(container.isFocusable(true)).toBe(false);
                            });
                            
                            it("should return true when matching delegate is added", function() {
                                container.add(stdComponent({
                                    renderTo: undefined,
                                    itemId: 'foo'
                                }));
                                
                                expect(container.isFocusable(true)).toBe(true);
                            });
                        });
                    });
                    
                    describe("container is focusable", function() {
                        it("should return true", function() {
                            expect(container.isFocusable(true)).toBe(true);
                        });
                    });
                });
            });
        });
    });
    
    describe("getTabIndex", function() {
        beforeEach(function() {
            makeComponent({
                renderTo: undefined,
                tabIndex: 42
            });
        });
        
        it("should return undefined when !focusable", function() {
            c.focusable = false;
            
            expect(c.getTabIndex()).toBe(undefined);
        });
        
        it("should return configured tabIndex when component is not rendered", function() {
            expect(c.rendered).toBe(false);
            expect(c.getTabIndex()).toBe(42);
        });
        
        it("should return actual tabIndex when component is rendered", function() {
            c.render(Ext.getBody());
            c.el.set({ tabIndex: 1 });
            
            expect(c.rendered).toBe(true);
            expect(c.getTabIndex()).toBe(1);
        });
    });
    
    describe("setTabIndex", function() {
        beforeEach(function() {
            makeComponent({
                renderTo: undefined,
                tabIndex: 43
            });
        });
        
        it("should do nothing when !focusable", function() {
            c.focusable = false;
            
            c.setTabIndex(-1);
            
            expect(c.tabIndex).toBe(43);
        });
        
        it("should set tabIndex property when not rendered", function() {
            c.setTabIndex(-1);
            
            expect(c.tabIndex).toBe(-1);
        });
        
        it("should set tabIndex property when el is a string", function() {
            c.el = 'foo'; // element id
            
            c.setTabIndex(-1);
            
            expect(c.tabIndex).toBe(-1);
        });
        
        it("should set el tabindex when rendered", function() {
            c.render(Ext.getBody());
            
            c.setTabIndex(-1);
            
            var index = c.el.getAttribute('tabIndex') - 0;
            
            expect(index).toBe(-1);
        });
    });
    
    describe("container delegated getTabIndex/setTabIndex", function() {
        beforeEach(function() {
            makeContainer({
                focusable: true,
                
                items: [makeComponent({
                    renderTo: undefined,
                    tabIndex: 1
                })],
                
                getFocusEl: function() {
                    return this.child();
                }
            });
        });
        
        it("should return child's tabIndex", function() {
            expect(container.getTabIndex()).toBe(1);
        });
        
        it("should set child's tabIndex", function() {
            container.setTabIndex(88);
            
            var index = c.el.getAttribute('tabIndex') - 0;
            
            expect(index).toBe(88);
        });
    });
    
    describe("focusCls handling", function() {
        beforeEach(function() {
            makeComponent({
                renderTpl: [
                    '<div id="{id}-focusClsEl" data-ref="focusClsEl">foo</div>'
                ],
                
                childEls: ['focusClsEl'],
                
                getFocusClsEl: function() {
                    return this.focusClsEl;
                }
            });
            
            focusAndWait(c);
        });
        
        describe("focusing", function() {
            it("should add focusCls to focusClsEl", function() {
                expect(c.focusClsEl.hasCls('x-focus')).toBe(true);
            });
            
            it("should not add focusCls to el", function() {
                expect(c.el.hasCls('x-focus')).toBe(false);
            });
        });
        
        describe("blurring", function() {
            beforeEach(function() {
                c.blur();
                
                waitAWhile();
            });
            
            it("should remove focusCls from focusClsEl", function() {
                expect(c.focusClsEl.hasCls('x-focus')).toBe(false);
            });
        });
        
        describe("disabling", function() {
            beforeEach(function() {
                // Disabling is synchronous, so no wait necessary
                c.disable();
            });
            
            it("should remove focusCls from focusClsEl", function() {
                expect(c.focusClsEl.hasCls('x-focus')).toBe(false);
            });
        });
    });
    
    describe("blur/focus", function() {
        var focusCls = Ext.baseCSSPrefix + 'focus';
        
        beforeEach(function(){
            makeComponent({
                autoEl: 'button',
                focusCls: 'focus'
            });
        });
        
        it("should look up focused Component", function() {
            c.focus();
            
            waitsFor(function() {
                return c.el.hasCls(focusCls);
            }, 'CSS class to be added', 100);
            
            runs(function() {
                var cmp = Ext.ComponentManager.getActiveComponent();
                
                expect(cmp).toEqual(c);
            });
        });
        
        it("should cancel previous delayed focus", function() {
            var c2 = new Ext.Component({
                renderTo: Ext.getBody(),
                autoEl: 'button',
                focusCls: 'focus',
                focusable: true,
                getFocusEl: function() {
                    return this.el;
                }
            });
            
            spyOn(Ext.focusTask, 'delay');
            spyOn(Ext.focusTask, 'cancel');
            
            c.focus(false, true);

            expect(Ext.focusTask.delay).toHaveBeenCalled();
            
            c2.focus();
            
            expect(Ext.focusTask.cancel).toHaveBeenCalled();
            
            Ext.destroy(c2);
        });
        
        describe("focus delegation", function() {
            var fooCmp, barCmp;
            
            beforeEach(function() {
                makeContainer({
                    height: 200,
                    
                    items: [
                        stdComponent({
                            itemId: 'foo',
                            renderTo: undefined
                        }),
                        
                        stdComponent({
                            itemId: 'bar',
                            renderTo: undefined
                        })
                    ]
                });
                
                fooCmp = container.down('#foo');
                barCmp = container.down('#bar');
            });
            
            it("should focus foo", function() {
                container.defaultFocus = 'component';
                
                // We're calling container.focus() here but expecting
                // fooCmp to be focused
                focusAndWait(container, fooCmp);
                
                expectFocused(fooCmp);
            });
            
            it("should focus bar", function() {
                container.defaultFocus = '#bar';
                
                focusAndWait(container, barCmp);
                
                expectFocused(barCmp);
            });
        });
        
        describe("events", function() {
            var focusSpy, blurSpy;
            
            beforeEach(function() {
                focusSpy = jasmine.createSpy('focus');
                blurSpy = jasmine.createSpy('blur');
                
                c.on('focus', focusSpy);
                c.on('blur', blurSpy);
            });
            
            afterEach(function() {
                c.un('focus', focusSpy);
                c.un('blur', blurSpy);
                
                focusSpy = blurSpy = null;
            });
            
            describe("focus", function() {
                beforeEach(function() {
                    c.focus();
                });
                
                it("should fire the focus event", function() {
                    waitForSpy(focusSpy);
                    
                    runs(function() {
                        expect(focusSpy).toHaveBeenCalled();
                    });
                });  
                
                it("should not fire the focus event if the component has focus", function() {
                    runs(function() {
                        c.focus();
                    });
                    
                    waitForSpy(focusSpy);
                    
                    // Enough time for the second event to fire, if any
                    waits(50);
                    
                    runs(function() {
                        expect(focusSpy.callCount).toBe(1);
                    });
                });
            });
            
            describe("blur", function() {
                var beforeSpy;
                
                beforeEach(function() {
                    beforeSpy = spyOn(c, 'beforeBlur');
                    c.focus();
                });
                
                it("should fire the blur event", function() {
                    runs(function() {
                        c.blur();
                    });
                    
                    waitForSpy(blurSpy);
                    
                    runs(function() {
                        expect(blurSpy).toHaveBeenCalled();
                    });
                });
                
                it("should not fire the blur event when component is blurred", function() {
                    runs(function() {
                        c.blur();
                    });
                    
                    waitForSpy(blurSpy);
                    
                    runs(function() {
                        blurSpy.reset();
                        c.blur();
                    });
                    
                    waitForSpy(beforeSpy);
                    
                    runs(function() {
                        expect(blurSpy).not.toHaveBeenCalled();
                    });
                });
                
                it("should set hasFocus to false before running beforeBlur", function() {
                    var hasFocus;
                    
                    runs(function() {
                        beforeSpy.andCallFake(function() {
                            hasFocus = this.hasFocus;
                        });
                        
                        c.blur();
                    });
                    
                    waitForSpy(blurSpy);
                    
                    runs(function() {
                        expect(hasFocus).toBe(false);
                    });
                });
            });
        });
    });
    
    describe("enable/disable tabbing", function() {
        describe("simple component", function() {
            beforeEach(function() {
                makeComponent();
                
                c.disableTabbing();
            });
            
            it("should disable tabbing", function() {
                expect(c.el.isTabbable()).toBe(false);
            });
            
            it("should re-enable tabbing", function() {
                c.enableTabbing();
                
                expect(c.el.isTabbable()).toBe(true);
            });
        });
        
        describe("non-focusable container with delegate", function() {
            var delegate;
            
            beforeEach(function() {
                makeContainer({
                    defaultFocus: 'foo',
                    items: [
                        stdComponent({ itemId: 'foo' })
                    ]
                });
                
                delegate = container.down('#foo');
                
                container.disableTabbing();
            });
            
            it("should disable tabbing", function() {
                expect(delegate.el.isTabbable()).toBe(false);
            });
            
            it("should re-enable tabbing", function() {
                container.enableTabbing();
                
                expect(delegate.el.isTabbable()).toBe(true);
            });
        });
        
        // We're simulating a window here
        describe("focusable container with delegate", function() {
            var delegate;
            
            beforeEach(function() {
                makeContainer({
                    floating: true,
                    focusable: true,
                    tabIndex: 0,
                    defaultFocus: 'bar',
                    items: [
                        stdComponent({ itemId: 'bar' })
                    ]
                });
                
                delegate = container.down('#bar');
                
                container.disableTabbing();
            });
            
            it("should disable tabbing on container", function() {
                expect(container.el.isTabbable()).toBe(false);
            });
            
            it("should disable tabbing on delegate", function() {
                expect(delegate.el.isTabbable()).toBe(false);
            });
            
            describe("re-enable", function() {
                beforeEach(function() {
                    container.enableTabbing();
                });
                
                it("should enable tabbing on container", function() {
                    expect(container.el.isTabbable()).toBe(true);
                });
                
                it("should enable tabbing on delegate", function() {
                    expect(delegate.el.isTabbable()).toBe(true);
                });
            });
        });
        
        // TODO Refactor this test not to depend on File field
        describe("focusEl outside of component DOM", function() {
            beforeEach(function() {
                c = new Ext.form.field.File({
                    renderTo: Ext.getBody()
                });
                
                c.disableTabbing();
            });
            
            it("should disable tabbing", function() {
                expect(c.button.fileInputEl.isTabbable()).toBe(false);
            });
            
            it("should re-enable tabbing", function() {
                c.enableTabbing();
                
                expect(c.button.fileInputEl.isTabbable()).toBe(true);
            });
        });
    });

    describe("Focus and state changes", function() {
        var panel, fieldset, textfield1, textfield2, button1, button2;
        
        beforeEach(function() {
            panel = new Ext.panel.Panel({
                renderTo: document.body,
                
                items: [{
                    xtype: 'textfield',
                    id: 'textfield1',
                }, {
                    xtype: 'fieldset',
                    id: 'fieldset',
                    items: [{
                        xtype: 'textfield',
                        id: 'textfield2'
                    }]
                }],
                
                bbar: {
                    // NOT toolbar here! Toolbars are FocusableContainers,
                    // which adds its own share of complexity
                    xtype: 'container',
                    
                    items: [{
                        xtype: 'button',
                        id: 'button1',
                        text: 'Button 1'
                    }, {
                        xtype: 'button',
                        id: 'button2',
                        text: 'Button 2'
                    }]
                }
            });
            
            fieldset = panel.down('#fieldset');
            textfield1 = panel.down('#textfield1');
            textfield2 = panel.down('#textfield2');
            button1 = panel.down('#button1');
            button2 = panel.down('#button2');
        });
        
        afterEach(function() {
            panel.destroy();
            panel = fieldset = textfield1 = textfield2 = button1 = button2 = null;
        });
        
        describe("disabling focused component", function() {
            it("should move focus to next sibling", function() {
                focusAndWait(button1);
                
                runs(function() {
                    // Disabling b1 should call button2.focus()
                    button1.disable();
                });
                
                expectFocused(button2);
            });
            
            it("should move focus to previous sibling", function() {
                focusAndWait(button2);
                
                runs(function() {
                    // Disabling b2 should call button1.focus()
                    button2.disable();
                });
                
                expectFocused(button1);
            });
            
            it("should move focus to a relation in parent container", function() {
                focusAndWait(button2);
                
                runs(function() {
                    button1.disable();
                
                    // Disabling b2 should call textfield.focus()
                    button2.disable();
                });
            });
        });
        
        describe("focusing disabled component", function() {
            it("should move focus to next sibling", function() {
                runs(function() {
                    button1.disable();
                });
                
                // IEs need a small delay after disabling
                jasmine.waitAWhile();
                
                runs(function() {
                    button1.focus();
                });
                
                expectFocused(button2);
            });
            
            it("should move focus to previous sibling", function() {
                runs(function() {
                    button2.disable();
                });
                
                // IEs need a small delay after disabling
                jasmine.waitAWhile();
                
                runs(function() {
                    button2.focus();
                });
                
                expectFocused(button1);
            });
            
            it("should move focus to a relation in parent container", function() {
                runs(function() {
                    button1.disable();
                    button2.disable();
                });
                
                // IEs need a small delay after disabling
                jasmine.waitAWhile();
                
                runs(function() {
                    button1.focus();
                });
                
                expectFocused(textfield1);
            });
        });
        
        describe("hiding component that contains focus", function() {
            it("should move focus to a relation or the previously focused component", function() {
                focusAndWait(button1);
                
                // Focus enters the fieldset, and the previously focused component
                // (button1) should be cached at that point.
                focusAndWait(textfield2);
                
                runs(function() {
                    button1.disable();
                });
                
                // IEs need a small delay after disabling
                jasmine.waitAWhile();
                
                // The hide should attempt to revert focus back to button1.
                // But now that is disabled, it should go to button2
                runs(function() {
                    fieldset.hide();
                });
                
                expectFocused(button2);
            });
        });
    });
    
    describe("Wrapping a Component which contains focus", function() {
        var waitForFocus = jasmine.waitForFocus,
            expectFocused = jasmine.expectFocused,
            container, cmp, newEl;
        
        beforeEach(function() {
            container = new Ext.Container({
                items: {
                    xtype: 'textfield'
                },
                renderTo: document.body
            });
            
            cmp = container.child();

            spyOn(container, 'onFocusEnter').andCallThrough();
            spyOn(container, 'onFocusLeave').andCallThrough();
            spyOn(cmp, 'onFocusEnter').andCallThrough();
            spyOn(cmp, 'onFocusLeave').andCallThrough();
            
            // Nudge input element to be repainted so it could focus
            if (Ext.isIE8) {
                +cmp.el.dom.offsetHeight;
            }

            cmp.focus();
            
            // This will fail the tests if cmp doesn't focus,
            // so we don't have to expect() it explicitly
            waitForFocus(cmp);
        });
        
        afterEach(function() {
            Ext.destroy(container, newEl);
            
            container = cmp = newEl = null;
        });
        
        describe("wrapping", function() {
            beforeEach(function() {
                // These were tripped by focusing the cmp above
                container.onFocusEnter.reset();
                container.onFocusLeave.reset();
                cmp.onFocusEnter.reset();
                cmp.onFocusLeave.reset();
                
                newEl = container.el.wrap();
                
                // Wait for a possible (it would be a bug) focus leave or enter of the component.
                // We can't wait for something, because we want NOTHING to happen.
                waits(100);
            });
            
            it("should retain focus on the Component", function() {
                expectFocused(cmp, true);
            });
            
            it("should retain hasFocus flag on the Component", function() {
                expect(cmp.hasFocus).toBe(true);
            });
            
            it("should retain containsFocus flag on the container", function() {
                expect(container.containsFocus).toBe(true);
            });
            
            it("should not call onFocusEnter on the container", function() {
                expect(container.onFocusEnter).not.toHaveBeenCalled();
            });
            
            it("should not call onFocusLeave on the container", function() {
                expect(container.onFocusLeave).not.toHaveBeenCalled();
            });
            
            it("should not call onFocusEnter on the Component", function() {
                expect(cmp.onFocusEnter).not.toHaveBeenCalled();
            });
            
            it("should not call onFocusLeave on the Component", function() {
                expect(cmp.onFocusLeave).not.toHaveBeenCalled();
            });
            
            describe("unwrapping", function() {
                beforeEach(function() {
                    container.el.unwrap();
                    
                    waits(100);
                });
                
                it("should retain focus on the Component", function() {
                    expectFocused(cmp, true);
                });
                
                it("should retain hasFocus flag on the Component", function() {
                    expect(cmp.hasFocus).toBe(true);
                });
                
                it("should retain containsFocus flag on the container", function() {
                    expect(container.containsFocus).toBe(true);
                });
                
                it("should not call onFocusEnter on the container", function() {
                    expect(container.onFocusEnter).not.toHaveBeenCalled();
                });
                
                it("should not call onFocusLeave on the container", function() {
                    expect(container.onFocusLeave).not.toHaveBeenCalled();
                });
                
                it("should not call onFocusEnter on the Component", function() {
                    expect(cmp.onFocusEnter).not.toHaveBeenCalled();
                });
                
                it("should not call onFocusLeave on the Component", function() {
                    expect(cmp.onFocusLeave).not.toHaveBeenCalled();
                });
            });
        });
    });
});
