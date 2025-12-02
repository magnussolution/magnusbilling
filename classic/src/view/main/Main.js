/**
 * Classe que define a lista de "CallShopCdr"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 01/10/2013
 */
Ext.define('MBilling.view.main.Main', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.main',
    layout: 'border',
    controller: 'main',
    initComponent: function() {
        var me = this;
        me.items = [{
            region: 'north',
            border: false,
            hidden: window.isTablet || window.isTablets,
            reference: 'header',
            dockedItems: [{
                xtype: 'toolbar',
                style: {
                    'padding-left': '0px',
                    'padding-top': '0px',
                    'padding-bottom': '0px'
                },
                items: [{
                    xtype: 'image',
                    src: window.logo,
                    height: 60,
                    hidden: window.isTablet || window.isTablets
                }, '->', {
                    xtype: 'credit',
                    width: '120px'
                }, {
                    xtype: 'locale',
                    hidden: window.isTablets || window.isTable
                }, '-', {
                    xtype: 'splitbutton',
                    scale: window.isTablet || window.isTablets ? 'small' : 'medium',
                    iconAlign: 'top',
                    glyph: window.isTablet || window.isTablets ? '' : icons.user,
                    handler: function() {
                        this.showMenu()
                    },
                    text: App.user.username,
                    menu: [{
                        handler: 'openChangePassword',
                        iconCls: 'icon-change-password',
                        text: t('Change password'),
                        hidden: !App.user.isAdmin
                    }, {
                        text: t('Import logo'),
                        glyph: icons.cog,
                        handler: 'importLogo',
                        hidden: App.user.isClient || window.isTablet || window.isTablets
                    }, {
                        text: t('Import Login Background'),
                        glyph: icons.cog,
                        handler: 'importLoginBackground',
                        hidden: !App.user.isAdmin || window.isTablet || window.isTablets
                    }, {
                        text: t('Theme settings'),
                        glyph: icons.cog,
                        handler: 'openSettings',
                        hidden: !App.user.isAdmin || window.isTablet || window.isTablets
                    }, {
                        text: t('About'),
                        glyph: icons.info,
                        handler: 'openAbout',
                        hidden: window.isTablets || App.user.l.slice(4, 7) == 'syn'
                    }, '-', {
                        glyph: icons.exit,
                        text: t('Exit'),
                        handler: 'logout'
                    }]
                }]
            }]
        }, {
            reference: 'tabPanelMenu',
            region: 'west',
            width: window.isTablet ? '100%' : 230,
            minWidth: 150,
            split: window.isTablet ? false : true,
            collapsible: !window.isTablets || window.isThemeNeptune ? true : false,
            titleCollapse: false,
            collapsed: false,
            layout: window.isTablet || window.isTablets ? 'anchor' : 'accordion',
            defaultType: 'treepanel',
            autoScroll: true,
            title: t('Menu'),
            header: !window.isTablet ? true : false,
            defaults: {
                animFloat: true,
                border: window.isThemeNeptune ? false : true,
                autoScroll: window.isTablet || window.isTablets ? false : true,
                rootVisible: false,
                listeners: {
                    itemclick: 'createTabStandard'
                }
            },
            listeners: {
                render: 'loadMenuStandard'
            }
        }, {
            xtype: 'tabpanel',
            region: 'center',
            reference: 'tabPanelCenter',
            listeners: {
                tabchange: 'changeActivatedTab'
            },
            items: [{
                xtype: 'dashboardmodule',
                hidden: window.isTablet,
                glyph: icons.home,
                title: t('Home'),
                stateful: false,
                items: [{
                    xtype: 'dashboardmodule'
                }]
            }]
        }];
        me.callParent(arguments);
    }
});