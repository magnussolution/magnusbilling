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
Ext.define('MBilling.view.phoneNumber.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.phonenumberimportcsv',
    htmlTipInfo: '<br>number,name,city<br>' + "551135672677, Dany Hilger, New York<br>" + "551156332233, Monica Leith, San Pablo<br>" + "554153882200, John Mart, Madri<br>" + "<b>" + t('Name') + ', ' + t('City') + ' ' + t('is optional') + "</b>",
    fieldsImport: [{
        xtype: 'phonebookcombo',
        width: 350
    }]
});