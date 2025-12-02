/**
 * Module to management of "Pedido"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 19/03/2014
 */
Ext.define('MBilling.view.configuration.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.configuration',
    onAfterSave: function(formPanel) {
        var me = this,
            form = me.formPanel.getForm(),
            record = form.getRecord(),
            key = record['data']['config_key'];
        formPanel = formPanel || me.formPanel;
        if (!formPanel.idRecord) {
            formPanel.getForm().reset();
            me.focusFirstField();
        }
        me.saveButton.enable();
        me.updateLotButton && me.updateLotButton.toggle(false);
        formPanel.setLoading(false);
        me.formPanel.collapse();
        me.store.load();
        me.logoutKey(key);
    },
    logoutKey: function(key) {
        var me = this;
        if (key == 'licence' || key == 'base_language') {
            localStorage.setItem('day', '');
            localStorage.setItem('lang', '');
        }
        if (key == 'licence') {
            Ext.Ajax.request({
                url: 'index.php/authentication/logoff',
                success: function() {
                    App.user.logged = false;
                    location.reload();
                }
            });
        }
    }
});