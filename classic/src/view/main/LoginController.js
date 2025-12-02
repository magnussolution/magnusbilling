Ext.define('MBilling.view.main.LoginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.login',
    titleWarning: t('Warning'),
    msgFieldsRequired: t('Fill in the fields correctly.'),
    msgAuthenticating: t('Authenticating...'),
    msgEnteringInSystem: t('Entering in system...'),
    msgWelcome: t('Welcome'),
    titleErrorInAuthentication: t('Authentication error'),
    onLogin: function(btn) {
        var me = this,
            loginWin = me.getView(),
            fieldUser = me.lookupReference('user'),
            fieldPassword = me.lookupReference('password'),
            user = fieldUser.getValue();
        if (!fieldUser.isValid() || !fieldPassword.isValid()) {
            Ext.ux.Alert.alert(me.titleWarning, me.msgFieldsRequired, 'warning');
            return false;
        }
        loginWin.setLoading(me.msgAuthenticating);
        Ext.Ajax.request({
            url: 'index.php/authentication/login',
            params: {
                user: user,
                password: me.SHA1(fieldPassword.getValue()),
                key: window.captcha
            },
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    loginWin.setLoading(me.msgEnteringInSystem);
                    App.init();
                    loginWin.setLoading(false);
                    loginWin.close();
                    Ext.ux.Alert.alert(me.msgWelcome, response.msg, 'information');
                    App.user.logged = response.success;
                } else {
                    if (response.ip) {
                        response.msg = t(response.msg) + "<br>" + t('IP') + ': ' + response.ip;
                    }
                    Ext.ux.Alert.alert(me.titleErrorInAuthentication, t(response.msg), 'error');
                    fieldUser.focus(true);
                    loginWin.setLoading(false);
                }
            }
        });
    },
    onShowLogin: function() {
        this.lookupReference('user').focus(false, 10);
    },
    onSignup: function() {
        window.location = window.location.pathname + '#signup';
        window.location.reload();
    },
    onCreateAccount: function(btn) {
        var me = this,
            loginWin = me.getView();
        formPanel = me.lookupReference('signupForm').getForm();
        values = formPanel.getFieldValues();
        if (values.accept_terms == 0) {
            Ext.ux.Alert.alert(me.titleWarning, t('You need accept the terms to signup'), 'warning');
            return;
        }
        if (!formPanel.isValid()) {
            console.log(values);
            Ext.ux.Alert.alert(me.titleWarning, me.msgFieldsRequired, 'warning');
            return false;
        }
        btn.disable();
        Ext.Ajax.request({
            url: 'index.php/signup/add',
            params: values,
            scope: me,
            success: function(response) {
                response = Ext.decode(response.responseText);
                if (response.success) {
                    Ext.ux.Alert.alert(t('Success'), t(response.msg) + ". <br>" + t('Your username is') + ' ' + response.username, 'success', true, false);
                } else {
                    errors = Helper.Util.convertErrorsJsonToString(response.errors);
                    if (!Ext.isObject(response.errors)) {
                        Ext.ux.Alert.alert(me.titleError, t(errors), 'error', true, 7);
                    } else {
                        Ext.ux.Alert.alert(me.titleWarning, t(errors), 'error', true, 7);
                    }
                    formPanel.markInvalid(response.errors);
                    btn.enable();
                }
            },
            failure: function(response) {
                response = Ext.decode(response.responseText);
                console.log(response);
            }
        });
    },
    SHA1: function(msg) {
        function rotate_left(n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        };

        function lsb_hex(val) {
            var str = '';
            var i;
            var vh;
            var vl;
            for (i = 0; i <= 6; i += 2) {
                vh = (val >>> (i * 4 + 4)) & 0x0f;
                vl = (val >>> (i * 4)) & 0x0f;
                str += vh.toString(16) + vl.toString(16);
            }
            return str;
        };

        function cvt_hex(val) {
            var str = '';
            var i;
            var v;
            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 0x0f;
                str += v.toString(16);
            }
            return str;
        };

        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        };
        var blockstart;
        var i, j;
        var W = new Array(80);
        var H0 = 0x67452301;
        var H1 = 0xEFCDAB89;
        var H2 = 0x98BADCFE;
        var H3 = 0x10325476;
        var H4 = 0xC3D2E1F0;
        var A, B, C, D, E;
        var temp;
        msg = Utf8Encode(msg);
        var msg_len = msg.length;
        var word_array = new Array();
        for (i = 0; i < msg_len - 3; i += 4) {
            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
            word_array.push(j);
        }
        switch (msg_len % 4) {
            case 0:
                i = 0x080000000;
                break;
            case 1:
                i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
                break;
            case 2:
                i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
                break;
            case 3:
                i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
                break;
        }
        word_array.push(i);
        while ((word_array.length % 16) != 14) word_array.push(0);
        word_array.push(msg_len >>> 29);
        word_array.push((msg_len << 3) & 0x0ffffffff);
        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
            for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;
            for (i = 0; i <= 19; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 20; i <= 39; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 40; i <= 59; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 60; i <= 79; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }
        var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
        return temp.toUpperCase();
    }
});