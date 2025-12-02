describe("Ext.layout.container.Dashboard", function() {
    var panel;

    function makeItem (itemConfig) {
        return Ext.apply({
            xtype: 'component',
            style: 'margin: 4px;'
        }, itemConfig);
    }

    function makePanel (parentConfig, childConfig) {
        var items = [];

        if (!Ext.isArray(childConfig)) {
            childConfig = [childConfig];
        }

        Ext.each(childConfig, function(config) {
            items.push(makeItem(config));
        });

        panel = Ext.widget(Ext.apply({
            renderTo: document.body,
            xtype: 'panel',
            layout: 'dashboard',
            border: 0,
            bodyPadding: '6',
            maxColumns: 10,
            items: items,
            getMaxColumns: function () {
                return this.maxColumns;
            }
        }, parentConfig));
    }

    afterEach(function() {
        panel.destroy();
    });

    describe("splitters", function() {
        var parentConfig = {
            height:100,
            width: 1000
        };

        it("should put splitters between each", function() {
            makePanel(parentConfig, [
                { height: 80, columnWidth: .25 },
                { height: 80, columnWidth: .25 },
                { height: 80, columnWidth: .5 }
            ]);

            var items = panel.items.items;

            expect(items.length).toBe(5);

            expect(! items[0].isSplitter).toBe(true);
            expect(items[1].isSplitter).toBe(true);
            expect(! items[2].isSplitter).toBe(true);
            expect(items[3].isSplitter).toBe(true);
            expect(! items[4].isSplitter).toBe(true);
        });

        it("should hide orphan splitter", function() {
            makePanel(parentConfig, [
                { height: 80, columnWidth: .25 },
                { height: 80, columnWidth: .50 },
                { height: 80, columnWidth: .50 },
                { height: 80, columnWidth: .50 }
            ]);

            var items = panel.items.items;

            expect(items.length).toBe(7);

            expect(! items[0].isSplitter).toBe(true);
            expect(items[1].isSplitter).toBe(true);
            expect(! items[2].isSplitter).toBe(true);

            expect(items[3].isSplitter).toBe(true);
            expect(items[3].el.getHeight()).toBe(0); // orphaned so hidden w/height=0

            expect(! items[4].isSplitter).toBe(true);
            expect(items[5].isSplitter).toBe(true);
            expect(! items[6].isSplitter).toBe(true);
        });

        it("should update splitters on add to three columns", function() {
            makePanel(parentConfig, [
                { height: 80, columnWidth: .25 },
                // splitter
                { height: 80, columnWidth: .50 },
                // splitter
                { height: 80, columnWidth: .25 }
            ]);

            panel.insert(2, makeItem({ height: 80, columnWidth: .50 }));

            var items = panel.items.items;

            expect(items.length).toBe(7);

            expect(! items[0].isSplitter).toBe(true);
            expect(items[1].isSplitter).toBe(true);
            expect(! items[2].isSplitter).toBe(true);

            expect(items[3].isSplitter).toBe(true);
            expect(items[3].el.getHeight()).toBe(0); // orphaned so hidden w/height=0

            expect(! items[4].isSplitter).toBe(true);
            expect(items[5].isSplitter).toBe(true);
            expect(! items[6].isSplitter).toBe(true);
        });

        it("should update splitters on add to four columns", function() {
            makePanel(parentConfig, [
                { height: 80, columnWidth: .25 },
                // splitter
                { height: 80, columnWidth: .50 },
                // splitter
                { height: 80, columnWidth: .50 },
                // splitter
                { height: 80, columnWidth: .50 }
            ]);

            panel.remove(2);

            var items = panel.items.items;

            expect(items.length).toBe(5);

            expect(! items[0].isSplitter).toBe(true);
            expect(items[1].isSplitter).toBe(true);
            expect(! items[2].isSplitter).toBe(true);

            expect(items[3].isSplitter).toBe(true);
            expect(items[3].el.getHeight()).toBe(0); // orphaned so hidden w/height=0

            expect(! items[4].isSplitter).toBe(true);
        });
    });
});
