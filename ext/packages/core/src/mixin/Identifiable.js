// @tag dom,core

/**
 * An Identifiable mixin.
 * @private
 */
Ext.define('Ext.mixin.Identifiable', {
    statics: {
        uniqueIds: {}
    },

    isIdentifiable: true,

    mixinId: 'identifiable',

    idCleanRegex: /\.|[^\w\-]/g,

    defaultIdPrefix: 'ext-',

    defaultIdSeparator: '-',

    getOptimizedId: function() {
        return this.id;
    },

    getUniqueId: function() {
        var id = this.id,
            prototype, separator, xtype, uniqueIds, prefix;

        // Cannot test falsiness. Zero is a valid ID.
        if (!(id || id === 0)) {
            prototype = this.self.prototype;
            separator = this.defaultIdSeparator;

            uniqueIds = Ext.mixin.Identifiable.uniqueIds;

            if (!prototype.hasOwnProperty('identifiablePrefix')) {
                xtype = this.xtype;

                if (xtype) {
                    prefix = this.defaultIdPrefix + xtype.replace(this.idCleanRegex, separator) + separator;
                } else if (!(prefix = prototype.$className)) {
                    prefix = this.defaultIdPrefix + 'anonymous' + separator;
                } else {
                    prefix = prefix.replace(this.idCleanRegex, separator).toLowerCase() + separator;
                }

                prototype.identifiablePrefix = prefix;
            }

            prefix = this.identifiablePrefix;

            if (!uniqueIds.hasOwnProperty(prefix)) {
                uniqueIds[prefix] = 0;
            }

            // The double assignment here and in setId is intentional to workaround a JIT 
            // issue that prevents me.id from being assigned in random scenarios. The issue
            // occurs on 4th gen iPads and lower, possibly other older iOS devices. See EXTJS-16494.
            id = this.id = this.id = prefix + (++uniqueIds[prefix]);
        }

        this.getUniqueId = this.getOptimizedId;

        return id;
    },

    setId: function(id) {
        // See getUniqueId()
        this.id = this.id = id;
    },

    /**
     * Retrieves the id of this component. Will autogenerate an id if one has not already been set.
     * @return {String} id
     */
    getId: function() {
        var id = this.id;

        if (!id) {
            id = this.getUniqueId();
        }

        this.getId = this.getOptimizedId;

        return id;
    }
});
