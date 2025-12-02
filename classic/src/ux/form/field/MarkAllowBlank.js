/**
 * Plugin to mark field required
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 10/07/2014
 */
Ext.define('Ext.ux.form.field.MarkAllowBlank', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.markallowblank',
    init: function(component) {
        var me = this;
        me.component = component;
        me.component.setAllowBlank = me.setAllowBlank;
        me.component.on('afterrender', function() {
            me.setAllowBlank(me.component.allowBlank);
        });
    },
    setAllowBlank: function(allowBlank) {
        var me = this,
            cmp = me.component || me,
            style = allowBlank ? {
                'border-right': '0px'
            } : {
                'border-right': '1px solid red',
                'padding-right': '1px'
            };
        cmp.allowBlank = allowBlank;
        if (!Ext.isEmpty(cmp.labelEl)) {
            cmp.labelEl.setStyle(style);
        }
    }
});