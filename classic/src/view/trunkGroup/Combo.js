/**
 * Classe que define a combo de "trunkcombo"
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
 * 04/07/2012
 */
Ext.define('MBilling.view.trunkGroup.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.trunkgroupcombo',
    name: 'id_trunk_group',
    fieldLabel: t('Trunk groups'),
    forceSelection: true,
    editable: false,
    displayField: 'name',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.TrunkGroup', {
            proxy: {
                type: 'uxproxy',
                module: 'trunkGroup',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});