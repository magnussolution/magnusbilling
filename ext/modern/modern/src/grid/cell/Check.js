/**
 * A Cell subclass which renders a checkbox in each column cell which toggles the truthiness
 * of the associated data field on click.
 *
 * This class should not be directly instantiated.  Instances are created automatically
 * when using a {@link Ext.grid.column.Check Check Column}.
 */
Ext.define('Ext.grid.cell.Check', {
    extend: 'Ext.grid.cell.Cell',
    xtype: 'checkcell',

    config: {
        /**
         * @cfg {Boolean} disabled
         * Whether or not this component is disabled
         */
        disabled: null
    },

    innerTemplate: [{
        reference: 'checkboxElement',
        classList:[
            Ext.baseCSSPrefix + 'checkbox-el',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }],

    classCls: Ext.baseCSSPrefix + 'checkcell',
    disabledCls: Ext.baseCSSPrefix + 'disabled',
    checkedCls: Ext.baseCSSPrefix + 'checked',

    constructor: function(config) {
        this.callParent([config]);

        this.checkboxElement.on('tap', 'onTap', this);
    },

    updateValue: function(value, oldValue) {
        var me = this,
            column = me.getColumn();

        value = !!value;
        me.el.toggleCls(me.checkedCls, !!value);

        // Keep column header state up to date.
        if (value) {
            column.updateHeaderState();
        } else {
            column.setHeaderStatus(value);
        }
    },

    updateColumn: function(column, olcColumn) {
        this.callParent([column, olcColumn]);
        if (column) {
            this.setDisabled(column.getDisabled());
        }
    },

    applyDisabled: function(disabled) {
        return Boolean(disabled);
    },

    updateDisabled: function(disabled) {
        this.element.toggleCls(this.disabledCls, disabled);
    },

    /**
     * Disables this CheckCell
     */
    disable: function() {
       this.setDisabled(true);
    },

    /**
     * Enables this CheckCell
     */
    enable: function() {
        this.setDisabled(false);
    },

    onTap: function(e) {
        var me = this,
            record = me.getRecord(),
            column = me.getColumn(),
            recordIndex = column.up('grid').getStore().indexOf(record),
            checked;

        if (record) {
            checked = !column.isRecordChecked(record);
            if (me.getDisabled()) {
                return;
            }

            if (column.fireEvent('beforecheckchange', me, recordIndex, checked, record, e) !== false) {
                if (me.getColumn().getStopSelection()) {
                    e.stopSelection = true;
                }

                if (record) {
                    column.setRecordChecked(record, checked);
                }
                if (column.hasListeners.checkchange) {
                    column.fireEvent('checkchange', me, recordIndex, checked, record, e);
                }
            }
        }
    }
});
