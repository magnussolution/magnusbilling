/**
 * Classe que define a list "CampaignReport"
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
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/07/2020
 */
Ext.define('MBilling.view.campaignReport.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.campaignreport',
    formHidden: true,
    onRenderModule: function() {
        var me = this;
        me.callParent(arguments);
        btn = me.lookupReference('hour');
        btn.disable();
        me.store.defaultFilter = [];
    },
    onSetInterval: function(btn) {
        var me = this;
        me.lookupReference('hour').enable();
        me.lookupReference('day').enable();
        me.lookupReference('week').enable();
        me.lookupReference('month').enable();
        btn.disable();
        me.store.defaultFilter = [];
        activeFilter = {
            type: 'string',
            field: 'interval',
            value: btn.reference,
            comparison: 'ct'
        };
        me.store.defaultFilter.push(activeFilter);
        me.store.load();
    }
});