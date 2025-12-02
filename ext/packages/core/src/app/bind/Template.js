/**
 * This class holds the parsed text for a bind template. The syntax is that of a normal
 * `Ext.Template` except that substitution tokens can contain dots to reference property
 * names.
 *
 * The template is parsed and stored in a representation like this:
 *
 *      me.text = 'Hey {foo.bar}! Test {bar} and {foo.bar} with {abc} over {bar:number}'
 *
 *      me.tokens = [ 'foo.bar', 'bar', 'abc' ]
 *
 *      me.buffer = [           me.slots = [
 *          'Hey ',                 undefined,
 *          undefined,              { token: 'foo.bar', pos: 0 },
 *          '! Test ',              undefined,
 *          undefined,              { token: 'bar', pos: 1 },
 *          ' and ',                undefined,
 *          undefined,              { token: 'foo.bar', pos: 0 },
 *          ' with ',               undefined,
 *          undefined,              { token: 'abc', pos: 2 },
 *          ' over ',               undefined,
 *          undefined               { token: 'bar', fmt: 'number', pos: 1 }
 *      ]                       ]
 *
 * @private
 * @since 5.0.0
 */
Ext.define('Ext.app.bind.Template', {
    requires: [
        'Ext.util.Format',
        'Ext.app.bind.Parser'
    ],

    /**
     * @property {String[]} buffer
     * Initially this is just the array of string fragments with `null` between each
     * to hold the place of a substitution token. On first use these slots are filled
     * with the token's value and this array is joined to form the output.
     * @private
     */
    buffer: null,

    /**
     * @property {Object[]} slots
     * The elements of this array line up with those of `buffer`. This array holds
     * the parsed information for the substitution token that fills a given slot in
     * the generated string. Indices that correspond to literal text are `null`.
     *
     * Consider the following substitution token:
     *
     *      {foo:this.fmt(2,4)}
     *
     * The object in this array has the following properties to describe this token:
     *
     *   * `fmt` The name of the formatting function ("fmt") or `null` if none.
     *   * `index` The numeric index if this is not a named substitution or `null`.
     *   * `not` True if the token has a logical not ("!") at the front.
     *   * `token` The name of the token ("foo") if not an `index`.
     *   * `pos` The position of this token in the `tokens` array.
     *   * `scope` A reference to the object on which the `fmt` method exists. This
     *    will be `Ext.util.Format` if no "this." is present or `null` if it is (or
     *    if there is no `fmt`). In the above example, this is `null` to indicate the
     *    scope is unknown.
     *   * `args` An array of arguments to `fmt` if the arguments are simple enough
     *    to parse directly. Otherwise this is `null` and `fn` is used.
     *   * `fn` A generated function to use to evaluate the arguments to the `fmt`. In
     *    rare cases these arguments can reference global variables so the expression
     *    must be evaluated on each call.
     *   * `format` The method to call to perform the format. This method accepts the
     *    scope (in case `scope` is unknown) and the value. This function is `null` if
     *    there is no `fmt`.
     *
     * @private
     */
    slots: null,

    /**
     * @property {String[]} tokens
     * The distinct set of tokens used in the template excluding formatting. This is
     * used to ensure that only one bind is performed per unique token. This array is
     * passed to {@link Ext.app.ViewModel#bind} to perform a "multi-bind". The result
     * is an array of values corresponding these tokens. Each entry in `slots` then
     * knows its `pos` in this array from which to pick up its value, apply formats
     * and place in `buffer`.
     * @private
     */
    tokens: null,

    /**
     * @param {String} text The text of the template.
     */
    constructor: function (text) {
        var me = this,
            initters = me._initters,
            name;

        me.text = text;

        for (name in initters) {
            me[name] = initters[name];
        }
    },

    /**
     * @property {Object} _initters
     * Each of the methods contained on this object are placed in new instances to lazily
     * parse the template text.
     * @private
     * @since 5.0.0
     */
    _initters: {
        apply: function (values, scope) {
            return this.parse().apply(values, scope);
        },
        getTokens: function () {
            return this.parse().getTokens();
        }
    },

    /**
     * Applies this template to the given `values`. The `values` must correspond to the
     * `tokens` returned by `getTokens`.
     *
     * @param {Array} values The values of the `tokens`.
     * @param {Object} scope The object instance to use for "this." formatter calls in the
     * template.
     * @return {String}
     * @since 5.0.0
     */
    apply: function (values, scope) {
        var me = this,
            slots = me.slots,
            buffer = me.buffer,
            length = slots.length,
            i, slot;

        for (i = 0; i < length; ++i) {
            slot = slots[i];
            if (slot) {
                buffer[i] = slot(values, scope);
            }
        }

        // If we have only one component and it is a slot (a {} component), then we
        // want to evaluate to whatever that expression generated.
        if (slot && me.single) {
            return buffer[0];
        }

        return buffer.join('');
    },

    /**
     * Returns the distinct set of binding tokens for this template.
     * @return {String[]} The `tokens` for this template.
     */
    getTokens: function () {
        return this.tokens;
    },

    /**
     * Returns true if the expression is static, meaning it has no
     * tokens or slots that need to be evaluated.
     *
     * @private
     */
    isStatic: function(){
        var tokens = this.getTokens(),
            slots = this.slots;

        return (tokens.length === 0 && slots.length === 0);
    },

    privates: {
        /**
         * Parses the template text into `buffer`, `slots` and `tokens`. This method is called
         * automatically when the template is first used.
         * @return {Ext.app.bind.Template} this
         * @private
         */
        parse: function () {
            // NOTE: The particulars of what is stored here, while private, are likely to be
            // important to Sencha Architect so changes need to be coordinated.
            var me = this,
                text = me.text,
                parser = Ext.app.bind.Parser.fly(),
                buffer = (me.buffer = []),
                slots = (me.slots = []),
                last = 0,
                length = text.length,
                pos = 0,
                i;

            // Remove the initters so that we don't get called here again.
            for (i in me._initters) {
                delete me[i];
            }

            me.tokens = [];
            me.tokensMap = {};

            // text = 'Hello {foo:this.fmt(2,4)} World {bar} - {1}'
            for (i = 0; i < length;) {
                last = i;
                if ((i = text.indexOf('{', last)) < 0) {
                    buffer[pos++] = text.substring(last);
                    break;
                }

                if (last < i) {
                    buffer[pos++] = text.substring(last, i);
                }

                parser.reset(text, i + 1);
                slots[pos++] = parser.compileExpression(me.tokens, me.tokensMap);

                i = parser.token.at + 1;  // skip over the "}" token
                parser.expect('}');      // ensure the next token is "}"
            }

            parser.release();

            me.single = buffer.length === 0 && slots.length === 1;

            return me;
        }

    }
});
