/**
 * @class Ext.app.Application
 */
Ext.define('Ext.overrides.app.Application', {
    override: 'Ext.app.Application',
    requires: ['Ext.viewport.Viewport'],
    uses: ['Ext.tip.Manager'],

    /**
     * @cfg {Boolean/Object} quickTips
     * `true` to enable quick tips to be read from the DOM and displayed
     * by the `Ext.tip.Manager`. Pass the object form as a configuration
     * for `Ext.tip.Manager`.
     * @cmd-auto-dependency {defaultType: "Ext.tip.Manager"}
     *
     * @since 6.2.0
     */
     quickTips: false,

    initMainView: function() {
        var me = this,
            viewport,
            mainView;

        me.viewport = viewport = Ext.Viewport;

        me.callParent();

        mainView = me.getMainView();

        // Ensure the viewport is ready by the time launch is called
        viewport.onAppLaunch();

        if (mainView) {
            viewport.add(mainView);
        }
    },

    applyQuickTips: function(quickTips) {
        quickTips = quickTips || null;

        if (quickTips) {
            if (quickTips === true) {
                quickTips = {};
            }
            quickTips = new Ext.tip['Manager'](quickTips);
        }
        return quickTips;
    },

    updateQuickTips: function(quickTips, oldQuickTips) {
        if (oldQuickTips) {
            oldQuickTips.destroy();
        }
    }
});
