describe('Ext.field.Slider', function() {
    var field,
        createField = function(config) {
            if (field) {
                field.destroy();
            }

            field = Ext.create('Ext.field.Slider', config || {});
        };

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe('readOnly', function() {
        beforeEach(function() {
            createField({
                readOnly : true,
                value    : 50,
                minValue : 0,
                maxValue : 100
            });
        });

        it('should not move thumb on tap', function() {
            var component = field.getComponent();

            spyOn(component, 'fireAction');

            component.onTap();

            expect(component.fireAction).not.toHaveBeenCalled();
        });
    });
});
