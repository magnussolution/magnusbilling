Ext.define('Overrides.ux.grid.filter.DateFilter', {
    override: 'Ext.ux.grid.filter.DateFilter',
    beforeText: t('Before'),
    afterText: t('After'),
    onText: t('In'),
    dateFormat: 'Y-m-d',
    onCheckChange: function(item, checked) {
        var me = this,
            picker = item.menu.items.first(),
            itemId = picker.itemId,
            values = me.values;
        if (checked) {
            values[itemId] = picker.getValue();
            // deselect "opposite" checkboxes
            if (itemId == "on") {
                this.fields['after'].setChecked(false);
                this.fields['before'].setChecked(false);
            } else {
                this.fields['on'].setChecked(false);
            }
        } else {
            delete values[itemId]
        }
        me.setActive(me.isActivatable());
        me.fireEvent('update', me);
    },
    onPickerSelect: function(picker, date) {
        // keep track of the picker value separately because the menu gets destroyed
        // when columns order changes.  We return this value from getValue() instead
        // of picker.getValue()
        picker.up('menu').hide();
        this.fields[picker.itemId].setChecked(true);
        // deselect opposite checkboxes
        if (picker.itemId == "on") {
            this.fields['after'].setChecked(false);
            this.fields['before'].setChecked(false);
        } else {
            this.fields['on'].setChecked(false);
        }
        this.values[picker.itemId] = date;
        this.fireEvent('update', this);
    }
});