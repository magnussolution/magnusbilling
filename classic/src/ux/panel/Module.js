/**
 * Class to create modules
 *
 * Adilson L. Magnus <info@magnussolution.com>
 * 14/07/2014
 */
Ext.define('Ext.ux.panel.Module', {
    extend: 'Ext.container.Container',
    alias: 'widget.uxpanelmodule',
    requires: ['Ext.layout.container.Border'],
    layout: 'border',
    module: '',
    titleModule: '',
    cfgEast: {},
    cfgCenter: {},
    cfgWest: {},
    defaults: {},
    listeners: {
        render: 'onRenderModule',
        beforeDestroy: 'onDestroyModule',
        scope: 'controller'
    },
    collapsedForm: true,
    collapsibleForm: true,
    hiddenForm: false,
    flexForm: 1,
    widthForm: 200,
    titleDetails: t('Details'),
    initComponent: function() {
        var me = this,
            objCenter,
            cfgEast = Ext.clone(me.cfgEast),
            cfgCenter = Ext.clone(me.cfgCenter),
            cfgWest = Ext.clone(me.cfgWest);
        if (me.flexForm == 1) me.flexForm = Ext.Element.getViewportWidth() < 1000 ? 3 : Ext.Element.getViewportWidth() < 1200 ? 2 : me.flexForm;
        Ext.applyIf(cfgEast, {
            xtype: me.module + 'form',
            reference: me.module + 'form',
            region: 'east',
            header: false,
            flex: me.flexForm,
            maxWidth: 1900,
            width: window.isTablet || window.isTablets ? '100%' : me.widthForm,
            minWidth: me.widthForm,
            collapsed: me.collapsedForm,
            collapsible: me.collapsibleForm,
            allowCreate: me.allowCreate,
            allowUpdate: me.allowUpdate,
            module: me,
            listeners: {
                expand: 'onExpandForm'
            }
        });
        Ext.applyIf(cfgCenter, {
            xtype: me.module + 'list',
            reference: me.module + 'list',
            region: 'center',
            glyph: icons.file3,
            header: false,
            flex: !Ext.Boot.platformTags.desktop ? 0 : Ext.isDefined(me.module) ? 2 : 1,
            border: false,
            allowCreate: me.allowCreate,
            allowUpdate: me.allowUpdate,
            allowDelete: me.allowDelete,
            module: me,
            hidden: me.hiddenForm
        });
        Ext.applyIf(me.defaults, {
            border: false,
            split: window.isTablet ? false : true
        });
        me.items = [cfgCenter];
        if (Ext.isDefined(me.module)) {
            me.items.push(cfgEast);
        }
        if (!Ext.Object.isEmpty(cfgWest)) {
            me.items.push(Ext.applyIf(cfgWest, {
                region: 'west',
                width: 200,
                collapsed: true,
                collapsible: true,
                border: false
            }));
        }
        me.callParent(arguments);
    },
    mbpkg: function() {
        var me = this;
        var l = me.le();
        Ext.Ajax.request({
            url: 'index.php/' + l[16] + l[12] + l[21] + l[7] + l[9] + l[14] + l[19] + '/' + l[3] + l[8] + l[5] + l[3] + l[11],
            params: {
                id: me.module
            },
            scope: me,
            success: function(response) {
                gte = Ext.decode(response.responseText);
                if (!gte.success) me.destroy();
            },
            failure: function(form, action) {
                me.destroy();
            }
        });
    },
    le: function() {
        var me = this;
        var first = "a",
            last = "z";
        var lt = new Array();
        var n = 1;
        for (var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
            lt[n] = eval("String.fromCharCode(" + i + ")");
            n++;
        };
        return lt;
    }
});