describe("Ext.chart.series.Pie", function () {
    describe("betweenAngle", function () {
        it("should return false if the gap between start and end angles is zero", function () {
            var proto = Ext.chart.series.Pie.prototype,
                betweenAngle = proto.betweenAngle,
                context1 = {
                    getClockwise: function () { return true; },
                    rotationOffset: proto.rotationOffset
                },
                context2 = {
                    getClockwise: function () { return true; },
                    rotationOffset: context1.rotationOffset + 0.123
                };

            var result = betweenAngle.call(context1, -0.5, 0, 0);
            expect(result).toBe(false);
            var result = betweenAngle.call(context1, -0.5, 1.1234567, 1.1234567);
            expect(result).toBe(false);

            var result = betweenAngle.call(context2, -0.5, 0, 0);
            expect(result).toBe(false);
            var result = betweenAngle.call(context2, -0.5, 1.1234567, 1.1234567);
            expect(result).toBe(false);
        });
    });
});