/**
 * Classe que define a lista de "Offer"
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
Ext.define('MBilling.view.offer.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.offerlist',
    store: 'Offer',
    initComponent: function() {
        var me = this;
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Name'),
            dataIndex: 'label',
            flex: 1
        }, {
            header: t('Package type'),
            dataIndex: 'packagetype',
            renderer: Helper.Util.formatPackageType,
            comboRelated: 'offertypecombo',
            flex: 1,
            filter: {
                type: 'list',
                options: [
                    [0, t('Unlimited calls')],
                    [1, t('Number free calls')],
                    [2, t('Free seconds')]
                ]
            }
        }, {
            header: t('Free time to call'),
            dataIndex: 'freetimetocall',
            flex: 1
        }, {
            header: t('Period'),
            dataIndex: 'billingtype',
            renderer: Helper.Util.formatBillingType,
            comboRelated: 'billingtypecombo',
            flex: 1,
            filter: {
                type: 'list',
                options: [
                    [0, t('Monthly')],
                    [1, t('Weekly')]
                ]
            }
        }, {
            header: t('Price'),
            dataIndex: 'price',
            renderer: Helper.Util.formatMoneyDecimal,
            hidden: !App.user.isAdmin,
            hideable: App.user.isAdmin,
            flex: 2
        }, {
            header: t('Creation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'creationdate',
            flex: 1
        }];
        me.callParent(arguments);
    }
});