/**
 * Classe que define o panel de "CallSummaryperMonth"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.callSummaryPerMonth.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.callsummarypermonthmodule',
    controller: 'callsummarypermonth',
    titleDetails: t('Total'),
    iconForm: 'icon-sum',
    cfgEast: {
        flex: 0.8
    }
});