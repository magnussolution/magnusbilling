describe("Ext.chart.axis.segmenter.Numeric", function () {

    var proto = Ext.chart.axis.segmenter.Numeric.prototype;

    describe("exactStep", function () {
        it("should calculate unit and step correctly for the [.01, .99] range with 5 steps", function () {
            var min = 0.01,
                max = 0.99,
                steps = 5,
                estStep = (max - min) / steps,
                result = proto.exactStep(min, estStep);

            expect(result.unit.fixes).toBe(2);
            expect(result.unit.scale).toBe(estStep);
            expect(result.step).toBe(1);
        });

        it("should calculate unit and step correctly for the [-.01, .99] range with 5 steps", function () {
            var min = -0.01,
                max = 0.99,
                steps = 5,
                estStep = (max - min) / steps,
                result = proto.exactStep(min, estStep);

            expect(result.unit.fixes).toBe(2);
            expect(result.unit.scale).toBe(0.2);
            expect(result.step).toBe(1);
        });

        it("should calculate unit and step correctly for the [0, 1] range with 10 steps", function () {
            var min = 0,
                max = 1,
                steps = 10,
                estStep = (max - min) / steps,
                result = proto.exactStep(min, estStep);

            expect(result.unit.fixes).toBe(2);
            expect(result.unit.scale).toBe(0.1);
            expect(result.step).toBe(1);
        });

        it("should calculate unit and step correctly for the [5, 10] range with 3 steps", function () {
            var min = 5,
                max = 10,
                steps = 3,
                estStep = (max - min) / steps,
                result = proto.exactStep(min, estStep);

            expect(result.unit.fixes).toBe(1);
            expect(result.unit.scale).toBe(1);
            expect(result.step).toBe(1.6666666666666667);
        });
    });
});