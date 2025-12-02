/**
 * Classe que define a model "Callerid"
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
Ext.define('Ext.ux.data.proxy.Ajax', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.uxproxy',
    simpleSortMode: true,
    type: 'ajax',
    baseUrl: 'index.php',
    actionRead: 'read',
    actionCreate: 'save',
    actionUpdate: 'save',
    actionDestroy: 'destroy',
    actionReport: 'report',
    actionCsv: 'csv',
    actionFromCsv: 'importFromCsv',
    actionDestroyReport: 'destroyReport',
    reader: {
        type: 'json',
        rootProperty: 'rows',
        successProperty: 'success',
        totalProperty: 'count'
    },
    writer: {
        type: 'json',
        rootProperty: 'rows',
        writeAllFields: false,
        encode: true
    },
    constructor: function() {
        var me = this,
            module;
        me.callParent(arguments);
        module = me.config.module;
        if (!Ext.Object.getValues(me.api).length) {
            me.api.read = me.baseUrl + '/' + module + '/' + me.actionRead;
            me.api.create = me.baseUrl + '/' + module + '/' + me.actionCreate;
            me.api.update = me.baseUrl + '/' + module + '/' + me.actionUpdate;
            me.api.destroy = me.baseUrl + '/' + module + '/' + me.actionDestroy;
            me.api.report = me.baseUrl + '/' + module + '/' + me.actionReport;
            me.api.csv = me.baseUrl + '/' + module + '/' + me.actionCsv;
            me.api.fromCsv = me.baseUrl + '/' + module + '/' + me.actionFromCsv;
            me.api.destroyReport = me.baseUrl + '/' + module + '/' + me.actionDestroyReport;
        }
    }
});