/**
 * A simple progress bar widget.
 *
 * You are responsible for showing, updating (via {@link #setValue}) and clearing the
 * progress bar as needed from your own code. This method is most appropriate when you
 * want to show progress throughout an operation that has predictable points of interest
 * at which you can update the control.
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: ['name', 'progress'],
 *         data: [
 *             { name: 'Lisa', progress: .159 },
 *             { name: 'Bart', progress: .216 },
 *             { name: 'Homer', progress: .55 },
 *             { name: 'Maggie', progress: .167 },
 *             { name: 'Marge', progress: .145 }
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Simpsons',
 *         store: store,
 *         columns: [
 *             { text: 'Name',  dataIndex: 'name' },
 *             {
 *                 text: 'Progress',
 *                 xtype: 'widgetcolumn',
 *                 width: 120,
 *                 dataIndex: 'progress',
 *                 widget: {
 *                     xtype: 'progress'
 *                 }
 *             }
 *         ],
 *         height: 200,
 *         width: 400,
 *         renderTo: Ext.getBody()
 *     });
 *
 */
Ext.define('Ext.Progress', {
    extend: 'Ext.Gadget',
    xtype: ['progress', 'progressbarwidget'],
    alternateClassName: 'Ext.ProgressBarWidget',

    mixins: [
        'Ext.ProgressBase'
    ],

    config: {
        /**
         * @cfg {String} [text]
         * The background text
         */
        text: null,

        /**
         * @cfg {Boolean} [animate=false]
         * Specify as `true` to have this progress bar animate to new extent when updated.
         */
        animate: false
    },

    cachedConfig: {
        /**
         * @cfg {String} [baseCls='x-progress']
         * The base CSS class to apply to the progress bar's wrapper element.
         */
        baseCls: Ext.baseCSSPrefix + 'progress',

        textCls: Ext.baseCSSPrefix + 'progress-text',

        cls: null
    },

    template: [{
        reference: 'backgroundEl'
    }, {
        reference: 'barEl',
        children: [{
            reference: 'textEl'
        }]
    }],

    defaultBindProperty: 'value',

    updateCls: function (cls, oldCls) {
        var el = this.element;

        if (oldCls) {
            el.removeCls(oldCls);
        }

        if (cls) {
            el.addCls(cls);
        }
    },

    updateUi: function (ui, oldUi) {
        var element = this.element,
            barEl = this.barEl,
            baseCls = this.getBaseCls() + '-';

        if (oldUi) {
            element.removeCls(baseCls + oldUi);
            barEl.removeCls(baseCls + 'bar-' + oldUi);
        }

        element.addCls(baseCls + ui);
        barEl.addCls(baseCls + 'bar-' + ui);
    },

    updateBaseCls: function (baseCls, oldBaseCls) {
        //<debug>
        if (oldBaseCls) {
            Ext.raise('You cannot configure baseCls - use a subclass');
        }
        //</debug>
        this.element.addCls(baseCls);
        this.barEl.addCls(baseCls + '-bar');
    },

    updateTextCls: function (textCls) {
        this.backgroundEl.addCls(textCls + ' ' + textCls + '-back');
        this.textEl.addCls(textCls);
    },

    updateValue: function (value, oldValue) {
        var me = this,
            barEl = me.barEl,
            textTpl = me.getTextTpl();

        if (textTpl) {
            me.setText(textTpl.apply({
                value: value,
                percent: Math.round(value * 100)
            }));
        }
        if (me.getAnimate()) {
            barEl.stopAnimation();
            barEl.animate(Ext.apply({
                from: {
                    width: (oldValue * 100) + '%'
                },
                to: {
                    width: (value * 100) + '%'
                }
            }, me.animate));
        } else {
            barEl.setStyle('width', (value * 100) + '%');
        }
    },

    updateText: function (text) {
        this.backgroundEl.setHtml(text);
        this.textEl.setHtml(text);
    }
});
