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
Ext.define('Ext.ux.button.Credit', {
    extend: 'Ext.Button',
    alias: 'widget.credit',
    height: window.isThemeNeptune ? 21 : 20,
    iconCls: 'icon-add-credit',
    initComponent: function() {
        var me = this;
        if (!App.user.isAdmin) {
            me.text = App.user.currency + ' ' + Ext.util.Format.number(App.user.credit, '0.00');
            Ext.Ajax.request({
                url: 'index.php/user/credit',
                params: {
                    id: App.user.id
                },
                success: function(r) {
                    r = Ext.decode(r.responseText);
                    App.user.credit = r.rows.credit;
                    me.setText(App.user.currency + ' ' + Ext.util.Format.number(App.user.credit, '0.00'));
                }
            });
            me.handler = setInterval(function() {
                Ext.Ajax.request({
                    url: 'index.php/user/credit',
                    params: {
                        id: App.user.id
                    },
                    success: function(r) {
                        r = Ext.decode(r.responseText);
                        App.user.credit = r.rows.credit;
                        me.setText(App.user.currency + ' ' + Ext.util.Format.number(App.user.credit, '0.00'));
                    }
                });
            }, 15000);
        } else {
            me.hidden = true;
        }
        me.callParent(arguments);
    }
});