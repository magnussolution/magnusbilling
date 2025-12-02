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
Ext.define('MBilling.view.callArchive.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.callarchive',
    onRecordCall: function(btn) {
        var me = this,
            record = me.list.getSelectionModel().getSelection()[0],
            filter = Ext.encode(me.list.filters.getFilterData()),
            idRecord = [];
        //no have filter and not select any selected record
        if (!record && filter.length < 5) {
            Ext.ux.Alert.alert(me.titleError, t('Please select one or more records'), 'notification');
        } else {
            Ext.each(me.list.getSelectionModel().getSelection(), function(record) {
                idRecord.push(record.get(me.idProperty));
            });
            if (App.user.isAdmin && idRecord.length > 250) {
                Ext.ux.Alert.alert(me.titleError, t('Your limit to download record is') + ' 250', 'error');
            } else if (!App.user.isAdmin && idRecord.length > 25) {
                Ext.ux.Alert.alert(me.titleError, t('Your limit to download record is') + ' 25', 'error');
            } else {
                window.open('index.php/callArchive/downloadRecord?ids=' + Ext.encode(idRecord) + '&filter=' + filter);
            }
        }
    },
    onDownloadClick: function(grid, rowIndex, colIndex) {
        window.open('index.php/callArchive/downloadRecord?id=' + grid.getStore().getAt(rowIndex).getData().id);
    }
});