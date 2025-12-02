describe('Ext.draw.engine.Canvas', function () {

    describe('surface splitting', function () {
        it("should split the surface into canvas tiles vertically and horizontally based on splitThreshold", function () {
            var side = 400,
                threshold = 200,
                proto = Ext.draw.engine.Canvas.prototype,
                originalThreshold = proto.splitThreshold;

            proto.splitThreshold = threshold;
            var draw = new Ext.draw.Container({
                renderTo: Ext.getBody(),
                engine: 'Ext.draw.engine.Canvas',
                width: side,
                height: side
            });
            var surface = draw.getSurface();
            var expectedCanvasCount = Math.pow(Math.ceil((side * (window.devicePixelRatio || 1)) / threshold), 2);
            expect(surface.innerElement.select('canvas').elements.length).toBe(expectedCanvasCount);
            proto.splitThreshold = originalThreshold;
            Ext.destroy(draw);
        });
    });

});