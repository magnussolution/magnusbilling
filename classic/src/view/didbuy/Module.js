/**
 * Classe que define o panel de "didbuy"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.didbuy.Module', {
    extend: 'Ext.form.Panel',
    alias: 'widget.didbuymodule',
    controller: 'did',
    resizable: false,
    autoShow: true,
    header: false,
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'form',
            reference: 'buydidPanel',
            margin: '10 10 10 10',
            autoShow: true,
            closable: false,
            resizable: false,
            bodyPadding: 10,
            defaultType: 'textfield',
            defaults: {
                labelAlign: 'right',
                labelWidth: 100,
                width: 280,
                allowBlank: false,
                msgTarget: 'side',
                enableKeyEvents: true,
                plugins: 'markallowblank',
                anchor: '100%'
            },
            items: [{
                xtype: 'didbuycombo',
                name: 'did',
                fieldLabel: t('Select a DID')
            }],
            bbar: [{
                text: t('Buy'),
                tooltip: t('Next'),
                width: 100,
                iconCls: 'x-fa fa-shopping-cart',
                handler: 'onBuyDid'
            }]
        }];
        me.callParent(arguments);
    }
});