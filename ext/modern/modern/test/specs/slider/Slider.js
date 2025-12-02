describe('Ext.slider.Slider', function() {
    var slider,
        createField = function(config) {
            if (slider) {
                slider.destroy();
            }

            slider = Ext.create('Ext.slider.Slider', config || {});
        };

    afterEach(function() {
        Ext.destroy(slider);
    });

    describe('value', function() {
        it('should be a number, in case a number was given', function() {
            createField({value: 50});
            var value = slider.getValue();

            expect(value).toBe(50);
        });

        it('should be an array, in case a number was given and `valueIsArray` is `true`', function() {
            createField({
                value: 50,
                valueIsArray: true
            });
            var value = slider.getValue();

            expect(value[0]).toBe(50);
        });

        it('should be an array, in case an array was given', function() {
            createField({value: [30, 70]});
            var value = slider.getValue();

            expect(value[0]).toBe(30);
            expect(value[1]).toBe(70);
        });
    });

});
