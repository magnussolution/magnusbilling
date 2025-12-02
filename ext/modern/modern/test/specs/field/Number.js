describe('Modern form - Ext.field.Number', function() {
    var field,
        createField = function(config) {
            if (field) {
                field.destroy();
            }

            field = Ext.create('Ext.field.Number', config || {});
        };

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe("getValue", function() {
        describe("when value is null", function() {
            beforeEach(function() {
                createField();
            });

            it("should return null", function() {
                expect(field.getValue()).toBeNull();
            });
        });

        describe("when value is a number", function() {
            beforeEach(function() {
                createField({
                    value: 123
                });
            });

            it("should return 123", function() {
                expect(field.getValue()).toEqual(123);
            });
        });

        describe("when value is 0", function() {
            beforeEach(function() {
                createField({
                    value: 0
                });
            });

            it("should return 0", function() {
                expect(field.getValue()).toEqual(0);
            });
        });

        describe("when value is -123", function() {
            beforeEach(function() {
                createField({
                    value: -123
                });
            });

            it("should return -123", function() {
                expect(field.getValue()).toEqual(-123);
            });
        });

        describe("when value is a string", function() {
            beforeEach(function() {
                createField({
                    value: '123'
                });
            });

            it("should return 123", function() {
                expect(field.getValue()).toEqual(123);
            });
        });
    });

    describe("setValue", function() {
        describe("null value", function() {
            beforeEach(function() {
                createField();
            });

            describe("when value is a number", function() {
                it("should set the value to 123", function() {
                    field.setValue(123);
                    expect(field.getValue()).toEqual(123);
                });
            });

            describe("when value is a string", function() {
                it("should set the value to 123", function() {
                    field.setValue('123');
                    expect(field.getValue()).toEqual(123);
                });
            });

            describe("when value is a negative value", function() {
                it("should set the value to -123", function() {
                    field.setValue(-123);
                    expect(field.getValue()).toEqual(-123);
                });
            });

            describe("when value is a negative value as as tring", function() {
                it("should set the value to -123", function() {
                    field.setValue('-123');
                    expect(field.getValue()).toEqual(-123);
                });
            });

            describe("when value is 0", function() {
                it("should set the value to 0", function() {
                    field.setValue(0);
                    expect(field.getValue()).toEqual(0);
                });
            });

            describe("when value is 0 as string", function() {
                it("should set the value to 0", function() {
                    field.setValue('0');
                    expect(field.getValue()).toEqual(0);
                });
            });
        });
    });
});
