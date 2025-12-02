Ext.define('MBilling.view.queue.Combo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.queuestrategycombo',
    fieldLabel: t('Status'),
    value: 'ringall',
    forceSelection: true,
    editable: false,
    store: [
        ['ringall', 'Ringall' + ' - ' + t('Ring all available channels until one answers')],
        ['rrmemory', 'Rrmemory' + ' - ' + t('Round robin with memory, remember where we left off last ring pass')],
        ['leastrecent', 'Leastrecent' + ' - ' + t('Ring interface which was least recently called by this queue')],
        ['fewestcalls', 'Fewestcalls' + ' - ' + t('Ring the one with fewest completed calls from this queue')],
        ['random', 'Random' + ' -' + t('Ring random interface')],
        ['linear', 'Linear' + ' - ' + t('Rings interfaces in the order they are listed in the configuration file. Dynamic members will be rung in the order in which they were added')],
        ['wrandom', 'Wrandom' + ' -' + t('Rings a random interface, but uses the agent\'s penalty as a weight')]
    ]
});