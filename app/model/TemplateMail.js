/**
 * Class define the model "Produto"
 *
 * Adilson L. Magnus <info@magnusbilling.com> 
 * 05/06/2013
 */
Ext.define('MBilling.model.TemplateMail', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'mailtype',
        type: 'string'
    }, {
        name: 'fromemail',
        type: 'string'
    }, {
        name: 'fromname',
        type: 'string'
    }, {
        name: 'subject',
        type: 'string'
    }, {
        name: 'messagehtml',
        type: 'string'
    }, {
        name: 'language',
        type: 'string'
    }, {
        name: 'status',
        type: 'int'
    }],
    proxy: {
        type: 'uxproxy',
        module: 'templateMail'
    }
});