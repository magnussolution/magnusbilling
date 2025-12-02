/*
 * File: DateTime.js
 *
 * This file requires use of the Ext JS 4.2.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 */
Ext.define('Ext.ux.form.field.DateTime', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: ['Ext.ux.picker.DateTime'],
    //<locale>
    /**
     * @cfg {String} format
     * The default date format string which can be overriden for localization support. The format must be valid
     * according to {@link Ext.Date#parse}.
     */
    format: "m/d/Y H:i",
    //</locale>
    //<locale>
    /**
     * @cfg {String} altFormats
     * Multiple date formats separated by "|" to try when parsing a user input value and it does not match the defined
     * format.
     */
    altFormats: "m/d/Y H:i:s|c",
    width: 270,
    collapseIf: function(e) {
        var me = this,
            picker = me.picker;
        if ((Ext.getVersion().major == 4 && !me.isDestroyed && !e.within(me.bodyEl, false, true) && !e.within(me.picker.el, false, true) && !e.within(me.picker.timePicker.el, false, true)) || (Ext.getVersion().major == 5 && !Ext.fly(e.target).isFocusable() && !me.isDestroyed && !e.within(me.bodyEl, false, true) && !me.owns(e.target)) && !e.within(picker.timePicker.el, false, true)) {
            me.collapse();
        }
    },
    createPicker: function() {
        var me = this,
            format = Ext.String.format;
        return new Ext.ux.picker.DateTime({
            pickerField: me,
            floating: true,
            hidden: true,
            focusable: false, // Key events are listened from the input field which is never blurred
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    }
});