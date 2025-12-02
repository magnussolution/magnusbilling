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
Ext.define('MBilling.view.rateCallshop.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.ratecallshopimportcsv',
    htmlTipInfo: '<br><b>' + t('Prefix') + ", " + t('Destination') + ", " + t('Sell price') + "</b><br>" + "5511, Brasil SP, 0.080<br>" + "34, Spain Fix, 0.056<br>" + "54, Argentina, 0.025<br><br>" + "<b>" + t('Sell price') + ' ' + t('And') + ' ' + t('Buy price') + "</b>"
});