/**
 * Classe que define o form de "SubModule"
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
 * 04/07/2012
 */
Ext.define('MBilling.view.plan.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.planform',
    labelWidthFields: 115,
    fieldsHideUpdateLot: ['name'],
    initComponent: function() {
        var me = this;
        me.defaults = {
            labelWidth: 142
        };
        me.items = [{
            name: 'name',
            fieldLabel: t('Name'),
            maxLength: 100
        }, {
            xtype: 'noyescombo',
            name: 'signup',
            fieldLabel: t('Use on signup'),
            allowBlank: true
        }, {
            xtype: 'moneyfield',
            mask: App.user.currency + ' #9.999.990,00',
            name: 'ini_credit',
            fieldLabel: t('Initial credit to new users'),
            allowBlank: true,
            hidden: true,
            value: 0
        }, {
            xtype: 'yesnocombo',
            name: 'play_audio',
            fieldLabel: t('Notices with audio'),
            allowBlank: true,
            hidden: App.user.isClient
        }, {
            xtype: 'fieldset',
            style: 'margin-top:25px; overflow: visible;',
            title: 'Ativar portabilidade?',
            collapsible: true,
            collapsed: false,
            hidden: App.user.language != 'pt_BR',
            defaults: {
                labelWidth: 190,
                anchor: '100%',
                layout: {
                    type: 'hbox',
                    labelAlign: me.labelAlignFields
                }
            },
            items: [{
                xtype: 'noyescombo',
                name: 'portabilidadeMobile',
                fieldLabel: 'Para Celular',
                allowBlank: true,
                hidden: App.user.language != 'pt_BR'
            }, {
                xtype: 'noyescombo',
                name: 'portabilidadeFixed',
                fieldLabel: 'Para Fixo',
                allowBlank: true,
                hidden: App.user.language != 'pt_BR'
            }]
        }, {
            name: 'techprefix',
            fieldLabel: t('Tech prefix'),
            allowBlank: true,
            maxLength: 5,
            minLength: 5,
            hidden: !App.user.isAdmin
        }, {
            xtype: 'fieldset',
            style: 'margin-top:10px; overflow: visible;',
            title: t('Select one or more services'),
            collapsible: true,
            height: 100,
            collapsed: false,
            items: [{
                xtype: 'servicestag',
                name: 'id_services',
                fieldLabel: t(''),
                labelWidth: 10,
                anchor: '100%',
                allowBlank: true
            }]
        }];
        me.callParent(arguments);
    }
});