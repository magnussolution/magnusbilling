/**
 * @private
 */
Ext.define('Ext.device.analytics.Cordova', {
    extend: 'Ext.device.analytics.Abstract',

    trackEvent: function(config) {
        if (!this.getAccountID()) {
            return;
        }

        window.plugins.googleAnalyticsPlugin.trackEvent(
            config.category,
            config.action,
            config.label,
            config.value,
            config.nonInteraction
        );
    },

    trackPageview: function(page) {
        if (!this.getAccountID()) {
            return;
        }

        window.plugins.googleAnalyticsPlugin.trackPageview(page);
    }
});
