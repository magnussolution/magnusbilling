describe("Ext.field.DatePicker", function() {

    var field;

    function makeField(cfg) {
        field = new Ext.field.DatePicker(cfg);
        field.renderTo(Ext.getBody())
    }

    afterEach(function() {
        field = Ext.destroy(field);
    });

    describe("setValue", function() {
        it("should take accept a date object", function() {
            makeField();
            field.setValue(new Date(2010, 0, 1));
            expect(field.getValue()).toEqual(new Date(2010, 0, 1));
        });

        it("should accept a string that matches the dateFormat", function() {
            makeField({
                dateFormat: 'Y-m-d'
            });
            field.setValue('2010-01-01');
            expect(field.getValue()).toEqual(new Date(2010, 0, 1));
        });

        it("should return null for a string that does not match the format", function() {
            makeField({
                dateFormat: 'Y-m-d'
            });
            field.setValue('01/01/2010');
            expect(field.getValue()).toBeNull();
        });

        it("should update the text field with the formatted value when specifying a date", function() {
            makeField({
                dateFormat: 'Y-m-d'
            });
            field.setValue(new Date(2010, 0, 1));
            expect(field.getComponent().inputElement.dom.value).toBe('2010-01-01');
        });

        it("should clear the text field when specifying null", function() {
            makeField({
                dateFormat: 'Y-m-d'
            });
            field.setValue(new Date(2010, 0, 1));
            field.setValue(null);
            expect(field.getComponent().inputElement.dom.value).toBe('');
        });

        describe("events", function() {
            var spy;
            beforeEach(function() {
                spy = jasmine.createSpy();
                makeField();
                field.on('change', spy);
            });

            afterEach(function() {
                spy = null;
            });

            it("should fire the change event when setting a value", function() {
                field.setValue(new Date(2010, 0, 1));
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[0]).toBe(field);
                expect(spy.mostRecentCall.args[1]).toEqual(new Date(2010, 0, 1));
                expect(spy.mostRecentCall.args[2]).toBeNull(field);
            });

            it("should fire the change event when changing a value", function() {
                field.setValue(new Date(2010, 0, 1));
                spy.reset();
                field.setValue(new Date(2010, 11, 31));
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[0]).toBe(field);
                expect(spy.mostRecentCall.args[1]).toEqual(new Date(2010, 11, 31));
                expect(spy.mostRecentCall.args[2]).toEqual(new Date(2010, 0, 1));
            });

            it("should fire the change event when clearing a value", function() {
                field.setValue(new Date(2010, 0, 1));
                spy.reset();
                field.setValue(null);
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[0]).toBe(field);
                expect(spy.mostRecentCall.args[1]).toBeNull();
                expect(spy.mostRecentCall.args[2]).toEqual(new Date(2010, 0, 1));
            });

            it("should not fire the change event when setting the same date", function() {
                field.setValue(new Date(2010, 0, 1));
                spy.reset();
                field.setValue(new Date(2010, 0, 1));
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe("getValue", function() {
        it("should return a date object when configured with a value", function() {
            makeField({
                value: new Date(2010, 0, 1)
            });
            expect(field.getValue()).toEqual(new Date(2010, 0, 1));
        });

        it("should return a date object after having a value set", function() {
            makeField();
            field.setValue(new Date(2010, 0, 1));
            expect(field.getValue()).toEqual(new Date(2010, 0, 1));
        });

        it("should return null when not configured with a value", function() {
            makeField();
            expect(field.getValue()).toBeNull();
        });

        it("should return null after clearing a value", function() {
            makeField({
                value: new Date(2010, 0, 1)
            });
            field.setValue(null);
            expect(field.getValue()).toBeNull();
        });
    });

    describe("getFormattedValue", function() {
        it("should return the formatted value when configured with a value", function() {
            makeField({
                dateFormat: 'Y-m-d',
                value: new Date(2010, 0, 1)
            });
            expect(field.getFormattedValue()).toBe('2010-01-01');
        });

        it("should return the formatted value after having a value set", function() {
            makeField({
                dateFormat: 'Y-m-d'
            });
            field.setValue(new Date(2010, 0, 1));
            expect(field.getFormattedValue()).toBe('2010-01-01');
        });

        it("should favour a passed format over the class format", function() {
            makeField({
                dateFormat: 'd/m/Y'
            });
            field.setValue(new Date(2010, 0, 1));
            expect(field.getFormattedValue('Y-m-d')).toBe('2010-01-01');
        });

        it("should return '' when not configured with a value", function() {
            makeField();
            expect(field.getFormattedValue()).toBe('');
        });

        it("should return '' after clearing a value", function() {
            makeField({
                value: new Date(2010, 0, 1)
            });
            field.setValue(null);
            expect(field.getFormattedValue()).toBe('');
        });
    });


});