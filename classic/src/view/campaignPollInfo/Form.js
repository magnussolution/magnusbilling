/**
 * Classe que define o form de "campaignPollInfo"
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
Ext.define('MBilling.view.campaignPollInfo.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.campaignpollinfoform',
    initComponent: function() {
        var me = this;
        me.items = [{
            name: 'number',
            fieldLabel: t('Number'),
            readOnly: true
        }, {
            name: 'resposta',
            fieldLabel: t('Result'),
            readOnly: true
        }];
        me.callParent(arguments);
    }
});