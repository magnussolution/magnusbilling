/**
 * This plugin can be added to component instances to process a `responsiveConfig`. For
 * example:
 *
 *      Ext.create({
 *          xtype: 'panel',
 *          layout: 'hbox',
 *
 *          items: [{
 *              xtype: 'component',
 *              plugins: 'responsive',
 *
 *              responsiveConfig: {
 *                  'width < 800': {
 *                      hidden: true
 *                  },
 *
 *                  'width >= 800': {
 *                      hidden: false
 *                  }
 *              }
 *          },
 *          ...]
 *      });
 *
 * For details see `{@link Ext.mixin.Responsive#responsiveConfig responsiveConfig}`.
 */
Ext.define('Ext.plugin.Responsive', {
    extend: 'Ext.mixin.Responsive',
    alias: 'plugin.responsive',
    id: 'responsive',

    isPlugin: true,

    constructor: function (config) {
        //<debug>
        if (!config || !config.cmp) {
            Ext.raise('Responsive plugin must be constructed by Component');
        }
        //</debug>

        var me = this,
            cmp = config.cmp,
            cmpConfig = cmp.initialConfig,
            c = Ext.apply({
                responsiveConfig: cmpConfig.responsiveConfig,
                responsiveFormulas: cmpConfig.responsiveFormulas
            }, config),
            transformed;

        delete c.cmp;
        delete c.type;

        me.cmp = cmp;

        me.initConfig(c);

        transformed = me.transformed;

        // Push the evaluated responsiveConfig values back on to the component:
        if (transformed) {
            me.transformed = null;

            if (cmp.initConfig.$nullFn) {
                // Instance has already been through initConfig... This would only be
                // the case if this plugin was added after component construction.
                cmp.setConfig(transformed);
            } else {
                cmp.initialConfig = Ext.merge(Ext.merge({}, cmpConfig), transformed);
            }
        }
    },

    init: Ext.emptyFn,

    privates: {
        transformInstanceConfig: function (config) {
            // Since the responsiveConfigs we manage are for the component and not for us,
            // we set them aside here to be picked up by the constructor.
            var transformed = this.callParent([config]),
                ret;

            this.transformed = transformed;

            ret = Ext.apply({}, config);

            delete ret.responsiveConfig; // already processed
            delete ret.responsiveFormulas;

            return ret;
        },

        updateResponsiveState: function () {
            var config = this.getResponsiveState();

            // Push the dynamic stuff back on to our component:
            this.cmp.setConfig(config);
        }
    }
});
