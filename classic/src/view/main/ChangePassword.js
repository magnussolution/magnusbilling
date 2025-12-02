/**
 * Class to change password
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 02/01/2014
 */
Ext.define('MBilling.view.main.ChangePassword', {
    extend: 'Ext.window.Window',
    alias: 'widget.changepassword',
    controller: 'changepassword',
    title: t('Change password'),
    resizable: false,
    autoShow: true,
    width: 400,
    height: !Ext.Boot.platformTags.desktop ? 205 : window.isThemeNeptune ? 165 : window.isThemeCrisp ? 160 : window.isThemeTriton ? 220 : 145,
    titleWarning: t('Warning'),
    titleError: t('Error'),
    titleSuccess: t('Success'),
    titleConfirmation: t('Confirmation'),
    msgFormInvalid: t('Fill in the fields correctly.'),
    listeners: {
        scope: 'controller',
        show: 'onShowWinChangePass'
    },
    items: {
        xtype: 'form',
        reference: 'formChangePass',
        border: false,
        layout: 'anchor',
        bodyPadding: 5,
        defaults: {
            enableKeyEvents: true,
            allowBlank: false,
            msgTarget: 'side',
            listeners: {
                keyup: 'checkKeyEnterChangePass'
            }
        },
        items: [{
            xtype: 'textfield',
            name: 'current_password',
            maxLength: 100,
            inputType: 'password',
            hideLabel: true,
            emptyText: t('Current password'),
            anchor: '0'
        }, {
            xtype: 'textfield',
            name: 'password',
            inputType: 'password',
            maxLength: 100,
            hideLabel: true,
            emptyText: t('New password'),
            anchor: '0'
        }]
    },
    bbar: ['->', {
        text: t('Save'),
        width: 100,
        reference: 'saveChangePass',
        glyph: icons.disk,
        handler: 'savePassword'
    }]
});