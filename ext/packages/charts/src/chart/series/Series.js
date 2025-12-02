/**
 * Series is the abstract class containing the common logic to all chart series. Series includes
 * methods from Labels, Highlights, and Callouts mixins. This class implements the logic of
 * animating, hiding, showing all elements and returning the color of the series to be used as a legend item.
 *
 * ## Listeners
 *
 * The series class supports listeners via the Observable syntax.
 *
 * For example:
 *
 *     Ext.create('Ext.chart.CartesianChart', {
 *         plugins: {
 *             ptype: 'chartitemevents',
 *             moveEvents: true
 *         },
 *         store: {
 *             fields: ['pet', 'households', 'total'],
 *             data: [
 *                 {pet: 'Cats', households: 38, total: 93},
 *                 {pet: 'Dogs', households: 45, total: 79},
 *                 {pet: 'Fish', households: 13, total: 171}
 *             ]
 *         },
 *         axes: [{
 *             type: 'numeric',
 *             position: 'left'
 *         }, {
 *             type: 'category',
 *             position: 'bottom'
 *         }],
 *         series: [{
 *             type: 'bar',
 *             xField: 'pet',
 *             yField: 'households',
 *             listeners: {
 *                 itemmousemove: function (series, item, event) {
 *                     console.log('itemmousemove', item.category, item.field);
 *                 }
 *             }
 *         }, {
 *             type: 'line',
 *             xField: 'pet',
 *             yField: 'total',
 *             marker: true
 *         }]
 *     });
 *
 */
Ext.define('Ext.chart.series.Series', {

    requires: [
        'Ext.chart.Markers',
        'Ext.chart.sprite.Label',
        'Ext.tip.ToolTip'
    ],

    mixins: [
        'Ext.mixin.Observable',
        'Ext.mixin.Bindable'
    ],

    isSeries: true,

    defaultBindProperty: 'store',

    /**
     * @property {String} type
     * The type of series. Set in subclasses.
     * @protected
     */
    type: null,

    /**
     * @property {String} seriesType
     * Default series sprite type.
     */
    seriesType: 'sprite',

    identifiablePrefix: 'ext-line-',

    observableType: 'series',

    darkerStrokeRatio: 0.15,

    /**
     * @event itemmousemove
     * Fires when the mouse is moved on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemmouseup
     * Fires when a mouseup event occurs on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemmousedown
     * Fires when a mousedown event occurs on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemmouseover
     * Fires when the mouse enters a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemmouseout
     * Fires when the mouse exits a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemclick
     * Fires when a click event occurs on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemdblclick
     * Fires when a double click event occurs on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event itemtap
     * Fires when a tap event occurs on a series item.
     * *Note*: This event requires the {@link Ext.chart.plugin.ItemEvents chartitemevents}
     * plugin be added to the chart.
     * @param {Ext.chart.series.Series} series
     * @param {Object} item
     * @param {Event} event
     */

    /**
     * @event chartattached
     * Fires when the {@link Ext.chart.AbstractChart} has been attached to this series.
     * @param {Ext.chart.AbstractChart} chart
     * @param {Ext.chart.series.Series} series
     */
    /**
     * @event chartdetached
     * Fires when the {@link Ext.chart.AbstractChart} has been detached from this series.
     * @param {Ext.chart.AbstractChart} chart
     * @param {Ext.chart.series.Series} series
     */

    /**
     * @event storechange
     * Fires when the store of the series changes.
     * @param {Ext.chart.series.Series} series
     * @param {Ext.data.Store} newStore
     * @param {Ext.data.Store} oldStore
     */

    config: {
        /**
         * @private
         * @cfg {Object} chart The chart that the series is bound.
         */
        chart: null,

        /**
         * @cfg {String|String[]} title
         * The human-readable name of the series (displayed in the legend).
         * If the series is stacked (has multiple components in it) this
         * should be an array, where each string corresponds to a stacked component.
         */
        title: null,

        /**
         * @cfg {Function} renderer
         * A function that can be provided to set custom styling properties to each rendered element.
         * It receives `(sprite, config, rendererData, index)` as parameters.
         *
         * @param {Object} sprite The sprite affected by the renderer. The visual attributes are in `sprite.attr`.
         * The data field is available in `sprite.getField()`.
         * @param {Object} config The sprite configuration. It varies with the series and the type of sprite:
         * for instance, a Line chart sprite might have just the `x` and `y` properties while a Bar
         * chart sprite also has `width` and `height`. A `type` might be present too. For instance to
         * draw each marker and each segment of a Line chart, the renderer is called with the
         * `config.type` set to either `marker` or `line`.
         * @param {Object} rendererData A record with different properties depending on the type of chart.
         * The only guaranteed property is `rendererData.store`, the store used by the series.
         * In some cases, a store may not exist: for instance a Gauge chart may read its value directly
         * from its configuration; in this case rendererData.store is null and the value is
         * available in rendererData.value.
         * @param {Number} index The index of the sprite. It is usually the index of the store record associated
         * with the sprite, in which case the record can be obtained with `store.getData().items[index]`.
         * If the chart is not associated with a store, the index represents the index of the sprite within
         * the series. For instance a Gauge chart may have as many sprites as there are sectors in the
         * background of the gauge, plus one for the needle.
         *
         * @return {Object} The attributes that have been changed or added. Note: it is usually possible to
         * add or modify the attributes directly into the `config` parameter and not return anything,
         * but returning an object with only those attributes that have been changed may allow for
         * optimizations in the rendering of some series. Example to draw every other marker in red:
         *
         *      renderer: function (sprite, config, rendererData, index) {
         *          if (config.type === 'marker') {
         *              return { strokeStyle: (index % 2 === 0 ? 'red' : 'black') };
         *          }
         *      }
         */
        renderer: null,

        /**
         * @cfg {Boolean} showInLegend
         * Whether to show this series in the legend.
         */
        showInLegend: true,

        /**
         * @private
         * Trigger drawlistener flag
         */
        triggerAfterDraw: false,

        /**
         * @cfg {Object} style Custom style configuration for the sprite used in the series.
         * It overrides the style that is provided by the current theme.
         */
        style: {},

        /**
         * @cfg {Object} subStyle This is the cyclic used if the series has multiple sprites.
         */
        subStyle: {},

        /**
         * @private
         * @cfg {Object} themeStyle Style configuration that is provided by the current theme.
         * It is composed of five objects:
         * @cfg {Object} themeStyle.style Properties common to all the series, for instance the 'lineWidth'.
         * @cfg {Object} themeStyle.subStyle Cyclic used if the series has multiple sprites.
         * @cfg {Object} themeStyle.label Sprite config for the labels, for instance the font and color.
         * @cfg {Object} themeStyle.marker Sprite config for the markers, for instance the size and stroke color.
         * @cfg {Object} themeStyle.markerSubStyle Cyclic used if series have multiple marker sprites.
         */
        themeStyle: {},

        /**
         * @cfg {Array} colors
         * An array of color values which is used, in order of appearance, by the series. Each series
         * can request one or more colors from the array. Radar, Scatter or Line charts require just
         * one color each. Candlestick and OHLC require two (1 for drops + 1 for rises). Pie charts
         * and Stacked charts (like Bar or Pie charts) require one color for each data category
         * they represent, so one color for each slice of a Pie chart or each segment (not bar) of
         * a Bar chart.
         * It overrides the colors that are provided by the current theme.
         */
        colors: null,

        /**
         * @cfg {Boolean|Number} useDarkerStrokeColor
         * Colors for the series can be set directly through the 'colors' config, or indirectly
         * with the current theme or the 'colors' config that is set onto the chart. These colors
         * are used as "fill color". Set this config to true, if you want a darker color for the
         * strokes. Set it to false if you want to use the same color as the fill color.
         * Alternatively, you can set it to a number between 0 and 1 to control how much darker
         * the strokes should be.
         * Note: this should be initial config and cannot be changed later on.
         */
        useDarkerStrokeColor: true,

        /**
         * @cfg {Object} store The store to use for this series. If not specified,
         * the series will use the chart's {@link Ext.chart.AbstractChart#store store}.
         */
        store: null,

        /**
         * @cfg {Object} label
         * Object with the following properties:
         *
         * @cfg {String} label.display
         *
         * Specifies the presence and position of the labels. The possible values depend on the series type.
         * For Line and Scatter series: 'under' | 'over' | 'rotate'.
         * For Bar and 3D Bar series: 'insideStart' | 'insideEnd' | 'outside'.
         * For Pie series: 'outside' | 'rotate' | 'horizontal' | 'vertical'.
         * Area, Radar and Candlestick series don't support labels.
         * For Area and Radar series please consider using {@link #tooltip tooltips} instead.
         * 3D Pie series currently always display labels 'outside'.
         * For all series: 'none' hides the labels.
         *
         * Default value: 'none'.
         *
         * @cfg {String} label.color
         *
         * The color of the label text.
         *
         * Default value: '#000' (black).
         *
         * @cfg {String|String[]} label.field
         *
         * The name(s) of the field(s) to be displayed in the labels. If your chart has 3 series
         * that correspond to the fields 'a', 'b', and 'c' of your model, and you only want to
         * display labels for the series 'c', you must still provide an array `[null, null, 'c']`.
         *
         * Default value: null.
         *
         * @cfg {String} label.font
         *
         * The font used for the labels.
         *
         * Default value: '14px Helvetica'.
         *
         * @cfg {String} label.orientation
         *
         * Either 'horizontal' or 'vertical'. If not set (default), the orientation is inferred
         * from the value of the flipXY property of the series.
         *
         * Default value: ''.
         *
         * @cfg {Function} label.renderer
         *
         * Optional function for formatting the label into a displayable value.
         *
         * The arguments to the method are:
         *
         *   - *`text`*, *`sprite`*, *`config`*, *`rendererData`*, *`index`*
         *
         *     Label's renderer is passed the same arguments as {@link #renderer}
         *     plus one extra 'text' argument which comes first.
         *
         * @return {Object|String} The attributes that have been changed or added, or the text for the label.
         * Example to enclose every other label in parentheses:
         *
         *      renderer: function (text) {
         *          if (index % 2 == 0) {
         *              return '(' + text + ')'
         *          }
         *      }
         *
         * Default value: null.
         */
        label: {},

        /**
         * @cfg {Number} labelOverflowPadding
         * Extra distance value for which the labelOverflow listener is triggered.
         */
        labelOverflowPadding: null,

        /**
         * @cfg {Boolean} showMarkers
         * Whether markers should be displayed at the data points along the line. If true,
         * then the {@link #marker} config item will determine the markers' styling.
         */
        showMarkers: true,

        /**
         * @cfg {Object|Boolean} marker
         * The sprite template used by marker instances on the series.
         * If the value of the marker config is set to `true` or the type
         * of the sprite instance is not specified, the {@link Ext.draw.sprite.Circle}
         * sprite will be used.
         *
         * Examples:
         *
         *     marker: true
         *
         *     marker: {
         *         radius: 8
         *     }
         *
         *     marker: {
         *         type: 'arrow',
         *         fx: {
         *             duration: 200,
         *             easing: 'backOut'
         *         }
         *     }
         */
        marker: null,

        /**
         * @cfg {Object} markerSubStyle
         * This is cyclic used if series have multiple marker sprites.
         */
        markerSubStyle: null,

        /**
         * @protected
         * @cfg {Object} itemInstancing
         * The sprite template used to create sprite instances in the series.
         */
        itemInstancing: null,

        /**
         * @cfg {Object} background
         * Sets the background of the surface the series is attached.
         */
        background: null,

        /**
         * @cfg {Object} highlightItem
         * The item currently highlighted in the series.
         */
        highlightItem: null,

        /**
         * @protected
         * @cfg {Ext.draw.Surface} surface
         * The chart surface used to render series sprites.
         */
        surface: null,

        /**
         * @protected
         * @cfg {Object} overlaySurface
         * The surface used to render series labels.
         */
        overlaySurface: null,

        /**
         * @cfg {Boolean|Array} hidden
         */
        hidden: false,

        /**
         * @cfg {Boolean/Object} highlight
         * The sprite attributes that will be applied to the highlighted items in the series.
         * If set to 'true', the default highlight style from {@link #highlightCfg} will be used.
         * If the value of this config is an object, it will be merged with the {@link #highlightCfg}.
         * In case merging of 'highlight' and 'highlightCfg' configs in not the desired behavior,
         * provide the 'highlightCfg' instead.
         */
        highlight: false,

        /**
         * @protected
         * @cfg {Object} highlightCfg
         * The default style for the highlighted item.
         * Used when {@link #highlight} config was simply set to 'true' instead of specifying a style.
         */
        highlightCfg: {
            // Make custom highlightCfg's in subclasses replace this one.
            merge: function (value) {
                return value;
            },
            $value: {
                fillStyle: 'yellow',
                strokeStyle: 'red'
            }
        },

        /**
         * @cfg {Object} animation The series animation configuration.
         */
        animation: null,

        /**
         * @cfg {Object} tooltip
         * Add tooltips to the visualization's markers. The config options for the 
         * tooltip are the same configuration used with {@link Ext.tip.ToolTip} plus a 
         * `renderer` config option and a `scope` for the renderer. For example:
         *
         *     tooltip: {
         *       trackMouse: true,
         *       width: 140,
         *       height: 28,
         *       renderer: function (toolTip, record, ctx) {
         *           toolTip.setHtml(record.get('name') + ': ' + record.get('data1') + ' views');
         *       }
         *     }
         *
         * Note that tooltips are shown for series markers and won't work
         * if the {@link #marker} is not configured.
         * @cfg {Object} tooltip.scope The scope to use when the renderer function is 
         * called.  Defaults to the Series instance.
         * @cfg {Function} tooltip.renderer An 'interceptor' method which can be used to 
         * modify the tooltip attributes before it is shown.  The renderer function is 
         * passed the following params:
         * @cfg {Ext.tip.ToolTip} tooltip.renderer.toolTip The tooltip instance
         * @cfg {Ext.data.Model} tooltip.renderer.record The record instance for the 
         * chart item (sprite) currently targeted by the tooltip.
         * @cfg {Object} tooltip.renderer.ctx A data object with values relating to the 
         * currently targeted chart sprite
         * @cfg {String} tooltip.renderer.ctx.category The type of sprite passed to the 
         * renderer function (will be "items", "markers", or "labels" depending on the 
         * target sprite of the tooltip)
         * @cfg {String} tooltip.renderer.ctx.field The {@link #yField} for the series
         * @cfg {Number} tooltip.renderer.ctx.index The target sprite's index within the 
         * series' items
         * @cfg {Ext.data.Model} tooltip.renderer.ctx.record The record instance for the 
         * chart item (sprite) currently targeted by the tooltip.
         * @cfg {Ext.chart.series.Series} tooltip.renderer.ctx.series The series instance 
         * containing the tooltip's target sprite
         * @cfg {Ext.draw.sprite.Sprite} tooltip.renderer.ctx.sprite The sprite (item) 
         * target of the tooltip
         */
        tooltip: null
    },

    directions: [],

    sprites: null,

    /**
     * @private
     * Returns the number of colors this series needs.
     * A Pie chart needs one color per slice while a Stacked Bar chart needs one per segment.
     * An OHLC chart needs 2 colors (one for drops, one for rises), and most other charts need just 1 color.
     */
    themeColorCount: function() {
        return 1;
    },

    /**
     * @private
     * @property
     * Series, where the number of sprites (an so unique colors they require)
     * depends on the number of records in the store should set this to 'true'.
     */
    isStoreDependantColorCount: false,

    /**
     * @private
     * Returns the number of markers this series needs.
     * Currently, only the Line, Scatter and Radar series use markers - and they need just one each.
     */
    themeMarkerCount: function() {
        return 0;
    },

    getFields: function (fieldCategory) {
        var me = this,
            fields = [], fieldsItem,
            i, ln;
        for (i = 0, ln = fieldCategory.length; i < ln; i++) {
            fieldsItem = me['get' + fieldCategory[i] + 'Field']();
            if (Ext.isArray(fieldsItem)) {
                fields.push.apply(fields, fieldsItem);
            } else {
                fields.push(fieldsItem);
            }
        }
        return fields;
    },

    applyAnimation: function (newAnimation, oldAnimation) {
        if (!newAnimation) {
            newAnimation = {
                duration: 0
            };
        } else if (newAnimation === true) {
            newAnimation = {
                easing: 'easeInOut',
                duration: 500
            };
        }
        return oldAnimation ? Ext.apply({}, newAnimation, oldAnimation) : newAnimation;
    },

    getAnimation: function () {
        var chart = this.getChart();
        if (chart && chart.animationSuspendCount) {
            return {
                duration: 0
            };
        } else {
            return this.callParent();
        }
    },

    updateTitle: function () {
        var me = this,
            chart = me.getChart();

        if (chart && !chart.isInitializing) {
            chart.refreshLegendStore();
        }
    },

    applyHighlight: function (highlight, oldHighlight) {
        if (Ext.isObject(highlight)) {
            highlight = Ext.merge({}, this.config.highlightCfg, highlight);
        } else if (highlight === true) {
            highlight = this.config.highlightCfg;
        }
        return Ext.apply(oldHighlight || {}, highlight);
    },

    updateHighlight: function (highlight) {
        this.getStyle();
        if (!Ext.Object.isEmpty(highlight)) {
            this.addItemHighlight();
        }
    },

    updateHighlightCfg: function (highlightCfg) {
        if (!Ext.Object.equals(highlightCfg, this.defaultConfig.highlightCfg)) {
            this.addItemHighlight();
        }
    },

    applyItemInstancing: function (instancing, oldInstancing) {
        return Ext.merge(oldInstancing || {}, instancing);
    },

    setAttributesForItem: function (item, change) {
        var sprite = item && item.sprite,
            i;

        if (sprite) {
            if (sprite.itemsMarker && item.category === 'items') {
                sprite.putMarker(item.category, change, item.index, false, true);
            }
            if (sprite.isMarkerHolder && item.category === 'markers') {
                sprite.putMarker(item.category, change, item.index, false, true);
            } else if (sprite.isInstancing) {
                sprite.setAttributesFor(item.index, change);
            } else {
                if (Ext.isArray(sprite)) {
                    // In some instances, like with the 3D pie series,
                    // an item can be composed of multiple sprites
                    // (e.g. 8 for 3D pie slice).
                    for (i = 0; i < sprite.length; i++) {
                        sprite[i].setAttributes(change);
                    }
                } else {
                    sprite.setAttributes(change);
                }
            }
        }
    },

    getBBoxForItem: function (item) {
        if (item && item.sprite) {
            if (item.sprite.itemsMarker && item.category === 'items') {
                return item.sprite.getMarkerBBox(item.category, item.index);
            } else if (item.sprite instanceof Ext.draw.sprite.Instancing) {
                return item.sprite.getBBoxFor(item.index);
            } else {
                return item.sprite.getBBox();
            }
        }
        return null;
    },

    applyHighlightItem: function (newHighlightItem, oldHighlightItem) {
        if (newHighlightItem === oldHighlightItem) {
            return;
        }
        if (Ext.isObject(newHighlightItem) && Ext.isObject(oldHighlightItem)) {
            var isSameSprite = newHighlightItem.sprite === oldHighlightItem.sprite,
                isSameIndex = newHighlightItem.index === oldHighlightItem.index;

            if (isSameSprite && isSameIndex) {
                return;
            }
        }
        return newHighlightItem;
    },

    updateHighlightItem: function (newHighlightItem, oldHighlightItem) {
        this.setAttributesForItem(oldHighlightItem, {highlighted: false});
        this.setAttributesForItem(newHighlightItem, {highlighted: true});
    },

    constructor: function (config) {
        var me = this,
            id;

        config = config || {};

        // Backward compatibility with Ext.
        if (config.tips) {
            config = Ext.apply({
                tooltip: config.tips
            }, config);
        }
        // Backward compatibility with Touch.
        if (config.highlightCfg) {
            config = Ext.apply({
                highlight: config.highlightCfg
            }, config);
        }

        if ('id' in config) {
            id = config.id;
        } else if ('id' in me.config) {
            id = me.config.id;
        } else {
            id = me.getId();
        }
        me.setId(id);

        me.sprites = [];
        me.dataRange = [];

        me.mixins.observable.constructor.call(me, config);
        me.initBindable();
    },

    lookupViewModel: function (skipThis) {
        // Override the Bindable's method to redirect view model
        // lookup to the chart.
        var chart = this.getChart();
        return chart ? chart.lookupViewModel(skipThis) : null;
    },

    applyTooltip: function (tooltip, oldTooltip) {
        var config = Ext.apply({
            xtype: 'tooltip',
            renderer: Ext.emptyFn,
            constrainPosition: true,
            shrinkWrapDock: true,
            autoHide: true,
            mouseOffset: [20, 20]
        }, tooltip);

        return Ext.create(config);
    },

    updateTooltip: function () {
        // Tooltips can't work without the 'itemhighlight' or the 'itemedit' interaction.
        this.addItemHighlight();
    },

    // Adds the 'itemhighlight' interaction to the chart that owns the series.
    addItemHighlight: function () {
        var chart = this.getChart();

        if (!chart) {
            return;
        }

        var interactions = chart.getInteractions(),
            i, interaction, hasRequiredInteraction;

        for (i = 0; i < interactions.length; i++) {
            interaction = interactions[i];
            if (interaction.isItemHighlight || interaction.isItemEdit) {
                hasRequiredInteraction = true;
                break;
            }
        }
        if (!hasRequiredInteraction) {
            interactions.push('itemhighlight');
            chart.setInteractions(interactions);
        }
    },

    showTooltip: function (item, event) {
        var me = this,
            tooltip = me.getTooltip();

        if (!tooltip) {
            return;
        }
        clearTimeout(me.tooltipTimeout);

        // If trackMouse is set, a ToolTip shows by its pointerEvent.
        // A Tooltip aligning to an element uses a currentTarget flyweight
        // which may be pointed at any element.
        // It aligns using the component level defaultAlign config.
        tooltip.pointerEvent = event;
        tooltip.currentTarget.attach((item.sprite.length ? item.sprite[0] : item.sprite).getSurface().el.dom);

        Ext.callback(tooltip.renderer, tooltip.scope,
            [tooltip, item.record, item], 0, me);

        if (tooltip.isVisible()) {
            // After show handling repositions according
            // to configuration. trackMouse uses the pointerEvent
            // If aligning to an element, it uses a currentTarget
            // flyweight which may be attached to any DOM element.
            tooltip.handleAfterShow();
        } else {
            tooltip.show();
        }
    },

    hideTooltip: function (item) {
        var me = this,
            tooltip = me.getTooltip();

        if (!tooltip) {
            return;
        }
        clearTimeout(me.tooltipTimeout);
        me.tooltipTimeout = Ext.defer(function () {
            tooltip.hide();
        }, 1);
    },

    applyStore: function (store) {
        return store && Ext.StoreManager.lookup(store);
    },

    getStore: function () {
        return this._store || this.getChart() && this.getChart().getStore();
    },

    updateStore: function (newStore, oldStore) {
        var me = this,
            chart = me.getChart(),
            chartStore = chart && chart.getStore(),
            sprites, sprite, len, i;

        oldStore = oldStore || chartStore;

        if (oldStore && oldStore !== newStore) {
            oldStore.un({
                datachanged: 'onDataChanged',
                update: 'onDataChanged',
                scope: me
            });
        }
        if (newStore) {
            newStore.on({
                datachanged: 'onDataChanged',
                update: 'onDataChanged',
                scope: me
            });
            sprites = me.getSprites();
            for (i = 0, len = sprites.length; i < len; i++) {
                sprite = sprites[i];
                if (sprite.setStore) {
                    sprite.setStore(newStore);
                }
            }
            me.onDataChanged();
        }

        me.fireEvent('storechange', me, newStore, oldStore);
    },

    onStoreChange: function (chart, newStore, oldStore) {
        if (!this._store) {
            this.updateStore(newStore, oldStore);
        }
    },

    coordinate: function (direction, directionOffset, directionCount) {
        var me = this,
            store = me.getStore(),
            hidden = me.getHidden(),
            items = store.getData().items,
            axis = me['get' + direction + 'Axis'](),
            range = {min: Infinity, max: -Infinity},
            fieldCategory = me['fieldCategory' + direction] || [direction],
            fields = me.getFields(fieldCategory),
            i, field, data, style = {},
            sprites = me.getSprites();

        if (sprites.length > 0) {
            if (!Ext.isBoolean(hidden) || !hidden) {
                for (i = 0; i < fieldCategory.length; i++) {
                    field = fields[i];
                    data = me.coordinateData(items, field, axis);
                    me.getRangeOfData(data, range);
                    style['data' + fieldCategory[i]] = data;
                }
            }
            me.dataRange[directionOffset] = range.min;
            me.dataRange[directionOffset + directionCount] = range.max;
            style['dataMin' + direction] = range.min;
            style['dataMax' + direction] = range.max;
            if (axis) {
                axis.range = null;
                style['range' + direction] = axis.getRange();
            }
            for (i = 0; i < sprites.length; i++) {
                sprites[i].setAttributes(style);
            }
        }
    },

    /**
     * @private
     * This method will return an array containing data coordinated by a specific axis.
     * @param {Array} items Store records.
     * @param {String} field The field to fetch from each record.
     * @param {Ext.chart.axis.Axis} axis The axis used to lay out the data.
     * @return {Array}
     */
    coordinateData: function (items, field, axis) {
        var data = [],
            length = items.length,
            layout = axis && axis.getLayout(),
            i, x;

        for (i = 0; i < length; i++) {
            x = items[i].data[field];
            // An empty string (a valid discrete axis value) will be coordinated
            // by the axis layout (if axis is given), otherwise it will be converted
            // to zero (via +'').
            if (!Ext.isEmpty(x, true)) {
                if (layout) {
                    data[i] = layout.getCoordFor(x, field, i, items);
                } else {
                    data[i] = +x;
                }
            } else {
                data[i] = x;
            }
        }
        return data;
    },

    getRangeOfData: function (data, range) {
        var length = data.length,
            min = range.min,
            max = range.max,
            i, value;

        for (i = 0; i < length; i++) {
            value = data[i];
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        }
        range.min = min;
        range.max = max;
    },

    updateLabelData: function () {
        var me = this,
            store = me.getStore(),
            items = store.getData().items,
            sprites = me.getSprites(),
            labelTpl = me.getLabel().getTemplate(),
            labelFields = Ext.Array.from(labelTpl.getField()),
            i, j, ln, labels,
            sprite, field;

        if (!sprites.length || !labelFields.length) {
            return;
        }

        for (i = 0; i < sprites.length; i++) {
            labels = [];
            sprite = sprites[i];
            field = sprite.getField();
            if (Ext.Array.indexOf(labelFields, field) < 0) {
                field = labelFields[i];
            }
            for (j = 0, ln = items.length; j < ln; j++) {
                labels.push(items[j].get(field));
            }
            sprite.setAttributes({labels: labels});
        }
    },

    processData: function () {
        var me = this;

        if (me.isProcessingData || !me.getStore()) {
            return;
        }

        var directions = this.directions,
            i, ln = directions.length,
            direction, axis;

        me.isProcessingData = true;

        for (i = 0; i < ln; i++) {
            direction = directions[i];
            axis = me['get' + direction + 'Axis']();
            if (axis) {
                axis.processData(me);
                continue;
            }
            if (me['coordinate' + direction]) {
                me['coordinate' + direction]();
            }
        }
        me.updateLabelData();

        me.isProcessingData = false;
    },

    applyBackground: function (background) {
        if (this.getChart()) {
            this.getSurface().setBackground(background);
            return this.getSurface().getBackground();
        } else {
            return background;
        }
    },

    updateChart: function (newChart, oldChart) {
        var me = this,
            store = me._store;

        if (oldChart) {
            oldChart.un('axeschange', 'onAxesChange', me);
            me.clearSprites();
            me.setSurface(null);
            me.setOverlaySurface(null);
            oldChart.unregister(me);
            me.onChartDetached(oldChart);
            if (!store) {
                me.updateStore(null);
            }
        }
        if (newChart) {
            me.setSurface(newChart.getSurface('series'));
            me.setOverlaySurface(newChart.getSurface('overlay'));

            newChart.on('axeschange', 'onAxesChange', me);
            // TODO: Gauge series should render correctly when chart's store is missing.
            // TODO: When store is initially missing the getAxes will return null here,
            // TODO: since applyAxes has actually triggered this series.updateChart call
            // TODO: indirectly.
            // TODO: Figure out why it doesn't go this route when a store is present.
            if (newChart.getAxes()) {
                me.onAxesChange(newChart);
            }
            me.onChartAttached(newChart);
            newChart.register(me);
            if (!store) {
                me.updateStore(newChart.getStore());
            }
        }
    },

    onAxesChange: function (chart) {
        var me = this,
            axes = chart.getAxes(), axis,
            directionToAxesMap = {},
            directionToFieldsMap = {},
            needHighPrecision = false,
            directions = this.directions, direction,
            i, ln;

        for (i = 0, ln = directions.length; i < ln; i++) {
            direction = directions[i];
            directionToFieldsMap[direction] = me.getFields(me['fieldCategory' + direction]);
        }

        for (i = 0, ln = axes.length; i < ln; i++) {
            axis = axes[i];
            if (!directionToAxesMap[axis.getDirection()]) {
                directionToAxesMap[axis.getDirection()] = [axis];
            } else {
                directionToAxesMap[axis.getDirection()].push(axis);
            }
        }

        for (i = 0, ln = directions.length; i < ln; i++) {
            direction = directions[i];
            if (me['get' + direction + 'Axis']()) {
                continue;
            }
            if (directionToAxesMap[direction]) {
                axis = me.findMatchingAxis(directionToAxesMap[direction], directionToFieldsMap[direction]);
                if (axis) {
                    me['set' + direction + 'Axis'](axis);
                    if (axis.getNeedHighPrecision()) {
                        needHighPrecision = true;
                    }
                }
            }
        }
        this.getSurface().setHighPrecision(needHighPrecision);
    },

    /**
     * @private
     * Given the list of axes in a certain direction and a list of series fields in that direction
     * returns the first matching axis for the series in that direction,
     * or undefined if a match wasn't found.
     */
    findMatchingAxis: function (directionAxes, directionFields) {
        var axis, axisFields,
            i, j;

        for (i = 0; i < directionAxes.length; i++) {
            axis = directionAxes[i];
            axisFields = axis.getFields();
            if (!axisFields.length) {
                return axis;
            } else {
                if (directionFields) {
                    for (j = 0; j < directionFields.length; j++) {
                        if ( Ext.Array.indexOf(axisFields, directionFields[j]) >= 0 ) {
                            return axis;
                        }
                    }
                }
            }
        }
    },

    onChartDetached: function (oldChart) {
        var me = this;
        me.fireEvent('chartdetached', oldChart, me);
        oldChart.un('storechange', 'onStoreChange', me);
    },

    onChartAttached: function (chart) {
        var me = this;
        me.setBackground(me.getBackground());
        me.fireEvent('chartattached', chart, me);
        chart.on('storechange', 'onStoreChange', me);
        me.processData();
    },

    updateOverlaySurface: function (overlaySurface) {
        var me = this;
        if (overlaySurface) {
            if (me.getLabel()) {
                me.getOverlaySurface().add(me.getLabel());
            }
        }
    },

    applyLabel: function (label, oldLabel) {
        var template, chart;

        if (!oldLabel) {
            oldLabel = new Ext.chart.Markers({zIndex: 10});
            oldLabel.setTemplate(new Ext.chart.sprite.Label(label));
        } else {
            template = oldLabel.getTemplate();
            template.setAttributes(label);
            if (label) {
                if (label.field) {
                    template.setField(label.field);
                    this.updateLabelData();
                }
                if (label.display) {
                    oldLabel.setAttributes({
                        hidden: label.display === 'none'
                    });
                }
            }
            oldLabel.setDirty(true); // inform the label about the template change
            this.updateLabel(); // won't be called automatically in this case
        }
        return oldLabel;
    },

    updateLabel: function () {
        var chart = this.getChart();

        if (chart && !chart.isInitializing) {
            chart.redraw();
        }
    },

    createItemInstancingSprite: function (sprite, itemInstancing) {
        var me = this,
            markers = new Ext.chart.Markers(),
            config, template;

        markers.setAttributes({zIndex: Number.MAX_VALUE});
        config = Ext.apply({}, itemInstancing);
        if (me.getHighlight()) {
            config.highlight = me.getHighlight();
            config.modifiers = ['highlight'];
        }
        markers.setTemplate(config);
        template = markers.getTemplate();
        template.setAttributes(me.getStyle());
        template.fx.on('animationstart', 'onSpriteAnimationStart', this);
        template.fx.on('animationend', 'onSpriteAnimationEnd', this);
        sprite.bindMarker('items', markers);

        me.getSurface().add(markers);
        return markers;
    },

    getDefaultSpriteConfig: function () {
        return {
            type: this.seriesType,
            renderer: this.getRenderer()
        };
    },

    updateRenderer: function (renderer) {
        var me = this,
            chart = me.getChart(),
            sprites;

        if (chart && chart.isInitializing) {
            return;
        }
        sprites = me.getSprites();
        // TODO: Removing the renderer won't revert series markers to its original
        // TODO: style, if the renderer modified their attributes.
        if (sprites.length) {
            sprites[0].setAttributes({renderer: renderer || null});
            if (chart && !chart.isInitializing) {
                chart.redraw();
            }
        }
    },

    updateShowMarkers: function (showMarkers) {
        var sprites = this.getSprites(),
            sprite = sprites && sprites[0],
            markers = sprite && sprite.getMarker('markers');

        if (markers) {
            markers.getTemplate().setAttributes({
                hidden: !showMarkers
            });
        }
    },

    createSprite: function () {
        var me = this,
            surface = me.getSurface(),
            itemInstancing = me.getItemInstancing(),
            sprite = surface.add(me.getDefaultSpriteConfig()),
            marker = me.getMarker(),
            markers, markersTpl;

        sprite.setAttributes(me.getStyle());
        sprite.setSeries(me);

        if (itemInstancing) {
            sprite.itemsMarker = me.createItemInstancingSprite(sprite, itemInstancing);
        }

        if (sprite.bindMarker) {
            if (marker) {
                markers = new Ext.chart.Markers();
                markersTpl = Ext.Object.merge({}, marker);
                if (me.getHighlight()) {
                    markersTpl.highlight = me.getHighlight();
                    markersTpl.modifiers = ['highlight'];
                }
                markers.setTemplate(markersTpl);
                markers.getTemplate().fx.setCustomDurations({
                    translationX: 0,
                    translationY: 0
                });
                sprite.dataMarker = markers;
                sprite.bindMarker('markers', markers);
                me.getOverlaySurface().add(markers);
            }
            if (me.getLabel().getTemplate().getField()) {
                sprite.bindMarker('labels', me.getLabel());
            }
        }

        if (sprite.setStore) {
            sprite.setStore(me.getStore());
        }

        sprite.fx.on('animationstart', 'onSpriteAnimationStart', me);
        sprite.fx.on('animationend', 'onSpriteAnimationEnd', me);

        me.sprites.push(sprite);

        return sprite;
    },

    /**
     * @method
     * Returns sprites the are used to draw this series.
     */
    getSprites: Ext.emptyFn,

    onDataChanged: function () {
        var me = this,
            chart = me.getChart(),
            chartStore = chart && chart.getStore(),
            seriesStore = me.getStore();

        if (seriesStore !== chartStore) {
            me.processData();
        }
    },

    isXType: function (xtype) {
        return xtype === 'series';
    },

    getItemId: function () {
        return this.getId();
    },

    applyThemeStyle: function (theme, oldTheme) {
        var me = this,
            fill, stroke;

        fill = theme && theme.subStyle && theme.subStyle.fillStyle;
        stroke = fill && theme.subStyle.strokeStyle;
        if (fill && !stroke) {
            theme.subStyle.strokeStyle = me.getStrokeColorsFromFillColors(fill);
        }

        fill = theme && theme.markerSubStyle && theme.markerSubStyle.fillStyle;
        stroke = fill && theme.markerSubStyle.strokeStyle;
        if (fill && !stroke) {
            theme.markerSubStyle.strokeStyle = me.getStrokeColorsFromFillColors(fill);
        }
        return Ext.apply(oldTheme || {}, theme);
    },

    applyStyle: function (style, oldStyle) {
        // TODO: Incremental setter
        var cls = Ext.ClassManager.get(Ext.ClassManager.getNameByAlias('sprite.' + this.seriesType));
        if (cls && cls.def) {
            style = cls.def.normalize(style);
        }
        return Ext.apply({}, style, oldStyle);
    },

    applySubStyle: function (subStyle, oldSubStyle) {
        var cls = Ext.ClassManager.get(Ext.ClassManager.getNameByAlias('sprite.' + this.seriesType));
        if (cls && cls.def) {
            subStyle = cls.def.batchedNormalize(subStyle, true);
        }
        return Ext.merge({}, oldSubStyle, subStyle);
    },

    applyMarker: function (marker, oldMarker) {
        var type = (marker && marker.type) || (oldMarker && oldMarker.type) || 'circle',
            cls = Ext.ClassManager.get(Ext.ClassManager.getNameByAlias('sprite.' + type));
        if (cls && cls.def) {
            marker = cls.def.normalize(Ext.isObject(marker) ? marker : {}, true);
            marker.type = type;
        }
        return Ext.merge(oldMarker || {}, marker);
    },

    applyMarkerSubStyle: function (marker, oldMarker) {
        var type = (marker && marker.type) || (oldMarker && oldMarker.type) || 'circle',
            cls = Ext.ClassManager.get(Ext.ClassManager.getNameByAlias('sprite.' + type));
        if (cls && cls.def) {
            marker = cls.def.batchedNormalize(marker, true);
        }
        return Ext.merge(oldMarker || {}, marker);
    },

    updateHidden: function (hidden) {
        var me = this;

        me.getColors();
        me.getSubStyle();
        me.setSubStyle({hidden: hidden});
        me.processData();
        me.doUpdateStyles();

        if (!Ext.isArray(hidden)) {
            me.updateLegendStore(hidden);
        }
    },

    /**
     * @private
     * Updates chart's legend store when the value of the series' {@link #hidden} config
     * changes or when the {@link #setHiddenByIndex} method is called.
     * @param hidden Whether series (or its component) should be hidden or not.
     * @param index Used for stacked series.
     *              If present, only the component with the specified index will change visibility.
     */
    updateLegendStore: function (hidden, index) {
        var me = this,
            chart = me.getChart(),
            legendStore = chart.getLegendStore(),
            id = me.getId(),
            record;

        if (legendStore) {
            if (arguments.length > 1) {
                record = legendStore.findBy(function (rec) {
                    return rec.get('series') === id &&
                           rec.get('index')  === index;
                });
                if (record !== -1) {
                    record = legendStore.getAt(record);
                }
            } else {
                record = legendStore.findRecord('series', id);
            }
            if (record && record.get('disabled') !== hidden) {
                record.set('disabled', hidden);
            }
        }
    },

    /**
     *
     * @param {Number} index
     * @param {Boolean} value
     */
    setHiddenByIndex: function (index, value) {
        var me = this;

        if (Ext.isArray(me.getHidden())) {
            // Multi-sprite series like Pie and StackedCartesian.
            me.getHidden()[index] = value;
            me.updateHidden(me.getHidden());
            me.updateLegendStore(value, index);
        } else {
            me.setHidden(value);
        }
    },

    getStrokeColorsFromFillColors: function (colors) {
        var me = this,
            darker = me.getUseDarkerStrokeColor(),
            darkerRatio = (Ext.isNumber(darker) ? darker : me.darkerStrokeRatio),
            strokeColors;

        if (darker) {
            strokeColors = Ext.Array.map(colors, function (color) {
                color = Ext.isString(color) ? color : color.stops[0].color;
                color = Ext.util.Color.fromString(color);
                return color.createDarker(darkerRatio).toString();
            });
        } else {
            strokeColors = Ext.Array.clone(colors);
        }
        return strokeColors;
    },

    updateThemeColors: function (colors) {
        var me = this,
            theme = me.getThemeStyle(),
            fillColors = Ext.Array.clone(colors),
            strokeColors = me.getStrokeColorsFromFillColors(colors),
            newSubStyle = { fillStyle: fillColors, strokeStyle: strokeColors };

        theme.subStyle = Ext.apply(theme.subStyle || {}, newSubStyle);
        theme.markerSubStyle = Ext.apply(theme.markerSubStyle || {}, newSubStyle);

        me.doUpdateStyles();
    },

    themeOnlyIfConfigured: {
    },

    updateTheme: function (theme) {
        var me = this,
            seriesTheme = theme.getSeries(),
            initialConfig = me.getInitialConfig(),
            defaultConfig = me.defaultConfig,
            configs = me.self.getConfigurator().configs,
            genericSeriesTheme = seriesTheme.defaults,
            specificSeriesTheme = seriesTheme[me.type],
            themeOnlyIfConfigured = me.themeOnlyIfConfigured,
            key, value, isObjValue, isUnusedConfig, initialValue, cfg;

        seriesTheme = Ext.merge({}, genericSeriesTheme, specificSeriesTheme);
        for (key in seriesTheme) {
            value = seriesTheme[key];
            cfg = configs[key];
            if (value !== null && value !== undefined && cfg) {
                initialValue = initialConfig[key];
                isObjValue = Ext.isObject(value);
                isUnusedConfig = initialValue === defaultConfig[key];
                if (isObjValue) {
                    if (isUnusedConfig && themeOnlyIfConfigured[key]) {
                        continue;
                    }
                    value = Ext.merge({}, value, initialValue);
                }
                if (isUnusedConfig || isObjValue) {
                    me[cfg.names.set](value);
                }
            }
        }
    },

    /**
     * @private
     * When the chart's "colors" config changes, these colors are passed onto the series
     * where they are used with the same priority as theme colors, i.e. they do not override
     * the series' "colors" config, nor the series' "style" config, but they do override
     * the colors from the theme's "seriesThemes" config.
     */
    updateChartColors: function (colors) {
        var me = this;

        if (!me.getColors()) {
            me.updateThemeColors(colors);
        }
    },

    updateColors: function (colors) {
        this.updateThemeColors(colors);
    },

    updateStyle: function () {
        this.doUpdateStyles();
    },

    updateSubStyle: function () {
        this.doUpdateStyles();
    },

    updateThemeStyle: function () {
        this.doUpdateStyles();
    },

    doUpdateStyles: function () {
        var me = this,
            sprites = me.sprites,
            itemInstancing = me.getItemInstancing(),
            i = 0, ln = sprites && sprites.length,
            // 'showMarkers' updater calls 'series.getSprites()',
            // which we don't want to call here.
            showMarkers = me.getConfig('showMarkers', true),
            markerCfg = me.getMarker(),
            style;

        // TODO: make sure all series work nicely with the below change
//        me.setAnimation(me.getChart().getAnimation());
        for (; i < ln; i++) {
            style = me.getStyleByIndex(i);
            if (itemInstancing) {
                sprites[i].itemsMarker.getTemplate().setAttributes(style);
            }
            sprites[i].setAttributes(style);
            if (markerCfg && sprites[i].dataMarker) {
                sprites[i].dataMarker.getTemplate().setAttributes(me.getMarkerStyleByIndex(i));
            }
        }
    },

    getStyleWithTheme: function() {
        var me = this,
            theme = me.getThemeStyle(),
            seriesThemeStyle = (theme && theme.style) || {},
            style = Ext.applyIf(Ext.apply({}, me.getStyle()), seriesThemeStyle);
        return style;
    },

    getSubStyleWithTheme: function() {
        var me = this,
            theme = me.getThemeStyle(),
            seriesThemeSubStyle = (theme && theme.subStyle) || {},
            subStyle = Ext.applyIf(Ext.apply({}, me.getSubStyle()), seriesThemeSubStyle);
        return subStyle;
    },

    // getMarkerStyleWithTheme: function() {
    //     var me = this,
    //         theme = me.getThemeStyle(),
    //         seriesThemeStyle = (theme && theme.style) || {},
    //         style = Ext.applyIf(Ext.apply({}, me.getMarker()), seriesThemeStyle);
    //     return style;
    // },

    // getMarkerSubStyleWithTheme: function() {
    //     var me = this,
    //         theme = me.getThemeStyle(),
    //         seriesThemeStyle = (theme && theme.style) || {},
    //         style = Ext.applyIf(Ext.apply({}, me.getMarkerSubStyle()), seriesThemeStyle);
    //     return style;
    // },

    getStyleByIndex: function (i) {
        var me = this,
            theme = me.getThemeStyle(),
            style, themeStyle, subStyle, themeSubStyle,
            result = {};

        style = me.getStyle();
        themeStyle = (theme && theme.style) || {};

        subStyle = me.styleDataForIndex(me.getSubStyle(), i);
        themeSubStyle = me.styleDataForIndex((theme && theme.subStyle), i);

        Ext.apply(result, themeStyle);
        Ext.apply(result, themeSubStyle);

        Ext.apply(result, style);
        Ext.apply(result, subStyle);

        return result;
    },

    getMarkerStyleByIndex: function (i) {
        var me = this,
            theme = me.getThemeStyle(),
            style, themeStyle, subStyle, themeSubStyle,
            markerStyle, themeMarkerStyle, markerSubStyle, themeMarkerSubStyle,
            result = {};

        style = me.getStyle();
        themeStyle = (theme && theme.style) || {};

        // 'series.updateHidden()' will update 'series.subStyle.hidden' config
        // with the value of the 'series.hidden' config.
        // But we also need to account for 'series.showMarkers' config
        // to determine whether the markers should be hidden or not.
        subStyle = me.styleDataForIndex(me.getSubStyle(), i);
        if (subStyle.hasOwnProperty('hidden')) {
            subStyle.hidden = subStyle.hidden || !this.getConfig('showMarkers', true);
        }
        themeSubStyle = me.styleDataForIndex((theme && theme.subStyle), i);

        markerStyle = me.getMarker();
        themeMarkerStyle = (theme && theme.marker) || {};

        markerSubStyle = me.getMarkerSubStyle();
        themeMarkerSubStyle = me.styleDataForIndex((theme && theme.markerSubStyle), i);

        Ext.apply(result, themeStyle);
        Ext.apply(result, themeSubStyle);
        Ext.apply(result, themeMarkerStyle);
        Ext.apply(result, themeMarkerSubStyle);

        Ext.apply(result, style);
        Ext.apply(result, subStyle);
        Ext.apply(result, markerStyle);
        Ext.apply(result, markerSubStyle);

        return result;
    },

    styleDataForIndex: function (style, i) {
        var value, name, result = {};

        if (style) {
            for (name in style) {
                value = style[name];
                if (Ext.isArray(value)) {
                    result[name] = value[i % value.length];
                } else {
                    result[name] = value;
                }
            }
        }
        return result;
    },

    /**
     * @method
     * For a given x/y point relative to the main rect, find a corresponding item from this
     * series, if any.
     * @param {Number} x
     * @param {Number} y
     * @param {Object} [target] optional target to receive the result
     * @return {Object} An object describing the item, or null if there is no matching item. The exact contents of
     * this object will vary by series type, but should always contain at least the following:
     *
     * @return {Ext.data.Model} return.record the record of the item.
     * @return {Array} return.point the x/y coordinates relative to the chart box of a single point
     * for this data item, which can be used as e.g. a tooltip anchor point.
     * @return {Ext.draw.sprite.Sprite} return.sprite the item's rendering Sprite.
     * @return {Number} return.subSprite the index if sprite is an instancing sprite.
     */
    getItemForPoint: Ext.emptyFn,

    /**
     * Returns a series item by index and (optional) category.
     * @param {Number} index The index of the item (matches store record index).
     * @param {String} [category] The category of item, e.g.: 'items', 'markers', 'sprites'.
     * @return {Object} item
     */
    getItemByIndex: function (index, category) {
        var me = this,
            sprites = me.getSprites(),
            sprite = sprites && sprites[0],
            item;

        if (!sprite) {
            return;
        }

        // 'category' is not defined, making our best guess here.
        if (category === undefined && sprite.isMarkerHolder) {
            category = me.getItemInstancing() ? 'items' : 'markers';
        } else if (!category || category === '' || category === 'sprites') {
            sprite = sprites[index];
        }

        if (sprite) {
            item = {
                series: me,
                category: category,
                index: index,
                record: me.getStore().getData().items[index],
                field: me.getYField(),
                sprite: sprite
            };
            return item;
        }
    },

    onSpriteAnimationStart: function (sprite) {
        this.fireEvent('animationstart', this, sprite);
    },

    onSpriteAnimationEnd: function (sprite) {
        this.fireEvent('animationend', this, sprite);
    },

    resolveListenerScope: function (defaultScope) {
        // Override the Observable's method to redirect listener scope
        // resolution to the chart.
        var me = this,
            namedScope = Ext._namedScopes[defaultScope],
            chart = me.getChart(),
            scope;

        if (!namedScope) {
            scope = chart ? chart.resolveListenerScope(defaultScope, false) : (defaultScope || me);
        } else if (namedScope.isThis) {
            scope = me;
        } else if (namedScope.isController) {
            scope = chart ? chart.resolveListenerScope(defaultScope, false) : me;
        } else if (namedScope.isSelf) {
            scope = chart ? chart.resolveListenerScope(defaultScope, false) : me;
            // Class body listener. No chart controller, nor chart container controller.
            if (scope === chart && !chart.getInheritedConfig('defaultListenerScope')) {
                scope = me;
            }
        }

        return scope;
    },

    /**
     * Provide legend information to target array.
     *
     * @param {Array} target
     *
     * The information consists:
     * @param {String} target.name
     * @param {String} target.mark
     * @param {Boolean} target.disabled
     * @param {String} target.series
     * @param {Number} target.index
     */
    provideLegendInfo: function (target) {
        target.push({
            name: this.getTitle() || this.getId(),
            mark: 'black',
            disabled: this.getHidden(),
            series: this.getId(),
            index: 0
        });
    },

    clearSprites: function () {
        var sprites = this.sprites,
            sprite, i, ln;

        for (i = 0, ln = sprites.length; i < ln; i++) {
            sprite = sprites[i];
            if (sprite && sprite.isSprite) {
                sprite.destroy();
            }
        }
        this.sprites = [];
    },

    destroy: function () {
        var me = this,
            store = me._store,
            // Peek at the config so we don't create one just to destroy it
            tooltip = me.getConfig('tooltip', true);

        if (store && store.getAutoDestroy()) {
            Ext.destroy(store);
        }

        me.setChart(null);

        me.clearListeners();

        if (tooltip) {
            Ext.destroy(tooltip);
            clearTimeout(me.tooltipTimeout);
        }
        me.callParent();
    }
});
