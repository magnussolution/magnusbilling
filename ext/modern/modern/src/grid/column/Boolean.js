/**
 * A Column definition class which renders boolean data fields.  See the {@link Ext.grid.column.Column#xtype xtype}
 * config option of {@link Ext.grid.column.Column} for more details.
 *
 *     @example
 *     Ext.create('Ext.data.Store', {
 *        storeId:'sampleStore',
 *        fields:[
 *            {name: 'framework', type: 'string'},
 *            {name: 'rocks', type: 'boolean'}
 *        ],
 *        data:{ items:[
 *            { framework: "Ext JS",     rocks: true  },
 *            { framework: "Ext GWT",    rocks: true  },
 *            { framework: "Other Guys", rocks: false }
 *        ]}
 *     });
 *
 *     Ext.create('Ext.grid.Grid', {
 *         store: Ext.data.StoreManager.lookup('sampleStore'),
 *         columns: [
 *             { text: 'Framework',  dataIndex: 'framework', flex: 1 },
 *             {
 *                 xtype: 'booleancolumn',
 *                 text: 'Rocks',
 *                 trueText: 'Yes',
 *                 falseText: 'No',
 *                 dataIndex: 'rocks'
 *             }
 *         ],
 *         height: 200,
 *         width: 400
 *     });
 */
Ext.define('Ext.grid.column.Boolean', {
    extend: 'Ext.grid.column.Column',

    requires: ['Ext.grid.cell.Boolean'],

    xtype: 'booleancolumn',

    config: {
        /**
         * @cfg {String} trueText
         * The string returned by the renderer when the column value is not falsey.
         */
        trueText: null,

        /**
         * @cfg {String} falseText
         * The string returned by the renderer when the column value is falsey (but not undefined).
         */
        falseText: null,

        /**
         * @cfg {String} undefinedText
         * The string returned by the renderer when the column value is undefined.
         */
        undefinedText: null,

        defaultEditor: {
            xtype: 'checkboxfield'
        },

        cell: {
            xtype: 'booleancell'
        }
    }
});