/**
 * Classe que define a combo de "CampaignCombo"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 28/10/2012
 */
Ext.define('MBilling.view.campaignPoll.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.campaignpollcombo',
    name: 'id_campaign_poll',
    fieldLabel: t('Poll'),
    displayField: 'name',
    valueField: 'id',
    initComponent: function() {
        var me = this;
        me.store = Ext.create('MBilling.store.CampaignPoll', {
            proxy: {
                type: 'uxproxy',
                module: 'campaignPoll',
                limitParam: undefined
            }
        });
        me.callParent(arguments);
    }
});