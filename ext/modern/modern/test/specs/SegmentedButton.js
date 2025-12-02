describe("Ext.SegmentedButton", function() {

    var button;

    function makeItems(n, withValue, pressedIndexes) {
        var ret = [],
            o, i;

        for (i = 1; i <= n; ++i) {
            o = {
                text: 'Item' + i,
                itemId: 'item' + i
            };
            if (withValue) {
                o.value = 'item' + i;
            }
            ret.push(o);
        }

        if (pressedIndexes) {
            pressedIndexes.forEach(function(idx) {
                ret[idx].pressed = true;
            });
        }

        return ret;
    }

    function createButton(cfg) {
        cfg = Ext.apply(cfg, {
            renderTo: Ext.getBody()
        });

        if (!cfg.items) {
            cfg.items = makeItems(4, true);
        }

        button = new Ext.SegmentedButton(cfg);
    }

    afterEach(function() {
        button = Ext.destroy(button);
    });

    function expectPressedState(states) {
        var items = button.getItems().getRange(),
            len = items.length,
            i;

        expect(len).toBe(states.length);
        for (i = 0; i < len; ++i) {
            expect(items[i].getPressed()).toBe(states[i]);
        }
    }

    function getItem(index) {
        return button.getItems().getAt(index);
    }

    function clickIt(b) {
        b.onTap();
    }

    describe("value/pressed state", function() {
        describe("configuration", function() {
            describe("with allowMultiple: false", function() {
                function createMultipleButton(cfg) {
                    cfg = Ext.apply(cfg, {
                        allowMultiple: false
                    });
                    createButton(cfg);
                }

                describe("by specifying pressed state", function() {
                    describe("by button value", function() {
                        describe("with no pressed items", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to null", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toBeNull();
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toBe('item1');
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with pressed items", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1])
                                        });
                                        expect(button.getValue()).toBe('item2');
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1])
                                        });
                                        expectPressedState([false, true, false, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1]),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });

                    describe("by index", function() {
                        describe("with no pressed items", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to null", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toBeNull();
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toBe(0);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with pressed items", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1])
                                        });
                                        expect(button.getValue()).toBe(1);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1])
                                        });
                                        expectPressedState([false, true, false, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1]),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });
                });

                describe("by specifying value", function() {
                    describe("by button value", function() {
                        describe("with value: null", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to null", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toBeNull();
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toBe('item1');
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with a specified value", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            value: 'item2',
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true)
                                        });
                                        expect(button.getValue()).toBe('item2');
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            value: 'item2',
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true)
                                        });
                                        expectPressedState([false, true, false, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            value: 'item2',
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });

                    describe("by button index", function() {
                        describe("with value: null", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to null", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toBeNull();
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toBe(0);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with a specified value", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            value: 1,
                                            forceSelection: forceSelection,
                                            items: makeItems(4)
                                        });
                                        expect(button.getValue()).toBe(1);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            value: 1,
                                            forceSelection: forceSelection,
                                            items: makeItems(4)
                                        });
                                        expectPressedState([false, true, false, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            value: 1,
                                            forceSelection: forceSelection,
                                            items: makeItems(4),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });
                });
            });

            describe("with allowMultiple: true", function() {
                function createMultipleButton(cfg) {
                    cfg = Ext.apply(cfg, {
                        allowMultiple: true
                    });
                    createButton(cfg);
                }

                describe("by specifying pressed state", function() {
                    describe("by button value", function() {
                        describe("with no pressed items", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to []", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toEqual(['item1']);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with pressed items", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1, 2])
                                        });
                                        expect(button.getValue()).toEqual(['item2', 'item3']);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1, 2])
                                        });
                                        expectPressedState([false, true, true, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true, [1, 2]),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });

                    describe("by index", function() {
                        describe("with no pressed items", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to []", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: false,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toEqual([0]);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        forceSelection: true,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with pressed items", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1, 2])
                                        });
                                        expect(button.getValue()).toEqual([1, 2]);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1, 2])
                                        });
                                        expectPressedState([false, true, true, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            forceSelection: forceSelection,
                                            items: makeItems(4, false, [1, 2]),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });
                });

                describe("by specifying value", function() {
                    describe("by button value", function() {
                        describe("with value: null", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to []", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expect(button.getValue()).toEqual(['item1']);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4, true),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with a specified value", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            value: ['item2', 'item3'],
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true)
                                        });
                                        expect(button.getValue()).toEqual(['item2', 'item3']);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            value: ['item2', 'item3'],
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true)
                                        });
                                        expectPressedState([false, true, true, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            value: 'item2',
                                            forceSelection: forceSelection,
                                            items: makeItems(4, true),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });

                    describe("by button index", function() {
                        describe("with value: null", function() {
                            describe("with forceSelection: false", function() {
                                it("should default the value to []", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have no buttons pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: false,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });

                            describe("with forceSelection: true", function() {
                                it("should default the value to the first item", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expect(button.getValue()).toEqual([0]);
                                });

                                it("should have the first button pressed", function() {
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4)
                                    });
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    createMultipleButton({
                                        value: null,
                                        forceSelection: true,
                                        items: makeItems(4),
                                        listeners: {
                                            toggle: spy,
                                            change: spy
                                        }
                                    });
                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });

                        describe("with a specified value", function() {
                            // Expectations are the same for both cases, include them for
                            // the sake of completeness
                            var makeSuite = function(forceSelection) {
                                describe("with forceSelection: " + forceSelection, function() {
                                    it("should set the initial value correctly", function() {
                                        createMultipleButton({
                                            value: [1, 2],
                                            forceSelection: forceSelection,
                                            items: makeItems(4)
                                        });
                                        expect(button.getValue()).toEqual([1, 2]);
                                    });

                                    it("should have the pressed state set correctly", function() {
                                        createMultipleButton({
                                            value: [1, 2],
                                            forceSelection: forceSelection,
                                            items: makeItems(4)
                                        });
                                        expectPressedState([false, true, true, false]);
                                    });

                                    it("should not fire events", function() {
                                        var spy = jasmine.createSpy();

                                        createMultipleButton({
                                            value: 1,
                                            forceSelection: forceSelection,
                                            items: makeItems(4),
                                            listeners: {
                                                toggle: spy,
                                                change: spy
                                            }
                                        });
                                        expect(spy).not.toHaveBeenCalled();
                                    });
                                });
                            };

                            makeSuite(false);
                            makeSuite(true);
                        });
                    });
                });
            });
        });

        describe("dynamic", function() {
            describe("with allowMultiple: false", function() {
                describe("with no existing value", function() {
                    describe("via setPressed on the button", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false
                            });
                        });

                        it("should set the value", function() {
                            getItem(1).setPressed(true);
                            expect(button.getValue()).toBe('item2');
                        });

                        it("should have the correct pressed states", function() {
                            getItem(1).setPressed(true);
                            expectPressedState([false, true, false, false]);
                        });

                        it("should fire the change event", function() {
                            var spy = jasmine.createSpy();
                            button.on('change', spy);

                            getItem(1).setPressed(true);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe('item2');
                            expect(spy.mostRecentCall.args[2]).toBeNull();
                        });

                        it("should fire the toggle event for pressed button", function() {
                            var spy = jasmine.createSpy(),
                                item = getItem(1);

                            button.on('toggle', spy);

                            item.setPressed(true);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(item);
                            expect(spy.mostRecentCall.args[2]).toBe(true);
                        });
                    });

                    describe("via user interaction", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false
                            });
                        });

                        it("should set the value", function() {
                            clickIt(getItem(1));
                            expect(button.getValue()).toBe('item2');
                        });

                        it("should have the correct pressed states", function() {
                            clickIt(getItem(1));
                            expectPressedState([false, true, false, false]);
                        });

                        it("should fire the change event", function() {
                            var spy = jasmine.createSpy();
                            button.on('change', spy);

                            clickIt(getItem(1));

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe('item2');
                            expect(spy.mostRecentCall.args[2]).toBeNull();
                        });

                        it("should fire the toggle event for pressed button", function() {
                            var spy = jasmine.createSpy(),
                                item = getItem(1);

                            button.on('toggle', spy);

                            clickIt(item);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(item);
                            expect(spy.mostRecentCall.args[2]).toBe(true);
                        });
                    });

                    describe("via setValue", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false
                            });
                        });

                        it("should set the value", function() {
                            button.setValue('item2');
                            expect(button.getValue()).toBe('item2');
                        });

                        it("should have the correct pressed states", function() {
                            button.setValue('item2');
                            expectPressedState([false, true, false, false]);
                        });

                        it("should fire the change event", function() {
                            var spy = jasmine.createSpy();
                            button.on('change', spy);

                            button.setValue('item2');

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe('item2');
                            expect(spy.mostRecentCall.args[2]).toBeNull();
                        });

                        it("should fire the toggle event for pressed button", function() {
                            var spy = jasmine.createSpy(),
                                item = getItem(1);

                            button.on('toggle', spy);

                            button.setValue('item2');

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(item);
                            expect(spy.mostRecentCall.args[2]).toBe(true);
                        });
                    });
                });

                describe("with an existing value", function() {
                    describe("via setPressed on the button", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false,
                                value: 'item1'
                            });
                        });

                        describe("setting a different button", function() {
                            it("should set the value", function() {
                                getItem(1).setPressed(true);
                                expect(button.getValue()).toBe('item2');
                            });

                            it("should have the correct pressed states", function() {
                                getItem(1).setPressed(true);
                                expectPressedState([false, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                getItem(1).setPressed(true);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe('item2');
                                expect(spy.mostRecentCall.args[2]).toBe('item1');
                            });

                            it("should fire the toggle event for the unpressed button, then the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                item.setPressed(true);

                                expect(spy.callCount).toBe(2);

                                expect(spy.calls[0].args[0]).toBe(button);
                                expect(spy.calls[0].args[1]).toBe(getItem(0));
                                expect(spy.calls[0].args[2]).toBe(false);

                                expect(spy.calls[1].args[0]).toBe(button);
                                expect(spy.calls[1].args[1]).toBe(item);
                                expect(spy.calls[1].args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            it("should set the value", function() {
                                getItem(0).setPressed(false);
                                expect(button.getValue()).toBeNull();
                            });

                            it("should have the correct pressed states", function() {
                                getItem(0).setPressed(false);
                                expectPressedState([false, false, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                getItem(0).setPressed(false);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBeNull();
                                expect(spy.mostRecentCall.args[2]).toBe('item1');
                            });

                            it("should fire the toggle event for the unpressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(0);

                                button.on('toggle', spy);

                                item.setPressed(false);

                                expect(spy.callCount).toBe(1);

                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(false);
                            });
                        });
                    });

                    describe("via user interaction", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false,
                                allowDepress: true,
                                value: 'item1'
                            });
                        });

                        describe("setting a different button", function() {
                            it("should set the value", function() {
                                clickIt(getItem(1));
                                expect(button.getValue()).toBe('item2');
                            });

                            it("should have the correct pressed states", function() {
                                clickIt(getItem(1));
                                expectPressedState([false, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                clickIt(getItem(1));

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe('item2');
                                expect(spy.mostRecentCall.args[2]).toBe('item1');
                            });

                            it("should fire the toggle event for the unpressed button, then the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                clickIt(item);

                                expect(spy.callCount).toBe(2);

                                expect(spy.calls[0].args[0]).toBe(button);
                                expect(spy.calls[0].args[1]).toBe(getItem(0));
                                expect(spy.calls[0].args[2]).toBe(false);

                                expect(spy.calls[1].args[0]).toBe(button);
                                expect(spy.calls[1].args[1]).toBe(item);
                                expect(spy.calls[1].args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            describe("with forceSelection: false", function() {
                                it("should set the value", function() {
                                    clickIt(getItem(0));
                                    expect(button.getValue()).toBeNull();
                                });

                                it("should have the correct pressed states", function() {
                                    clickIt(getItem(0));
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    clickIt(getItem(0));

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBeNull();
                                    expect(spy.mostRecentCall.args[2]).toBe('item1');
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    clickIt(item);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });

                            describe("with forceSelection: true", function() {
                                beforeEach(function() {
                                    button.setForceSelection(true);
                                });

                                it("should not set the value", function() {
                                    clickIt(getItem(0));
                                    expect(button.getValue()).toBe('item1');
                                });

                                it("should have the correct pressed states", function() {
                                    clickIt(getItem(0));
                                    expectPressedState([true, false, false, false]);
                                });

                                it("should not fire events", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);
                                    button.on('toggle', spy);

                                    clickIt(getItem(0));

                                    expect(spy).not.toHaveBeenCalled();
                                });
                            });
                        });
                    });

                    describe("via setValue", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: false,
                                allowDepress: true,
                                value: 'item1'
                            });
                        });

                        describe("setting a different button", function() {
                            it("should set the value", function() {
                                button.setValue('item2');
                                expect(button.getValue()).toBe('item2');
                            });

                            it("should have the correct pressed states", function() {
                                button.setValue('item2');
                                expectPressedState([false, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                button.setValue('item2');

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe('item2');
                                expect(spy.mostRecentCall.args[2]).toBe('item1');
                            });

                            it("should fire the toggle event for the unpressed button, then the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                button.setValue('item2');

                                expect(spy.callCount).toBe(2);

                                expect(spy.calls[0].args[0]).toBe(button);
                                expect(spy.calls[0].args[1]).toBe(getItem(0));
                                expect(spy.calls[0].args[2]).toBe(false);

                                expect(spy.calls[1].args[0]).toBe(button);
                                expect(spy.calls[1].args[1]).toBe(item);
                                expect(spy.calls[1].args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            it("should set the value", function() {
                                button.setValue(null);
                                expect(button.getValue()).toBeNull();
                            });

                            it("should have the correct pressed states", function() {
                                button.setValue(null);
                                expectPressedState([false, false, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                button.setValue(null);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBeNull();
                                expect(spy.mostRecentCall.args[2]).toBe('item1');
                            });

                            it("should fire the toggle event for the unpressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(0);

                                button.on('toggle', spy);

                                button.setValue(null);

                                expect(spy.callCount).toBe(1);

                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(false);
                            });
                        });
                    });
                });
            });

            describe("with allowMultiple: true", function() {
                describe("with no existing value", function() {
                    describe("via setPressed on the button", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true
                            });
                        });

                        it("should set the value", function() {
                            getItem(1).setPressed(true);
                            expect(button.getValue()).toEqual(['item2']);
                        });

                        it("should have the correct pressed states", function() {
                            getItem(1).setPressed(true);
                            expectPressedState([false, true, false, false]);
                        });

                        it("should fire the change event", function() {
                            var spy = jasmine.createSpy();
                            button.on('change', spy);

                            getItem(1).setPressed(true);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                            expect(spy.mostRecentCall.args[2]).toEqual([]);
                        });

                        it("should fire the toggle event for pressed button", function() {
                            var spy = jasmine.createSpy(),
                                item = getItem(1);

                            button.on('toggle', spy);

                            item.setPressed(true);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(item);
                            expect(spy.mostRecentCall.args[2]).toBe(true);
                        });
                    });

                    describe("via user interaction", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true
                            });
                        });

                        it("should set the value", function() {
                            clickIt(getItem(1));
                            expect(button.getValue()).toEqual(['item2']);
                        });

                        it("should have the correct pressed states", function() {
                            clickIt(getItem(1));
                            expectPressedState([false, true, false, false]);
                        });

                        it("should fire the change event", function() {
                            var spy = jasmine.createSpy();
                            button.on('change', spy);

                            clickIt(getItem(1));

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                            expect(spy.mostRecentCall.args[2]).toEqual([]);
                        });

                        it("should fire the toggle event for pressed button", function() {
                            var spy = jasmine.createSpy(),
                                item = getItem(1);

                            button.on('toggle', spy);

                            clickIt(item);

                            expect(spy.callCount).toBe(1);
                            expect(spy.mostRecentCall.args[0]).toBe(button);
                            expect(spy.mostRecentCall.args[1]).toBe(item);
                            expect(spy.mostRecentCall.args[2]).toBe(true);
                        });
                    });

                    describe("via setValue", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true
                            });
                        });

                        describe("a single value", function() {
                            it("should set the value", function() {
                                button.setValue('item2');
                                expect(button.getValue()).toEqual(['item2']);
                            });

                            it("should have the correct pressed states", function() {
                                button.setValue('item2');
                                expectPressedState([false, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                button.setValue('item2');

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                                expect(spy.mostRecentCall.args[2]).toEqual([]);
                            });

                            it("should fire the toggle event for pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                button.setValue('item2');

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(true);
                            });
                        });

                        describe("multiple values", function() {
                            it("should set the value", function() {
                                button.setValue(['item2', 'item4']);
                                expect(button.getValue()).toEqual(['item2', 'item4']);
                            });

                            it("should have the correct pressed states", function() {
                                button.setValue(['item2', 'item4']);
                                expectPressedState([false, true, false, true]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                button.setValue(['item2', 'item4']);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toEqual(['item2', 'item4']);
                                expect(spy.mostRecentCall.args[2]).toEqual([]);
                            });

                            it("should fire the toggle event for pressed buttons", function() {
                                var spy = jasmine.createSpy();

                                button.on('toggle', spy);

                                button.setValue(['item2', 'item4']);

                                expect(spy.callCount).toBe(2);

                                expect(spy.calls[0].args[0]).toBe(button);
                                expect(spy.calls[0].args[1]).toBe(getItem(1));
                                expect(spy.calls[0].args[2]).toBe(true);

                                expect(spy.calls[1].args[0]).toBe(button);
                                expect(spy.calls[1].args[1]).toBe(getItem(3));
                                expect(spy.calls[1].args[2]).toBe(true);
                            });
                        });
                    });
                });

                describe("with an existing value", function() {
                    describe("via setPressed on the button", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true,
                                value: 'item1'
                            });
                        });

                        describe("setting an additional button", function() {
                            it("should set the value", function() {
                                getItem(1).setPressed(true);
                                expect(button.getValue()).toEqual(['item1', 'item2']);
                            });

                            it("should have the correct pressed states", function() {
                                getItem(1).setPressed(true);
                                expectPressedState([true, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                getItem(1).setPressed(true);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toEqual(['item1', 'item2']);
                                expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                            });

                            it("should fire the toggle event for the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                item.setPressed(true);

                                expect(spy.callCount).toBe(1);

                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            describe("the only pressed item", function() {
                                it("should set the value", function() {
                                    getItem(0).setPressed(false);
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have the correct pressed states", function() {
                                    getItem(0).setPressed(false);
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    getItem(0).setPressed(false);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual([]);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    item.setPressed(false);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });

                            describe("one of the pressed items", function() {
                                beforeEach(function() {
                                    button.setValue(['item1', 'item2']);
                                });

                                it("should set the value", function() {
                                    getItem(0).setPressed(false);
                                    expect(button.getValue()).toEqual(['item2']);
                                });

                                it("should have the correct pressed states", function() {
                                    getItem(0).setPressed(false);
                                    expectPressedState([false, true, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    getItem(0).setPressed(false);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1', 'item2']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    item.setPressed(false);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });
                        });
                    });

                    describe("via user interaction", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true,
                                allowDepress: true,
                                value: 'item1'
                            });
                        });

                        describe("setting an additional button", function() {
                            it("should set the value", function() {
                                clickIt(getItem(1));
                                expect(button.getValue()).toEqual(['item1', 'item2']);
                            });

                            it("should have the correct pressed states", function() {
                                clickIt(getItem(1));
                                expectPressedState([true, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                clickIt(getItem(1));

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toEqual(['item1', 'item2']);
                                expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                            });

                            it("should fire the toggle event for the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                clickIt(item);

                                expect(spy.callCount).toBe(1);

                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            describe("the only pressed item", function() {
                                it("should set the value", function() {
                                    clickIt(getItem(0));
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have the correct pressed states", function() {
                                    clickIt(getItem(0));
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    clickIt(getItem(0));

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual([]);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    clickIt(item);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });

                            describe("one of the pressed items", function() {
                                beforeEach(function() {
                                    button.setValue(['item1', 'item2']);
                                });

                                it("should set the value", function() {
                                    clickIt(getItem(0));
                                    expect(button.getValue()).toEqual(['item2']);
                                });

                                it("should have the correct pressed states", function() {
                                    clickIt(getItem(0));
                                    expectPressedState([false, true, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    clickIt(getItem(0));

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1', 'item2']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    clickIt(item);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });
                        });
                    });

                    describe("via setValue", function() {
                        beforeEach(function() {
                            createButton({
                                allowMultiple: true,
                                allowDepress: true,
                                value: 'item1'
                            });
                        });

                        describe("setting an additional button", function() {
                            it("should set the value", function() {
                                button.setValue(['item1', 'item2']);
                                expect(button.getValue()).toEqual(['item1', 'item2']);
                            });

                            it("should have the correct pressed states", function() {
                                button.setValue(['item1', 'item2']);
                                expectPressedState([true, true, false, false]);
                            });

                            it("should fire the change event", function() {
                                var spy = jasmine.createSpy();
                                button.on('change', spy);

                                button.setValue(['item1', 'item2']);

                                expect(spy.callCount).toBe(1);
                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toEqual(['item1', 'item2']);
                                expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                            });

                            it("should fire the toggle event for the pressed button", function() {
                                var spy = jasmine.createSpy(),
                                    item = getItem(1);

                                button.on('toggle', spy);

                                button.setValue(['item1', 'item2']);

                                expect(spy.callCount).toBe(1);

                                expect(spy.mostRecentCall.args[0]).toBe(button);
                                expect(spy.mostRecentCall.args[1]).toBe(item);
                                expect(spy.mostRecentCall.args[2]).toBe(true);
                            });
                        });

                        describe("clearing existing button", function() {
                            describe("the only pressed item", function() {
                                it("should set the value", function() {
                                    button.setValue([]);
                                    expect(button.getValue()).toEqual([]);
                                });

                                it("should have the correct pressed states", function() {
                                    button.setValue([]);
                                    expectPressedState([false, false, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    button.setValue([]);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual([]);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    button.setValue([]);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });

                            describe("one of the pressed items", function() {
                                beforeEach(function() {
                                    button.setValue(['item1', 'item2']);
                                });

                                it("should set the value", function() {
                                    button.setValue(['item2']);
                                    expect(button.getValue()).toEqual(['item2']);
                                });

                                it("should have the correct pressed states", function() {
                                    button.setValue(['item2']);
                                    expectPressedState([false, true, false, false]);
                                });

                                it("should fire the change event", function() {
                                    var spy = jasmine.createSpy();
                                    button.on('change', spy);

                                    button.setValue(['item2']);

                                    expect(spy.callCount).toBe(1);
                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toEqual(['item2']);
                                    expect(spy.mostRecentCall.args[2]).toEqual(['item1', 'item2']);
                                });

                                it("should fire the toggle event for the unpressed button", function() {
                                    var spy = jasmine.createSpy(),
                                        item = getItem(0);

                                    button.on('toggle', spy);

                                    button.setValue(['item2']);

                                    expect(spy.callCount).toBe(1);

                                    expect(spy.mostRecentCall.args[0]).toBe(button);
                                    expect(spy.mostRecentCall.args[1]).toBe(item);
                                    expect(spy.mostRecentCall.args[2]).toBe(false);
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("value order", function() {
            beforeEach(function() {
                createButton({
                    allowMultiple: true
                });
            });

            describe("via setPressed", function() {
                it("should keep values in index order", function() {
                    getItem(2).setPressed(true);
                    expect(button.getValue()).toEqual(['item3']);
                    getItem(0).setPressed(true);
                    expect(button.getValue()).toEqual(['item1', 'item3']);
                    getItem(3).setPressed(true);
                    expect(button.getValue()).toEqual(['item1', 'item3', 'item4']);
                    getItem(1).setPressed(true);
                    expect(button.getValue()).toEqual(['item1', 'item2', 'item3', 'item4']);
                });
            });

            describe("via user interaction", function() {
                it("should keep values in index order", function() {
                    clickIt(getItem(2));
                    expect(button.getValue()).toEqual(['item3']);
                    clickIt(getItem(0));
                    expect(button.getValue()).toEqual(['item1', 'item3']);
                    clickIt(getItem(3));
                    expect(button.getValue()).toEqual(['item1', 'item3', 'item4']);
                    clickIt(getItem(1));
                    expect(button.getValue()).toEqual(['item1', 'item2', 'item3', 'item4']);
                });
            });

            describe("via setValue", function() {
                it("should keep values in index order", function() {
                    button.setValue(['item3', 'item2', 'item1', 'item4']);
                    expect(button.getValue()).toEqual(['item1', 'item2', 'item3', 'item4']);
                });
            });
        });

        describe("event order", function() {
            beforeEach(function() {
                createButton({
                    allowMultiple: true
                });
            });

            it("should have the value set already in pressedchange", function() {
                var btn1 = button.down('#item1');
                btn1.on('pressedchange', function() {
                    expect(button.getValue()).toEqual(['item1']);
                }, null, {single: true});
                btn1.toggle();

                var btn2 = button.down('#item2');
                btn2.on('pressedchange', function() {
                    expect(button.getValue()).toEqual(['item1', 'item2']);
                }, null, {single: true});
                btn2.toggle();

                btn2.on('pressedchange', function() {
                    expect(button.getValue()).toEqual(['item1']);
                }, null, {single: true});
                btn2.toggle();

                 btn1.on('pressedchange', function() {
                    expect(button.getValue()).toEqual([]);
                }, null, {single: true});
                btn1.toggle();
            });

            it("should fire toggle events before change events", function() {
                button.setValue(['item2']);

                var order = [],
                    toggleSpy = jasmine.createSpy().andCallFake(function() {
                        order.push('toggle');
                    }),
                    changeSpy = jasmine.createSpy().andCallFake(function() {
                        order.push('change');
                    });

                button.on({
                    toggle: toggleSpy,
                    change: changeSpy
                });

                button.setValue(['item1', 'item4']);
                expect(order).toEqual(['toggle', 'toggle', 'toggle', 'change']);
            });

            it("should fire unpressed buttons before pressed buttons, both in index order", function() {
                button.setValue(['item2', 'item4']);

                var spy = jasmine.createSpy();

                button.on('toggle', spy);
                button.setValue(['item3', 'item1']);

                expect(spy.calls[0].args[0]).toBe(button);
                expect(spy.calls[0].args[1]).toBe(getItem(1));
                expect(spy.calls[0].args[2]).toBe(false);

                expect(spy.calls[1].args[0]).toBe(button);
                expect(spy.calls[1].args[1]).toBe(getItem(3));
                expect(spy.calls[1].args[2]).toBe(false);

                expect(spy.calls[2].args[0]).toBe(button);
                expect(spy.calls[2].args[1]).toBe(getItem(0));
                expect(spy.calls[2].args[2]).toBe(true);

                expect(spy.calls[3].args[0]).toBe(button);
                expect(spy.calls[3].args[1]).toBe(getItem(2));
                expect(spy.calls[3].args[2]).toBe(true);
            });
        });
    });

});