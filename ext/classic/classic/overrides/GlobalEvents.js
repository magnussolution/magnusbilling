// @tag core

/**
 * @class Ext.GlobalEvents
 */
Ext.define('Ext.overrides.GlobalEvents', {
    override: 'Ext.GlobalEvents',

    /**
     * @event resumelayouts
     * Fires after global layout processing has been resumed in {@link
     * Ext.Component#resumeLayouts}.
     */

    deprecated: {
        5: {
            methods: {
                addListener: function(ename, fn, scope, options, order, caller, eventOptions) {
                    var name,
                        readyFn;

                    // The "ready" event was removed from Ext.globalEvents in 5.0 in favor of
                    // Ext.onReady().  This function adds compatibility for the ready event

                    if (ename === 'ready') {
                        readyFn = fn;
                    } else if (typeof ename !== 'string') {
                        for (name in ename) {
                            if (name === 'ready') {
                                readyFn = ename[name];
                            }
                        }
                    }

                    if (readyFn) {
                        //<debug>
                        Ext.log.warn("Ext.on('ready', fn) is deprecated.  Please use Ext.onReady(fn) instead.");
                        //</debug>
                        Ext.onReady(readyFn);
                    }

                    this.callParent([ename, fn, scope, options, order, caller, eventOptions]);
                }
            }
        }
    }
});