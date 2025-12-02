/**
 * Class to define form to "GroupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.groupUser.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.groupuserform',
    requires: ['Ext.ux.form.field.Permission'],
    header: false,
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'tabpanel',
            defaults: {
                border: false,
                defaultType: 'textfield',
                layout: 'anchor',
                bodyPadding: 5,
                defaults: {
                    plugins: 'markallowblank',
                    allowBlank: false,
                    anchor: '100%',
                    enableKeyEvents: true,
                    labelWidth: 180
                }
            },
            items: [{
                title: t('General'),
                reference: 'generalTab',
                items: [{
                    name: 'name',
                    fieldLabel: t('Name'),
                    maxLength: 100
                }, {
                    xtype: 'usertypecombo',
                    name: 'id_user_type',
                    fieldLabel: t('User type')
                }, {
                    xtype: 'noyescombo',
                    name: 'hidden_prices',
                    fieldLabel: t('Hide prices'),
                    hidden: true
                }, {
                    xtype: 'noyescombo',
                    name: 'hidden_batch_update',
                    fieldLabel: t('Hide batch update button'),
                    hidden: true
                }]
            }, {
                title: t('Permissions'),
                items: [{
                    xtype: 'permissionfield',
                    hideLabel: true,
                    anchor: '100% ' + (!Ext.Boot.platformTags.desktop ? '82%' : window.isThemeNeptune ? '87%' : '89%'),
                    allowBlank: true
                }]
            }]
        }];
        me.callParent(arguments);
    }
});