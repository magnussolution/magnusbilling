Ext.define('Ext.theme.device_base.grid.HeaderContainer', {
    override: 'Ext.grid.HeaderContainer',
    config: {
        height: 65
    },
    privates: {
        doUpdateSpacer: function() {
            var scrollable = this.getGrid().getScrollable();
            this.element.setStyle('margin-right', scrollable.getScrollbarSize().width + 'px');
        }
    }
});