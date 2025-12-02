/**
 * Componente para upload de arquivos
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
 * 20/09/2012
 */
Ext.define('Ext.ux.form.field.FileUpload', {
    extend: 'Ext.form.field.File',
    alias: 'widget.uploadfield',
    anchor: '0',
    name: 'file',
    emptyText: t('Select file'),
    fieldLabel: t('File'),
    buttonText: undefined,
    maxSize: window.uploadFaxFilesizebites * 1000000,
    extAllowed: ['csv', 'ret'],
    titleTipInfo: t('Example'),
    titleWarning: t('Warning'),
    msgInvalidFile: t('File not allow'),
    msgInvalidSize: t('Max size file'),
    childEls: ['browseButtonWrap', 'playButtonWrap'],
    buttonPlayMargin: 5,
    buttonConfig: {
        glyph: icons.file
    },
    triggers: {
        filebutton: {
            type: 'component',
            hideOnReadOnly: false
        },
        playbutton: {
            type: 'component'
        }
    },
    applyTriggers: function(triggers) {
        var me = this,
            triggerCfg = (triggers || {}).playbutton;
        if (triggerCfg) {
            triggerCfg.component = Ext.apply({
                xtype: 'button',
                iconCls: 'icon-play',
                ownerCt: me,
                id: me.id + '-play',
                ui: me.ui,
                disabled: me.disabled,
                style: me.getButtonMarginProp() + me.buttonPlayMargin + 'px',
                inputName: me.getName(),
                scope: me,
                handler: me.playStop,
                hidden: true
            });
            return me.callParent([triggers]);
        }
    },
    onRender: function() {
        var me = this,
            button;
        me.isAudio = me.extAllowed.indexOf('wav') !== -1;
        me.formPanel = me.up('form');
        me.formPanel.on('edit', me.onEditForm, me);
        me.callParent(arguments);
        me.triggerPlay = me.getTrigger('playbutton');
        me.buttonPlay = me.triggerPlay.component;
        // Ensure the trigger element is sized correctly upon render
        me.triggerPlay.el.setWidth(me.buttonPlay.getEl().getWidth() + me.buttonPlay.getEl().getMargin('lr'));
        if (Ext.isIE) {
            me.buttonPlay.getEl().repaint();
        }
        me.initTipInfo();
    },
    reset: function() {
        var me = this;
        if (!me.isAudio) {
            return;
        }
        if (me.audio && !me.audio.paused && me.audio.currentTime) {
            me.audio.pause();
            me.audio.currentTime = 0;
        }
        me.buttonPlay.setIconCls('icon-play');
        me.triggerPlay.el.setWidth(0);
        if (Ext.isIE) {
            me.buttonPlay.getEl().repaint();
        }
        me.callParent(arguments);
    },
    onEditForm: function() {
        var me = this,
            record = me.formPanel.getForm().getRecord(),
            audio = record && record.get(me.name),
            hasAudio = !Ext.isEmpty(audio);
        if (!me.isAudio) {
            return;
        }
        if (me.audio && !me.audio.paused && me.audio.currentTime) {
            me.audio.pause();
            me.audio.currentTime = 0;
        }
        me.buttonPlay.setIconCls('icon-play');
        if (hasAudio) {
            me.audio = new Audio(audio);
            me.audio.addEventListener('ended', Ext.bind(me.onEndAudio, me));
            me.triggerPlay.el.setWidth(me.buttonPlay.el.getWidth() + me.buttonPlay.el.getMargin('lr'));
            if (Ext.isIE) {
                me.buttonPlay.getEl().repaint();
            }
        } else {
            me.triggerPlay.el.setWidth(0);
            if (Ext.isIE) {
                me.buttonPlay.getEl().repaint();
            }
        }
        me.buttonPlay.setVisible(hasAudio);
        me.triggerPlay.setVisible(hasAudio);
    },
    onEndAudio: function() {
        this.buttonPlay.setIconCls('icon-play');
    },
    getTriggerMarkup: function() {
        var me = this,
            btn = me.callParent(arguments),
            play = '<td id="' + me.id + '-playButtonWrap" data-ref="playButtonWrap" role="presentation"></td>';
        return btn + play;
    },
    playStop: function(btn) {
        var me = this,
            isPlay = btn.iconCls === 'icon-play';
        if (isPlay) {
            url = 'index.php/playAudio/?audio=' + me.formPanel.getForm().getRecord().get(me.name);
            window.open(url, "_blank");
        }
    },
    initTipInfo: function() {
        var me = this;
        if (!me.htmlTipInfo) {
            return;
        }
        me.tipInfoFile = Ext.create('Ext.tip.ToolTip', {
            html: me.htmlTipInfo,
            anchor: 'top',
            title: me.titleTipInfo,
            target: me.button.el
        });
    },
    onFileChange: function(btn, evt, value) {
        var me = this;
        me.getInfoFile(evt);
        me.callParent(arguments);
    },
    getInfoFile: function(evt) {
        var me = this,
            file = evt.target.files[0],
            arrayNameFile = file.name.split('.'),
            ext = arrayNameFile[arrayNameFile.length - 1].toLowerCase();
        if (me.extAllowed.indexOf(ext) === -1) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgInvalidFile, 'warning');
            me.reset();
            return;
        }
        if (file.size > me.maxSize) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgInvalidSize + Ext.util.Format.fileSize(me.maxSize), 'warning');
            me.reset();
            return;
        }
    }
});