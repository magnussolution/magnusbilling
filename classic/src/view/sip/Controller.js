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
Ext.define('MBilling.view.sip.Controller', {
    extend: 'Ext.ux.app.ViewController',
    requires: ['MBilling.view.callDiagnostic.Window'],
    alias: 'controller.sip',
    init: function () {
        var me = this;
        me.control({
            'typesipforwardcombo': {
                select: me.onSelectMethod
            }
        });
        me.callParent(arguments);
    },
    onSelectionChange: function (selModel, selections) {
        var webphone = this.lookupReference('webphone');
        webphone && webphone.setDisabled(selections.length !== 1);
        var button = this.lookupReference('checkUser');
        button && button.setDisabled(selections.length !== 1);
        this.callParent(arguments);
    },
    onWebphone: function () {
        var records = this.list.getSelectionModel().getSelection(), me = this;
        if (records.length !== 1 || me.webphoneChecking) return;
        var host = window.location.hostname.replace(/\.$/, '');
        if (window.location.protocol !== 'https:') {
            Ext.Msg.alert(t('Webphone'), t('Open MagnusBilling using HTTPS to use the webphone.'));
            return;
        }
        if (host.indexOf('.') < 0 || /^[0-9.]+$/.test(host) || /[:\[\]]/.test(host) || /(^|\.)localhost$/i.test(host)) {
            Ext.Msg.alert(t('Webphone'), t('Open MagnusBilling using a domain name, not an IP address.'));
            return;
        }
        if (records[0].get('webrtc') !== 'yes') {
            Ext.Msg.alert(t('Webphone'), t('Enable WebRTC on this SIP account before opening the webphone.'));
            return;
        }
        if (me.webphoneWindow && !me.webphoneWindow.closed) {
            me.webphoneWindow.focus();
            return;
        }
        // Reserve the window during the click so async validation is not blocked as a popup.
        var popup = window.open('about:blank', '_blank', 'popup,width=480,height=850');
        if (!popup) {
            Ext.Msg.alert(t('Webphone'), t('Allow popups to open the webphone.'));
            return;
        }
        popup.document.title = t('Webphone');
        popup.document.body.textContent = t('Checking Asterisk WebRTC configuration...');
        me.webphoneChecking = true;
        var record = records[0], origin = window.location.origin, socket, probeTimer, settled = false;
        var fail = function (message) {
            if (settled) return;
            settled = true;
            clearTimeout(probeTimer);
            if (socket) socket.close();
            me.webphoneChecking = false;
            if (!popup.closed) popup.close();
            Ext.Msg.alert(t('Webphone'), message);
        };
        var open = function () {
            if (settled) return;
            settled = true;
            clearTimeout(probeTimer);
            socket.close();
            me.webphoneChecking = false;
            if (popup.closed) return;
            me.webphoneWindow = popup;
            var timeout;
            var ready = function (event) {
                if (event.origin !== origin || event.source !== popup || !event.data || event.data.type !== 'mbilling-webphone-ready') return;
                popup.postMessage({
                    type: 'mbilling-webphone-account',
                    uri: 'sip:' + encodeURIComponent(record.get('name')) + '@' + host,
                    password: record.get('secret') || ''
                }, origin);
                window.removeEventListener('message', ready);
                clearTimeout(timeout);
            };
            window.addEventListener('message', ready);
            timeout = setTimeout(function () { window.removeEventListener('message', ready); }, 30000);
            popup.location.replace(new URL('index.php/webphone', window.location.href).href);
        };
        Ext.Ajax.request({
            url: 'index.php/webphone/check',
            method: 'GET',
            params: { language: App.lang || window.lang || 'en' },
            timeout: 15000,
            success: function (response) {
                var result = Ext.decode(response.responseText, true);
                if (!result || !result.success) {
                    fail(result && result.message || t('Unable to check Asterisk configuration. Please contact the administrator.'));
                    return;
                }
                try {
                    socket = new WebSocket('wss://' + host + ':8089/ws', 'sip');
                    probeTimer = setTimeout(function () { fail(t('Unable to connect to WSS. Check the certificate, domain and port 8089.')); }, 8000);
                    socket.onopen = open;
                    socket.onerror = socket.onclose = function () { fail(t('Unable to connect to WSS. Check the certificate, domain and port 8089.')); };
                } catch (e) {
                    fail(t('Unable to connect to WSS. Check the certificate, domain and port 8089.'));
                }
            },
            failure: function () { fail(t('Unable to check Asterisk configuration. Please contact the administrator.')); }
        });
    },
    onCheckUser: function () {
        var records = this.list.getSelectionModel().getSelection();
        if (records.length !== 1) {
            Ext.ux.Alert.alert(t('Warning'), t('Select exactly one SIP user.'), 'warning');
            return;
        }
        this.formPanel.collapse();

        Ext.create('MBilling.view.callDiagnostic.Window', {
            diagnosticType: 'outbound',
            ownerList: this.list,
            recordId: records[0].get('id'),
            recordLabel: records[0].get('name'),
            defaultCallerId: records[0].get('callerid')
        }).show();
    },
    onSelectMethod: function (combo, records) {
        this.showFieldsRelated(records.getData().showFields);
    },
    showFieldsRelated: function (showFields) {
        var me = this,
            form = me.formPanel.getForm(),
            fields = me.formPanel.getForm().getFields(),
            activeField = Ext.get(Ext.Element.getActiveElement()).component,
            number = activeField.name.substr(-2); //get the last two caracter from active field
        me.onSetVisibleFiel(activeField, form, number, activeField.value);
    },
    onSetVisibleFiel: function (activeField, form, number, fieldShow) {
        if (activeField.value == 'undefined') activeField.setValue('undefined');
        form.findField('id_queue').setValue('');
        form.findField('id_sip').setValue('');
        form.findField('id_ivr').setValue('');
        form.findField('extension').setValue('');
        form.findField('id_queue').setVisible(fieldShow.match("^queue"));
        form.findField('id_sip').setVisible(fieldShow.match("^sip"));
        form.findField('id_ivr').setVisible(fieldShow.match("^ivr"));
        form.findField('extension').setVisible(fieldShow.match("^group|^number|^custom"));
    },
    onGetDiskSpaceService: function (callback) {
        filterGroupp = Ext.encode([{
            type: 'numeric',
            comparison: 'eq',
            value: App.user.id,
            field: 'id_user'
        }, {
            type: 'numeric',
            comparison: 'eq',
            value: 1,
            field: 'status'
        }]),
            Ext.Ajax.request({
                url: 'index.php/servicesUse/read?filter=' + filterGroupp,
                success: function (r) {
                    r = Ext.decode(r.responseText);
                    callback(r.rows);
                }
            });
    },
    onEdit: function () {
        var me = this,
            form = me.formPanel.getForm(),
            record = me.list.getSelectionModel().getSelection()[0];
        if (App.user.isAdmin) {
            Ext.Ajax.request({
                url: 'index.php/sip/getSipShowPeer',
                params: {
                    name: record.getData()['name']
                },
                scope: me,
                success: function (response) {
                    response = Ext.decode(response.responseText);
                    form.findField('sipshowpeer').setValue(response.sipshowpeer);
                }
            });
        }
        if (App.user.isClient) {
            form.findField('record_call').setVisible(false);
            me.onGetDiskSpaceService(function (result) {
                Ext.each(result, function (record) {
                    if (record.idServicestype == 'disk_space') {
                        me.formPanel.getForm().findField('record_call').setVisible(true);
                    }
                });
            });
        }
        fieldValue = record.getData()['type_forward'];
        form.findField('type_forward').setVisible(true);
        if (fieldValue == 'ivr') {
            form.findField('id_ivr').setVisible(true);
            form.findField('id_sip').setVisible(false);
            form.findField('id_queue').setVisible(false);
            form.findField('extension').setVisible(false);
        } else if (fieldValue == 'pjsip') {
            form.findField('id_sip').setVisible(true);
            form.findField('id_ivr').setVisible(false);
            form.findField('id_queue').setVisible(false);
            form.findField('extension').setVisible(false);
        } else if (fieldValue == 'queue') {
            form.findField('id_queue').setVisible(true);
            form.findField('id_sip').setVisible(false);
            form.findField('id_ivr').setVisible(false);
            form.findField('extension').setVisible(false);
        } else if (fieldValue.match("custom|number|group")) {
            form.findField('extension').setVisible(true);
            form.findField('id_ivr').setVisible(false);
            form.findField('id_sip').setVisible(false);
            form.findField('id_queue').setVisible(false);
        } else {
            form.findField('id_queue').setVisible(false);
            form.findField('id_sip').setVisible(false);
            form.findField('id_ivr').setVisible(false);
            form.findField('extension').setVisible(false);
        }
        this.callParent(arguments);
        valueAllow = me.formPanel.idRecord ? record.get('allow').split(',') : ['g729', 'gsm', 'alaw', 'ulaw'];
        fieldAllow = me.formPanel.down('checkboxgroup');
        fieldAllow.setValue({
            allow: valueAllow
        });
    },
    onNew: function () {
        var me = this,
            form = me.formPanel.getForm(),
            record = me.list.getSelectionModel().getSelection()[0];
        if (App.user.isClient) {
            me.formPanel.getForm().findField('defaultuser').setReadOnly(false);
        }
        form.findField('id_ivr').setVisible(false);
        form.findField('id_sip').setVisible(false);
        form.findField('id_queue').setVisible(false);
        form.findField('id_ivr').setVisible(false);
        form.findField('id_queue').setVisible(false);
        form.findField('type_forward').setVisible(true);
        me.callParent(arguments);
        form.findField('voicemail_password').setValue(Ext.Number.randomInt(111111, 999999));
    }
});
