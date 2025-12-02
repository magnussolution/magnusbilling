/**
 * @private
 *
 * A general {@link Ext.picker.Picker} slot class.  Slots are used to organize multiple scrollable slots into
 * a single {@link Ext.picker.Picker}.
 *
 *     {
 *         name : 'limit_speed',
 *         title: 'Speed Limit',
 *         data : [
 *             {text: '50 KB/s', value: 50},
 *             {text: '100 KB/s', value: 100},
 *             {text: '200 KB/s', value: 200},
 *             {text: '300 KB/s', value: 300}
 *         ]
 *     }
 *
 * See the {@link Ext.picker.Picker} documentation on how to use slots.
 */
Ext.define('Ext.picker.Slot', {
    extend: 'Ext.dataview.DataView',
    xtype: 'pickerslot',
    
    requires: [
        'Ext.XTemplate',
        'Ext.data.Store',
        'Ext.Component',
        'Ext.data.StoreManager'
    ],

    /**
     * @event slotpick
     * Fires whenever an slot is picked
     * @param {Ext.picker.Slot} this
     * @param {Mixed} value The value of the pick
     * @param {HTMLElement} node The node element of the pick
     */

    isSlot: true,

    config: {
        /**
         * @cfg {String} title The title to use for this slot, or `null` for no title.
         * @accessor
         */
        title: null,

        /**
         * @private
         * @cfg {Boolean} showTitle
         * @accessor
         */
        showTitle: true,

        /**
         * @private
         * @cfg {String} cls The main component class
         * @accessor
         */
        cls: Ext.baseCSSPrefix + 'picker-slot',

        /**
         * @cfg {String} name (required) The name of this slot.
         * @accessor
         */
        name: null,

        /**
         * @cfg {Number} value The value of this slot
         * @accessor
         */
        value: null,

        /**
         * @cfg {Number} flex
         * @accessor
         * @private
         */
        flex: 1,

        /**
         * @cfg {String} align The horizontal alignment of the slot's contents.
         *
         * Valid values are: "left", "center", and "right".
         * @accessor
         */
        align: 'left',

        /**
         * @cfg {String} displayField The display field in the store.
         * @accessor
         */
        displayField: 'text',

        /**
         * @cfg {String} valueField The value field in the store.
         * @accessor
         */
        valueField: 'value',

        /**
         * @cfg {String} itemTpl The template to be used in this slot.
         * If you set this, {@link #displayField} will be ignored.
         */
        itemTpl: null,

        /**
         * @cfg {Object} scrollable
         * @accessor
         * @hide
         */
        scrollable: {
            x: false,
            y: true,
            scrollbars: false
        },

        /**
         * @cfg {Boolean} verticallyCenterItems
         * @private
         */
        verticallyCenterItems: true
    },

    snapSelector: '.' + Ext.baseCSSPrefix + 'dataview-item',

    /**
     * @property selectedIndex
     * @type Number
     * The current `selectedIndex` of the picker slot.
     * @private
     */
    selectedIndex: 0,

    /**
     * Sets the title for this dataview by creating element.
     * @param {String} title
     * @return {String}
     */
    applyTitle: function(title) {
        //check if the title isnt defined
        if (title) {
            //create a new title element
            title = Ext.create('Ext.Component', {
                cls: Ext.baseCSSPrefix + 'picker-slot-title',
                docked: 'top',
                html: title
            });
        }

        return title;
    },

    updateTitle: function(newTitle, oldTitle) {
        if (newTitle) {
            this.add(newTitle);
            this.setupBar();
        }

        if (oldTitle) {
            this.remove(oldTitle);
        }
    },

    updateShowTitle: function(showTitle) {
        var title = this.getTitle(),
            mode = showTitle ? 'show' : 'hide';
        if (title) {
            title.on(mode, this.setupBar, this, { single: true, delay: 50 });
            title[showTitle ? 'show' : 'hide']();
        }
    },

    updateDisplayField: function(newDisplayField) {
        if (!this.config.itemTpl) {
            this.setItemTpl('<div class="' + Ext.baseCSSPrefix + 'picker-item {cls} <tpl if="extra">' + Ext.baseCSSPrefix + 'picker-invalid</tpl>">{' + newDisplayField + '}</div>');
        }
    },

    /**
     * Updates the {@link #align} configuration
     */
    updateAlign: function(newAlign, oldAlign) {
        var element = this.element;
        element.addCls(Ext.baseCSSPrefix + 'picker-' + newAlign);
        element.removeCls(Ext.baseCSSPrefix + 'picker-' + oldAlign);
    },

    /**
     * Looks at the {@link #data} configuration and turns it into {@link #store}.
     * @param {Object} data
     * @return {Object}
     */
    applyData: function(data) {
        var parsedData = [],
            ln = data && data.length,
            i, item, obj;

        if (data && Ext.isArray(data) && ln) {
            for (i = 0; i < ln; i++) {
                item = data[i];
                obj = {};
                if (Ext.isArray(item)) {
                    obj[this.valueField] = item[0];
                    obj[this.displayField] = item[1];
                }
                else if (Ext.isString(item)) {
                    obj[this.valueField] = item;
                    obj[this.displayField] = item;
                }
                else if (Ext.isObject(item)) {
                    obj = item;
                }
                parsedData.push(obj);
            }
        }

        return data;
    },

    /**
     * @private
     */
    initialize: function() {
        this.callParent();

        var scroller = this.getScrollable();

        this.on({
            scope: this,
            painted: 'onPainted',
            itemtap: 'doItemTap',
            resize: {
                fn: 'onResize',
                single: true
            }
        });

        this.picker.on({
            scope: this,
            beforehiddenchange: 'onBeforeHiddenChange'
        });

        this.element.on({
            scope: this,
            touchstart: 'onTouchStart',
            touchend: 'onTouchEnd'
        });

        scroller.on({
            scope: this,
            scrollend: 'onScrollEnd'
        });
    },

    /**
     * @private
     */
    onPainted: function() {
        this.setupBar();
    },

    /**
     * @private
     */
    onResize: function() {
        var value = this.getValue();
        if (value) {
            this.doSetValue(value);
        }
    },

    /**
     * @private
     */
    onBeforeHiddenChange: function (picker, hidden) {
        if (!hidden) {
            this.doSetValue(this.getValue());   
        }        
    },

    /**
     * Returns an instance of the owner picker.
     * @return {Object}
     * @private
     */
    getPicker: function() {
        if (!this.picker) {
            this.picker = this.getParent();
        }

        return this.picker;
    },

    /**
     * @private
     */
    setupBar: function() {
        if (!this.isPainted()) {
            //if the component isnt rendered yet, there is no point in calculating the padding just eyt
            return;
        }

        var element = this.element,
            innerElement = this.innerElement,
            picker = this.getPicker(),
            bar = picker.bar,
            value = this.getValue(),
            showTitle = this.getShowTitle(),
            title = this.getTitle(),
            scroller = this.getScrollable(),
            titleHeight = 0,
            barHeight, offset;

        barHeight = bar.dom.getBoundingClientRect().height;

        if (showTitle && title) {
            titleHeight = title.element.getHeight();
        }

        offset = Math.ceil((element.getHeight() - titleHeight - barHeight) / 2);

        if (this.getVerticallyCenterItems()) {
            innerElement.setStyle({
                padding: offset + 'px 0 ' + offset + 'px'
            });
        }

        scroller.setSnapOffset({
            y: offset
        });

        scroller.setSnapSelector(this.snapSelector);

        scroller.setMsSnapInterval({
            y: barHeight
        });

        this.doSetValue(value);
    },

    /**
     * @private
     */
    doItemTap: function(list, index, item, e) {
        var me = this;
        me.selectedIndex = index;
        me.selectedNode = item;
        me.scrollToItem(item, true);
    },

    /**
     * @private
     */
    scrollToItem: function(item, animated) {
        var y = item.getY(),
            parentEl = item.parent(),
            parentY = parentEl.getY(),
            scroller = this.getScrollable(),
            difference;

        difference = y - parentY;

        scroller.scrollTo(0, difference, animated);
    },

    /**
     * @private
     */
    onTouchStart: function() {
        this.element.addCls(Ext.baseCSSPrefix + 'scrolling');
    },

    /**
     * @private
     */
    onTouchEnd: function() {
        this.element.removeCls(Ext.baseCSSPrefix + 'scrolling');
    },

    /**
     * @private
     */
    onScrollEnd: function(scroller, x, y) {
        var me = this,
            index = Math.round(y / me.picker.bar.dom.getBoundingClientRect().height),
            viewItems = me.getViewItems(),
            item = viewItems[index];

        if (item) {
            me.selectedIndex = index;
            me.selectedNode = item;

            this.setValueAnimated(this.getValue(true));
            me.fireEvent('slotpick', me, me.getValue(), me.selectedNode);
        }
    },

    /**
     * Returns the value of this slot
     * @private
     */
    getValue: function(useDom) {
        var store = this.getStore(),
            record, value;

        if (!store) {
            return;
        }

        if (!useDom) {
            return this._value;
        }

        //if the value is ever false, that means we do not want to return anything
        if (this._value === false) {
            return null;
        }

        record = store.getAt(this.selectedIndex);

        value = record ? record.get(this.getValueField()) : null;

        return value;
    },

    /**
     * Sets the value of this slot
     * @private
     */
    setValue: function(value) {
        return this.doSetValue(value);
    },

    /**
     * Sets the value of this slot
     * @private
     */
    setValueAnimated: function(value) {
        return this.doSetValue(value, true);
    },

    doSetValue: function(value, animated) {
        var me = this,
            store = me.getStore(),
            viewItems = me.getViewItems(),
            valueField = me.getValueField(),
            hasSelection = true,
            index, item;

        index = store.findExact(valueField, value);

        if (index === -1) {
            hasSelection = false;
            index = 0;
        }

        item = Ext.get(viewItems[index]);

        me.selectedIndex = index;

        if (item) {
            me.scrollToItem(item, animated);
            if (hasSelection) {
                // only set selection if an item is actually selected
                me.select(me.selectedIndex);
            }
        }

        me._value = value;
    }
});
