/**
 * Ux for alerts
 *
 * Adilson L. Magnus <info@magnussolution.com> 
 * 26/11/2011
 */
Ext.define('Ext.ux.Alert', {
    msgAlert: null,
    mapTypeMsg: {
        notification: {
            glyph: 'spam',
            color: 'rgb(163, 160, 160)'
        },
        information: {
            glyph: 'info2',
            color: '#8AAFC5'
        },
        success: {
            glyph: 'ok-circled',
            color: '#59B53A'
        },
        warning: {
            glyph: 'warning',
            color: '#C4B700'
        },
        error: {
            glyph: 'spam',
            color: '#DC4E3D'
        }
    },
    /**
     * Show message of alert in top/center of app
     * @param {String} title Title of message
     * @param {String} msg Message
     * @param {String} type The type of alert (notification, information, success, warning and error)
     * @param {Boolean} closable Enable button to close box alert - default: if undefined and autoHide = false, true
     * @param {Boolean} autoHide To auto hide box alert - default: if undefined and type not error and closable = false, true
     * @param {Integer} delay time in ms to close box - default 3000
     * @param {String} icon icon to show in box - default icon type message
     * @param {Boolean} showIcon if true, show icon in box - default true
     */
    alert: function(title, msg, type, closable, autoHide, delay, icon, showIcon) {
        showIcon = Ext.isDefined(showIcon) ? showIcon : true;
        var me = this,
            msgBox = {},
            content,
            tpl,
            msgBox,
            tagClose,
            sizeClose = Ext.Boot.platformTags.desktop ? '11px' : '15px',
            sizeGlyph = Ext.Boot.platformTags.desktop ? '16px' : '17px',
            sizeTitle = Ext.Boot.platformTags.desktop ? '14px' : '17px',
            sizeContent = Ext.Boot.platformTags.desktop ? '13px' : '15px',
            tagIcon = showIcon ? Ext.String.format('<span style="font-family:icons; font-size: {2}; color: {0};">&#{1}</span>', me.mapTypeMsg[type].color, icons[icon || me.mapTypeMsg[type].glyph], sizeGlyph) : '',
            tagTitle = showIcon ? '<h3 style="font-size: ' + sizeTitle + ';">' + title + '</h3>' : '<h3 style="padding-left: 0px; font-size: ' + sizeTitle + ';">' + title + '</h3>';
        format = msg || '';
        autoHide = Ext.isDefined(autoHide) ? autoHide : !closable && (type !== 'error');
        closable = Ext.isDefined(closable) ? closable : !autoHide;
        tagClose = closable ? '<div class="close" style="width: ' + sizeClose + '; height: ' + sizeClose + ';"></div>' : '';
        if (!me.msgAlert) {
            me.msgAlert = Ext.core.DomHelper.insertFirst(Ext.getBody(), {
                cls: 'alert-box'
            }, true);
        }
        content = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
        tpl = ['<table class="alert-', type, '">', '<tbody>', '<tr>', '<td width="16px">', tagIcon, '</td>', '<td>', tagTitle, '</td>', '<td style="vertical-align: top">', tagClose, '</td>', '</tr>', '<tr>', '<td colspan="3"><p style="font-size: ' + sizeContent + ';">', content, '<p></td>', '</tr>', '</tbody>', '</table>'];
        msgBox = Ext.core.DomHelper.append(me.msgAlert, tpl, true);
        if (closable) {
            msgBox.el.down('.close').on('click', function() {
                msgBox.ghost('t', {
                    remove: true
                });
            }, me);
        }
        //msgBox.hide();
        //msgBox.slideIn('t');
        autoHide && msgBox.ghost('t', {
            delay: delay || 3000,
            remove: true
        });
    }
}, function() {
    /**
     * @class Ext.ux.Alert
     * Singleton instance of {@link Abstracts.MessageBox}.
     */
    Ext.ns('Ext.ux');
    Ext.ux.Alert = new this();
});