/**
 * Classe que define o form de "Queue"
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
 * 19/09/2012
 */
Ext.define('MBilling.view.queue.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.queueform',
    fieldsHideUpdateLot: ['id_user', 'name'],
    fileUpload: true,
    initComponent: function() {
        var me = this;
        me.defaults = {
            labelWidth: 200
        };
        me.items = [{
            xtype: 'userlookup',
            ownerForm: me,
            name: 'id_user',
            fieldLabel: t('Username'),
            hidden: App.user.isClient,
            allowBlank: App.user.isClient
        }, {
            name: 'name',
            fieldLabel: t('Name')
        }, {
            xtype: 'languagecombo',
            name: 'language',
            fieldLabel: t('Language'),
            value: App.user.language == 'pt_BR' ? 'br' : App.user.language
        }, {
            xtype: 'queuestrategycombo',
            name: 'strategy',
            fieldLabel: t('Strategy')
        }, {
            xtype: 'yesnostringcombo',
            name: 'ringinuse',
            fieldLabel: t('Ringinuse')
        }, {
            xtype: 'numberfield',
            name: 'timeout',
            fieldLabel: t('Ring for'),
            value: 30
        }, {
            xtype: 'numberfield',
            name: 'retry',
            fieldLabel: t('Time for another agent'),
            value: 1
        }, {
            xtype: 'numberfield',
            name: 'wrapuptime',
            fieldLabel: t('Time for another call'),
            value: 1
        }, {
            xtype: 'numberfield',
            name: 'weight',
            fieldLabel: t('Weight'),
            value: 0
        }, {
            xtype: 'uploadfield',
            name: 'periodic-announce',
            fieldLabel: t('Periodic announce'),
            emptyText: t('Select an wav mono 8khz or gsm File'),
            allowBlank: true,
            extAllowed: ['wav', 'gsm']
        }, {
            xtype: 'numberfield',
            name: 'periodic-announce-frequency',
            fieldLabel: t('Frequency'),
            value: 30
        }, {
            xtype: 'yesnostringcombo',
            name: 'announce-position',
            fieldLabel: t('Announce position')
        }, {
            xtype: 'yesnostringcombo',
            name: 'announce-holdtime',
            fieldLabel: t('Announce holdtime')
        }, {
            xtype: 'numberfield',
            name: 'announce-frequency',
            fieldLabel: t('Announce frequency'),
            value: 45
        }, {
            xtype: 'combobox',
            name: 'joinempty',
            fieldLabel: t('Join empty'),
            forceSelection: true,
            editable: false,
            value: 'yes',
            store: [
                ['no', t('No')],
                ['yes', t('Yes')],
                ['unavailable,invalid,unknown', t('Unavailable, Invalid, Unknown')],
                ['penalty,paused,invalid,unavailable', t('Penalty, Paused, Invalid, Unavailable')]
            ]
        }, {
            xtype: 'combobox',
            name: 'leavewhenempty',
            fieldLabel: t('Leave when empty'),
            forceSelection: true,
            editable: false,
            value: 'no',
            store: [
                ['no', t('No')],
                ['yes', t('Yes')],
                ['unavailable,invalid,unknown', t('Unavailable, Invalid, Unknown')],
                ['penalty,paused,invalid,unavailable', t('Penalty, Paused, Invalid, Unavailable')]
            ]
        }, {
            xtype: 'numberfield',
            name: 'max_wait_time',
            fieldLabel: t('Max wait time'),
            value: 0,
            allowBlank: true
        }, {
            name: 'max_wait_time_action',
            fieldLabel: t('Max wait time action'),
            allowBlank: true
        }, {
            xtype: 'combobox',
            name: 'ring_or_moh',
            fieldLabel: t('Ring or playing MOH'),
            forceSelection: true,
            editable: false,
            value: 'moh',
            store: [
                ['moh', t('MOH')],
                ['ring', t('Ring')]
            ]
        }, {
            xtype: 'uploadfield',
            name: 'musiconhold',
            fieldLabel: t('Audio musiconhold'),
            emptyText: t('Select an wav mono 8khz or gsm File'),
            allowBlank: true,
            extAllowed: ['wav', 'gsm']
        }];
        me.callParent(arguments);
    }
});