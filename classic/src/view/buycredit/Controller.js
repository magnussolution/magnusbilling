/**
 * Classe que define a lista de "CallShopCdr"
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
 * 01/10/2013
 */
Ext.define('MBilling.view.buycredit.Controller', {
    extend: 'Ext.ux.app.ViewController',
    alias: 'controller.buycredit',
    buyCreditClose: function(btn) {
        var me = this,
            getForm = me.lookupReference('buycreditPanel'),
            getBtnCancel = me.lookupReference('btnCancel');
        getForm.getForm().findField('amount')['show']();
        getForm.getForm().findField('method')['show']();
        getForm.getForm().findField('card_num')['hide']();
        getForm.getForm().findField('exp_date')['hide']();
        getForm.getForm().findField('method').setValue('');
        getBtnCancel.setVisible(false);
    },
    buyCredit: function(btn) {
        var me = this,
            getForm = me.lookupReference('buycreditPanel'),
            getBtnCancel = me.lookupReference('btnCancel'),
            fieldAmount = getForm.getForm().findField('amount').getValue(),
            fieldMethod = getForm.getForm().findField('method').getValue(),
            fielCard_num = getForm.getForm().findField('card_num').getValue(),
            fieldExpDate = getForm.getForm().findField('exp_date').rawValue;
        if (getForm.getForm().findField('method').rawValue.match(/uthorize/)) {
            if (fielCard_num) {
                getForm.setLoading(me.msgWait);
                Ext.Ajax.request({
                    url: 'index.php/buyCredit/method/?amount=' + fieldAmount + '&id_method=' + fieldMethod + '&cc=' + fielCard_num + '&ed=' + fieldExpDate,
                    scope: me,
                    success: function(response) {
                        response = Ext.decode(response.responseText);
                        if (response.success) {
                            Ext.ux.Alert.alert(t('Success'), response.msg, 'success', 10000);
                            getForm.setLoading(false);
                            getForm.getForm().findField('amount')['show']();
                            getForm.getForm().findField('method')['show']();
                            getForm.getForm().findField('card_num')['hide']();
                            getForm.getForm().findField('exp_date')['hide']();
                            getBtnCancel.setVisible(false);
                            getForm.getForm().findField('card_num').setValue('');
                            getForm.getForm().findField('exp_date').setValue('');
                            getForm.getForm().findField('method').setValue('');
                        } else {
                            Ext.ux.Alert.alert(t('Error'), response.msg, 'error');
                            getForm.getForm().findField('card_num').setValue('');
                            getForm.getForm().findField('exp_date').setValue('');
                            getForm.setLoading(false);
                        }
                    }
                });
                return;
            } else {
                getForm.getForm().findField('amount')['hide']();
                getForm.getForm().findField('method')['hide']();
                getForm.getForm().findField('card_num')['show']();
                getForm.getForm().findField('exp_date')['show']();
                getBtnCancel.setVisible(true);
                getForm.getForm().findField('card_num').focus();
            }
        } else if (!fieldMethod) {
            Ext.ux.Alert.alert(me.titleWarning, t('Select a payment methods'), 'warning');
            return;
        } else if (fieldAmount <= 0) {
            Ext.ux.Alert.alert(me.titleWarning, t('Select a valid amount'), 'warning');
            return;
        } else {
            url = 'index.php/buyCredit/method/?amount=' + fieldAmount + '&id_method=' + fieldMethod;
            getForm.getForm().findField('method').setValue('');
            getForm.getForm().findField('card_num').setValue('');
            getForm.getForm().findField('exp_date').setValue('');
            if (getForm.getForm().findField('method').rawValue.match(/PlacetoPay/)) window.open(url, "_self");
            else window.open(url, "_blank");
        }
    }
});