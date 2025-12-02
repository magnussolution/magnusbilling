/**
 * Class to change password
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 02/01/2014
 */
//https://www.google.com/recaptcha/admin#list
Ext.define('MBilling.view.main.ForgetPassword', {
    extend: 'Ext.window.Window',
    alias: 'widget.forgetPassword',
    controller: 'main',
    title: t('Forgot your password?'),
    resizable: true,
    autoShow: true,
    width: 415,
    height: 150,
    titleWarning: t('Warning'),
    titleError: t('Error'),
    titleSuccess: t('Success'),
    titleConfirmation: t('Confirmation'),
    msgFormInvalid: t('Fill in the fields correctly.'),
    listeners: {
        scope: 'controller'
    },
    y: 55,
    items: {
        xtype: 'form',
        reference: 'formForgetPass',
        border: false,
        layout: 'anchor',
        bodyPadding: 5,
        defaults: {
            enableKeyEvents: true,
            allowBlank: false,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'textfield',
            name: 'email',
            vtype: 'email',
            reference: 'email',
            maxLength: 100,
            inputType: 'email',
            hideLabel: true,
            emptyText: t('Your') + ' ' + t('Email'),
            anchor: '0'
        }]
    },
    bbar: ['->', {
        text: t('Send'),
        width: 80,
        reference: 'saveForgetPass',
        glyph: icons.disk,
        handler: 'saveForgetPass'
    }]
});