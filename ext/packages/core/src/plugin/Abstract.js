/**
 * This is the base class from which all plugins should extend.
 *
 * This class defines the essential API of plugins as used by Components by defining the
 * following methods:
 *
 *  - `init` : The plugin initialization method which the host Component calls during
 *     Component initialization. The Component passes itself as the sole parameter.
 *     Subclasses should set up bidirectional links between the plugin and its host
 *     Component here.
 *
 *  - `destroy` : The plugin cleanup method which the host Component calls at Component
 *     destruction time. Use this method to break links between the plugin and the
 *     Component and to free any allocated resources.
 */
Ext.define('Ext.plugin.Abstract', {
    alternateClassName: 'Ext.AbstractPlugin',

    /**
     * @property {Boolean} isPlugin
     * The value `true` to identify objects of this class or a subclass thereof.
     * @readonly
     */
    isPlugin: true,

    /**
     * Initializes the plugin.
     * @param {Object} [config] Configuration object.
     */
    constructor: function (config) {
        if (config) {
            this.pluginConfig = config;
            this.initConfig(config);
        }
    },

    /**
     * Creates clone of the plugin.
     * @param {Object} [overrideCfg] Additional config for the derived plugin.
     */
    clonePlugin: function (overrideCfg) {
        return new this.self(Ext.apply({}, overrideCfg, this.pluginConfig));
    },

    /**
     * @method detachCmp
     * Plugins that can be disconnected from their host component should implement
     * this method.
     * @since 6.2.0
     */

    /**
     * Returns the component to which this plugin is attached.
     * @return {Ext.Component} The owning host component.
     */
    getCmp: function() {
        return this.cmp;
    },

    /**
     * Sets the host component to which this plugin is attached. For a plugin to be
     * removable without being destroyed, this method should be provided and be prepared
     * to receive `null` for the component.
     * @param {Ext.Component} host The owning host component.
     */
    setCmp: function (host) {
        this.cmp = host;
    },

    /**
     * @cfg {String} id
     * An identifier for the plugin that can be set at creation time to later retrieve the
     * plugin using the {@link #getPlugin getPlugin} method. For example:
     *
     *      var panel = Ext.create({
     *          xtype: 'panel',
     *
     *          plugins: [{
     *              id: 'foo',
     *              ...
     *          }]
     *      });
     *
     *      // later on:
     *      var plugin = panel.getPlugin('foo');
     * @since 6.2.0
     */

    /**
     * @cfg {String} pluginId
     * @deprecated 6.2.0 Use `id` instead
     */

    /**
     * @method init
     * The init method is invoked to formally associate the host component and the plugin.
     *
     * Subclasses should perform initialization and set up any requires links between the
     * plugin and its host Component in their own implementation of this method.
     * @param {Ext.Component} host The host Component which owns this plugin.
     */
    init: Ext.emptyFn,

    /**
     * @method destroy
     *
     * The destroy method is invoked by the owning Component at the time the Component is
     * being destroyed.
     */
    destroy: function() {
        this.cmp = this.pluginConfig = null;
        
        this.callParent();
    },

    onClassExtended: function (cls, data, hooks) {
        var alias = data.alias,
            prototype = cls.prototype;

        // Inject a ptype property so that findPlugin() works.
        if (alias && !data.ptype) {
            if (Ext.isArray(alias)) {
                alias = alias[0];
            }
            
            prototype.ptype = alias.split('plugin.')[1];
        }
    },

    resolveListenerScope: function (defaultScope) {
        var me = this,
            cmp = me.getCmp(),
            scope;

        if (cmp) {
            scope = cmp.resolveSatelliteListenerScope(me, defaultScope);
        }

        // If this method was called, it means the plugin subclass must
        // have mixed in Observable, so we can rely on there being
        // a "this.mixins.observable" even though Ext.plugin.Abstract
        // does not mix it in directly
        return scope || me.mixins.observable.resolveListenerScope.call(me, defaultScope);
    }
});
