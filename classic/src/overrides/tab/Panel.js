Ext.define('Overrides.tab.Panel', {
    override: 'Ext.tab.Panel',
    activeTab: 0,
    plain: window.isThemeClassic,
    defaults: {
        border: !window.isThemeClassic
    }
});