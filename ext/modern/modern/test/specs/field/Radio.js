describe('Ext.field.Radio', function() {
    var field, fieldset;

    function makeField(cfg) {
        field = new Ext.field.Radio(cfg);
    }

    function makeGroup(fields) {
        fields.forEach(function(f) {
            f.name = 'group';
        });

        fieldset = new Ext.form.FieldSet({
            defaultType: 'radiofield',
            items: fields
        });

        fieldset.renderTo(Ext.getBody());
    }

    afterEach(function() {
        fieldset = field = Ext.destroy(field, fieldset);
    });

    describe("getGroupValue", function() {
        it("should return the value of the radio configured with checked: true", function() {
            makeGroup([{
                value: 'red'
            }, {
                checked: true,
                value: 'blue'
            }]);

            var fields = fieldset.query('radiofield');
            fields.forEach(function(f) {
                expect(f.getGroupValue()).toBe('blue');
            });
        });

        it("should return the value of the checked radio when selection changes", function() {
            makeGroup([{
                value: 'red'
            }, {
                checked: true,
                value: 'blue'
            }]);

            fieldset.items.first().check();

            var fields = fieldset.query('radiofield');
            fields.forEach(function(f) {
                expect(f.getGroupValue()).toBe('red');
            });
        });

        it("should return null if no item is checked", function() {
            makeGroup([{
                value: 'red'
            }, {
                value: 'blue'
            }]);

            var fields = fieldset.query('radiofield');
            fields.forEach(function(f) {
                expect(f.getGroupValue()).toBeNull();
            });
        });
    });

    describe("checked state", function() {
        function expectChecked(states) {
            var len = states.length,
                i;

            for (i = 0; i < len; ++i) {
                expect(fieldset.getAt(i).getChecked()).toBe(states[i]);
            }
        }

        it("should be able to have no item checked initially", function() {
            makeGroup([{
                value: 'red'
            }, {
                value: 'blue'
            }, {
                value: 'green'
            }]);

            expectChecked([false, false, false]);
        });

        it("should have the checked item checked, other items unchecked", function() {
            makeGroup([{
                value: 'red'
            }, {
                value: 'blue',
                checked: true
            }, {
                value: 'green'
            }]);

            expectChecked([false, true, false]);
        });

        it("should uncheck the checked item when checking a new item", function() {
            makeGroup([{
                value: 'red'
            }, {
                value: 'blue'
            }, {
                value: 'green'
            }]);

            fieldset.getAt(0).check();
            expectChecked([true, false, false]);

            fieldset.getAt(1).check();
            expectChecked([false, true, false]);

            fieldset.getAt(2).check();
            expectChecked([false, false, true]);
        });

        it("should allow the checked item to be unchecked", function() {
            makeGroup([{
                value: 'red',
                checked: true
            }, {
                value: 'blue'
            }, {
                value: 'green'
            }]);

            fieldset.getAt(0).uncheck();
            expectChecked([false, false, false]);
        });
    });

    // Currently this fails on Tablets, because it's not translating
    // the click to tap.
    xdescribe("change via the UI", function() {
        it("should set checked when clicking", function() {
            makeGroup([{
                value: 'red',
                checked: true
            }, {
                value: 'blue'
            }]);

            var f = fieldset.getAt(1);

            jasmine.fireMouseEvent(f.getComponent().maskElement.dom, 'click');

            expect(fieldset.getAt(0).getChecked()).toBe(false);
            expect(f.getChecked()).toBe(true);
        });
    });

    describe("state methods", function() {
        var changeSpy, checkSpy, uncheckSpy;

        beforeEach(function() {
            changeSpy = jasmine.createSpy();
            checkSpy = jasmine.createSpy();
            uncheckSpy = jasmine.createSpy();
        });

        afterEach(function() {
            changeSpy = checkSpy = uncheckSpy = null;
        });

        function attachSpies(f) {
            f.on({
                change: changeSpy,
                check: checkSpy,
                uncheck: uncheckSpy
            });
        }

        describe("setChecked", function() {
            describe("setChecked(true)", function() {
                describe("when not checked", function() {
                    beforeEach(function() {
                        makeGroup([{
                            value: 'red'
                        }, {
                            value: 'blue'
                        }])
                    });

                    it("should set the checked state", function() {
                        var f = fieldset.getAt(0);
                        f.setChecked(true);
                        expect(f.getChecked()).toBe(true);
                        expect(f.isChecked()).toBe(true);
                    });

                    it("should fire change, check, not fire uncheck", function() {
                        var f = fieldset.getAt(0);
                        attachSpies(f);

                        f.setChecked(true);
                        expect(changeSpy.callCount).toBe(1);
                        expect(changeSpy.mostRecentCall.args[0]).toBe(f);
                        expect(changeSpy.mostRecentCall.args[1]).toBe(true);
                        expect(changeSpy.mostRecentCall.args[2]).toBe(false);

                        expect(checkSpy.callCount).toBe(1);
                        expect(checkSpy.mostRecentCall.args[0]).toBe(f);

                        expect(uncheckSpy).not.toHaveBeenCalled();
                    });
                });

                describe("when checked", function() {
                    beforeEach(function() {
                        makeGroup([{
                            value: 'red',
                            checked: true
                        }, {
                            value: 'blue'
                        }])
                    });

                    it("should set the checked state", function() {
                        var f = fieldset.getAt(0);
                        f.setChecked(true);
                        expect(f.getChecked()).toBe(true);
                        expect(f.isChecked()).toBe(true);
                    });

                    it("should not fire any events", function() {
                        var f = fieldset.getAt(0);
                        attachSpies(f);

                        f.setChecked(true);
                        
                        expect(changeSpy).not.toHaveBeenCalled();
                        expect(checkSpy).not.toHaveBeenCalled();
                        expect(uncheckSpy).not.toHaveBeenCalled();
                    });
                });
            });

            describe("setChecked(false)", function() {
                describe("when not checked", function() {
                    beforeEach(function() {
                        makeGroup([{
                            value: 'red'
                        }, {
                            value: 'blue'
                        }])
                    });

                    it("should set the checked state", function() {
                        var f = fieldset.getAt(0);
                        f.setChecked(false);
                        expect(f.getChecked()).toBe(false);
                        expect(f.isChecked()).toBe(false);
                    });

                    it("should not fire any events", function() {
                        var f = fieldset.getAt(0);
                        attachSpies(f);

                        f.setChecked(false);
                        
                        expect(changeSpy).not.toHaveBeenCalled();
                        expect(checkSpy).not.toHaveBeenCalled();
                        expect(uncheckSpy).not.toHaveBeenCalled();
                    });
                });

                describe("when checked", function() {
                    beforeEach(function() {
                        makeGroup([{
                            value: 'red',
                            checked: true
                        }, {
                            value: 'blue'
                        }])
                    });

                    it("should set the checked state", function() {
                        var f = fieldset.getAt(0);
                        f.setChecked(false);
                        expect(f.getChecked()).toBe(false);
                        expect(f.isChecked()).toBe(false);
                    });

                    it("should fire change, check, not fire uncheck", function() {
                        var f = fieldset.getAt(0);
                        attachSpies(f);

                        f.setChecked(false);
                        expect(changeSpy.callCount).toBe(1);
                        expect(changeSpy.mostRecentCall.args[0]).toBe(f);
                        expect(changeSpy.mostRecentCall.args[1]).toBe(false);
                        expect(changeSpy.mostRecentCall.args[2]).toBe(true);

                        expect(uncheckSpy.callCount).toBe(1);
                        expect(uncheckSpy.mostRecentCall.args[0]).toBe(f);

                        expect(checkSpy).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe("check", function() {
            describe("when not checked", function() {
                beforeEach(function() {
                    makeGroup([{
                        value: 'red'
                    }, {
                        value: 'blue'
                    }])
                });

                it("should set the checked state", function() {
                    var f = fieldset.getAt(0);
                    f.check();
                    expect(f.getChecked()).toBe(true);
                    expect(f.isChecked()).toBe(true);
                });

                it("should fire change, check, not fire uncheck", function() {
                    var f = fieldset.getAt(0);
                    attachSpies(f);

                    f.check();
                    expect(changeSpy.callCount).toBe(1);
                    expect(changeSpy.mostRecentCall.args[0]).toBe(f);
                    expect(changeSpy.mostRecentCall.args[1]).toBe(true);
                    expect(changeSpy.mostRecentCall.args[2]).toBe(false);

                    expect(checkSpy.callCount).toBe(1);
                    expect(checkSpy.mostRecentCall.args[0]).toBe(f);

                    expect(uncheckSpy).not.toHaveBeenCalled();
                });
            });

            describe("when checked", function() {
                beforeEach(function() {
                    makeGroup([{
                        value: 'red',
                        checked: true
                    }, {
                        value: 'blue'
                    }])
                });

                it("should set the checked state", function() {
                    var f = fieldset.getAt(0);
                    f.check();
                    expect(f.getChecked()).toBe(true);
                    expect(f.isChecked()).toBe(true);
                });

                it("should not fire any events", function() {
                    var f = fieldset.getAt(0);
                    attachSpies(f);

                    f.check();
                    
                    expect(changeSpy).not.toHaveBeenCalled();
                    expect(checkSpy).not.toHaveBeenCalled();
                    expect(uncheckSpy).not.toHaveBeenCalled();
                });
            });
        });

        describe("uncheck", function() {
            describe("when not checked", function() {
                beforeEach(function() {
                    makeGroup([{
                        value: 'red'
                    }, {
                        value: 'blue'
                    }])
                });

                it("should set the checked state", function() {
                    var f = fieldset.getAt(0);
                    f.uncheck();
                    expect(f.getChecked()).toBe(false);
                    expect(f.isChecked()).toBe(false);
                });

                it("should not fire any events", function() {
                    var f = fieldset.getAt(0);
                    attachSpies(f);

                    f.uncheck();
                    
                    expect(changeSpy).not.toHaveBeenCalled();
                    expect(checkSpy).not.toHaveBeenCalled();
                    expect(uncheckSpy).not.toHaveBeenCalled();
                });
            });

            describe("when checked", function() {
                beforeEach(function() {
                    makeGroup([{
                        value: 'red',
                        checked: true
                    }, {
                        value: 'blue'
                    }])
                });

                it("should set the checked state", function() {
                    var f = fieldset.getAt(0);
                    f.uncheck();
                    expect(f.getChecked()).toBe(false);
                    expect(f.isChecked()).toBe(false);
                });

                it("should fire change, check, not fire uncheck", function() {
                    var f = fieldset.getAt(0);
                    attachSpies(f);

                    f.uncheck();
                    expect(changeSpy.callCount).toBe(1);
                    expect(changeSpy.mostRecentCall.args[0]).toBe(f);
                    expect(changeSpy.mostRecentCall.args[1]).toBe(false);
                    expect(changeSpy.mostRecentCall.args[2]).toBe(true);

                    expect(uncheckSpy.callCount).toBe(1);
                    expect(uncheckSpy.mostRecentCall.args[0]).toBe(f);

                    expect(checkSpy).not.toHaveBeenCalled();
                });
            });
        });
    });
});
