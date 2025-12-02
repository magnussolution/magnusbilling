/**
 * Classe que define a lista de "OfferCdr"
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
Ext.define('MBilling.view.offerCdr.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.offercdrlist',
    store: 'OfferCdr',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowCreate = false;
        me.allowUpdate = false;
        me.allowDelete = false;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'date_consumption',
            flex: 3
        }, {
            header: t('Username'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 3
        }, {
            xtype: 'templatecolumn',
            tpl: '{idOfferlabel}',
            header: t('Offer'),
            dataIndex: 'id_offer',
            comboFilter: 'offercombo',
            flex: 3
        }, {
            header: t('Duration'),
            dataIndex: 'used_secondes',
            renderer: Helper.Util.formatsecondsToTime,
            flex: 3
        }];
        me.callParent(arguments);
    }
});