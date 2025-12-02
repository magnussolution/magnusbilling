describe('Ext.picker.Picker', function() {
    var selectField, datePicker;
    
    afterEach(function() {
        selectField = datePicker = Ext.destroy(selectField, datePicker);
    });

    describe("mask", function() {
        it("should be inserted as the first child of the innerElement", function() {
            var picker, firstChild,
                maskCls = Ext.baseCSSPrefix + 'picker-mask';

            datePicker = Ext.create('Ext.picker.Date');

            selectField = Ext.create('Ext.field.Select', {
                usePicker: true,
                options: [
                    {text: 'First Option',  value: 'first'},
                    {text: 'Second Option', value: 'second'},
                    {text: 'Third Option',  value: 'third'}
                ]
            });

            picker = selectField.getPhonePicker();
            firstChild = picker.innerElement.first();

            expect(firstChild).toHaveCls(maskCls);

            firstChild = datePicker.innerElement.first();
            expect(firstChild).toHaveCls(maskCls);
        });
    });
});
