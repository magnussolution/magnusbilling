describe("Ext.field.Checkbox", function() {

    var field, container;

    function makeField(cfg) {
        field = new Ext.field.Checkbox(cfg);
        field.renderTo(Ext.getBody());
    }

    function makeForm() {
        container = new Ext.Container({
            items: [{
                xtype: 'formpanel',
                itemId: 'form1',
                items: [{
                    xtype: 'fieldset',
                    title: 'Action Item',
                    items: [{
                        xtype: 'radiofield',
                        itemId: 'status1',
                        name: 'status',
                        value: 'Open'
                    }, {
                        xtype: 'radiofield',
                        itemId: 'status2',
                        name: 'status',
                        value: 'Closed'
                    }]
                },{
                    xtype: 'fieldset',
                    title: 'Alt Item',
                    items: [{
                        xtype: 'radiofield',
                        itemId: 'status3',
                        name: 'status',
                        value: 'In Progress'
                    }, {
                        xtype: 'radiofield',
                        itemId: 'status4',
                        name: 'status',
                        value: 'Pending'
                    }]
                }]
            },
            {
                xtype: 'formpanel',
                itemId: 'form2',
                items: [{
                    xtype: 'fieldset',
                    items: [{
                        xtype: 'textfield',
                        itemId: 'status5',
                        name: 'status'
                    }]
                }]
            }]
        });
        container.renderTo(Ext.getBody());
    } 

    function makeFieldset() {
        container = new Ext.Container({
            items: [{
                xtype: 'fieldset',
                itemId: 'fieldset1',
                items: [{
                    xtype: 'radiofield',
                    itemId: 'status1',
                    name: 'status',
                    value: 'Open'
                }, {
                    xtype: 'radiofield',
                    itemId: 'status2',
                    name: 'status',
                    value: 'Closed'
                }]
            },
            {
                xtype: 'fieldset',
                itemId: 'fieldset2',
                items: [{
                    xtype: 'textfield',
                    itemId: 'status5',
                    name: 'status'
                }]
            }]
        });
        container.renderTo(Ext.getBody());
    }

    describe("binding", function() {
        afterEach(function() {
            field = Ext.destroy(field);
        });
        describe("publish with reference", function() {
            it("should publish the checked state if checked: false", function() {
                var vm;
                makeField({
                    reference: 'fooField',
                    viewModel: {}
                });
                vm = field.getViewModel();
                vm.notify();
                expect(vm.get('fooField.checked')).toBe(false);

            });

            it("should publish the checked state if checked: true", function() {
                var vm;
                makeField({
                    reference: 'fooField',
                    checked: true,
                    viewModel: {}
                });
                vm = field.getViewModel();
                vm.notify();
                expect(vm.get('fooField.checked')).toBe(true);
            });
        });
    });

    describe("getSameGroupFields", function() {
        afterEach(function() {
            if(container) {
                container = Ext.destroy(container);
            }
        });
        describe("retrieving descendant components", function() {
            it("should return fields with the same name within the parent form", function() {
                var form, radio, children;
                makeForm();

                form = container.down('#form1');
                radio = container.down('#status1');

                children = radio.getSameGroupFields();

                expect(children.length).toBe(4);        
            });

            it("should return fields with the same name within the parent fieldset", function() {
                var fieldset, radio, children;
                makeFieldset();

                fieldset = container.down('#fieldset1');
                radio = container.down('#status1');

                children = radio.getSameGroupFields();

                expect(children.length).toBe(2);
            });

            it("should return only the checkboxes/radio fields", function() {
                var types=[],
                    form, radio, children;

                makeForm();

                form = container.down('#form1');
                radio = container.down('#status1');

                children = radio.getSameGroupFields();
                children.forEach(function(child) {
                    types.push(child.xtype); 
                });

                expect(types).toEqual(['radiofield', 'radiofield', 'radiofield', 'radiofield']);
            });
        });
    });
});