describe('Ext.draw.Container', function () {

    describe("'sprites' config", function () {
        it("should accept sprite configs.", function () {
            var container = new Ext.draw.Container({
                sprites: {
                    type: 'rect',
                    x: 10
                }
            });

            var sprite = container.getSprites()[0];
            expect(sprite.isSprite).toBe(true);
            expect(sprite.type).toBe('rect');
            expect(sprite.attr.x).toEqual(10);

            container.destroy();
        });

        it("should accept sprite instances.", function () {
            var container = new Ext.draw.Container({
                sprites: new Ext.draw.sprite.Rect({
                    x: 10
                })
            });

            var sprite = container.getSprites()[0];
            expect(sprite.isSprite).toBe(true);
            expect(sprite.type).toBe('rect');
            expect(sprite.attr.x).toEqual(10);

            container.destroy();
        });

        it("should put sprites into the specified surface or the 'main' one.", function () {
            var container = new Ext.draw.Container({
                sprites: {
                    type: 'rect',
                    surface: 'test',
                    x: 10
                }
            });

            var sprite = container.getSurface('test').getItems()[0];

            expect(sprite.isSprite).toBe(true);
            expect(sprite.type).toBe('rect');
            expect(sprite.attr.x).toEqual(10);

            container.destroy();
        });

    });
});