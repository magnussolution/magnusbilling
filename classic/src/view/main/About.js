/**
 * Class to window about
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 12/12/2012
 */
Ext.define('MBilling.view.main.About', {
    extend: 'Ext.window.Window',
    alias: 'widget.about',
    title: t('About'),
    resizable: false,
    autoShow: true,
    initComponent: function() {
        var me = this;
        me.html = '<table width="330">' + '<tr>' + '<td><div align="center"><img height="30" src="resources/images/logo.png"></div></td>' + '</tr>' + '<tr>' + '<td height="110" colspan="2">' + '<fieldset style="padding: 5px; font: 10px tahoma,arial,helvetica; color:#949494; border: 0px;">' + '<b> MagnusBilling is a FREE system to VoIP providers<br />' + '<br>' + '<b>' + t('Version') + ':</b> ' + App.user.version + '<br />' + '<br>' + '<b>' + t('Site') + ':</b> <a id="credits" target="_blank" href="http://www.magnusbilling.org">www.magnusbilling.org</a><br />' + '<br>' + '<b>' + t('Contact') + ':</b> <a id="credits" target="_blank" href="mailto:info@magnussolution.com">info@magnussolution.com</a><br />' + '<br />' + '<div align="center">© Copyright 2005-2024 - <a id="credits" target="_blank" href="http://www.magnussolution.com">MagnusSolution<a></div>' + '</fieldset>' + '</td>' + '</tr>' + '</table>';
        me.callParent(arguments);
    }
});