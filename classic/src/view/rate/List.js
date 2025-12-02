/**
 * Classe que define a lista de "Rate"
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
 * 30/07/2012
 */
Ext.define('MBilling.view.rate.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.ratelist',
    store: 'Rate',
    fieldSearch: 'idPrefix.prefix',
    initComponent: function() {
        var me = this;
        me.buttonImportCsv = !App.user.isClient,
            me.columns = [{
                header: t('ID'),
                dataIndex: 'id',
                flex: 1,
                hidden: true,
                hideable: App.user.isAdmin
            }, {
                header: t('Prefix'),
                dataIndex: 'idPrefixprefix',
                filter: {
                    type: 'string',
                    field: 'idPrefix.prefix'
                },
                flex: window.isTablet ? 2 : 3
            }, {
                dataIndex: 'idPrefixdestination',
                header: t('Destination'),
                filter: {
                    type: 'string',
                    field: 'idPrefix.destination'
                },
                flex: window.isTablet ? 2 : 3,
                hidden: window.isTablet
            }, {
                header: t('Sell price'),
                dataIndex: 'rateinitial',
                renderer: Helper.Util.formatMoneyDecimal4,
                flex: 2,
                hidden: App.user.hidden_prices == 1
            }, {
                header: t('Initial block'),
                dataIndex: 'initblock',
                hidden: window.isTablet,
                flex: 2
            }, {
                header: t('Billing block'),
                dataIndex: 'billingblock',
                flex: 2,
                hidden: window.isTablet
            }, {
                xtype: 'templatecolumn',
                tpl: '{idTrunkGroupname}',
                header: t('Trunk groups'),
                dataIndex: 'id_trunk_group',
                comboFilter: 'trunkgroupcombo',
                flex: 3,
                hidden: !App.user.isAdmin || window.isTablet,
                hideable: App.user.isAdmin
            }, {
                xtype: 'templatecolumn',
                tpl: '{idPlanname}',
                header: t('Plan'),
                dataIndex: 'id_plan',
                comboFilter: 'plancombo',
                flex: 3
            }, {
                header: t('Include in offer'),
                dataIndex: 'package_offer',
                hidden: true,
                hideable: !App.user.isClient,
                flex: 1,
                renderer: Helper.Util.formattyyesno,
                filter: {
                    type: 'list',
                    options: [
                        [1, t('Yes')],
                        [0, t('No')]
                    ]
                }
            }, {
                header: t('Status'),
                dataIndex: 'status',
                hidden: true,
                hideable: App.user.isAdmin,
                flex: 2,
                renderer: Helper.Util.formatBooleanActive,
                filter: {
                    type: 'list',
                    options: [
                        [1, t('Active')],
                        [0, t('Inactive')]
                    ]
                }
            }, {
                header: t('Connection charge'),
                dataIndex: 'connectcharge',
                renderer: Helper.Util.formatMoneyDecimal4,
                flex: 2,
                hideable: App.user.isAdmin,
                hidden: true
            }]
        me.callParent(arguments);
    }
});