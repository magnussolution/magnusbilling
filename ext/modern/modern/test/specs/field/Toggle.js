describe('Ext.field.Toggle', function() {
    var field,
        createField = function(config) {
            if (field) {
                field.destroy();
            }

            field = Ext.create('Ext.field.Toggle', config || {});
        };

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe("methods", function() {
        describe("getValue", function() {
            describe("checked", function() {
                beforeEach(function() {
                    createField({
                        value: 1
                    });
                });

                it("should return a value", function() {
                    expect(field.getValue()).toBe(true);
                });
            });

            describe("unchecked", function() {
                beforeEach(function() {
                    createField();
                });

                it("should return a boolean", function() {
                    expect(field.getValue()).toBe(false);
                });
            });
        });
    });

    describe("events", function() {
        beforeEach(function() {
            createField();
        });

        describe("change", function() {
            it("should fire when you call setValue", function() {
                var callback = jasmine.createSpy();
                field.on('change', callback);
                field.setValue(1);
                expect(callback).toHaveBeenCalled();
            });

            it("should fire when you call toggle", function() {
                var callback = jasmine.createSpy();
                field.on('change', callback);
                field.toggle();
                expect(callback).toHaveBeenCalled();
            });
        });
    });
});
