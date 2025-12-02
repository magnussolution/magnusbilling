/**
 * @private
 * Common methods for both classic & modern containers
 */
Ext.define('Ext.mixin.Container', {
    extend: 'Ext.Mixin',

    mixinConfig: {
        id: 'container'
    },

    /**
     * @property {Boolean} isContainer
     * `true` in this class to identify an object as an instantiated Container, or subclass thereof.
     */
    isContainer: true,

    config: {
        /**
         * @cfg {Boolean} referenceHolder
         * If `true`, this container will be marked as being a point in the hierarchy where
         * references to items with a specified `reference` config will be held. The container
         * will automatically become a referenceHolder if a {@link #controller} is specified.
         *
         * See the introductory docs for {@link Ext.container.Container} for more information
         * about references & reference holders.
         */
        referenceHolder: false
    },

    /**
     * Returns an object holding the descendants of this view keyed by their
     * `{@link Ext.Component#cfg-reference reference}`. This object should not be held
     * past the scope of the function calling this method. It will not be valid if items
     * are added or removed from this or any sub-container.
     *
     * The intended usage is shown here (assume there are 3 components with reference
     * values of "foo", "bar" and "baz" at some level below this container):
     *
     *      onClick: function () {
     *          var refs = this.getReferences();
     *
     *          // using "refs" we can access any descendant by its "reference"
     *
     *          refs.foo.getValue() + refs.bar.getValue() + refs.baz.getValue();
     *      }
     *
     * If `this` component has a `{@link Ext.Component#cfg-reference reference}` assigned
     * to it, that is **not** included in this object. That reference is understood to
     * belong to the ancestor container configured as the `referenceHolder`.
     *
     * @return {Object} An object with each child reference. This will be `null` if this
     * container has no descendants with a `{@link Ext.Component#cfg-reference reference}`
     * specified.
     * @since 5.0.0
     */
    getReferences: function () {
        Ext.ComponentManager.fixReferences();
        return this.refs || null;
    },

    /**
     * Gets a reference to the component with the specified {@link #reference} value.
     *
     * The method is a short-hand for the {@link #lookupReference} method.
     *
     * @param {String} key The name of the reference to lookup.
     * @return {Ext.Component} The referenced component or `null` if it is not found.
     * @since 6.0.1
     */
    lookup: function (key) {
        var refs = this.getReferences();
        return (refs && refs[key]) || null;
    },

    /**
     * Gets a reference to the component with the specified {@link #reference} value.
     *
     * The {@link #lookup} method is a short-hand version of this method.
     *
     * @param {String} key The name of the reference to lookup.
     * @return {Ext.Component} The referenced component or `null` if it is not found.
     * @since 5.0
     */
    lookupReference: function (key) {
        return this.lookup(key);
    },

    privates: {
        /**
         * Sets up a component reference.
         * @param {Ext.Component} component The component to reference.
         * @private
         */
        attachReference: function (component) {
            var me = this,
                key, refs;

            // Cleaning all this up later anyway
            if (me.destroying || me.destroyed) {
                return;
            }

            refs = me.refs || (me.refs = {});
            key = component.referenceKey;
            //<debug>
            if (refs[key] && refs[key] !== component) {
                Ext.log.warn('Duplicate reference: "' + key + '" on ' + me.id);
            }
            //</debug>
            refs[key] = component;
        },

        /**
         * Clear a component reference.
         * @param {Ext.Component} component The component to remove.
         * @private
         */
        clearReference: function (component) {
            var refs = this.refs,
                key = component.referenceKey;

            if (refs && key) {
                // viewModelKey would be better placed in app.Container however
                // it's not really worth introducing a second method call to clear
                // a single property.
                component.viewModelKey = component.referenceKey = refs[key] = null;
            }
        },

        containerOnAdded: function(component, instanced) {
            // We have been added to a container, we may have child references
            // or be a reference ourself. At this point we have no way of knowing if 
            // our references are correct, so trigger a fix.
            if (instanced) {
                Ext.ComponentManager.markReferencesDirty();
            }
        },

        containerOnRemoved: function(destroying) {
            var refHolder;
        
            // If we're destroying this will get cleaned up anyway
            if (!destroying) {
                refHolder = this.lookupReferenceHolder();
                if (refHolder) {
                    // Clear any references here, they will be reset after the 
                    // next call to lookupReference after being marked dirty.
                    // It's easier to wipe & re-establish them than attempt to 
                    // track what changed and prune the collection
                    
                    Ext.ComponentManager.markReferencesDirty();
                    refHolder.clearReferences();
                }
            }
        },  

        /**
         * Invalidates the references collection. Typically called when
         * removing a container from this container, since it's difficult
         * to know what references got removed.
         *
         * @private
         */
        clearReferences: function () {
            this.refs = null;
        },

        initContainerInheritedState: function(inheritedState, inheritedStateInner) {
            var me = this,
                controller = me.getController(),
                session = me.getSession(),
                // Don't instantiate it here, we just want to know whether we
                // were configured with a VM
                viewModel = me.getConfig('viewModel', true),
                reference = me.getReference(),
                referenceHolder = me.getReferenceHolder();



            if (controller) {
                inheritedState.referenceHolder = controller;
                referenceHolder = true;
            } else if (referenceHolder) {
                inheritedState.referenceHolder = me;
            }

            if (referenceHolder) {
                inheritedState.referencePath = '';
            } else if (reference && me.isParentReference) {
                inheritedState.referencePath = me.referenceKey + '.';
            }

            if (session) {
                inheritedState.session = session;
            }

            if (viewModel) {
                inheritedState.viewModelPath = '';
            } else if (reference && me.isParentReference) {
                inheritedState.viewModelPath = me.viewModelKey + '.';
            }
        },
        
        setupReference: function(reference) {
            var len;

            if (reference && reference.charAt(len = reference.length - 1) === '>') {
                this.isParentReference = true;
                reference = reference.substring(0, len);
            }

            //<debug>
            if (reference && !Ext.validIdRe.test(reference)) {
                Ext.Error.raise('Invalid reference "' + reference + '" for ' + this.getId() +
                    ' - not a valid identifier');
            }
            //</debug>

            return reference;
        }
    }
});