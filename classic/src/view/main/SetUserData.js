/**
 * Class to view Login
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 08/07/2014
 */
/*
Se ja esta logado, nao pedir nada


Se logar, verificar se esta ativo o google ou nao

se nao estiver, passar direto

se tiver ativo, validar o codigo
*/
Ext.define('MBilling.view.main.SetUserData', {
    extend: 'Ext.window.Window',
    alias: 'widget.setuserdata',
    controller: 'main',
    glyph: icons.lock,
    title: t('Set the basic configuration'),
    autoShow: true,
    closable: false,
    resizable: false,
    draggable: false,
    width: 350,
    bodyPadding: 5,
    defaultType: 'textfield',
    layout: 'anchor',
    defaults: {
        labelAlign: 'right',
        anchor: '0',
        allowBlank: false,
        msgTarget: 'side',
        enableKeyEvents: true,
        plugins: 'markallowblank'
    },
    initComponent: function() {
        var me = this;
        me.items = [{
            vtype: 'textfield',
            fieldLabel: t('Email'),
            reference: 'email',
            labelWidth: 100,
            allowBlank: false,
            vtype: 'email',
            value: App.user.email == 'info@magnussolution.com' ? '' : App.user.email,
            hidden: !me.email
        }, {
            xtype: 'textfield',
            reference: 'currency',
            fieldLabel: t('Currency'),
            labelWidth: 100,
            allowBlank: false,
            value: App.user.currency == 0 ? '' : App.user.currency,
            hidden: !me.currency
        }, {
            xtype: 'countryisocombo',
            reference: 'countryiso',
            fieldLabel: t('Country'),
            labelWidth: 100,
            allowBlank: false,
            value: App.user.base_country.length != 3 ? 'USA' : App.user.base_country,
            hidden: !me.country
        }];
        me.bbar = [{
            text: t('Save'),
            reference: 'saveButton',
            glyph: icons.enter,
            width: 100,
            handler: 'onSetData'
        }];
        me.callParent(arguments);
    }
});