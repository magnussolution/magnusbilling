/**
 * This is the base class for {@link Ext.grid.Grid grid} cells that contain only text.
 *
 * {@link Ext.grid.Row Rows} create cells based on the {@link Ext.grid.column.Column#cell}
 * config. Application code would rarely create cells directly.
 */
Ext.define('Ext.grid.cell.Text', {
    extend: 'Ext.grid.cell.Base',
    xtype: 'textcell',

    config: {
        /**
         * @cfg {Boolean} encodeHtml
         * Specify `false` to write HTML directly to the cell. Be aware that doing this
         * can expose your application to security issues if that content is not known to
         * be safe. User input can contain malicious content such as `script` tags and
         * should be scrubbed before directly rendering that HTML.
         */
        encodeHtml: true,

        /**
         * @cfg {String} rawValue
         * The text value of the cell. This value will be written to the cell differently
         * based on the {@link #encodeHtml} config. This config is automatically set as a
         * result of setting the {@link #value} config and is rarely set directly. This is
         * a separate config to avoid writting the same formatted result to the DOM.
         * @protected
         */
        rawValue: null,

        /**
         * @cfg {String} zeroValue
         *
         * A replacement value for 0.
         *
         * If the cell value is 0 and you want to display it or hide it then you can define
         * a not null value here.
         *
         * Set it as an empty string if you want to hide cells that have 0s.
         */
        zeroValue: null
    },

    updateRawValue: function (rawValue) {
        var dom = this.innerElement.dom,
            value = rawValue == null ? '' : rawValue;

        if (this.getEncodeHtml()) {
            dom.textContent = value;
        } else {
            dom.innerHTML = value;
        }
    },

    updateValue: function() {
        this.writeValue();
    },

    updateZeroValue: function(){
        if(!this.isConfiguring) {
            this.writeValue();
        }
    },

    writeValue: function() {
        var me = this,
            v = me.getValue(),
            format = me.getColumn().getFormatter(),
            zeroValue = me.getZeroValue();

        if(v === 0 && zeroValue !== null) {
            v = zeroValue;
        }else if(typeof format === 'function'){
            v = format(v);
        }
        me.setRawValue(v);
    }
});
