/**
 * {@link Ext.TitleBar}'s are most commonly used as a docked item within an {@link Ext.Container}.
 *
 * The main difference between a {@link Ext.TitleBar} and an {@link Ext.Toolbar} is that
 * the {@link #title} configuration.
 *
 * You can also give items of a {@link Ext.TitleBar} an `align` configuration of `left` or `right`
 * which will dock them to the `left` or `right` of the bar.
 *
 * ## Examples
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'Navigation',
 *         items: [
 *             {
 *                 iconCls: 'add',
 *                 align: 'left'
 *             },
 *             {
 *                 iconCls: 'home',
 *                 align: 'right'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows the title being centered and buttons using align <i>left</i> and <i>right</i>.');
 *
 * <br />
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'Navigation',
 *         items: [
 *             {
 *                 align: 'left',
 *                 text: 'This button has a super long title'
 *             },
 *             {
 *                 iconCls: 'home',
 *                 align: 'right'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows how the title is automatically moved to the right when one of the aligned buttons is very wide.');
 *
 * <br />
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'A very long title',
 *         items: [
 *             {
 *                 align: 'left',
 *                 text: 'This button has a super long title'
 *             },
 *             {
 *                 align: 'right',
 *                 text: 'Another button'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows how the title and buttons will automatically adjust their size when the width of the items are too wide..');
 *
 * The {@link #defaultType} of Toolbar's is {@link Ext.Button button}.
 */
Ext.define('Ext.TitleBar', {
    extend: 'Ext.Container',
    xtype: 'titlebar',

    requires: [
        'Ext.Button',
        'Ext.Title',
        'Ext.Spacer'
    ],

    defaultBindProperty: 'title',

    /**
     * @private
     */
    isToolbar: true,

    classCls: Ext.baseCSSPrefix + 'titlebar',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        cls: Ext.baseCSSPrefix + 'navigation-bar',

        /**
         * @cfg {String} title
         * The title of the toolbar.
         * @accessor
         */
        title: null,

        /**
         * @cfg {String} titleAlign
         * The alignment for the title of the toolbar.
         * @accessor
         */
        titleAlign: 'center',

        /**
         * @cfg {String} defaultType
         * The default xtype to create.
         * @accessor
         */
        defaultType: 'button',

        /**
         * @cfg {String}
         * A default {@link Ext.Component#ui ui} to use for {@link Ext.Button Button} items.
         */
        defaultButtonUI: null,

        /**
         * @cfg {String} minHeight
         * The minimum height height of the Toolbar.
         * @accessor
         */
        minHeight: null,

        /**
         * @cfg
         * @hide
         */
        layout: {
            type: 'hbox',
            align: 'center'
        },

        /**
         * @cfg {Array/Object} items The child items to add to this TitleBar. The {@link #defaultType} of
         * a TitleBar is {@link Ext.Button}, so you do not need to specify an `xtype` if you are adding
         * buttons.
         *
         * You can also give items a `align` configuration which will align the item to the `left` or `right` of
         * the TitleBar.
         * @accessor
         */
        items: [],

        /**
         * @cfg {String} maxButtonWidth The maximum width of the button by percentage
         * @accessor
         */
        maxButtonWidth: '40%'
    },

    border: false,

    hasCSSMinHeight: true,

    beforeInitialize: function () {
        this.applyItems = this.applyInitialItems;
    },

    initialize: function () {
        delete this.applyItems;

        this.add(this.initialItems);
        delete this.initialItems;

        this.on({
            painted: 'refreshTitlePosition',
            single: true
        });
    },

    applyInitialItems: function (items) {
        var me = this,
            titleAlign = me.getTitleAlign(),
            defaults = me.getDefaults() || {};

        me.initialItems = items;

        me.leftBox = me.add({
            xtype: 'container',
            style: 'position: relative',
            cls: Ext.baseCSSPrefix + 'titlebar-left',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });

        me.spacer = me.add({
            xtype: 'component',
            style: 'position: relative',
            cls: Ext.baseCSSPrefix + 'titlebar-center',
            flex: 1,
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });

        me.rightBox = me.add({
            xtype: 'container',
            style: 'position: relative',
            cls: Ext.baseCSSPrefix + 'titlebar-right',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            listeners: {
                resize: 'refreshTitlePosition',
                scope: me
            }
        });

        switch (titleAlign) {
            case 'left':
                me.titleComponent = me.leftBox.add({
                    xtype: 'title',
                    cls: Ext.baseCSSPrefix + 'title-align-left',
                    hidden: defaults.hidden
                });
                me.refreshTitlePosition = Ext.emptyFn;
                break;
            case 'right':
                me.titleComponent = me.rightBox.add({
                    xtype: 'title',
                    cls: Ext.baseCSSPrefix + 'title-align-right',
                    hidden: defaults.hidden
                });
                me.refreshTitlePosition = Ext.emptyFn;
                break;
            default:
                me.titleComponent = me.add({
                    xtype: 'title',
                    hidden: defaults.hidden,
                    centered: true
                });
                break;
        }

        me.doAdd = me.doBoxAdd;
        me.remove = me.doBoxRemove;
        me.doInsert = me.doBoxInsert;
    },

    doBoxAdd: function (item) {
        var me = this, titleAlign = me.getTitleAlign();

        me.addDefaultButtonUI(item);

        if (item.config.align == 'right') {
            me.rightBox.add(item);
        } else if (me.titleComponent && titleAlign === 'left') {
            me.leftBox.insertBefore(item, me.titleComponent);
        } else {
            me.leftBox.add(item);
        }
    },

    doBoxRemove: function (item, destroy) {
        if (item.config.align == 'right') {
            this.rightBox.remove(item, destroy);
        } else {
            this.leftBox.remove(item, destroy);
        }
    },

    doBoxInsert: function (index, item) {
        var me = this;
        me.addDefaultButtonUI(item);

        if (item.config.align == 'right') {
            me.rightBox.insert(index, item);
        } else {
            me.leftBox.insert(index, item);
        }
    },

    addDefaultButtonUI: function(item) {
        var defaultButtonUI = this.getDefaultButtonUI();

        if (defaultButtonUI) {
            if (item.isSegmentedButton) {
                if (item.getDefaultUI() == null) {
                    item.setDefaultUI(defaultButtonUI);
                }
            } else if (item.isButton && (item.getUi() == null)) {
                item.setUi(defaultButtonUI);
            }
        }
    },

    calculateMaxButtonWidth: function () {
        var maxButtonWidth = this.getMaxButtonWidth();

        //check if it is a percentage
        if (Ext.isString(maxButtonWidth)) {
            maxButtonWidth = parseInt(maxButtonWidth.replace('%', ''), 10);
        }
        maxButtonWidth = Math.round((this.element.getWidth() / 100) * maxButtonWidth);

        return maxButtonWidth;
    },

    refreshTitlePosition: function () {
        if (this.destroyed) {
            return;
        }

        var titleElement = this.titleComponent.renderElement;

        titleElement.setWidth(null);
        titleElement.setLeft(null);

        //set the min/max width of the left button
        var leftBox = this.leftBox,
            leftButton = leftBox.down('button'),
            singleButton = leftBox.getItems().getCount() == 1,
            leftBoxWidth, maxButtonWidth;

        if (leftButton && singleButton) {
            if (leftButton.getWidth() == null) {
                leftButton.renderElement.setWidth('auto');
            }

            leftBoxWidth = leftBox.renderElement.getWidth();
            maxButtonWidth = this.calculateMaxButtonWidth();

            if (leftBoxWidth > maxButtonWidth) {
                leftButton.renderElement.setWidth(maxButtonWidth);
            }
        }

        var spacerBox = this.spacer.renderElement.getBox();

        if (Ext.browser.is.IE) {
            titleElement.setWidth(spacerBox.width);
        }

        var titleBox = titleElement.getBox(),
            widthDiff = titleBox.width - spacerBox.width,
            titleLeft = titleBox.left,
            titleRight = titleBox.right,
            halfWidthDiff, leftDiff, rightDiff;


        if (widthDiff > 0) {
            halfWidthDiff = widthDiff / 2;
            titleLeft += halfWidthDiff;
            titleRight -= halfWidthDiff;
            titleElement.setWidth(spacerBox.width);
        }

        leftDiff = spacerBox.left - titleLeft;
        rightDiff = titleRight - spacerBox.right;

        if (leftDiff > 0) {
            titleElement.setLeft(leftDiff);
        }
        else if (rightDiff > 0) {
            titleElement.setLeft(-rightDiff);
        }

        titleElement.repaint();
    },

    /**
     * @private
     */
    updateTitle: function (newTitle) {
        // ensure the items have been initialized, since the applyer creates titleComponent
        this.getItems();
        this.titleComponent.setTitle(newTitle);

        if (this.isPainted()) {
            this.refreshTitlePosition();
        }
    }
});
