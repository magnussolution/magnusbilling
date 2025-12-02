/**
 * Class to define lookup of "user"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 05/09/2014
 */
Ext.define('MBilling.view.user.Lookup', {
    extend: 'Ext.ux.form.field.Lookup',
    alias: 'widget.userlookup',
    name: 'id_user',
    fieldLabel: t('Username'),
    displayField: 'idUserusername',
    displayFieldList: 'username',
    gridConfig: {
        xtype: 'userlist',
        fieldSearch: 'username',
        columns: [{
            header: t('Username'),
            dataIndex: 'username',
            flex: 2
        }, {
            header: t('Email'),
            dataIndex: 'email',
            flex: 2
        }, {
            header: t('Last name'),
            dataIndex: 'lastname',
            hidden: window.isTablet,
            flex: 2
        }, {
            header: t('First name'),
            dataIndex: 'firstname',
            hidden: window.isTablet,
            flex: 2
        }, {
            header: t('Credit'),
            dataIndex: 'credit',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 2
        }]
    }
});