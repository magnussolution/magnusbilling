/**
 * Classe que define a model "Callerid"
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
 * 19/09/2012
 */
Ext.define('Ext.ux.button.Locale', {
    extend: 'Ext.button.Split',
    alias: 'widget.locale',
    handler: function () {
        this.showMenu()
    },
    supportLang: ['pt_BR', 'en', 'es', 'fr', 'it', 'ru', 'de', 'pl'],
    iconCls: 'flag-' + window.lang,
    initComponent: function () {
        var me = this;
        me.menu = [{
            text: t('English'),
            iconCls: 'flag-en',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('French'),
            iconCls: 'flag-fr',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('German'),
            iconCls: 'flag-de',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('Italian'),
            iconCls: 'flag-it',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('Polish'),
            iconCls: 'flag-pl',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('Portuguese'),
            iconCls: 'flag-pt_BR',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('Russian'),
            iconCls: 'flag-ru',
            scope: me,
            handler: me.setLocale
        }, {
            text: t('Spanish'),
            iconCls: 'flag-es',
            scope: me,
            handler: me.setLocale
        }];
        me.callParent(arguments);
    },
    setLocale: function (item) {
        var me = this,
            icon = item.iconCls,
            lang = icon.replace('flag-', '');
        if (me.iconCls === icon) {
            return;
        }
        me.setIconCls(icon);
        localStorage && localStorage.setItem('lang', lang);
        window.location.reload();
    }
});