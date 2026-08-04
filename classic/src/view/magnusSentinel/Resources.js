Ext.define('MBilling.view.magnusSentinel.Resources', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.magnussentinelresources',
    reference: 'sentinelResources',
    title: t('Server resources'),
    border: true,
    store: { fields: ['server_name','severity','cpu_percent','iowait_percent',
        'load_1','cpu_count','memory_total_bytes','memory_available_bytes',
        'swap_total_bytes','swap_used_bytes','disk_max_percent','affected_resources',
        'active_diagnostic','trends','baseline'], data: [] },
    viewConfig: { emptyText: t('Server resource data is not available yet.'), deferEmptyText: false },
    initComponent: function() {
        var me = this;
        function percent(value) { return Ext.isNumber(value) ? value.toFixed(1) + '%' : '—'; }
        function bytes(value) {
            return Ext.isNumber(value) ? (value / 1073741824).toFixed(1) + ' GB' : '—';
        }
        me.columns = [
            { text: t('Server'), dataIndex: 'server_name', flex: 2, minWidth: 120 },
            { text: t('Severity'), dataIndex: 'severity', width: 105 },
            { text: t('CPU'), dataIndex: 'cpu_percent', width: 80, renderer: percent },
            { text: t('I/O wait'), dataIndex: 'iowait_percent', width: 85, renderer: percent },
            { text: t('Load'), dataIndex: 'load_1', width: 70 },
            { text: t('Available RAM'), dataIndex: 'memory_available_bytes', width: 125, renderer: bytes },
            { text: t('Swap used'), dataIndex: 'swap_used_bytes', width: 105, renderer: bytes },
            { text: t('Disk'), dataIndex: 'disk_max_percent', width: 80, renderer: percent },
            { text: t('Affected resource'), dataIndex: 'affected_resources', flex: 2,
              renderer: function(value) { return Ext.util.Format.htmlEncode((value || []).join(', ') || t('None')); } },
            { text: t('Probable cause'), dataIndex: 'active_diagnostic', flex: 3, minWidth: 220,
              renderer: function(value) {
                  var diagnostic = value && value.diagnostic;
                  return Ext.util.Format.htmlEncode(diagnostic ? diagnostic.probable_cause : t('No degradation detected'));
              } },
            { text: t('Recommended action'), dataIndex: 'active_diagnostic', flex: 3, minWidth: 240,
              renderer: function(value) {
                  var diagnostic = value && value.diagnostic;
                  return Ext.util.Format.htmlEncode(diagnostic ? diagnostic.recommended_action : t('None'));
              } }
        ];
        me.callParent(arguments);
    },
    setResources: function(data) { this.getStore().loadData((data && data.items) || []); }
});
