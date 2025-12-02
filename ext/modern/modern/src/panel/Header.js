/**
 * This container class is used to manage the items (such as title and tools) for `Ext.Panel`.
 *
 * @since 6.0.1
 */
Ext.define('Ext.panel.Header', {
    extend: 'Ext.Container',
    xtype: 'panelheader',

    /**
     * @property {Boolean} isPanelHeader
     * `true` in this class to identify an object as an instantiated Header, or a subclass
     * thereof.
     * @readonly
     */
    isPanelHeader: true,

    baseCls: Ext.baseCSSPrefix + 'panel-header',

    config: {
        /**
         * @cfg {Number/String} glyph
         * @accessor
         * A numeric unicode character code to use as the icon.  The default font-family
         * for glyphs can be set globally using
         * {@link Ext.app.Application#glyphFontFamily glyphFontFamily} application
         * config or the {@link Ext#setGlyphFontFamily Ext.setGlyphFontFamily()} method.
         *
         * The following shows how to set the glyph using the font icons provided in the
         * SDK (assuming the font-family has been configured globally):
         *
         *     // assumes the glyphFontFamily is "FontAwesome"
         *     glyph: 'xf005'     // the "home" icon
         *
         *     // assumes the glyphFontFamily is "Pictos"
         *     glyph: 'H'         // the "home" icon
         *
         * Alternatively, this config option accepts a string with the charCode and
         * font-family separated by the `@` symbol.
         *
         *     // using Font Awesome
         *     glyph: 'xf005@FontAwesome'     // the "home" icon
         *
         *     // using Pictos
         *     glyph: 'H@Pictos'              // the "home" icon
         *
         * Depending on the theme you're using, you may need include the font icon
         * packages in your application in order to use the icons included in the
         * SDK.  For more information see:
         *
         *  - [Font Awesome icons](http://fortawesome.github.io/Font-Awesome/cheatsheet/)
         *  - [Pictos icons](http://docs.sencha.com/extjs/6.0/core_concepts/font_ext.html)
         *  - [Theming Guide](http://docs.sencha.com/extjs/6.0/core_concepts/theming.html)
         */
        glyph: null,

        /**
         * @cfg {String} icon
         * Path to an image to use as an icon.
         *
         * For instructions on how you can use icon fonts including those distributed in
         * the SDK see {@link #iconCls}.
         * @accessor
         */
        icon: null,

        /**
         * @cfg {'top'/'right'/'bottom'/'left'} [iconAlign='left']
         * The side of the title to render the icon.
         * @accessor
         */
        iconAlign: null,

        /**
         * @cfg {String} iconCls
         * @accessor
         * One or more space separated CSS classes to be applied to the icon element.
         * The CSS rule(s) applied should specify a background image to be used as the
         * icon.
         *
         * An example of specifying a custom icon class would be something like:
         *
         *     // specify the property in the config for the class:
         *     iconCls: 'my-home-icon'
         *
         *     // css rule specifying the background image to be used as the icon image:
         *     .my-home-icon {
         *         background-image: url(../images/my-home-icon.gif) !important;
         *     }
         *
         * In addition to specifying your own classes, you can use the font icons
         * provided in the SDK using the following syntax:
         *
         *     // using Font Awesome
         *     iconCls: 'x-fa fa-home'
         *
         *     // using Pictos
         *     iconCls: 'pictos pictos-home'
         *
         * Depending on the theme you're using, you may need include the font icon
         * packages in your application in order to use the icons included in the
         * SDK.  For more information see:
         *
         *  - [Font Awesome icons](http://fortawesome.github.io/Font-Awesome/cheatsheet/)
         *  - [Pictos icons](http://docs.sencha.com/extjs/6.0/core_concepts/font_ext.html)
         *  - [Theming Guide](http://docs.sencha.com/extjs/6.0/core_concepts/theming.html)
         */
        iconCls: null,

        /**
         * @cfg {String/Ext.panel.Title}
         * The title text or config object for the {@link Ext.panel.Title Title} component.
         * @accessor
         */
        title: null,

        /**
         * @cfg {'left'/'center'/'right'} [titleAlign='left']
         * The alignment of the title text within the available space between the
         * icon and the tools.
         * @accessor
         */
        titleAlign: null,

        layout: {
            type: 'hbox',
            align: 'center'
        }
    },

    add: function (item) {
        var me = this,
            isArray = Ext.isArray(item),
            array = isArray ? item.slice(0) : [ item ], // copy array since we sort it
            items = me.getItems(),
            length = items.length,
            n = array.length,
            c, i, pos, instanced;

        for (i = 0; i < n; ++i) {
            c = array[i];
            // We have to ensure all items are actual instances because the "weight"
            // config may come from the class.
            instanced = c.isWidget;
            if (!instanced) {
                c.$initParent = me;
            }
            array[i] = me.factoryItem(c);
            delete c.$initParent;
        }

        Ext.Array.sort(array, me.sortByWeight);

        if (length) {
            items = items.items; // get the items array of our ItemCollection
            pos = 0;

            // Both "items" and "array" are in order by weight. For each new item,
            // we find the pos where items[pos] is greater than the new item. This
            // ensures new items of equal weight are added after existing items of
            // that weight.

            for (i = 0; i < n; ++i) {
                c = array[i];

                for ( ; pos < length; ++pos) {
                    if (me.sortByWeight(c, items[pos]) < 0) {
                        break;
                    }
                }

                me.insert(pos, c);

                ++pos;
                ++length;
            }
        } else {
            me.callParent([ array ]);
        }

        return isArray ? array : item;
    },

    applyTitle: function (newTitle, oldTitle) {
        var title = oldTitle;

        if (title) {
            if (!newTitle || typeof newTitle === 'string') {
                title.setText(newTitle || '');
            } else if (newTitle) {
                title.setConfig(newTitle);
            }
        } else {
            title = Ext.create(this.createTitle(newTitle));
        }

        return title;
    },

    createTitle: function (config) {
        var ret = {
            xtype: 'paneltitle',
            flex: 1
        };

        if (config) {
            if (typeof config === 'string') {
                config = {
                    text: config
                };
            }

            Ext.merge(ret, config);
        }

        return ret;
    },

    createTools: function (tools, toolOwner) {
        var n = tools && tools.length,
            ret = n && [],
            c, i;

        toolOwner = toolOwner || null;

        for (i = 0; i < n; ++i) {
            c = tools[i];

            if (typeof c === 'string') {
                c = {
                    xtype: 'paneltool',
                    type: c,
                    toolOwner: toolOwner
                };
            } else if (c.isInstance) {
                if (toolOwner) {
                    c.setToolOwner(toolOwner);
                }
            } else {
                c = Ext.apply({
                    xtype: 'paneltool',
                    toolOwner: toolOwner
                }, c);
            }

            ret[i] = c;
        }

        return ret;
    },

    updateGlyph: function(glyph) {
        this.ensureTitle().setGlyph(glyph);
    },

    updateIcon: function(icon) {
        this.ensureTitle().setIcon(icon);
    },

    updateIconAlign: function(align, oldAlign) {
        this.ensureTitle().setIconAlign(align);
    },

    updateIconCls: function(cls) {
        this.ensureTitle().setIconCls(cls);
    },

    updateTitle: function(title, oldTitle) {
        if (oldTitle) {
            oldTitle.setConfig(title);
        } else {
            this.add(title);
        }
    },

    updateTitleAlign: function(align, oldAlign) {
        this.ensureTitle().setTextAlign(align);
    },

    updateUi: function(ui, oldValue) {
        this.callParent([ ui, oldValue ]);

        this.ensureTitle().setUi(ui);
    },

    privates: {
        clearTools: function () {
            var items = this.getItems().items,
                c, i;

            for (i = items.length; i-- > 0; ) {
                c = items[i];

                if (c.isPanelTool) {
                    this.remove(c);
                }
            }
        },

        ensureTitle: function () {
            var me = this,
                title = me.getTitle();

            if (!title) {
                me.setTitle('');
                title = me.getTitle();
            }

            return title;
        },

        sortByWeight: function (item1, item2) {
            return (item1.weight || 0) - (item2.weight || 0);
        }
    }
});
