describe("Ext.grid.property.Grid", function() {
    var grid;

    function makeGrid(source) {
        grid = new Ext.grid.property.Grid({
            source: source || {
                stringProp: 'foo',
                numProp: 100,
                boolProp: true,
                dateProp: new Date(2000, 0, 1)
            },
            renderTo: Ext.getBody()
        });
    }

    afterEach(function() {
        grid = Ext.destroy(grid);
    });

    describe("property manipulation", function() {
        beforeEach(function() {
            makeGrid();
        });

        describe("getProperty", function() {
            it("should return the value for the property", function() {
                expect(grid.getProperty('numProp')).toBe(100);
            });

            it("should return null when the property doesn't exist", function() {
                expect(grid.getProperty('foo')).toBeNull();
            });
        });

        describe("setProperty", function() {
            describe("with create: true", function() {
                it("should set an existing property", function() {
                    grid.setProperty('stringProp', 'bar', true);
                    expect(grid.getProperty('stringProp')).toBe('bar');
                });

                it("should create a property that doesn't exist", function() {
                    grid.setProperty('newStringProp', 'asdf', true);
                    expect(grid.getProperty('newStringProp')).toBe('asdf');
                });
            });

            describe("with create: false", function() {
                it("should set an existing property", function() {
                    grid.setProperty('stringProp', 'bar', false);
                    expect(grid.getProperty('stringProp')).toBe('bar');
                });

                it("should not create a property that doesn't exist", function() {
                    grid.setProperty('newStringProp', 'asdf', false);
                    expect(grid.getProperty('newStringProp')).toBeNull();
                });
            });
        });

        describe("removeProperty", function() {
            it("should remove a property", function() {
                grid.removeProperty('stringProp');
                expect(grid.getProperty('stringProp')).toBeNull();
            });

            it("should not cause an exception when removing a non-existent property", function() {
                expect(function() {
                    grid.removeProperty('foo');
                }).not.toThrow();
            });
        });
    });
});