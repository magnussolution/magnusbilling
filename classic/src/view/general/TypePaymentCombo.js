/**
 * Classe que define a combo "TypePayment"
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
Ext.define('MBilling.view.general.TypePaymentCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.typepaymentcombo',
    fieldLabel: t('Type paid'),
    forceSelection: true,
    editable: false,
    value: 0,
    store: [
        [0, t('Prepaid')],
        [1, t('Postpaid')]
    ]
});
Ext.define('MBilling.view.general.CampaignSendCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.campaignsendcombo',
    fieldLabel: t('Type'),
    forceSelection: true,
    editable: false,
    displayField: 'name',
    valueField: 'id',
    value: 'CALL1',
    store: {
        fields: ['id', 'name'],
        data: [{
            id: 'CALL1',
            name: t('Select type'),
            showFields: ['type']
        }, {
            id: 'SMS',
            name: 'SMS',
            showFields: ['type', 'sms_text', 'csv_path', 'numbers', 'startingdate', 'startingtime']
        }, {
            id: 'CALL',
            name: 'CALL',
            showFields: ['type', 'audio_path', 'csv_path', 'numbers', 'startingdate', 'startingtime']
        }]
    }
});
Ext.define('MBilling.view.general.PaymentCountryCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.paymentcountrycombo',
    fieldLabel: t('Type paid'),
    value: 'Brasil',
    forceSelection: true,
    editable: true,
    listeners: {
        focus: function(combo) {
            combo.expand();
        }
    },
    store: [
        ['Argentina', 'Argentina'],
        ['Brasil', 'Brasil'],
        ['Colombia', 'Colombia'],
        ['Latino America', 'Latino America'],
        ['Global', 'Global']
    ]
});
Ext.define('MBilling.view.general.BoletoBanckCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.boletobanckcombo',
    fieldLabel: t('Bank'),
    forceSelection: true,
    editable: false,
    value: 'cef',
    store: [
        ['cef', 'Caixa Economica SICOB'],
        ['bradesco', 'Bradesco']
    ]
});
Ext.define('MBilling.view.general.PaymentBanckCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.paymentbanckcombo',
    fieldLabel: t('Type paid'),
    forceSelection: true,
    editable: false,
    value: 'Banco do Brasil',
    store: [
        ['Banco do Brasil', 'Banco do Brasil'],
        ['bradesco', 'Bradesco'],
        ['hsbc', 'Hsbc'],
        ['itau', 'Itau'],
        ['santander', 'Santander'],
        ['unibanco', 'Unibanco'],
        ['cef', 'Caixa Economica SICOB'],
        ['cef_sinco', 'Caixa Economica SINCO'],
        ['cef_sigcb', 'Caixa Economica SIGCB']
    ]
});