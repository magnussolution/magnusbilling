/**
 * Classe that define the store of menu help
 *
 * Adilson L. Magnus <info@magnusbilling.com> 
 * 15/04/2013
 */
Ext.define('MBilling.store.Help', {
    extend: 'Ext.data.TreeStore',
    proxy: {
        type: 'memory',
        reader: {
            rootProperty: 'help'
        },
        data: [{
            text: t('User'),
            help: [{
                text: t('Cadastre'),
                leaf: true,
                iconCls: 'icon-item-help',
                url: 'user/cadastre'
            }]
        }]
    },
    fields: [{
        name: 'url',
        convert: function(v, record) {
            return Ext.String.format('resources/help/{0}/{1}.html', window.lang, v);
        }
    }]
});