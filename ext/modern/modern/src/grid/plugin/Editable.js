/**
 * @class Ext.grid.plugin.Editable
 *
 * The Editable plugin injects editing at a row level for Modern Toolkit's
 * Grid. Editing begins by double-tapping a row.  This can be set to any event, which we'll
 * discuss below. The editor consists of a small positioned dialog that be shown on the right
 * side of your viewport.
 *
 * There is a button to save or cancel all changes for the edit in the toolbar, and the
 * row is deletable by default.
 *
 * The default editable grid can be defined like so:
 *
 *     @example
 *     Ext.create({
 *         xtype: 'grid',
 *         fullscreen: true,
 *         plugins: 'grideditable',
 *         store: {
 *             fields: [],
 *             data: [{
 *                 name: 'Jake'
 *             }, {
 *                 name: 'Finn'
 *             }]
 *         },
 *         columns: [{
 *             text: 'Name',
 *             dataIndex: 'name',
 *             flex: 1,
 *             editable: true
 *         }]
 *     });
 *
 * By opening up the plugins type as an object (or an array of objects), you can modify your
 * editor more significantly.  You can see the changeable bits below:
 *
 *     @example
 *     Ext.create({
 *         xtype: 'grid',
 *         fullscreen: true,
 *         plugins: {
 *             type: 'grideditable',
 *             triggerEvent: 'doubletap',
 *             enableDeleteButton: true,
 *             formConfig: null, // See more below
 *
 *             defaultFormConfig: {
 *                 xtype: 'formpanel',
 *                 scrollable: true,
 *                 items: {
 *                     xtype: 'fieldset'
 *                 }
 *             },
 *
 *             toolbarConfig: {
 *                 xtype: 'titlebar',
 *                 docked: 'top',
 *                 items: [{
 *                     xtype: 'button',
 *                     ui: 'decline',
 *                     text: 'Cancel',
 *                     align: 'left',
 *                     action: 'cancel'
 *                 }, {
 *                     xtype: 'button',
 *                     ui: 'confirm',
 *                     text: 'Submit',
 *                     align: 'right',
 *                     action: 'submit'
 *                 }]
 *             },
 *         },
 *         store: {
 *             fields: [],
 *             data: [{
 *                 name: 'Jake'
 *             }, {
 *                 name: 'Finn'
 *             }]
 *         },
 *         columns: [{
 *             text: 'Name',
 *             dataIndex: 'name',
 *             flex: 1,
 *             editable: true
 *         }]
 *     });
 *
 *  As you can see, you can easily modify nearly every bit of the editor window.  As mentioned
 *  above, the toolbar and delete button are the only components included by default.  That's
 *  where formConfig comes into play.
 *
 *  By adding formConfig, you can hardcode the form that gets created when editing a row.
 *  There are no fields set on the form initially, so you will need to define them
 *  yourself.  For example, if you had a "name" column, and you wanted it to be editable,
 *  you would do something like this in your plugins object:
 *
 *     formConfig: {
 *        items: [{
 *           xtype: 'textfield',
 *           name: 'name',
 *           label: 'Name'
 *        }]
 *     }
 *
 *  Now, upon opening the editor, you would see a textfield populated with the editable value from
 *  its corresponding record.
 *
 *  If you want to alter certain form configurations, but still have the default editor fields applied, use
 *  the defaultFormConfig instead.
 */
Ext.define('Ext.grid.plugin.Editable', {
    extend: 'Ext.Component',
    alias: 'plugin.grideditable' ,

    config: {
        /**
         * @private
         */
        grid: null,

        /**
         * @cfg {String} triggerEvent
         * The event used to trigger the showing of the editor form.
         */
        triggerEvent: 'doubletap',

        /**
         * @cfg {Object} formConfig
         * By changing the formConfig you can hardcode the form that gets created when editing a row.
         * Note that the fields are not set on this form, so you will have to define them yourself in this config.
         * If you want to alter certain form configurations, but still have the default editor fields applied, use
         * the defaultFormConfig instead.
         */
        formConfig: null,

        /**
         * Configures the default form appended to the editable panel.
         */
        defaultFormConfig: {
            xtype: 'formpanel',
            scrollable: true,
            items: {
                xtype: 'fieldset'
            }
        },

        /**
         * Configures the toolbar appended to the editable panel.
         */
        toolbarConfig: {
            xtype: 'titlebar',
            docked: 'top',
            items: [{
                xtype: 'button',
                ui: 'decline',
                text: 'Cancel',
                align: 'left',
                action: 'cancel'
            }, {
                xtype: 'button',
                ui: 'confirm',
                text: 'Submit',
                align: 'right',
                action: 'submit'
            }]
        },

        /**
         *  Creates a delete button, which allows the user to delete the selected row.
         */
        enableDeleteButton: true
    },

    init: function(grid) {
        this.setGrid(grid);

        grid.setTouchAction({
            doubleTapZoom: false
        });
    },

    updateGrid: function(grid, oldGrid) {
        var triggerEvent = this.getTriggerEvent();
        if (oldGrid) {
            oldGrid.renderElement.un(triggerEvent, 'onTrigger', this);
        }

        if (grid) {
            grid.renderElement.on(triggerEvent, 'onTrigger', this);
        }
    },

    onCancelTap: function() {
        this.sheet.hide();
    },

    onSubmitTap: function() {
        this.form.getRecord().set(this.form.getValues());
        this.sheet.hide();
    },

    onSheetHide: function() {
        this.sheet.destroy();
        this.form = null;
        this.sheet = null;
    },

    getRecordByTriggerEvent: function(e) {
        var rowEl = e.getTarget('.' + Ext.baseCSSPrefix + 'gridrow'),
            row;

        if (rowEl) {
            row = Ext.getCmp(rowEl.id);
            if (row) {
                return row.getRecord();
            }
        }

        return null;
    },

    getEditorFields: function(columns) {
        var fields = [],
            ln = columns.length,
            i, column, editor;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            if (column.getEditable()) {
                editor = Ext.apply({}, column.getEditor() || column.getDefaultEditor());
                editor.label = column.getText();
                fields.push(editor);
            }
        }

        return fields;
    },

    onTrigger: function(e) {
        var me = this,
            grid = me.getGrid(),
            formConfig = me.getFormConfig(),
            toolbarConfig = me.getToolbarConfig(),
            record = me.getRecordByTriggerEvent(e),
            fields, form, sheet, toolbar;

        if (record) {
            if (formConfig) {
                this.form = form = Ext.factory(formConfig, Ext.form.Panel);
            } else {
                this.form = form = Ext.factory(me.getDefaultFormConfig());

                fields = me.getEditorFields(grid.getColumns());
                form.down('fieldset').setItems(fields);
            }

            form.setRecord(record);

            toolbar = Ext.factory(toolbarConfig, Ext.form.TitleBar);
            toolbar.down('button[action=cancel]').on('tap', 'onCancelTap', this);
            toolbar.down('button[action=submit]').on('tap', 'onSubmitTap', this);

            this.sheet = sheet = grid.add({
                xtype: 'sheet',
                items: [toolbar, form],
                hideOnMaskTap: true,
                enter: 'right',
                exit: 'right',
                centered: false,
                right: 0,
                width: 320,
                layout: 'fit',
                stretchY: true,
                hidden: true
            });

            if (me.getEnableDeleteButton()) {
                form.add({
                    xtype: 'button',
                    text: 'Delete',
                    ui: 'decline',
                    margin: 10,
                    handler: function() {
                        grid.getStore().remove(record);
                        sheet.hide();
                    }
                });
            }

            sheet.on('hide', 'onSheetHide', this);

            sheet.show();
        }
    }
});
