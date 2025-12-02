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
Ext.define('MBilling.view.rate.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.rateimportcsv',
    htmlTipInfo: '<br><b>' + t('Prefix') + ", " + t('Destination') + ", " + t('Sell price') + "</b><br>" + "5511, Brasil SP, 0.080<br>" + "34, Spain Fix, 0.056<br>" + "54, Argentina, 0.025<br><br>" + "<b>" + t('Buy price initblock') + ', ' + t('Buy price increment') + ' ' + t('is optional') + "</b>",
    labelWidthFields: 160,
    height: window.isThemeTriton ? 350 : 275,
    initComponent: function() {
        var me = this;
        me.fieldsImport = [{
            xtype: 'plancombo',
            name: 'id_plan',
            fieldLabel: t('Plan'),
            width: 350
        }, {
            xtype: 'trunkgroupcombo',
            name: 'id_trunk_group',
            fieldLabel: t('Trunk groups'),
            width: 350,
            hidden: !App.user.isAdmin
        }, {
            xtype: 'fieldset',
            style: 'margin-top:25px; overflow: visible;',
            title: t('CSV format'),
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