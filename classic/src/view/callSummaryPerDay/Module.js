/**
 * Classe que define o panel de "CallSummary"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.callSummaryPerDay.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.callsummaryperdaymodule',
    controller: 'callsummaryperday',
    titleDetails: t('Total'),
    iconForm: 'icon-sum',
    cfgEast: {
        flex: 0.8
    }
});