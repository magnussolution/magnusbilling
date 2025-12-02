/**
 * Classe TextMaskPlugin
 *
 * =======================================
 * ###################################
 * MagnusBilling
 *
 * @package MagnusBilling
 * @author Adilson Leffa Magnus.
 * @copyright Copyright (C) 2005 - 2021 MagnusBilling. All rights reserved.
 * ###################################
 *
 * This software is released under the terms of the GNU Lesser General Public License v3
 * A copy of which is available from http://www.gnu.org/copyleft/lesser.html
 *
 * Please submit bug reports, patches, etc to https://github.com/magnussolution/magnusbilling7/issues
 * =======================================
 * Magnusbilling.org <info@magnussolution.com>
 * 19/09/2012
 */
Ext.define('Ext.ux.TextMaskPlugin', {
    extend: 'Ext.AbstractPlugin',
    uses: ['Ext.ux.TextMaskCore'],
    alias: "plugin.textmask",
    useMask: true,
    date: false,
    maskRel: {
        m: '99',
        d: '99',
        n: '99',
        j: '99',
        Y: '9999'
    },
    init: function(cp) {
        this.cp = cp;
        if (this.cp.xtype === 'datefield') {
            this.date = true;
        }
        if (this.date) {
            this.cp.mask = '';
            Ext.each(this.cp.format.split(''), function(item) {
                this.cp.mask += this.maskRel[item] || item;
            }, this);
        }
        cp.textMask = new Ext.ux.TextMaskCore(cp.mask, cp.money);
        cp.updateHidden = this.updateHidden;
        cp.getKeyCode = this.getKeyCode;
        cp.simpleUpdateHidden = this.simpleUpdateHidden;
        cp.getValue = this.getValue;
        cp.getRawValue = this.getRawValue;
        cp.getValueWithMask = this.getValueWithMask;
        cp.getValueWithoutMask = this.getValueWithoutMask;
        cp.setMask = this.setMask;
        if (this.date) {
            cp.setValue = this.setDateValue;
        } else {
            cp.setValue = this.setValue;
        }
        if (Ext.isEmpty(cp.useMask)) {
            cp.useMask = this.useMask;
        }
        cp.on('afterrender', this.afterRender, cp);
    },
    afterRender: function() {
        if (this.money) {
            this.inputEl.setStyle('text-align', 'right');
        }
        this.hiddenField = this.inputEl.insertSibling({
            tag: 'input',
            type: 'hidden',
            name: this.name,
            value: this.textMask.mask(this.value)
        }, 'after');
        this.hiddenName = this.name;
        this.inputEl.dom.removeAttribute('name');
        this.enableKeyEvents = true;
        this.inputEl.on({
            keypress: this.updateHidden,
            keydown: function(e) {
                if (this.readOnly) {
                    return false;
                }
                if (e.getKey() === e.BACKSPACE) {
                    if (this.money) {
                        this.hiddenField.dom.value = this.hiddenField.dom.value.substr(0, this.hiddenField.dom.value.length - 1);
                        this.hiddenField.dom.value = this.hiddenField.dom.value.replace(/[.]/g, '');
                        this.hiddenField.dom.value = this.textMask.parsePrecision(this.hiddenField.dom.value, this.textMask.moneyPrecision);
                        this.hiddenField.dom.value = this.textMask.unmask(this.hiddenField.dom.value);
                    } else {
                        this.hiddenField.dom.value = this.hiddenField.dom.value.substr(0, this.hiddenField.dom.value.length - 1);
                    }
                    this.updateHidden(e);
                }
                this.keyDownEventKey = e.getKey();
            },
            keyup: this.simpleUpdateHidden,
            scope: this
        });
        this.inputEl.dom.value = this.textMask.mask(this.hiddenField.dom.value);
        this.setValue(this.value);
    },
    getKeyCode: function(onKeyDownEvent, type) {
        if (this.readOnly) {
            return false;
        }
        var keycode = {};
        keycode.unicode = onKeyDownEvent.getKey();
        keycode.isShiftPressed = onKeyDownEvent.shiftKey;
        keycode.isDelete = ((onKeyDownEvent.getKey() === Ext.EventObject.DELETE && type === 'keydown') || (type === 'keypress' && onKeyDownEvent.charCode === 0 && onKeyDownEvent.keyCode === Ext.EventObject.DELETE)) ? true : false;
        keycode.isTab = (onKeyDownEvent.getKey() === Ext.EventObject.TAB) ? true : false;
        keycode.isBackspace = (onKeyDownEvent.getKey() === Ext.EventObject.BACKSPACE) ? true : false;
        keycode.isLeftOrRightArrow = (onKeyDownEvent.getKey() === Ext.EventObject.LEFT || onKeyDownEvent.getKey() === Ext.EventObject.RIGHT) ? true : false;
        keycode.pressedKey = String.fromCharCode(keycode.unicode);
        return (keycode);
    },
    updateHidden: function(e) {
        if (this.readOnly || !this.useMask) {
            return false;
        }
        var key = this.getKeyCode(e, 'keydown');
        var kk = this.keyDownEventKey || e.getKey();
        if (!(kk >= e.F1 && kk <= e.F12) && !e.isNavKeyPress()) {
            if (this.inputEl.dom.selectionStart === 0 && this.inputEl.dom.selectionEnd === this.inputEl.dom.value.length) {
                this.hiddenField.dom.value = this.money ? 0 : '';
            }
            if (!key.isBackspace) {
                if (this.money) {
                    this.hiddenField.dom.value = String(this.hiddenField.dom.value) + String(key.pressedKey);
                    this.hiddenField.dom.value = this.hiddenField.dom.value.replace(/[.]/g, '');
                    this.hiddenField.dom.value = this.textMask.parsePrecision(this.hiddenField.dom.value, this.textMask.moneyPrecision);
                    this.hiddenField.dom.value = this.textMask.unmask(this.hiddenField.dom.value);
                } else {
                    this.hiddenField.dom.value = this.textMask.unmask(this.hiddenField.dom.value + key.pressedKey);
                }
            }
            this.inputEl.dom.value = this.textMask.mask(this.hiddenField.dom.value);
            this.inputEl.dom.selectionStart = this.textMask.getLength(this.hiddenField.dom.value);
            this.inputEl.dom.selectionEnd = this.inputEl.dom.selectionStart;
            e.preventDefault();
        }
    },
    simpleUpdateHidden: function(e) {
        if (this.readOnly || this.useMask) {
            return false;
        }
        this.hiddenField.dom.value = this.inputEl.dom.value;
    },
    getValue: function() {
        if (this.returnWithMask) {
            return this.getValueWithMask();
        } else {
            return this.getValueWithoutMask();
        }
    },
    getValueWithMask: function() {
        return this.inputEl.dom.value;
    },
    getValueWithoutMask: function() {
        if (this.hiddenField) {
            return this.hiddenField.dom.value;
        } else {
            return '';
        }
    },
    getRawValue: function() {
        return this.getValue();
    },
    setValue: function(v) {
        v = !Ext.isDefined(v) ? '' : v;
        if (this.useMask && !Ext.isEmpty(v)) {
            if (this.inputEl) {
                this.hiddenField.dom.value = this.textMask.unmask(v);
                this.inputEl.dom.value = this.textMask.mask(v);
            }
            this.value = this.textMask.unmask(v);
        } else {
            if (this.inputEl) {
                this.hiddenField.dom.value = v;
                this.inputEl.dom.value = v;
            }
            this.value = v;
        }
    },
    setDateValue: function(v) {
        if (v === 'now') {
            v = new Date();
        }
        if (this.inputEl) {
            v = this.formatDate(this.parseDate(v));
            this.hiddenField.dom.value = v;
            this.inputEl.dom.value = this.textMask.mask(v);
        }
        this.value = v;
    },
    setMask: function(mask) {
        this.textMask.setMask(mask);
        this.setValue(this.hiddenField.dom.value);
    }
});
/**
 * MODO DE USO DO Ext.ux.form.MaskDateField (xtype: 'maskdatefield')
 *
 * var campo = new Ext.ux.form.MaskTextField({
 *   //Não precisamos definir nada, o componente mascara de acordo com o formato
 *   //da data que já está definido no componente.
 * }) 
 *
//Ext.form.DateField.prototype.altFormats = 'd|dm|dmY|d/m|d-m|d/m/Y|d-m-Y|Y-m-d|Y-m-dTg:i:s';
Ext.define('Ext.ux.form.MaskDateField', {
    extend: 'Ext.form.DateField',
    alias: 'widget.maskdatefield',
    maskRel: {
        m: '99',
        d: '99',
        n: '99',
        j: '99',
        Y: '9999'
    },
    initComponent: function(){
        this.mask = '';
        Ext.each(this.format.split(''), function(item){
            this.mask += this.maskRel[item] || item
        },this)
        
        Ext.ux.form.MaskDateField.superclass.initComponent.apply(this, arguments);
        this.textMask = new Ext.ux.TextMask(this.mask);
        this.textMask.blankChar = '_';
    },
    onRender: function(){
        Ext.ux.form.MaskDateField.superclass.onRender.apply(this, arguments);
        this.hiddenField = this.inputEl.insertSibling({
            tag: 'input',
            type: 'hidden',
            name: this.name,
            value: this.textMask.unmask(this.value)
        }, 'after');
        this.hiddenName = this.name;
        this.inputEl.dom.removeAttribute('name');
        this.enableKeyEvents = true;
        this.inputEl.on({
            keypress:this.updateHidden,
            keydown: function(e){
                if(this.readOnly){return false};
                if(e.getKey() == e.BACKSPACE){
                    this.hiddenField.dom.value = this.hiddenField.dom.value.substr(0, this.hiddenField.dom.value.length-1);
                    this.updateHidden(e);
                }
            },
            scope:this
        });
        this.setValue(this.value);
    },
    getKeyCode : function(onKeyDownEvent, type) {
        if(this.readOnly){return false};
        var keycode = {};
        keycode.unicode = onKeyDownEvent.getKey();
        keycode.isShiftPressed = onKeyDownEvent.shiftKey;
        
        keycode.isDelete = ((onKeyDownEvent.getKey() == Ext.EventObject.DELETE && type=='keydown') || ( type=='keypress' && onKeyDownEvent.charCode===0 && onKeyDownEvent.keyCode == Ext.EventObject.DELETE))? true: false;
        keycode.isTab = (onKeyDownEvent.getKey() == Ext.EventObject.TAB)? true: false;
        keycode.isBackspace = (onKeyDownEvent.getKey() == Ext.EventObject.BACKSPACE)? true: false;
        keycode.isLeftOrRightArrow = (onKeyDownEvent.getKey() == Ext.EventObject.LEFT || onKeyDownEvent.getKey() == Ext.EventObject.RIGHT)? true: false;
        keycode.pressedKey = String.fromCharCode(keycode.unicode);
        return(keycode);
    },
    updateHidden: function(e){
        
        if(this.readOnly){return false};
        var key = this.getKeyCode(e, 'keydown');
        if(!(e.getKey() >= e.F1 && e.getKey() <= e.F12) && !e.isNavKeyPress()){
            if((this.inputEl.dom.selectionStart == 0 && this.inputEl.dom.selectionEnd == this.inputEl.dom.value.length) || (this.hiddenField.dom.value == 'undefined')){
                this.hiddenField.dom.value = '';
            }
            
            if(!key.isBackspace){
                this.hiddenField.dom.value = this.textMask.unmask(this.hiddenField.dom.value + key.pressedKey);
            }
            
            this.inputEl.dom.value = this.textMask.mask(this.hiddenField.dom.value);
            this.inputEl.dom.selectionStart = this.textMask.getLength(this.hiddenField.dom.value);
            this.inputEl.dom.selectionEnd = this.inputEl.dom.selectionStart;
            
            e.preventDefault();
        }
    },
    getRawValue: function(){
        return this.hiddenField.dom.value;
    },
    setValue: function(v){
        if(v === 'now'){
            v = new Date;
        }
        
        if(this.inputEl){
            v = this.formatDate(this.parseDate(v));
            this.hiddenField.dom.value = v;
            this.inputEl.dom.value = this.textMask.mask(v);
        }
        this.value = v;
    },
    //Correção de bug, só dava parse na mascara se fosse um TAB
    onFocus2: function(){
        Ext.form.TriggerField.superclass.onFocus.call(this);
        if(!this.mimicing){
            this.wrap.addClass(this.wrapFocusClass);
            this.mimicing = true;
            this.doc.on('mousedown', this.mimicBlur, this, {delay: 10});
            if(this.monitorTab){
                this.on('keydown', this.checkTab, this);
            }
        }
    },
    checkTab: function(me, e){
        if(e.getKey() == e.TAB || e.getKey() == e.ENTER){
            this.triggerBlur();
        }
    }
})
//Ext.reg('maskdatefield', Ext.ux.form.MaskDateField);

/**
 * ATENÇÃO
 * Usado pra substituir todos os datefields que uso pelo datefield com mascara
 * isto ocorre sobreescrevendo o xtype do datefield normal, faço isso pq uso
 * sómente xtypes no meu sistema, caso não queira isto apague a linha abaixo.
 **/
//Ext.reg('datefield', Ext.ux.form.MaskDateField);