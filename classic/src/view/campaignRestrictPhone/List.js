/**
 * Classe que define a lista de "Callerid"
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
Ext.define('MBilling.view.campaignRestrictPhone.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.campaignrestrictphonelist',
    store: 'CampaignRestrictPhone',
    buttonImportCsv: true,
    initComponent: function() {
        var me = this;
        me.extraButtons = [{
            text: t('Remove duplicate'),
            iconCls: 'callshop',
            handler: 'deleteDuplicados',
            disabled: false
        }];
        me.buttonUpdateLot = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Number'),
            dataIndex: 'number',
            flex: 4
        }, {
            header: t('Description'),
            dataIndex: 'description',
            flex: 4,
            hidden: !App.user.isAdmin
        }]
        me.callParent(arguments);
    }
});