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
Ext.define('MBilling.view.providerCNL.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.providercnlimportcsv',
    htmlTipInfo: '<br>cnl,zone<br>' + "11098, CVA<br>" + "11123, CVA</b>",
    fieldsImport: [{
        xtype: 'providercombo',
        width: 350
    }]
});