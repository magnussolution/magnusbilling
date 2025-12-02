/**
 * Classe que define a lista de "Call"
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
 * 17/08/2012
 */
Ext.define('MBilling.view.backup.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.backuplist',
    store: 'Backup',
    initComponent: function() {
        var me = this;
        me.extraButtons = [{
            text: t('Download') + ' Backup',
            glyph: icons.disk,
            handler: 'onDownload',
            width: 140,
            disabled: false
        }];
        me.buttonCsv = false;
        me.allowPrint = false;
        me.buttonUpdateLot = false;
        me.buttonCleanFilter = false;
        me.allowUpdate = false;
        me.columns = [{
            menuDisabled: true,
            header: t('Name'),
            dataIndex: 'name',
            flex: 1
        }, {
            menuDisabled: true,
            header: t('Size'),
            dataIndex: 'size',
            flex: 1
        }]
        me.callParent(arguments);
    }
});