/**
 * Classe que define o form de "Alarm"
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
 * 03/01/2021
 */
Ext.define('MBilling.view.alarm.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.alarmform',
    initComponent: function() {
        var me = this;
        me.items = [{
            xtype: 'combobox',
            name: 'type',
            fieldLabel: t('Type'),
            forceSelection: true,
            editable: false,
            value: '1',
            store: [
                ['1', t('ALOC')],
                ['2', t('ASR')],
                ['3', t('Calls per minute')],
                ['4', t('Consecutive number')],
                ['5', t('Online calls on same number')],
                ['6', t('Same number and CallerID')],
                ['7', t('Total calls per user')],
                ['8', t('Failed calls per trunk')]
            ]
        }, {
            xtype: 'combobox',
            name: 'period',
            fieldLabel: t('Period'),
            forceSelection: true,
            editable: false,
            value: '3600',
            store: [
                ['3600', t('1 Hour')],
                ['7200', t('2 Hours')],
                ['43200', t('12 Hours')],
                ['1', t('1 day')],
                ['2', t('2 days')],
                ['3', t('3 days')],
                ['4', t('4 days')],
                ['5', t('5 days')],
                ['6', t('6 days')],
                ['7', t('1 week')],
                ['14', t('2 weeks')],
                ['21', t('3 weeks')],
                ['30', t('1 month')]
            ]
        }, {
            xtype: 'combobox',
            name: 'condition',
            fieldLabel: t('Condition'),
            forceSelection: true,
            editable: false,
            value: '1',
            store: [
                ['1', t('Bigger than')],
                ['2', t('Less than')]
            ]
        }, {
            name: 'amount',
            fieldLabel: t('Amount')
        }, {
            xtype: 'booleancombo',
            name: 'status',
            fieldLabel: t('Status')
        }, {
            name: 'email',
            fieldLabel: t('Email')
        }, {
            name: 'subject',
            fieldLabel: t('Subject')
        }, {
            xtype: 'textareafield',
            name: 'message',
            fieldLabel: t('Message'),
            hideLabel: true,
            height: 400,
            grow: true,
            enableKeyEvents: false,
            anchor: '100%'
        }];
        me.callParent(arguments);
    }
});