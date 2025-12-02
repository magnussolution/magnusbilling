/**
 * Utility class used by Ext.slider.Slider - should never need to be used directly.
 */
Ext.define('Ext.slider.Thumb', {
    extend: 'Ext.Component',
    xtype : 'thumb',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'thumb',

        /**
         * @cfg
         * @inheritdoc
         */
        draggable: {
            direction: 'horizontal',
            translatable: {
                // use cssposition instead of csstransform so that themes can use transform
                // scale to style the pressed state of the thumb (material)
                translationMethod: 'cssposition'
            }
        },

        touchAction: { panX: false },

        slider: null,

        /**
         * @cfg {Boolean/String}
         * True to add a "fill" color to the track for this thumb, or a valid CSS color
         * to use for the fill.  When a fill color is used is extends from the left
         * edge of the thumb to the previous thumb, or to the left edge of the track if
         * this thumb is the left-most thumb.
         */
        fillTrack: null,

        /**
         * @cfg {String}
         * A CSS class for styling the track fill element.  Assumes {@link #fillTrack} has
         * been set to `true`, otherwise the fill element will be invisible.
         */
        fillCls: null
    },

    // Strange issue where the thumbs translation value is not being set when it is not visible. Happens when the thumb 
    // is contained within a modal panel.
    platformConfig: {
        ie10: {
            draggable: {
                translatable: {
                    translationMethod: 'csstransform'
                }
            }
        }
    },

    template: [{
        reference: 'iconElement',
        classList: [
            Ext.baseCSSPrefix + 'icon-el',
            Ext.baseCSSPrefix + 'font-icon'
        ]
    }],

    elementWidth: 0,

    pressingCls: Ext.baseCSSPrefix + 'pressing',
    fillCls: Ext.baseCSSPrefix + 'fill-el',
    sizerCls: Ext.baseCSSPrefix + 'thumb-sizer',

    constructor: function(config) {
        // Since the thumbs are absolutely positioned, the slider component cannot shrink
        // wrap to their height.  The sizer element is a 0-width element that ensures
        // the slider is at least as high as the largest thumb.
        // This has to be created early so the ui updater can access it
        this.sizerElement = Ext.Element.create({
            cls: this.sizerCls
        });

        this.callParent([config]);
    },

    initialize: function() {
        var me = this,
            element = me.element,
            draggable, fillElement;

        me.callParent();

        draggable = me.getDraggable();
        draggable.onBefore({
            beforedragstart: 'onBeforeDragStart',
            dragstart: 'onDragStart',
            drag: 'onDrag',
            dragend: 'onDragEnd',
            scope: me
        });

        draggable.getTranslatable().on({
            animationstart: 'onAnimationStart',
            animationend: 'onAnimationEnd',
            scope: me
        });

        element.on('resize', 'onElementResize', me);

        element.addClsOnClick(me.pressingCls, me.shouldAddPressingCls, me);

        fillElement = me.fillElement = Ext.Element.create({
            cls: me.fillCls
        });

        fillElement.setVisibilityMode(1); // VISIBILITY

        me.getDraggable().getTranslatable().on('translate', 'onTranslate', me);
    },

    updateFillTrack: function(fillTrack) {
        var fillElement = this.fillElement;

        if (fillTrack === false) {
            fillElement.hide();
        } else {
            fillElement.show();
            fillElement.setStyle('background-color', (typeof fillTrack === 'string') ? fillTrack : '');
        }
    },

    updateFillCls: function(fillCls, oldFillCls) {
        var fillElement = this.fillElement;

        if (oldFillCls) {
            fillElement.removeCls(oldFillCls);
        }

        if (fillCls) {
            fillElement.addCls(fillCls);
        }
    },

    shouldAddPressingCls: function() {
        return !this.isDisabled();
    },

    onAnimationStart: function(translatable, x, y) {
        this.getSlider().onThumbAnimationStart(this, x, y);
    },

    onAnimationEnd: function(translatable, x, y) {
        this.getSlider().onThumbAnimationEnd(this, x, y);
    },

    onBeforeDragStart: function(draggable, e, x, y) {
        if (this.isDisabled()) {
            return false;
        }

        this.getSlider().onThumbBeforeDragStart(this, e, x, y);
    },

    onDragStart: function(draggable, e, x, y) {
        this.getSlider().onThumbDragStart(this, e, x, y);
    },

    onDrag: function(draggable, e, x, y) {
        if (this.isDisabled()) {
            return false;
        }

        this.getSlider().onThumbDrag(this, e, x, y);
    },

    onDragEnd: function(draggable, e, x, y) {
        if (this.isDisabled()) {
            return false;
        }

        this.getSlider().onThumbDragEnd(this, e, x, y);
    },

    onTranslate: function(translatable, x, y) {
        this.getSlider().syncFill(this, x);
    },

    onElementResize: function(element, info) {
        this.elementWidth = info.width;
    },

    getElementWidth: function() {
        return this.elementWidth;
    },

    updateUi: function(ui, oldUi) {
        var me = this,
            sizerCls = me.sizerCls,
            sizerElement = me.sizerElement;

        if (oldUi) {
            sizerElement.removeCls(oldUi, sizerCls)
        }

        if (ui) {
            sizerElement.addCls(ui, sizerCls);
        }

        me.callParent([ui, oldUi]);
    },

    destroy: function() {
        Ext.destroyMembers(this, 'fillElement', 'sizerElement');
        this.callParent();
    }
});
