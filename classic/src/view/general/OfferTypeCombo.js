/**
 * Classe que define a combo "OferType"
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 12/09/2012
 */
Ext.define('MBilling.view.general.OfferTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.offertypecombo',
    fieldLabel: t('Offer type'),
    forceSelection: true,
    editable: false,
    value: 0,
    store: [
        [0, t('Unlimited calls')],
        [1, t('Number free calls')],
        [2, t('Free seconds')]
    ]
});
Ext.define('MBilling.view.general.BillingTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.billingtypecombo',
    fieldLabel: t('Billing type'),
    forceSelection: true,
    editable: false,
    value: 0,
    store: [
        [0, t('Monthly')],
        [1, t('Weekly')]
    ]
});