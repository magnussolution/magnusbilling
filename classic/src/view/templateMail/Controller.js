/**
 * Class define the model "Produto"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/06/2013
 */
Ext.define('MBilling.view.templateMail.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.templatemail',
    onAfterSave: function(formPanel) {
        var me = this;
        formPanel = formPanel || me.formPanel;
        if (!formPanel.idRecord) {
            formPanel.getForm().reset();
            me.focusFirstField();
        }
        me.saveButton.enable();
        me.updateLotButton && me.updateLotButton.toggle(false);
        formPanel.setLoading(false);
        me.store.load();
    },
    onEdit: function() {
        var me = this;
        me.formPanel.reset();
        me.lookupReference('generalTab').show();
        me.callParent(arguments);
    }
});