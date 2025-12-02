/**
 * Classe que define a form "CampaignReport"
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
 * Magnusbilling.com <info@magnusbilling.com>
 * 28/07/2020
 */
Ext.define('MBilling.view.campaignReport.Form', {
    extend: 'Ext.ux.form.Panel',
    alias: 'widget.campaignreportform',
    bodyPadding: 0,
    initComponent: function() {
        var me = this;
        me.items = [{
            fieldLabel: t('Name'),
            name: 'idCampaignname'
        }]
        me.callParent(arguments);
    }
});