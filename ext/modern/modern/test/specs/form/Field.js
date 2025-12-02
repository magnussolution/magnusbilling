describe('Ext.form.Field', function() {
    var field;

    var create = function(config) {
        field = Ext.create('Ext.form.Field', config || {});
        return this;
    };

    var render = function() {
        field.render(Ext.getBody());
        return this;
    };

    afterEach(function() {
        if (field) {
            field.destroy();
        }
    });

    describe('deprecated configurations + methods', function() {
        
    }); 

});























































