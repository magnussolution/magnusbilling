Ext.define('MBilling.view.diddestination.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.didtypecombo',
    fieldLabel: t('Type paid'),
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    editable: false,
    value: 1,
    store: {
        fields: ['id', 'name'],
        data: [{
            id: '0',
            name: t('Call to PSTN'),
            showFields: ['voip_call', 'destination', 'id_did', 'id_user', 'activated', 'priority']
        }, {
            id: '1',
            name: t('PJSIP'),
            showFields: ['voip_call', 'id_sip', 'id_did', 'id_user', 'activated', 'priority']
        }, {
            id: '2',
            name: t('IVR'),
            showFields: ['voip_call', 'id_did', 'id_ivr', 'id_user', 'activated']
        }, {
            id: '3',
            name: t('CallingCard'),
            showFields: ['voip_call', 'id_did', 'id_user', 'activated']
        }, {
            id: '4',
            name: t('Direct extension'),
            showFields: ['voip_call', 'id_did', 'id_user', 'activated']
        }, {
            id: '5',
            name: t('CID Callback'),
            showFields: ['voip_call', 'id_did', 'id_user', 'activated']
        }, {
            id: '6',
            name: t('0800 Callback'),
            showFields: ['voip_call', 'id_did', 'id_user', 'activated']
        }, {
            id: '7',
            name: t('Queue'),
            showFields: ['voip_call', 'id_did', 'id_queue', 'id_user', 'activated']
        }, {
            id: '8',
            name: t('SIP group'),
            showFields: ['voip_call', 'destination', 'id_did', 'id_user', 'activated']
        }, {
            id: '9',
            name: t('Custom'),
            showFields: ['voip_call', 'destination', 'id_did', 'id_user', 'activated']
        }, {
            id: '10',
            name: t('Context'),
            showFields: ['voip_call', 'context', 'id_did', 'id_user', 'activated']
        }, {
            id: '11',
            name: t('Multiples IPs'),
            showFields: ['voip_call', 'destination', 'id_did', 'id_user', 'activated']
        }]
    }
});