describe("Ext.tree.Column", function() {

    var tree, colRef;

    function makeTree(columns) {
        tree = new Ext.tree.Panel({
            renderTo: Ext.getBody(),
            width: 600,
            height: 300,
            store: {
                autoDestroy: true,
                root: {
                    text: 'Foo'
                }
            },
            columns: columns
        });
        colRef = tree.getColumnManager().getColumns();
    }

    afterEach(function() {
        tree = Ext.destroy(tree);
    });

    it("should retain scope when assigned before calling parent initComponent & subclassing", function() {
        var spy = jasmine.createSpy(),
            o = {};

        Ext.define('spec.Foo', {
            extend: 'Ext.tree.Column',
            alias: 'widget.spectreecolumn',

            initComponent: function() {
                this.scope = o;
                this.callParent();
            }
        });

        makeTree([{
            xtype: 'spectreecolumn',
            renderer: spy
        }]);

        expect(spy.callCount).toBe(1);
        expect(spy.mostRecentCall.object).toBe(o);

        Ext.undefine('spec.Foo');
    });
});