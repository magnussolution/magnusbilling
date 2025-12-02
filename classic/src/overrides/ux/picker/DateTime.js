Ext.define('Overrides.ux.picker.DateTime', {
    override: 'Ext.ux.picker.DateTime',
    todayText: t('Now'),
    timeLabel: t('Time'),
    selectedUpdate: function(date) {
        this.callParent([Ext.Date.clearTime(date, true)]);
    }
});