/**
 * @class Ext.list.Tree
 */
Ext.define('Ext.overrides.list.Tree', {
    override: 'Ext.list.Tree',

    constructor: function(config) {
        var me = this,
            el;

        me.callParent([config]);
        el = me.element;
        if (el.isPainted()) {
            me.syncIconSize();
        } else {
            el.on({
                scope: me,
                painted: me.syncIconSize,
                single: true
            });
        }
    }
});