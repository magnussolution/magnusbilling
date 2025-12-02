/**
 * Classe que define a combo de "CampaignCombo"
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
Ext.define('MBilling.view.campaign.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.campaigncombo',
    name: 'id_campaign',
    fieldLabel: t('Campaign'),
    displayField: 'name',
    forceSelection: true,
    editable: false,
    valueField: 'id',
    initComponent: function () {
        var me = this;
        me.store = Ext.create('MBilling.store.Campaign', {
            proxy: {
                type: 'uxproxy',
                module: 'campaign',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});
Ext.define('MBilling.view.general.TypeCampaignDestination', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.typecampaigndestinationcombo',
    fieldLabel: t('Type'),
    forceSelection: true,
    editable: false,
    value: '',
    store: [
        ['', t('')],
        ['undefined', t('Undefined')],
        ['pjsip', t('PJSIP')],
        ['ivr', t('IVR')],
        ['queue', t('Queue')],
        ['group', t('Group')],
        ['custom', t('Custom')]
    ]
});