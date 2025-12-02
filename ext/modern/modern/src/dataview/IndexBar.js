/**
 * IndexBar is a component used to display a list of data (primarily an alphabet) which can then be used to quickly
 * navigate through a list (see {@link Ext.List}) of data. When a user taps on an item in the {@link Ext.IndexBar},
 * it will fire the {@link #index} event.
 *
 * Here is an example of the usage in a {@link Ext.List}:
 *
 *     @example phone portrait preview
 *     Ext.define('Contact', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             fields: ['firstName', 'lastName']
 *         }
 *     });
 *
 *     var store = new Ext.data.JsonStore({
 *        model: 'Contact',
 *        sorters: 'lastName',
 *
 *        grouper: {
 *            groupFn: function(record) {
 *                return record.get('lastName')[0];
 *            }
 *        },
 *
 *        data: [
 *            {firstName: 'Screech', lastName: 'Powers'},
 *            {firstName: 'Kelly',   lastName: 'Kapowski'},
 *            {firstName: 'Zach',    lastName: 'Morris'},
 *            {firstName: 'Jessie',  lastName: 'Spano'},
 *            {firstName: 'Lisa',    lastName: 'Turtle'},
 *            {firstName: 'A.C.',    lastName: 'Slater'},
 *            {firstName: 'Richard', lastName: 'Belding'}
 *        ]
 *     });
 *
 *     var list = new Ext.List({
 *        fullscreen: true,
 *        itemTpl: '<div class="contact">{firstName} <strong>{lastName}</strong></div>',
 *
 *        grouped     : true,
 *        indexBar    : true,
 *        store: store,
 *        hideOnMaskTap: false
 *     });
 *
 */
Ext.define('Ext.dataview.IndexBar', {
    extend: 'Ext.Component',
    alternateClassName: 'Ext.IndexBar',
    xtype: 'indexbar',

    /**
     * @event index
     * Fires when an item in the index bar display has been tapped.
     * @param {Ext.dataview.IndexBar} this The IndexBar instance
     * @param {String} html The HTML inside the tapped node.
     * @param {Ext.dom.Element} target The node on the indexbar that has been tapped.
     */

    config: {
        /**
         * @cfg {Array} letters
         * The letters to show on the index bar.
         * @accessor
         */
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

        /**
         * @cfg {String} listPrefix
         * The prefix string to be used at the beginning of the list.
         * E.g: useful to add a "#" prefix before numbers.
         * @accessor
         */
        listPrefix: null
    },


    cachedConfig: {
        /**
         * @private
         * The parent list that created this index bar
         */
        parentList: null // this is a cachedConfig so that it is available from updateUi
    },

    classCls: Ext.baseCSSPrefix + 'indexbar',
    verticalCls: Ext.baseCSSPrefix + 'vertical',
    horizontalCls: Ext.baseCSSPrefix + 'horizontal',
    indexedCls: Ext.baseCSSPrefix + 'indexed',
    pressedCls: Ext.baseCSSPrefix + 'pressed',
    indexedVerticalCls: Ext.baseCSSPrefix + 'indexed-vertical',
    indexedHorizontalCls: Ext.baseCSSPrefix + 'indexed-horizontal',

    eventedConfig: {
        /**
         * @cfg {String} direction
         * Layout direction, can be either 'vertical' or 'horizontal'
         * @accessor
         */
        direction: 'vertical'
    },

    updateDirection: function(direction) {
        var me = this,
            verticalCls = me.verticalCls,
            horizontalCls = me.horizontalCls,
            indexedVerticalCls = me.indexedVerticalCls,
            indexedHorizontalCls = me.indexedHorizontalCls,
            oldCls, newCls, oldIndexedCls, newIndexedCls;

        if (direction === 'vertical') {
            oldCls = horizontalCls;
            newCls = verticalCls;
            oldIndexedCls = indexedHorizontalCls;
            newIndexedCls = indexedVerticalCls
        } else {
            oldCls = verticalCls;
            newCls = horizontalCls;
            oldIndexedCls = indexedVerticalCls;
            newIndexedCls = indexedHorizontalCls;
        }

        me.element.replaceCls(oldCls, newCls);
        me.wrapper.replaceCls(oldCls, newCls);
        me.getParentList().element.replaceCls(oldIndexedCls, newIndexedCls);
    },

    getElementConfig: function() {
        return {
            reference: 'wrapper',
            classList: ['x-center', 'x-indexbar-wrapper'],
            children: [this.callParent()]
        };
    },

    updateLetters: function(letters) {
        this.innerElement.setHtml('');

        if (letters) {
            var ln = letters.length,
                i;

            for (i = 0; i < ln; i++) {
                this.innerElement.createChild({
                    cls: 'x-indexbar-item',
                    html: letters[i]
                });
            }
        }
    },

    updateListPrefix: function(listPrefix) {
        if (listPrefix && listPrefix.length) {
            this.innerElement.createChild({
                html: listPrefix
            }, 0);
        }
    },

    updateUi: function(ui, oldUi) {
        var me = this,
            list = me.getParentList(),
            listElement = list.element,
            indexedCls = me.indexedCls;

        // list element needs the x-indexed-[indexBarUi] class added so that it can pad
        // its items to account for the presence of the index bar
        if (oldUi) {
            listElement.removeCls(oldUi, indexedCls);
        }

        if (ui) {
            listElement.addCls(ui, indexedCls);
        }

        me.callParent([ui, oldUi]);
    },

    updateParentList: function(parentList) {
        if (parentList) {
            parentList.element.addCls(this.indexedCls);
        }
    },

    /**
     * @private
     */
    initialize: function() {
        var me = this;

        me.callParent();

        me.innerElement.on({
            touchstart: 'onTouchStart',
            drag: 'onDrag',
            dragEnd: 'onDragEnd',
            scope: me
        });

        me.innerElement.addClsOnClick(this.pressedCls);
    },

    isVertical: function() {
        return this.getDirection() === 'vertical';
    },

    onTouchStart: function(e) {
        var me = this;

        me.pageBox = me.innerElement.getBox();
        me.onDrag(e);
    },

    onDragEnd: Ext.emptyFn,

    /**
     * @private
     */
    onDrag: function(e) {
        var me = this,
            el = me.element,
            point = Ext.util.Point.fromEvent(e),
            target, isValidTarget,
            pageBox = me.pageBox;

        if (!pageBox) {
            pageBox = me.pageBox = me.el.getBox();
        }


        if (me.getDirection() === 'vertical') {
            if (point.y > pageBox.bottom || point.y < pageBox.top) {
                return;
            }
            target = Ext.Element.fromPoint(pageBox.left + (pageBox.width / 2), point.y);
            isValidTarget = target && target.getParent() === el;

            me.onVerticalDrag(point, target, isValidTarget);
        } else {
            if (point.x > pageBox.right || point.x < pageBox.left) {
                return;
            }
            target = Ext.Element.fromPoint(point.x, pageBox.top + (pageBox.height / 2));
            isValidTarget = target && target.getParent() === el;
        }

        if (target && isValidTarget) {
            me.fireEvent('index', me, target.dom.innerHTML, target);
        }
    },

    privates: {
        onVerticalDrag: Ext.privateFn
    }
});
