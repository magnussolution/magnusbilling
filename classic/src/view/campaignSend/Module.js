/**
 * Classe que define o panel de "Campaign"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.campaignSend.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.campaignsendmodule',
    controller: 'campaignsend',
    resizable: false,
    autoShow: true,
    header: false,
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'form',
            reference: 'campaignSendPanel',
            margin: '10 10 10 10',
            autoShow: true,
            closable: false,
            resizable: false,
            bodyPadding: 10,
            defaultType: 'textfield',
            defaults: {
                labelAlign: 'right',
                labelWidth: 150,
                width: 280,
                allowBlank: false,
                msgTarget: 'side',
                enableKeyEvents: true,
                plugins: 'markallowblank',
                anchor: '100%'
            },
            items: [{
                xtype: 'campaignsendcombo',
                name: 'type',
                fieldLabel: t('Campaign type')
            }, {
                xtype: 'textarea',
                name: 'sms_text',
                fieldLabel: t('SMS Text'),
                height: 100,
                anchor: '100%',
                allowBlank: true,
                hidden: true
            }, {
                xtype: 'filefield',
                emptyText: 'Select an audio file',
                name: 'audio_path',
                fieldLabel: t('Audio file'),
                buttonText: '',
                buttonConfig: {
                    iconCls: 'upload-icon'
                },
                buttonText: t('Select audio'),
                allowBlank: true,
                hidden: true
            }, {
                xtype: 'filefield',
                emptyText: 'Select an csv file',
                name: 'csv_path',
                fieldLabel: t('CSV file'),
                allowBlank: true,
                hidden: true
            }, {
                xtype: 'textarea',
                name: 'numbers',
                fieldLabel: t('Numbers'),
                height: 100,
                anchor: '100%',
                allowBlank: true,
                hidden: true
            }, {
                xtype: 'datefield',
                name: 'startingdate',
                fieldLabel: t('Date'),
                format: 'Y-m-d',
                value: new Date(),
                allowBlank: true,
                hidden: true
            }, {
                xtype: 'timefield',
                name: 'startingtime',
                fieldLabel: t('Hour'),
                format: 'H:i',
                value: '00:00',
                allowBlank: true,
                hidden: true
            }],
            bbar: [{
                width: '150px',
                text: t('Send'),
                tooltip: t('Send'),
                glyph: icons.disk,
                handler: 'onSendCampaign'
            }]
        }];
        me.callParent(arguments);
    }
});