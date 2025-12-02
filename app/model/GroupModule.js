/**
 * Class define the model "GroupModule"
 *
 * Adilson L. Magnus <info@magnusbilling.com> 
 * 15/04/2013
 */
Ext.define('MBilling.model.GroupModule', {
    extend: 'Ext.data.Model',
    idProperty: 'id_group, id_module',
    fields: [{
        name: 'id_group',
        type: 'int'
    }, 'idGroupname', {
        name: 'id_module',
        type: 'int'
    }, {
        name: 'idModuletext',
        type: 'string',
        convert: function(value) {
            return eval(value);
        }
    }, {
        name: 'show_menu',
        type: 'int'
    }, {
        name: 'createShortCut',
        type: 'int'
    }, {
        name: 'createQuickStart',
        type: 'int'
    }, 'action'],
    proxy: {
        type: 'uxproxy',
        module: 'groupModule'
    }
});