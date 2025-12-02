describe("AlternateClassName", function() { 
    describe("Ext.button.Button", function() {

        it("should have Ext.Button as the alternate class name", function() {
            expect(Ext.button.Button.prototype.alternateClassName).toEqual("Ext.Button");
        });

        it("should allow the use of Ext.Button", function() {
            expect(Ext.Button).toBeDefined();
        });

    });

    describe("Ext.button.Cycle", function() {

        it("should have Ext.CycleButton as the alternate class name", function() {
            expect(Ext.button.Cycle.prototype.alternateClassName).toEqual("Ext.CycleButton");
        });

        it("should allow the use of Ext.CycleButton", function() {
            expect(Ext.CycleButton).toBeDefined();
        });

    });

    describe("Ext.button.Split", function() {

        it("should have Ext.SplitButton as the alternate class name", function() {
            expect(Ext.button.Split.prototype.alternateClassName).toEqual("Ext.SplitButton");
        });

        it("should allow the use of Ext.SplitButton", function() {
            expect(Ext.SplitButton).toBeDefined();
        });

    });

    describe("Ext.container.ButtonGroup", function() {

        it("should have Ext.ButtonGroup as the alternate class name", function() {
            expect(Ext.container.ButtonGroup.prototype.alternateClassName).toEqual("Ext.ButtonGroup");
        });

        it("should allow the use of Ext.ButtonGroup", function() {
            expect(Ext.ButtonGroup).toBeDefined();
        });

    });

    describe("Ext.container.Container", function() {

        it("should have Ext.Container as the alternate class name", function() {
            expect(Ext.container.Container.prototype.alternateClassName).toEqual(["Ext.Container", "Ext.AbstractContainer"]);
        });

        it("should allow the use of Ext.Container", function() {
            expect(Ext.Container).toBeDefined();
        });

    });

    describe("Ext.container.Viewport", function() {

        it("should have Ext.Viewport as the alternate class name", function() {
            expect(Ext.container.Viewport.prototype.alternateClassName).toEqual("Ext.Viewport");
        });

        it("should allow the use of Ext.Viewport", function() {
            expect(Ext.Viewport).toBeDefined();
        });

    });

    describe("Ext.form.action.DirectLoad", function() {

        it("should have Ext.form.Action.DirectLoad as the alternate class name", function() {
            expect(Ext.form.action.DirectLoad.prototype.alternateClassName).toEqual("Ext.form.Action.DirectLoad");
        });

        it("should allow the use of Ext.form.Action.DirectLoad", function() {
            expect(Ext.form.Action.DirectLoad).toBeDefined();
        });

    });

    describe("Ext.form.action.DirectSubmit", function() {

        it("should have Ext.form.Action.DirectSubmit as the alternate class name", function() {
            expect(Ext.form.action.DirectSubmit.prototype.alternateClassName).toEqual("Ext.form.Action.DirectSubmit");
        });

        it("should allow the use of Ext.form.Action.DirectSubmit", function() {
            expect(Ext.form.Action.DirectSubmit).toBeDefined();
        });

    });

    describe("Ext.form.action.Load", function() {

        it("should have Ext.form.Action.Load as the alternate class name", function() {
            expect(Ext.form.action.Load.prototype.alternateClassName).toEqual("Ext.form.Action.Load");
        });

        it("should allow the use of Ext.form.Action.Load", function() {
            expect(Ext.form.Action.Load).toBeDefined();
        });

    });

    describe("Ext.form.action.Submit", function() {

        it("should have Ext.form.Action.Submit as the alternate class name", function() {
            expect(Ext.form.action.Submit.prototype.alternateClassName).toEqual("Ext.form.Action.Submit");
        });

        it("should allow the use of Ext.form.Action.Submit", function() {
            expect(Ext.form.Action.Submit).toBeDefined();
        });

    });

    describe("Ext.form.Basic", function() {

        it("should have Ext.form.BasicForm as the alternate class name", function() {
            expect(Ext.form.Basic.prototype.alternateClassName).toEqual("Ext.form.BasicForm");
        });

        it("should allow the use of Ext.form.BasicForm", function() {
            expect(Ext.form.BasicForm).toBeDefined();
        });

    });

    describe("Ext.form.field.Date", function() {

        it("should have Ext.form.DateField as the alternate class name", function() {
            expect(Ext.form.field.Date.prototype.alternateClassName).toEqual(["Ext.form.DateField", "Ext.form.Date"]);
        });

        it("should allow the use of Ext.form.DateField", function() {
            expect(Ext.form.DateField).toBeDefined();
        });

    });

    describe("Ext.form.field.Display", function() {

        it("should have Ext.form.DisplayField as the alternate class name", function() {
            expect(Ext.form.field.Display.prototype.alternateClassName).toEqual(["Ext.form.DisplayField", "Ext.form.Display"]);
        });

        it("should allow the use of Ext.form.DisplayField", function() {
            expect(Ext.form.DisplayField).toBeDefined();
        });

    });

    describe("Ext.form.field.Number", function() {

        it("should have Ext.form.NumberField as the alternate class name", function() {
            expect(Ext.form.field.Number.prototype.alternateClassName).toEqual(["Ext.form.NumberField", "Ext.form.Number"]);
        });

        it("should allow the use of Ext.form.NumberField", function() {
            expect(Ext.form.NumberField).toBeDefined();
        });

    });

    describe("Ext.form.field.Text", function() {

        it("should have Ext.form.TextField as the alternate class name", function() {
            expect(Ext.form.field.Text.prototype.alternateClassName).toEqual(["Ext.form.TextField", "Ext.form.Text"]);
        });

        it("should allow the use of Ext.form.TextField", function() {
            expect(Ext.form.TextField).toBeDefined();
        });

    });

    describe("Ext.form.field.Time", function() {

        it("should have Ext.form.TimeField as the alternate class name", function() {
            expect(Ext.form.field.Time.prototype.alternateClassName).toEqual(["Ext.form.TimeField", "Ext.form.Time"]);
        });

        it("should allow the use of Ext.form.TimeField", function() {
            expect(Ext.form.TimeField).toBeDefined();
        });

    });

    describe("Ext.layout.container.Card", function() {

        it("should have Ext.layout.CardLayout as the alternate class name", function() {
            expect(Ext.layout.container.Card.prototype.alternateClassName).toEqual("Ext.layout.CardLayout");
        });

        it("should allow the use of Ext.layout.CardLayout", function() {
            expect(Ext.layout.CardLayout).toBeDefined();
        });

    });

    describe("Ext.panel.Panel", function() {

        it("should have Ext.Panel as the alternate class name", function() {
            expect(Ext.panel.Panel.prototype.alternateClassName).toEqual("Ext.Panel");
        });

        it("should allow the use of Ext.Panel", function() {
            expect(Ext.Panel).toBeDefined();
        });

    });

    describe("Ext.picker.Color", function() {

        it("should have Ext.ColorPalette as the alternate class name", function() {
            expect(Ext.picker.Color.prototype.alternateClassName).toEqual("Ext.ColorPalette");
        });

        it("should allow the use of Ext.ColorPalette", function() {
            expect(Ext.ColorPalette).toBeDefined();
        });

    });

    describe("Ext.picker.Date", function() {

        it("should have Ext.DatePicker as the alternate class name", function() {
            expect(Ext.picker.Date.prototype.alternateClassName).toEqual("Ext.DatePicker");
        });

        it("should allow the use of Ext.DatePicker", function() {
            expect(Ext.DatePicker).toBeDefined();
        });

    });

    describe("Ext.picker.Month", function() {

        it("should have Ext.MonthPicker as the alternate class name", function() {
            expect(Ext.picker.Month.prototype.alternateClassName).toEqual("Ext.MonthPicker");
        });

        it("should allow the use of Ext.MonthPicker", function() {
            expect(Ext.MonthPicker).toBeDefined();
        });

    });

    describe("Ext.toolbar.Paging", function() {

        it("should have Ext.PagingToolbar as the alternate class name", function() {
            expect(Ext.toolbar.Paging.prototype.alternateClassName).toEqual("Ext.PagingToolbar");
        });

        it("should allow the use of Ext.PagingToolbar", function() {
            expect(Ext.PagingToolbar).toBeDefined();
        });

    });

    describe("Ext.toolbar.Toolbar", function() {

        it("should have Ext.Toolbar as the alternate class name", function() {
            expect(Ext.toolbar.Toolbar.prototype.alternateClassName).toEqual("Ext.Toolbar");
        });

        it("should allow the use of Ext.Toolbar", function() {
            expect(Ext.Toolbar).toBeDefined();
        });

    });

    describe("Ext.util.History", function() {

        it("should have Ext.History as the alternate class name", function() {
            expect(Ext.util.History.alternateClassName).toEqual("Ext.History");
        });

        it("should allow the use of Ext.History", function() {
            expect(Ext.History).toBeDefined();
        });

    });

    describe("Ext.util.KeyMap", function() {

        it("should have Ext.KeyMap as the alternate class name", function() {
            expect(Ext.util.KeyMap.prototype.alternateClassName).toEqual("Ext.KeyMap");
        });

        it("should allow the use of Ext.KeyMap", function() {
            expect(Ext.KeyMap).toBeDefined();
        });

    });

    describe("Ext.util.KeyNav", function() {

        it("should have Ext.KeyNav as the alternate class name", function() {
            expect(Ext.util.KeyNav.prototype.alternateClassName).toEqual("Ext.KeyNav");
        });

        it("should allow the use of Ext.KeyNav", function() {
            expect(Ext.KeyNav).toBeDefined();
        });

    });

    describe("Ext.view.BoundList", function() {

        it("should have Ext.BoundList as the alternate class name", function() {
            expect(Ext.view.BoundList.prototype.alternateClassName).toEqual("Ext.BoundList");
        });

        it("should allow the use of Ext.BoundList", function() {
            expect(Ext.BoundList).toBeDefined();
        });

    });

    describe("Ext.window.Window", function() {

        it("should have Ext.Window as the alternate class name", function() {
            expect(Ext.window.Window.prototype.alternateClassName).toEqual("Ext.Window");
        });

        it("should allow the use of Ext.Window", function() {
            expect(Ext.Window).toBeDefined();
        });

    });

});
