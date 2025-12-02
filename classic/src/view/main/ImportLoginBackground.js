/**
 * Class to window about
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 12/12/2012
 */
Ext.define('MBilling.view.main.ImportLoginBackground', {
    extend: 'Ext.window.Window',
    alias: 'widget.importloginbackground',
    title: t('Import Login Background'),
    controller: 'main',
    resizable: false,
    autoShow: true,
    width: 500,
    height: !Ext.Boot.platformTags.desktop ? 205 : window.isThemeNeptune ? 165 : window.isThemeCrisp ? 160 : 145,
    titleWarning: t('Warning'),
    titleError: t('Error'),
    titleSuccess: t('Success'),
    titleConfirmation: t('Confirmation'),
    msgFormInvalid: t('Fill in the fields correctly.'),
    items: {
        xtype: 'form',
        reference: 'formImportLoginBackground',
        border: false,
        layout: 'anchor',
        bodyPadding: 5,
        defaults: {
            enableKeyEvents: true,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'uploadfield',
            name: 'loginbackground',
            fieldLabel: t('Select file'),
            emptyText: t('Only JPEG format'),
            allowBlank: false,
            extAllowed: ['jpg', 'jpeg'],
            anchor: '0'
        }]
    },
    bbar: ['->', {
        text: t('Save'),
        reference: 'saveImportLoginBackground',
        glyph: icons.disk,
        width: 100,
        handler: 'saveImportLoginBackground'
    }]
});