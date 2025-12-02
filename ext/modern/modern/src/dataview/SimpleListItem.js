/**
 * A SimpleListItem is a simplified list item that is used by {@link Ext.dataview.List} when
 * useSimpleItems is set to true.  It supports disclosure icons and headers and generates the
 * slimmest markup possible to achieve this. It doesn't support container functionality like adding
 * or docking items. If you require those features you should have your list use
 * {@link Ext.dataview.ListItem} instances by setting the List's
 * {@link Ext.dataview.List#useSimpleItems useSimpleItems} config to `false`.
 */
Ext.define('Ext.dataview.SimpleListItem', {
    extend: 'Ext.Component',
    alternateClassName: 'Ext.dataview.component.SimpleListItem',
    xtype: 'simplelistitem',

    requires: [
        'Ext.dataview.ListItemDisclosure'
    ],

    config: {
        disclosure: {
            xtype: 'listitemdisclosure',
            hidden: true
        },

        header: {
            xtype: 'itemheader'
        },

        /**
         * @private
         * @cfg dataview
         */
        dataview: null,

        /**
         * @cfg {Ext.data.Model} record The model instance of this ListTplItem. It is controlled by the List.
         * @accessor
         */
        record: null
    },

    classCls: Ext.baseCSSPrefix + 'listitem',
    bodyCls: Ext.baseCSSPrefix + 'listitem-body',

    element: {
        reference: 'element',
        cls: Ext.baseCSSPrefix + 'simplelistitem',
        children: [{
            reference: 'innerElement',
            // this element does not follow the normal CSS class naming conventions
            // for reference elements because it needs to match the same selector
            // as the "body" component created by ListItem so it can share styling.
            // it is named "innerElement" so that it will automatically be the container
            // of the "x-innerhtml" element
            cls: Ext.baseCSSPrefix + 'listitem-body'
        }]
    },

    initialize: function() {
        var me = this,
            disclosure, ui;

        me.callParent();

        disclosure = me.getDisclosure();

        if (disclosure) {
            ui = me.getUi();

            if (ui) {
                disclosure.setUi(ui);
            }

            me.element.appendChild(disclosure.renderElement);
        }
    },

    applyHeader: function(header) {
        if (header && !header.isComponent) {
            header = Ext.factory(header, Ext.Component, this.getHeader());
        }
        return header;
    },

    updateHeader: function(header, oldHeader) {
        if (oldHeader) {
            oldHeader.destroy();
        }
    },

    applyDisclosure: function(disclosure) {
        if (disclosure && !disclosure.isComponent) {
            disclosure = Ext.factory(disclosure, Ext.Component, this.getDisclosure());
        }
        return disclosure;
    },

    updateDisclosure: function(disclosure, oldDisclosure) {
        if (disclosure && !this.isConfiguring) {
            this.element.appendChild(disclosure.renderElement);
        }

        if (oldDisclosure) {
            oldDisclosure.destroy();
        }
    },

    updateUi: function(ui, oldUi) {
        var me = this,
            bodyCls = me.bodyCls,
            innerElement = me.innerElement,
            disclosure;

        if (oldUi) {
            innerElement.removeCls(oldUi, bodyCls);
        }

        if (ui) {
            innerElement.addCls(ui, bodyCls);
        }

        if (!me.isConfiguring) {
            disclosure = me.getDisclosure();

            if (disclosure) {
                disclosure.setUi(ui);
            }
        }

        me.callParent([ui, oldUi]);
    },

    updateRecord: function(record) {
        var me = this,
            dataview = me.dataview || this.getDataview(),
            data = record && dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record),
            disclosure = this.getDisclosure();

        me.updateData(data || null);

        if (disclosure && record && dataview.getOnItemDisclosure()) {
            var disclosureProperty = dataview.getDisclosureProperty();
            disclosure[(data.hasOwnProperty(disclosureProperty) && data[disclosureProperty] === false) ? 'hide' : 'show']();
        }
    },

    doDestroy: function() {
        Ext.destroy(this.getHeader(), this.getDisclosure());
        this.callParent();
    }
});
