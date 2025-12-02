Ext.define(null, {
    override: 'Ext.event.publisher.Focus',
    
    compatibility: Ext.isIE10m,
    
    publishDelegatedDomEvent: function(e) {
        var body = document.body,
            el = Ext.synchronouslyFocusing;
        
        // This horrid hack is necessary to work around the issue with input elements
        // in IE10m that can fail to focus under certain conditions. See comment in
        // Ext.dom.Element override.
        if (el &&
            ((e.type === 'focusout' && (e.srcElement === el || e.srcElement === window) && e.toElement === body) ||
             (e.type === 'focusin' && (e.srcElement === body || e.srcElement === window) && e.fromElement === el &&
              e.toElement === null)))
        {
            return;
        }
        
        this.callParent([e]);
    }
});
