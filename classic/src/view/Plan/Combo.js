/**
 * Classe que define a combo de "Plan"
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
 * 13/08/2012
 */
Ext.define('MBilling.view.plan.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.plancombo',
    name: 'id_plan',
    fieldLabel: t('Plan'),
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    editable: false,
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Plan', {
            proxy: {
                type: 'uxproxy',
                module: 'plan',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});
Ext.define('MBilling.view.plansignup.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.plansignupcombo',
    name: 'id_plan',
    fieldLabel: t('Plan'),
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    editable: false,
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.Signup', {
            proxy: {
                type: 'uxproxy',
                module: 'signup',
                limitParam: undefined,
                actionRead: 'getPlans'
            }
        });
        me.callParent(arguments);
    }
});