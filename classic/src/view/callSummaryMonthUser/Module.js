/**
 * Classe que define o panel de "CallSummary"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.callSummaryMonthUser.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.callsummarymonthusermodule',
    controller: 'callsummarymonthuser',
    titleDetails: t('Total'),
    iconForm: 'icon-sum',
    cfgEast: {
        flex: 0.8
    }
});