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
Ext.define('MBilling.view.callerid.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.calleridimportcsv',
    htmlTipInfo: '<br>cid<br>' + "551135672677<br>" + "551156332233<br>" + "554153882200<br>" + "</b>",
    fieldsImport: [{
        xtype: 'userlookup'
    }]
});