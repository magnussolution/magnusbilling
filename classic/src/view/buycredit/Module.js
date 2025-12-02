/**
 * Classe que define o panel de "buycredit"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.buycredit.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.buycreditmodule',
    controller: 'buycredit',
    resizable: false,
    autoShow: true,
    header: false,
    initComponent: function() {
        var me = this;
        if (window.isTablet == true) {
            window.open('index.php/buyCredit/method/?mobile=true', "_self");
            me.items = [];
        } else {
            me.items = [{
                xtype: 'form',
                reference: 'buycreditPanel',
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
                    xtype: 'moneyfield',
                    mask: App.user.currency + ' #9.999.990,' + App.user.decimalPrecision,
                    fieldLabel: t('Amount'),
                    value: 0,
                    name: 'amount'
                }, {
                    xtype: 'methodpaycombo',
                    name: 'method',
                    fieldLabel: t('Payment methods')
                }, {
                    fieldLabel: t('CreditCard number'),
                    name: 'card_num',
                    hidden: true
                }, {
                    xtype: 'datefield',
                    name: 'exp_date',
                    fieldLabel: t('Expiration date'),
                    format: 'm/y',
                    hidden: true
                }],
                bbar: [{
                    text: t('Cancel'),
                    tooltip: t('Cancel'),
                    glyph: me.glyphCancel,
                    handler: 'buyCreditClose',
                    hidden: true,
                    reference: 'btnCancel'
                }, {
                    text: t('Next'),
                    tooltip: t('Next'),
                    width: 100,
                    glyph: icons.disk,
                    handler: 'buyCredit'
                }]
            }];
        }
        me.callParent(arguments);
    }
});