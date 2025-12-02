describe('Ext.form.FieldSet', function() {
    var field, panel,
        create = function(config) {
            panel = Ext.create('Ext.form.FieldSet', config || {});
        };

    afterEach(function() {
        if (panel) {
            panel.destroy();
        }
    });

    // configs
    describe("configurations", function() {
        describe("title", function() {
            describe("method", function() {
                beforeEach(function() {
                    create({
                        title: 'testing'
                    });
                });

                it("should return text", function() {
                    expect(panel.getTitle()).toEqual('testing');
                });
            });
        });
    });
    // end configs

    describe("setDisabled", function() {
        var field;

        beforeEach(function() {
            field = Ext.create('Ext.field.Text', {
                name: 'test'
            });

            create({
                items: [field]
            });
        });

        it("should disable all fields", function() {
            expect(panel.getDisabled()).toBeFalsy();
            expect(field.getDisabled()).toBeFalsy();

            panel.setDisabled(true);

            expect(panel.getDisabled()).toBeTruthy();
            expect(field.getDisabled()).toBeTruthy();
        });
    });
});
