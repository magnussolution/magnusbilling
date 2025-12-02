describe('Ext.field.Select', function() {
    var field, 
        viewport,
        createField = function(config) {
            if (field) {
                field.destroy();
            }

            field = Ext.create('Ext.field.Select', config || {});
        },
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore;

    beforeEach(function() {
        // Override so that we can control asynchronous loading
        loadStore = Ext.data.ProxyStore.prototype.load = function() {
            proxyStoreLoad.apply(this, arguments);
            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }
            return this;
        };
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;

        if (field) {
            field.destroy();
        }
        viewport = Ext.Viewport = Ext.destroy(viewport, Ext.Viewport);
    });

    describe("configurations", function() {
        describe("options", function() {
            beforeEach(function() {
                createField({
                    options: [
                        {text: 'One', value: 1},
                        {text: 'Two', value: 2},
                        {text: 'Three', value: 3}
                    ]
                });
            });

            it("should create a store with 3 items", function() {
                expect(field.getStore().getCount()).toEqual(3);
            });

            it("should set the value configuration to the first item", function() {
                expect(field.getSelection()).toEqual(field.getStore().getAt(0));
            });

            describe("with value", function() {
                beforeEach(function() {
                    createField({
                        value: 3,
                        options: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    });
                });

                it("should create a store with 3 items", function() {
                    expect(field.getStore().getCount()).toEqual(3);
                });

                it("should set the value configuration to the third item", function() {
                    expect(field.getSelection()).toEqual(field.getStore().getAt(2));
                    expect(field.getSelection().get('value')).toEqual(3);
                    expect(field.getSelection().get('text')).toEqual('Three');
                    expect(field.getValue()).toEqual(3);
                });
            });
        });

        describe("store", function() {
            beforeEach(function() {
                createField({
                    store: {
                        fields: ['text', 'value'],
                        data: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    }
                });
            });

            it("should create a store with 3 items", function() {
                expect(field.getStore().getCount()).toEqual(3);
            });

            describe("with value", function() {
                beforeEach(function() {
                    createField({
                        value: 3,
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should create a store with 3 items", function() {
                    expect(field.getStore().getCount()).toEqual(3);
                });

                it("should set the value configuration to the third item", function() {
                    expect(field.getSelection()).toEqual(field.getStore().getAt(2));
                    expect(field.getSelection().get('value')).toEqual(3);
                    expect(field.getSelection().get('text')).toEqual('Three');
                    expect(field.getValue()).toEqual(3);
                });
            });
        });

        describe("value", function() {
            describe("0", function() {
                beforeEach(function() {
                    createField({
                        value: 0,
                        options: [
                            {text: 'One', value: 0},
                            {text: 'Two', value: 1},
                            {text: 'Three', value: 2}
                        ]
                    });
                });

                it("should set the value after adding options", function() {
                    expect(field.getValue()).toEqual(0);
                });
            });

            describe("1", function() {
                beforeEach(function() {
                    createField({
                        value: 1,
                        options: [
                            {text: 'One', value: 0},
                            {text: 'Two', value: 1},
                            {text: 'Three', value: 2}
                        ]
                    });
                });

                it("should set the value after adding options", function() {
                    expect(field.getValue()).toEqual(1);
                });
            });

            describe("default value", function() {
                describe("none", function() {
                    beforeEach(function() {
                        createField();
                    });

                    it("should set the value after adding options", function() {
                        expect(field.getValue()).toEqual(null);

                        field.setStore({
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        });

                        //autoSelect
                        expect(field.getValue()).toEqual(1);
                    });
                });

                describe("value", function() {
                    beforeEach(function() {
                        createField({
                            value: 3
                        });
                    });

                    it("should set the value after adding options", function() {
                        expect(field.getValue()).toEqual(null);

                        field.setStore({
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        });

                        expect(field.getValue()).toEqual(3);
                    });
                });

                describe("setValue", function() {
                    describe("with value and store", function() {
                        beforeEach(function() {
                            createField({
                                value: 3,
                                store: {
                                    fields: ['text', 'value'],
                                    data: [
                                        {text: 'One', value: 1},
                                        {text: 'Two', value: 2},
                                        {text: 'Three', value: 3}
                                    ]
                                }
                            });
                        });

                        it("should set to null", function() {
                            expect(field.getValue()).toEqual(3);
                            field.setValue(null);
                            expect(field.getValue()).toEqual(null);
                        });
                    });

                    describe("with no value", function() {
                        beforeEach(function() {
                            createField();
                        });

                        it("should set to null", function() {
                            expect(field.getValue()).toEqual(null);
                            field.setStore({
                                fields: ['text', 'value'],
                                data: [
                                    {text: 'One', value: 1},
                                    {text: 'Two', value: 2},
                                    {text: 'Three', value: 3}
                                ]
                            });
                            expect(field.getValue()).toEqual(1);
                            field.setValue(null);
                            expect(field.getValue()).toEqual(null);
                        });
                    });

                    describe("with value and late store", function(){
                        beforeEach(function() {
                            createField();
                        });

                        it("should wait to set value until store is set", function() {
                            expect(field.getValue()).toEqual(null);
                            field.setValue(2);
                            expect(field.getValue()).toEqual(null);
                            field.setStore({
                                fields: ['text', 'value'],
                                data: [
                                    {text: 'One', value: 1},
                                    {text: 'Two', value: 2},
                                    {text: 'Three', value: 3}
                                ]
                            });
                            expect(field.getValue()).toEqual(2);
                            field.setValue(null);
                            expect(field.getValue()).toEqual(null);
                        });
                    });
                });
            });
        });

        describe("autoSelect", function() {
            describe("when on", function() {
                beforeEach(function() {
                    createField({
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should set the value configuration to the first item", function() {
                    expect(field.getSelection()).toEqual(field.getStore().getAt(0));
                });
            });

            describe("when off", function() {
                beforeEach(function() {
                    createField({
                        autoSelect: false,
                        store: {
                            fields: ['text', 'value'],
                            data: [
                                {text: 'One', value: 1},
                                {text: 'Two', value: 2},
                                {text: 'Three', value: 3}
                            ]
                        }
                    });
                });

                it("should set the value to null", function() {
                    expect(field.getSelection()).toEqual(null);
                });
            });
        });
    });

    describe("TOUCH-2431", function() {
        it("should use store configuration", function() {
            Ext.define('Ext.MySelect', {
                extend: 'Ext.field.Select',

                config: {
                    store: {
                        fields: ['name', 'value'],
                        data: [
                            {
                                name: 'one',
                                value: 1
                            },
                            {
                                name: 'two',
                                value: 2
                            }
                        ]
                    }
                }
            });

            var select = Ext.create('Ext.MySelect');
            expect(select.getStore().getCount()).toEqual(2);
            
            select.destroy();
        });
    });

    describe("events", function() {
        describe("change", function() {
            describe("without options", function() {
                beforeEach(function() {
                    createField();
                });

                it("should only fire change once when adding options", function() {
                    var spy = jasmine.createSpy();

                    field.on('change', spy);

                    field.setOptions([
                        {text: 'One', value: 1},
                        {text: 'Two', value: 2},
                        {text: 'Three', value: 3}
                    ]);

                    expect(spy.callCount).toBe(1);
                });
            });

            describe("with options", function() {
                beforeEach(function() {
                    createField({
                        options: [
                            {text: 'One', value: 1},
                            {text: 'Two', value: 2},
                            {text: 'Three', value: 3}
                        ]
                    });
                });

                it("should fire when you change the value", function() {
                    var spy = jasmine.createSpy();

                    field.on('change', spy);

                    field.setValue(2);

                    expect(spy.callCount).toBe(1);
                });

                it("should not fire when you dont change the value", function() {
                    var spy = jasmine.createSpy();

                    field.on('change', spy);

                    field.setValue(1);

                    expect(spy).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("methods", function() {
        describe("reset", function() {
            describe("when autoSelect is on", function() {
                beforeEach(function() {
                    createField({
                        store : {
                            fields : ['text', 'value'],
                            data   : [
                                { text : 'One',   value : 1 },
                                { text : 'Two',   value : 2 },
                                { text : 'Three', value : 3 }
                            ]
                        }
                    });

                    field.setValue(3);
                });

                it("should set the value configuration to the first item", function() {
                    field.reset();

                    expect(field.getSelection()).toBe(field.getStore().getAt(0));
                });
            });

            describe("when autoSelect is off", function() {
                beforeEach(function() {
                    createField({
                        autoSelect : false,
                        store      : {
                            fields  : ['text', 'value'],
                            data    : [
                                { text : 'One',   value : 1 },
                                { text : 'Two',   value : 2 },
                                { text : 'Three', value : 3 }
                            ]
                        }
                    });

                    field.setValue(3);
                });

                it("should set the value to null", function() {
                    field.reset();

                    expect(field.getSelection()).toBe(null);
                });
            });
        });

        describe("showPicker", function() {
            beforeEach(function() {
                viewport = Ext.Viewport = new Ext.viewport.Default();
                
                createField({
                    usePicker: false,
                    store: {
                        fields: ['text', 'value'],
                        data: (function() {
                            var data = [], i;
                            for(i=0; i<100; i++) {
                                data.push({text: i, value: i});
                            }
                            return data;
                        })()
                    }
                });

                viewport.add(field);
            });

            it("should scroll to initial value", function() {
                var scrollComplete = false,
                    resizeSpy = spyOn(field, 'onTabletPickerResize').andCallThrough(),
                    item, scroller, scrollHeight, scrollMin, scrollMax,
                    offset, picker, list;

                field.setValue(45);
                field.showPicker();
                
                picker = field.getTabletPicker();
                list = picker.down('list');
                scroller = list.getScrollable();

                scroller.on('scrollend', function() {
                    scrollComplete = true;
                }); 

                waitsFor(function() {
                    return scrollComplete;
                }, 'slot to scroll selection into view', 800);
                runs(function() {
                    item = list.getItemAt(45);
                    scrollHeight = picker.element.getHeight();
                    scrollMin = scroller.getPosition().y;                    
                    scrollMax = scrollMin+scrollHeight;
                    offset = item.renderElement.dom.offsetTop;

                    expect(resizeSpy).toHaveBeenCalled();
                    expect(resizeSpy.callCount).toBe(1);
                });                
            });

            it("should scroll to selected value", function() {
                var scrollComplete = false,
                    scrollSpy = spyOn(field, 'scrollToSelection').andCallThrough(),
                    item, scroller, scrollHeight, scrollMin, scrollMax,
                    offset, picker, list;

                field.showPicker();
                field.setValue(78);

                picker = field.getTabletPicker();
                list = picker.down('list');
                scroller = list.getScrollable();

                scroller.on('scrollend', function() {
                    scrollComplete = true;
                }); 

                waitsFor(function() {
                    return scrollComplete;
                }, 'slot to scroll selection into view', 800);
                runs(function() {
                    item = list.getItemAt(78);
                    scrollHeight = picker.element.getHeight();
                    scrollMin = scroller.getPosition().y;                    
                    scrollMax = scrollMin+scrollHeight;
                    offset = item.renderElement.dom.offsetTop;

                    expect(scrollSpy).toHaveBeenCalled();
                    // should be between the current scroll position and max height of scrollable area
                    expect(offset >= scrollMin && offset <= scrollMax).toBeTruthy();
                });
            });
        });
    });
});
