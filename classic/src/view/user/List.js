/**
 * Class to define list of "User"
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 15/04/2013 */
Ext.define('MBilling.view.user.List', {
    extend: 'Ext.ux.grid.Panel',
    alias: 'widget.userlist',
    store: 'User',
    fieldSearch: 'username',
    initComponent: function () {
        var me = this;
        me.buttonCsv = false;
        me.allowPrint = false;
        me.extraButtons = [{
            text: t('Bulk user'),
            handler: 'onBulk',
            width: App.user.language == 'en' ? 80 : 110,
            disabled: false,
            hidden: App.user.isClient || !me.allowCreate || window.isTablet
        }];
        me.columns = me.columns || [{
            header: t('ID'),
            dataIndex: 'id',
            flex: 1,
            hidden: true,
            hideable: App.user.isAdmin
        }, {
            header: t('Username'),
            dataIndex: 'username',
            flex: 2
        }, {
            header: t('Last name'),
            dataIndex: 'lastname',
            flex: 3
        }, {
            header: t('First name'),
            dataIndex: 'firstname',
            flex: 3,
            hidden: window.isTablet
        }, {
            header: t('Email'),
            dataIndex: 'email',
            flex: 4,
            hidden: window.isTablet
        }, {
            header: t('Email') + ' 2',
            dataIndex: 'email2',
            flex: 4,
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Credit'),
            dataIndex: 'credit',
            renderer: Helper.Util.formatMoneyDecimal,
            flex: 2
        }, {
            xtype: 'templatecolumn',
            tpl: '{idPlanname}',
            header: t('Plan'),
            dataIndex: 'id_plan',
            comboFilter: 'plancombo',
            hidden: window.isTablet,
            flex: 3
        }, {
            header: t('Sip Users'),
            dataIndex: 'sip_count',
            flex: 2,
            hidden: !App.user.isAdmin
        }, {
            header: t('Offer balance'),
            dataIndex: 'offer',
            hidden: !App.user.isClient || window.isTablet,
            flex: 2
        }, {
            xtype: 'templatecolumn',
            tpl: '{idGroupname}',
            header: t('Group'),
            dataIndex: 'id_group',
            comboFilter: 'groupusercombo',
            flex: 2,
            hidden: App.user.isClient || App.user.isAgent || window.isTablet,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Agent'),
            dataIndex: 'idUserusername',
            filter: {
                type: 'string',
                field: 'idUser.username'
            },
            flex: 2,
            hidden: !App.user.isAdmin || window.isTablet,
            hideable: App.user.isAdmin
        }, {
            header: t('Status'),
            dataIndex: 'active',
            renderer: Helper.Util.formatUserStatus,
            flex: 2,
            filter: {
                type: 'list',
                options: [
                    [1, t('Active')],
                    [2, t('Pending')],
                    [0, t('Inactivated')],
                    [3, t('Blocked In')],
                    [4, t('Blocked In Out')]
                ]
            },
            hidden: App.user.isClient || window.isTablet,
            hideable: !App.user.isClient
        }, {
            header: t('Creation date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'creationdate',
            hidden: window.isTablet,
            flex: 4
        }, {
            header: t('Expiration date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'expirationdate',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 4
        }, {
            dataIndex: 'prefix_local',
            header: t('Prefix rules'),
            flex: 2,
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Type paid'),
            dataIndex: 'typepaid',
            flex: 2,
            renderer: Helper.Util.formattypepaid,
            filter: {
                type: 'list',
                options: [
                    [0, t('Prepaid')],
                    [1, t('Postpaid')]
                ]
            },
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent
        }, {
            header: t('Company name'),
            dataIndex: 'company_name',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 2
        }, {
            header: t('City'),
            dataIndex: 'city',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('State'),
            dataIndex: 'state',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('Country'),
            dataIndex: 'country',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('Zip code'),
            dataIndex: 'zipcode',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('Phone'),
            dataIndex: 'phone',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('DOC'),
            dataIndex: 'doc',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('Credit limit'),
            dataIndex: 'creditlimit',
            hidden: true,
            hideable: !App.user.isClient && !App.user.isAgent,
            flex: 1
        }, {
            header: t('CPS Limit'),
            dataIndex: 'cpslimit',
            hidden: true,
            hideable: window.dialC && App.user.isAdmin,
            flex: 2
        }, {
            header: t('DIST'),
            dataIndex: 'dist',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 2
        }, {
            header: t('Description'),
            dataIndex: 'description',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 4
        }, {
            header: t('Expiration date'),
            renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            dataIndex: 'expirationdate',
            hidden: true,
            hideable: App.user.isAdmin,
            flex: 4
        }];
        me.callParent(arguments);
    }
});