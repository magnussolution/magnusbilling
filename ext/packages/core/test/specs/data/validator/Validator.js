describe("Ext.data.validator.Validator", function() {
    
    var v;
    
    afterEach(function() {
        v = null;
    });
    
    describe("construction", function() {
        it("should accept a function to be the validate method", function() {
            var fn = function() {};
            v = new Ext.data.validator.Validator(fn);
            expect(v.validate).toBe(fn);        
        });
    });
    
    describe("validate", function() {
        it("should return true", function() {
            v = new Ext.data.validator.Validator();
            expect(v.validate()).toBe(true);    
        });  
    });
    
    describe("factory", function() {
        var factory = function(type, cfg) {
            return Ext.data.validator.Validator.create(Ext.apply({
                type: type
            }, cfg));
        };
        
        it("should create a presence validator", function() {
            expect(factory('presence') instanceof Ext.data.validator.Presence).toBe(true);    
        });
        
        it("should create a length validator", function() {
            expect(factory('length') instanceof Ext.data.validator.Length).toBe(true);    
        });
        
        it("should create a range validator", function() {
            expect(factory('range') instanceof Ext.data.validator.Range).toBe(true);    
        });
        
        it("should create an email validator", function() {
            expect(factory('email') instanceof Ext.data.validator.Email).toBe(true);    
        });
        
        it("should create a format validator", function() {
            expect(factory('format', {
                matcher: /foo/
            }) instanceof Ext.data.validator.Format).toBe(true);    
        });
        
        it("should create an inclusion validator", function() {
            expect(factory('inclusion', {
                list: []
            }) instanceof Ext.data.validator.Inclusion).toBe(true);    
        });
        
        it("should create an exclusion validator", function() {
            expect(factory('exclusion', {
                list: []
            }) instanceof Ext.data.validator.Exclusion).toBe(true);    
        });
        
        it("should default to base", function() {
            expect(factory('') instanceof Ext.data.validator.Validator).toBe(true);   
        });
    });

    describe("custom validator", function() {
        var validator;

        beforeEach(function() {
            Ext.define('Ext.data.validator.Custom', {
                extend: 'Ext.data.validator.Validator',
                alias: 'data.validator.custom'
            });

            validator = Ext.data.validator.Validator.create({
                type: 'custom'
            });
        });

        afterEach(function() {
            validator.destroy();
            Ext.undefine('Ext.data.validator.Custom');
            Ext.Factory.dataValidator.instance.clearCache();
        });

        it("should be able to create a custom validator", function() {
            expect(validator instanceof Ext.data.validator.Custom).toBe(true);
            expect(validator instanceof Ext.data.validator.Validator).toBe(true);
        });

        it("should pass value and record to Validator validate method", function() {
            spyOn(validator,'validate').andCallThrough();

            var Model = Ext.define(null,{
                extend : 'Ext.data.Model',
                fields : ['test'],
                validators : {
                    test : validator
                }
            }),
            record = new Model({
                test : 'Foo'
            });
            
            record.isValid();

            expect(validator.validate).toHaveBeenCalled();
            expect(validator.validate).toHaveBeenCalledWith('Foo', record);
        });
    });
});
