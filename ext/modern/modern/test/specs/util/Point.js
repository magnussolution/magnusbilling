describe("Ext.util.Point", function() {
    var Point = Ext.util.Point,
        point;

    describe("constructor()", function() {
        it("should instantiate with x=0 and y=0 if not provided", function() {
            point = new Point();
            expect(point.x).toBe(0);
            expect(point.y).toBe(0);
        });

        it("should instantiate with the provided x and y", function() {
            point = new Point(100, 200);
            expect(point.x).toBe(100);
            expect(point.y).toBe(200);
        });
    });

    describe("members", function() {
        beforeEach(function() {
            point = new Point(100, 200);
        });

        describe("copy()", function() {
            it("should create a new instance with the same x and y values", function() {
                var newPoint = point.copy();

                expect(newPoint).not.toBe(point);
                expect(newPoint.x).toEqual(point.x);
                expect(newPoint.y).toEqual(point.y);
            });
        });

        describe("copyFrom()", function() {
            it("should copy x and y value to the current instance", function() {
                point.copyFrom({
                    x: 300,
                    y: 400
                });

                expect(point.x).toBe(300);
                expect(point.y).toBe(400);
            });
        });

        describe("equal()", function() {
            it("should return true if both x and y values are the same", function() {
                expect(point.equals({
                    x: 100,
                    y: 200
                })).toBe(true);
            });

            it("should return false otherwise", function() {
                expect(point.equals({
                    x: 101,
                    y: 200
                })).toBe(false);

                expect(point.equals({
                    x: 100,
                    y: 200.1
                })).toBe(false);
            });
        });

        describe("isWithin()", function() {
            it("should return true if point.x=108, point.y=194 and threshold=10", function() {
                expect(point.isWithin({
                    x: 108,
                    y: 194
                }, 10)).toBe(true);
            });

            it("should return false if point.x=108.1, point.y=194 and threshold=10", function() {
                expect(point.isWithin({
                    x: 108.1,
                    y: 194
                }, 10)).toBe(false);
            });
        });

        describe("translate()", function() {
            it("should translate x and y by the given amounts", function() {
                point.translate(10, -20);
                expect(point.x).toBe(110);
                expect(point.y).toBe(180);
            });
        });

        describe("roundedEquals()", function() {
            it("should return true if point.x=100.3 and point.y=199.7", function() {
                var compare = {
                    x: 100.3,
                    y: 199.7
                };

                expect(point.roundedEquals(compare)).toBe(true);
            });

            it("should return true if point.x=100.6 and point.y=199.7", function() {
                var compare = {
                    x: 100.6,
                    y: 199.7
                };

                expect(point.roundedEquals(compare)).toBe(false);
            });
        });
    });

});
