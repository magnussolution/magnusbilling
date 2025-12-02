// This spec will always throw a JS error if we don't wait until the editor is initialized to destroy it.
// However, even waiting 20 seconds it fails in 50% of the runs on IE, and, even worse, leaves some DIVs
// in the document body, even cleaning it on afterEach(). So, by now, it's disabled on IE, not only
// to avoid false positives, but to avoid side-effects in other specs, specially VBox and HBox, which are
// very sensitive to any garbage left in the body.
describe('Ext.form.field.HtmlEditor', function() {
    var editor;

    function createHtmlEditor(cfg) {
        editor = Ext.widget(Ext.apply({
            renderTo: Ext.getBody(),
            xtype: 'htmleditor'
        }, cfg));
    }

    afterEach(function() {
        if (editor) {
            editor.destroy();
            editor = undefined;
        }
    });
    
    describe("dirty state", function(){
        it("should not be dirty when rendered without a value", function(){
            createHtmlEditor();
            expect(editor.isDirty()).toBe(false);    
        }); 
    }); 

    it("should be able to set the value before rendering", function(){
        editor = new Ext.form.field.HtmlEditor();
        editor.setValue('foo');
        editor.render(Ext.getBody());
        expect(editor.getValue()).toBe('foo');    
    });
    
    it("should fire the change event", function(){
        var newVal,
            oldVal;
            
        createHtmlEditor();
        editor.on('change', function(arg1, arg2, arg3) {
            newVal = arg2;
            oldVal = arg3;
        });  
        editor.setValue('foo');
        expect(oldVal).toBe('');
        expect(newVal).toBe('foo');
    });

    describe('Destruction', function() {
        it('should destroy successfully when it isn\'t rendered', function() {
            if (Ext.isIE) {
                return;
            }

            createHtmlEditor({renderTo: null});
            expect(editor.rendered).toBeFalsy();
            editor.destroy();
            editor = undefined;
        });

        // Temporarily disabled because it crashes the test runner.
        xit('should destroy successfully when it\'s rendered', function() {
            if (Ext.isIE) {
                return;
            }

            createHtmlEditor();
            expect(editor.rendered).toBeTruthy();

            waitsFor(function() {
                return editor.initialized;
            }, 20000);
            runs(function() {
                editor.destroy();
                editor = undefined;

                // Check we can we successfully create another one...
                createHtmlEditor();
                expect(editor.rendered).toBeTruthy();

                waitsFor(function() {
                    return editor.initialized;
                }, 20000);
                runs(function() {
                    editor.destroy();
                    editor = undefined;
                });
            });

        });
    });
});