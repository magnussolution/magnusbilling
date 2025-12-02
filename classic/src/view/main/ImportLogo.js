/**
 * Class to window about
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 12/12/2012
 */
Ext.define('MBilling.view.main.ImportLogo', {
    extend: 'Ext.window.Window',
    alias: 'widget.importlogo',
    title: t('Import logo'),
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
        reference: 'formImportLogo',
        border: false,
        layout: 'anchor',
        bodyPadding: 5,
        defaults: {
            enableKeyEvents: true,
            msgTarget: 'side'
        },
        items: [{
            xtype: 'uploadfield',
            name: 'logo',
            fieldLabel: t('Select file'),
            emptyText: t('Only PNG format') + '. ' + t('Height') + ' 60px',
            allowBlank: false,
            extAllowed: window.isDesktop ? ['jpg'] : ['png'],
            anchor: '0'
        }]
    },
    bbar: ['->', {
        text: t('Save'),
        reference: 'saveImportLogo',
        glyph: icons.disk,
        width: 100,
        handler: 'saveLogo'
    }]
});