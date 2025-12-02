/**
 * Class to define list of "GroupUser"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013
 */
Ext.define('MBilling.view.groupUser.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.groupuserlist',
    store: 'GroupUser',
    initComponent: function() {
        var me = this;
        me.buttonUpdateLot = false;
        me.allowPrint = false;
        me.buttonCsv = false;
        me.extraButtons = [{
            text: t('Clone') + ' ' + t('Group'),
            handler: 'onCloneGroupUser',
            width: 100,
            reference: 'buttonCloneGroup',
            disabled: true
        }];
        me.columns = [{
            header: t('ID'),
            dataIndex: 'id',
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Name'),
            dataIndex: 'name'
        }, {
            header: t('User type'),
            dataIndex: 'idUserTypename',
            filter: {
                type: 'string',
                field: 'idUserType.name'
            },
            renderer: function(value) {
                if (value) {
                    return t(value.slice(3, -2));
                }
            },
            hidden: App.user.isClient,
            hideable: !App.user.isClient
        }];
        me.callParent(arguments);
    }
});