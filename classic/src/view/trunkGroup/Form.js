/**
 * Classe que define o form de "Campaign"
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
 * 28/10/2012
 */
Ext.define('MBilling.view.trunkGroup.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.trunkgroupform',
    fieldsHideUpdateLot: ['name', 'id_trunk'],
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'name',
            fieldLabel: t('Name'),
            hidden: App.user.isClient
        }, {
            xtype: 'combobox',
            name: 'type',
            fieldLabel: t('Type'),
            forceSelection: true,
            editable: false,
            value: 1,
            store: window.dialC == true ? [
                [1, t('Order')],
                [2, t('Random')],
                [3, t('LCR')],
                [4, t('Weight')]
            ] : [
                [1, t('Order')],
                [2, t('Random')],
                [3, t('LCR')]
            ]
        }, {
            name: 'weight',
            fieldLabel: t('Weight'),
            allowBlank: true,
            hidden: true
        }, {
            xtype: 'fieldset',
            style: 'margin-top:10px; overflow: visible;',
            title: t('Select one or more trunks'),
            collapsible: false,
            collapsed: false,
            height: 300,
            items: [{
                xtype: 'trunktag',
                name: 'id_trunk',
                fieldLabel: t('Trunks'),
                labelWidth: 70,
                anchor: '100%',
                allowBlank: true
            }]
        }];
        me.callParent(arguments);
    }
});