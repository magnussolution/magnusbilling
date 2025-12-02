Ext.namespace('Ext.theme.is').iOS = true;
Ext.theme.name = 'iOS';

Ext.theme.getDocCls = function() {
    return Ext.platformTags.desktop ? '' : 'x-big';
};
