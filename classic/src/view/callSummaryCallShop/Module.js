/**
 * Classe que define o panel de "CallSummary"
 *
 * MagnusSolution.com <info@magnussolution.com>
 * 17/08/2012
 */
Ext.define('MBilling.view.callSummaryCallShop.Module', {
    extend: 'Ext.ux.panel.Module',
    alias: 'widget.callsummarycallshopmodule',
    controller: 'callsummarycallshop',
    titleForm: t('Total'),
    iconForm: 'icon-sum',
    widthForm: 350
});