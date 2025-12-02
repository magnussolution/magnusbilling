Ext.define('Overrides.chart.Legend', {
    override: 'Ext.chart.Legend',
    config: {
        tpl: ['<div class="', Ext.baseCSSPrefix, 'legend-container">', '<tpl for=".">', '<div class="', Ext.baseCSSPrefix, 'legend-item">', '<span ', 'class="', Ext.baseCSSPrefix, 'legend-item-marker {[ values.disabled ? Ext.baseCSSPrefix + \'legend-inactive\' : \'\' ]}" ', 'style="background:{mark};">', '</span>{[this.owner.renderer(values.name)]}', '</div>', '</tpl>', '</div>'],
        nodeContainerSelector: 'div.' + Ext.baseCSSPrefix + 'legend-container',
        itemSelector: 'div.' + Ext.baseCSSPrefix + 'legend-item',
        docked: 'bottom'
    },
    renderer: function(value) {
        return value;
    }
});