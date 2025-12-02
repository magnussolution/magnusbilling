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
Ext.define('MBilling.view.backup.ImportCsv', {
    extend: 'Ext.ux.window.ImportCsv',
    alias: 'widget.backupimportcsv',
    htmlTipInfo: '',
    extAllowed: ['tgz'],
    fieldLabel: t('Backup'),
    iconCls: 'icon-play'
});