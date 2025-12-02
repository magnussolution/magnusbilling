/**
 * A basic title component for a Panel Header.
 *
 * @since 6.0.1
 */
Ext.define('Ext.panel.Title', {
    extend: 'Ext.Component',
    xtype: 'paneltitle',

    isPanelTitle: true,

    // For performance reasons we give the following configs their default values on
    // the class body.  This prevents the updaters from running on initialization in the
    // default configuration scenario

    _textAlign: 'left',
    _iconAlign: 'left',
    _text: '&#160;',

    cachedConfig: {
        /**
         * @cfg [textAlign='left']
         * @inheritdoc Ext.panel.Header#cfg-titleAlign
         * @accessor
         */
        textAlign: null,

        /**
         * @cfg {String}
         * The title's text (can contain html tags/entities)
         * @accessor
         */
        text: null,

        /**
         * @cfg glyph
         * @inheritdoc Ext.panel.Header#cfg-glyph
         * @accessor
         */
        glyph: null,

        /**
         * @cfg icon
         * @inheritdoc Ext.panel.Header#cfg-icon
         * @accessor
         */
        icon: null,

        /**
         * @cfg {'top'/'right'/'bottom'/'left'} [iconAlign='left']
         * alignment of the icon
         * @accessor
         */
        iconAlign: null,

        /**
         * @cfg iconCls
         * @inheritdoc Ext.panel.Header#cfg-iconCls
         * @accessor
         */
        iconCls: null
    },

    weight: -10,

    element: {
        unselectable: 'on',
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'panel-title-align-left',

        children: [{
            reference: 'iconElement',
            style: 'display:none',
            cls: Ext.baseCSSPrefix + 'panel-title-icon ' +
                Ext.baseCSSPrefix + 'panel-title-icon-left'
        }, {
            reference: 'textElement',
            cls: Ext.baseCSSPrefix + 'panel-title-text'
        }]
    },

    _textAlignClasses: {
        left: Ext.baseCSSPrefix + 'panel-title-align-left',
        center: Ext.baseCSSPrefix + 'panel-title-align-center',
        right: Ext.baseCSSPrefix + 'panel-title-align-right'
    },

    _iconAlignClasses: {
        top: Ext.baseCSSPrefix + 'panel-title-icon-top',
        right: Ext.baseCSSPrefix + 'panel-title-icon-right',
        bottom: Ext.baseCSSPrefix + 'panel-title-icon-bottom',
        left: Ext.baseCSSPrefix + 'panel-title-icon-left'
    },

    baseCls: Ext.baseCSSPrefix + 'panel-title',
    _titleSuffix: '-title',
    _glyphCls: Ext.baseCSSPrefix + 'panel-title-glyph',
    _verticalCls: Ext.baseCSSPrefix + 'panel-title-vertical',

    applyText: function (text) {
        return text || '&#160;';
    },

    updateGlyph: function(glyph, oldGlyph) {
        glyph = glyph || 0;

        var me = this,
            glyphCls = me._glyphCls,
            iconEl = me.iconElement,
            fontFamily, glyphParts;

        me.glyph = glyph;

        me._syncIconVisibility();

        if (typeof glyph === 'string') {
            glyphParts = glyph.split('@');
            glyph = glyphParts[0];
            fontFamily = glyphParts[1] || Ext._glyphFontFamily;
        }

        if (!glyph) {
            iconEl.dom.innerHTML = '';
            iconEl.removeCls(glyphCls);
        } else {
            iconEl.dom.innerHTML = '&#' + glyph + ';';
            iconEl.addCls(glyphCls);
        }

        if (fontFamily) {
            iconEl.setStyle('font-family', fontFamily);
        }
    },

    updateIcon: function(icon, oldIcon) {
        var me = this,
            iconEl;

        me._syncIconVisibility();
        iconEl = me.iconElement;

        iconEl.setStyle('background-image', icon ? 'url(' + icon + ')': '');
    },

    updateIconAlign: function(align, oldAlign) {
        var me = this,
            iconEl = me.iconElement,
            iconAlignClasses = me._iconAlignClasses,
            el = me.el;

        if (oldAlign) {
            iconEl.removeCls(iconAlignClasses[oldAlign]);
        }

        iconEl.addCls(iconAlignClasses[align]);

        // here we move the icon to the correct position in the dom - before the
        // title el for top/left alignments, and after the title el for right/bottom
        if (align === 'top' || align === 'left') {
            el.insertFirst(iconEl);
        } else {
            el.appendChild(iconEl);
        }

        if (align === 'top' || align === 'bottom') {
            el.addCls(me._verticalCls);
        } else {
            el.removeCls(me._verticalCls);
        }
    },

    updateIconCls: function(cls, oldCls) {
        var iconEl = this.iconElement;

        this._syncIconVisibility();

        if (oldCls) {
            iconEl.removeCls(oldCls);
        }

        if (cls) {
            iconEl.addCls(cls);
        }
    },

    updateText: function(text) {
        this.textElement.setHtml(text);
    },

    updateTextAlign: function(align, oldAlign) {
        var me = this,
            textAlignClasses = me._textAlignClasses;

        if (oldAlign) {
            me.removeCls(textAlignClasses[oldAlign]);
        }

        me.addCls(textAlignClasses[align]);
    },

    privates: {
        _getVerticalAdjustDirection: function() {
            // rtl hook
            return 'left';
        },

        _hasIcon: function() {
            return !!(this.getIcon() || this.getIconCls() || this.getGlyph());
        },

        _syncIconVisibility: function() {
            this.iconElement.setDisplayed(this._hasIcon());
        }
    }
});
