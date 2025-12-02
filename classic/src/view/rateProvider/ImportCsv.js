/**
 * Classe que define a window import csv de "Rate"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author  Adilson Leffa Magnus.
 * @copyright   Todos os direitos reservados.
 * ###################################
 * =======================================
 * MagnusSolution.com <info@magnussolution.com>
 * 08/11/2012
 */
Ext.define('MBilling.view.rateProvider.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.rateproviderimportcsv',
    htmlTipInfo: '<br><b>' + t('Prefix') + ", " + t('Destination') + ",  " + t('Buy price') + "</b><br>" + "5511, Brasil SP, 0.080<br>" + "34, Spain Fix, 0.056<br>" + "54, Argentina, 0.025<br><br>" + "</b>",
    labelWidthFields: 160,
    height: window.isThemeTriton ? 350 : 275,
    initComponent: function() {
        var me = this;
        me.fieldsImport = [{
            xtype: 'providercombo',
            name: 'id_provider',
            fieldLabel: t('Provider'),
            width: 350
        }, {
            xtype: 'fieldset',
            style: 'margin-top:25px; overflow: visible;',
            title: t('CSV Format'),
            collapsible: true,
            collapsed: false,
            defaults: {
                labelWidth: 190,
                anchor: '100%',
                layout: {
                    type: 'hbox',
                    labelAlign: me.labelAlignFields
                }
            },
            items: [{
                xtype: 'pontovirgulacombo',
                name: 'delimiter',
                fieldLabel: t('Delimiter'),
                width: 230
            }]
        }];
        me.callParent(arguments);
    }
});