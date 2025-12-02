/**
 * @class Ext.draw.modifier.Modifier
 *
 * Each sprite has a stack of modifiers. The resulting attributes of sprite is
 * the content of the stack top. When setting attributes to a sprite,
 * changes will be pushed-down though the stack of modifiers and pop-back the
 * additive changes; When modifier is triggered to change the attribute of a
 * sprite, it will pop-up the changes to the top.
 */
Ext.define('Ext.draw.modifier.Modifier', {
    mixins: {
        observable: 'Ext.mixin.Observable'
    },
    config: {
        /**
         * @private
         * @cfg {Ext.draw.modifier.Modifier} lower Modifier that receives the push-down changes.
         */
        lower: null,

        /**
         * @private
         * @cfg {Ext.draw.modifier.Modifier} upper Modifier that receives the pop-up changes.
         */
        upper: null,

        /**
         * @cfg {Ext.draw.sprite.Sprite} sprite The sprite to which the modifier belongs.
         */
        sprite: null
    },

    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
    },

    updateUpper: function (upper) {
        if (upper) {
            upper.setLower(this);
        }
    },

    updateLower: function (lower) {
        if (lower) {
            lower.setUpper(this);
        }
    },

    /**
     * @private
     * Validate attribute set before use.
     *
     * @param {Object} attr The attribute to be validated. Note that it may be already initialized, so do
     * not override properties that have already been used.
     */
    prepareAttributes: function (attr) {
        if (this._lower) {
            this._lower.prepareAttributes(attr);
        }
    },

    /**
     * @private
     * Invoked when changes need to be popped up to the top.
     * @param {Object} attributes The source attributes.
     * @param {Object} changes The changes to be popped up.
     */
    popUp: function (attributes, changes) {
        if (this._upper) {
            this._upper.popUp(attributes, changes);
        } else {
            Ext.apply(attributes, changes);
        }
    },

    /**
     * @private
     * Invoked when changes need to be pushed down to the sprite.
     * @param {Object} attr The source attributes.
     * @param {Object} changes The changes to make. This object might be changed unexpectedly inside the method.
     * @return {Mixed}
     */
    pushDown: function (attr, changes) {
        if (this._lower) {
            return this._lower.pushDown(attr, changes);
        } else {
            for (var name in changes) {
                if (changes[name] === attr[name]) {
                    delete changes[name];
                }
            }
            return changes;
        }
    }
});
