/**
 * Classe global da aplicacao e vtypes
 *
 * Adilson L. Magnus <info@magnusbilling.com>
 * 07/10/2011
 */
Ext.define('Helper.Util', {
    singleton: true,
    yesValue: t('Active'),
    noValue: t('Inactive'),
    colorYesValue: 'green',
    colorNoValue: 'red',
    LCRbuy: t('LCR According buyer Price'),
    LCRSell: t('LCR According seller Price'),
    prepaidValue: t('Prepaid'),
    pospaidValue: t('Postpaid'),
    yesValue: t('Yes'),
    noValue: t('No'),
    activeValue: t('Active'),
    inactiveValue: t('Inactive'),
    getListFilter: function (combo, name) {
        var store,
            labelField;
        combo = Ext.widget(combo);
        store = combo.store;
        labelField = combo.listConfig ? combo.listConfig.itemTpl : combo.displayField;
        return {
            type: 'list',
            labelField: labelField,
            store: store,
            field: name || combo.name,
            idField: combo.valueField
        };
    },
    formatQueueState: function (value) {
        switch (value) {
            case 'ringing':
                value = '<span style="color:blue; font-weight: bold; ">' + t('Receiving') + '</span>';
                break;
            case 'answered':
                value = '<span style="color:red; font-weight: bold;">' + t('On Phone') + '</span>';
                break;
            default:
                value = t(value);
                break;
        }
        return value;
    },
    formatQueueAgentState: function (value) {
        switch (value) {
            case 'Not in use':
                value = '<span style="color:green; font-weight: bold; ">' + t('Waiting') + '</span>';
                break;
            case 'Unavailable':
                value = '<span style="color:black; font-weight: bold;">' + t('Unavailable') + '</span>';
                break;
            case 'Ringing':
                value = '<span style="color:blue; font-weight: bold;">' + t('Ringing') + '</span>';
                break;
            case 'In use' || 'in call':
                value = '<span style="color:red; font-weight: bold;">' + t('On Phone') + '</span>';
                break;
            default:
                value = t(value);
                break;
        }
        return value;
    },
    enableComboRelated: function (combo, comboRelated, valueComboRelated) {
        var store = comboRelated.store,
            nameField = combo.name,
            valueCombo = combo.getValue(),
            valueFilter = [{
                type: 'list',
                value: [valueCombo],
                field: nameField
            }];
        valueComboRelated = valueComboRelated || comboRelated.getValue();
        if (!Ext.isDefined(valueCombo)) {
            return;
        } else {
            comboRelated.reset();
        }
        store.load({
            params: {
                filter: Ext.encode(valueFilter)
            },
            callback: function () {
                comboRelated.setValue(valueComboRelated);
                comboRelated.enable();
            }
        });
    },
    utf8Encode: function (argString) {
        if (argString === null || typeof argString === "undefined") {
            return "";
        }
        var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var utftext = "",
            start, end, stringl = 0,
            n;
        start = end = 0;
        stringl = string.length;
        for (n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;
            if (c1 < 128) {
                end++;
            } else if (c1 > 127 && c1 < 2048) {
                enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
            } else {
                enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
            }
            if (enc !== null) {
                if (end > start) {
                    utftext += string.slice(start, end);
                }
                utftext += enc;
                start = end = n + 1;
            }
        }
        if (end > start) {
            utftext += string.slice(start, stringl);
        }
        return utftext;
    },
    sha1: function (str) {
        var rotate_left = function (n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        };
        var cvt_hex = function (val) {
            var str = "";
            var i;
            var v;
            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 0x0f;
                str += v.toString(16);
            }
            return str;
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
        str = Helper.Util.utf8Encode(str);
        var str_len = str.length;
        var word_array = [];
        for (i = 0; i < str_len - 3; i += 4) {
            j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
            word_array.push(j);
        }
        switch (str_len % 4) {
            case 0:
                i = 0x080000000;
                break;
            case 1:
                i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
                break;
            case 2:
                i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
                break;
            case 3:
                i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
                break;
        }
        word_array.push(i);
        while ((word_array.length % 16) !== 14) {
            word_array.push(0);
        }
        word_array.push(str_len >>> 29);
        word_array.push((str_len << 3) & 0x0ffffffff);
        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++) {
                W[i] = word_array[blockstart + i];
            }
            for (i = 16; i <= 79; i++) {
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            }
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
        temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
        return temp.toLowerCase();
    },
    formatBooleanFree: function (value) {
        var me = Helper.Util,
            color = value == 0 ? 'red' : value == 1 ? 'green' : value == 2 ? 'blue' : value == 3 ? 'orange' : '#FFCC00';
        value = value == 0 ? t('Blocked') : value == 1 ? t('Free') : value == 2 ? t('In use') : value == 3 ? t('Calling') : t('Pending');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatBoleto: function (value) {
        var me = Helper.Util,
            color = value == 'P' ? me.colorYesValue : me.colorNoValue;
        value = value = 'P' ? me.yesValue : me.noValue;
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatPackageType: function (value) {
        value = value == 0 ? t('Unlimited calls') : value == 1 ? t('Number free calls') : t('Free seconds');
        return value;
    },
    formatBooleancallback: function (value) {
        color = value == 0 ? 'red' : value == 1 ? 'green' : value == 2 ? 'blue' : value == 3 ? 'orange' : value == 4 ? 'black' : '#FFCC00';
        value = value == 1 ? t('Active') : value == 2 ? t('Pending') : value == 4 ? t('Not working') : t('Sent');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatPorcente: function (value) {
        return value + '%';
    },
    formatBillingType: function (value) {
        value = value == 0 ? t('Monthly') : t('Weekly');
        return value;
    },
    formatDidType: function (value) {
        switch (value) {
            case 0:
                value = t('Call to PSTN');
                break;
            case 1:
                value = t('PJSIP');
                break;
            case 2:
                value = t('IVR');
                break;
            case 3:
                value = t('CallingCard');
                break;
            case 4:
                value = t('Direct extension');
                break;
            case 5:
                value = t('CID Callback');
                break;
            case 6:
                value = t('0800 Callback');
                break;
            case 7:
                value = t('Queue');
                break;
            case 8:
                value = t('Call Group');
                break;
            case 9:
                value = t('Custom');
                break;
            case 10:
                value = t('Context');
                break;
            case 11:
                value = t('Multiples IPs');
                break;
        }
        return value;
    },
    formatLcrtype: function (value) {
        var me = Helper.Util,
            value = value == 1 ? t('LCR According buyer Price') : value == 2 ? t('Load Balancer') : value == 0 ? t('LCR According seller Price') : '';
        return value;
    },
    formatMoneyDecimalWithoutColor: function (value) {
        var format = Ext.util.Format.numberRenderer('0.000');
        return App.user.currency + ' ' + format(value);
    },
    formatMoneyDecimal: function (value) {
        var me = Helper.Util,
            fnName = t('id') + 'Money',
            format = Ext.util.Format.numberRenderer('0.000');
        if (value > 0) {
            return '<span style="color:green;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value < 0) {
            return '<span style="color:red;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value == 0) {
            return '<span style="color:blue;">' + App.user.currency + ' ' + format(value) + '</span>';
        }
    },
    formatMoneyDecimal4: function (value) {
        var me = Helper.Util,
            fnName = t('id') + 'Money',
            format = Ext.util.Format.numberRenderer('0.' + App.user.decimalPrecision);
        if (value > 0) {
            return '<span style="color:green;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value < 0) {
            return '<span style="color:red;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value == 0) {
            return '<span style="color:blue;">' + App.user.currency + ' ' + format(value) + '</span>';
        }
    },
    formatMoneyDecimal2: function (value) {
        var me = Helper.Util,
            fnName = t('id') + 'Money',
            format = Ext.util.Format.numberRenderer('0.00');
        if (value > 0) {
            return '<span style="color:green;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value < 0) {
            return '<span style="color:red;">' + App.user.currency + ' ' + format(value) + '</span>';
        } else if (value == 0) {
            return '<span style="color:blue;">' + App.user.currency + ' ' + format(value) + '</span>';
        }
    },
    formatUserType: function (value) {
        var me = Helper.Util,
            value = value == 1 ? t('Admin') : value == 2 ? t('Agent') : value == 3 ? t('User') : t('NULL');
        return value;
    },
    formatMoney: function (value) {
        var me = Helper.Util,
            fnName = 'globalMoney',
            format = Ext.isFunction(Ext.util.Format[fnName]) ? Ext.util.Format[fnName] : me[fnName] || Ext.util.Format.usMoney;
        formatDecimal = Ext.util.Format.numberRenderer('0.000');
        if (value > 0) {
            return '<span style="color:green;">' + format(value) + '</span>';
        } else if (value < 0) {
            return '<span style="color:red;">' + format(value) + '</span>';
        } else if (value == 0) {
            return '<span style="color:blue;">' + format(value) + '</span>';
        }
    },
    formattyyesno: function (value) {
        var me = Helper.Util,
            color = value ? me.colorYesValue : me.colorNoValue;
        value = value ? me.yesValue : me.noValue;
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatCampaignType: function (value) {
        value = value == 1 ? t('Voice') : value == 2 ? t('WhatsApp') : t('SMS');
        return value;
    },
    formatDirection: function (value) {
        value = value == 1 ? t('Outbound') : value == 2 ? t('Inbound') : value == 3 ? t('Outbound & CallerID') : t('CallerID');
        return value;
    },
    formatHangupCause: function (value) {
        switch (value) {
            case 0:
                value = t('Cause not defined');
                break;
            case 1:
                value = t('Unallocated');
                break;
            case 2:
                value = t('No route to specified transmit network');
                break;
            case 3:
                value = t('No route to destination');
                break;
            case 5:
                value = t('Misdialled trunk prefix');
                break;
            case 6:
                value = t('Channel unacceptable');
                break;
            case 7:
                value = t('Call awarded and being delivered in an established channel');
                break;
            case 8:
                value = t('Preemption');
                break;
            case 14:
                value = t('QoR: ported number');
                break;
            case 16:
                value = t('Normal Clearing');
                break;
            case 17:
                value = t('User busy');
                break;
            case 18:
                value = t('No user responding');
                break;
            case 20:
                value = t('Subscriber absent');
                break;
            case 21:
                value = t('Call Rejected');
                break;
            case 22:
                value = t('Number changed');
                break;
            case 23:
                value = t('Redirected to new destination');
                break;
            case 26:
                value = t('Non-selected user clearing');
                break;
            case 27:
                value = t('Destination out of order');
                break;
            case 28:
                value = t('Invalid number format');
                break;
            case 29:
                value = t('Facility rejected');
                break;
            case 30:
                value = t('Response to STATUS ENQUIRY');
                break;
            case 31:
                value = t('Normal, unspecified');
                break;
            case 34:
                value = t('No circuit/channel available');
                break;
            case 38:
                value = t('Network out of order');
                break;
            case 41:
                value = t('Temporary failure');
                break;
            case 42:
                value = t('Switching equipment congestion');
                break;
            case 43:
                value = t('Access information discarded');
                break;
            case 44:
                value = t('Requested circuit/channel not available');
                break;
            case 50:
                value = t('Requested facility not subscribed');
                break;
            case 52:
                value = t('Outgoing call barred');
                break;
            case 54:
                value = t('Incoming call barred');
                break;
            case 57:
                value = t('Bearer capability not authorized');
                break;
            case 58:
                value = t('Bearer capability not presently available');
                break;
            case 65:
                value = t('Bearer capability not implemented');
                break;
            case 66:
                value = t('Channel type not implemented');
                break;
            case 69:
                value = t('Requested facility not implemented');
                break;
            case 81:
                value = t('Invalid call reference value');
                break;
            case 88:
                value = t('Incompatible destination');
                break;
            case 95:
                value = t('Invalid message unspecified');
                break;
            case 96:
                value = t('Mandatory information element is missing');
                break;
        }
        return value;
    },
    formatCallType: function (value) {
        switch (value) {
            case 0:
                value = t('Standard');
                break;
            case 1:
                value = t('PJSIP');
                break;
            case 2:
                value = t('DID');
                break;
            case 3:
                value = t('DID voip');
                break;
            case 4:
                value = t('Callback');
                break;
            case 5:
                value = t('Voice Broadcasting');
                break;
            case 6:
                value = t('SMS');
                break;
            case 7:
                value = t('Transfer');
                break;
            case 8:
                value = t('Queue');
                break;
            case 9:
                value = t('IVR');
                break;
        }
        return value;
    },
    formatWhatsapp: function (value) {
        color = value == 0 ? 'blue' : value == 1 ? 'green' : value == 2 ? 'red' : value == 3 ? 'black' : value == 4 ? 'red' : '#FFCC00';
        value = value == 0 ? t('Inactive') : value == 1 ? t('Active') : value == 2 ? t('Blocked') : value == 3 ? t('Wrong identity') : value == 4 ? t('Blocked') : t('Pending');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatBoleto: function (value) {
        var me = Helper.Util,
            color = value == 'P' ? me.colorYesValue : me.colorNoValue;
        value = value = 'P' ? me.yesValue : me.noValue;
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatBooleanActive: function (value) {
        var me = Helper.Util,
            color = value == 0 ? 'red' : value == 1 ? 'green' : value == 2 ? 'blue' : value == 3 ? 'green' : value == 4 ? 'red' : value == 5 ? 'orange' : '#FFCC00';
        value = value == 0 ? t('Inactive') : value == 1 ? t('Active') : value == 2 ? t('Pending') : value == 3 ? t('Sent') : value == 4 ? t('Blocked') : value == 5 ? t('AMD') : t('Pending');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatUserStatus: function (value) {
        var me = Helper.Util;
        switch (value) {
            case 0:
                color = 'red';
                value = t('Inactive');
                break;
            case 1:
                color = 'green';
                value = t('Active');
                break;
            case 2:
                color = 'blue';
                value = t('Pending');
                break;
            case 3:
                color = '#FFCC00';
                value = t('Blocked In');
                break;
            case 4:
                color = 'pink';
                value = t('Blocked In Out');
                break;
        }
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatBooleanSms: function (value) {
        var me = Helper.Util,
            color = value == 0 ? 'red' : value == 1 ? 'green' : value == 2 ? 'blue' : '#FFCC00',
            value = value == 0 ? t('Error') : value == 1 ? t('Sent') : value == 2 ? t('Received') : t('Pending');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatBooleanServers: function (value) {
        var me = Helper.Util,
            color = value == 0 ? 'red' : value == 1 ? 'green' : value == 2 ? '#FFCC00' : '#FFCC00',
            value = value == 0 ? t('Inactive') : value == 1 ? t('Active') : value == 2 ? t('OffLine') : value == 3 ? t('Error') : value == 4 ? t('Alert') : t('Pending');
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatLanguageImage: function (value) {
        return '<img src="resources/images/flags/' + value + '.png" />';
    },
    formatsecondsToTime: function (secs) {
        var hr = Math.floor(secs / 3600);
        var min = Math.floor((secs - (hr * 3600)) / 60);
        var sec = secs - (hr * 3600) - (min * 60);
        while (min.length < 2) {
            min = '0' + min;
        }
        while (sec.length < 2) {
            sec = '0' + min;
        }
        hr = hr < 10 ? '0' + hr : hr;
        min = min < 10 ? '0' + min : min;
        sec = parseInt(sec);
        sec = sec < 10 ? '0' + sec : sec
        return hr + ':' + min + ':' + sec;
    },
    formatBoleto: function (value) {
        var me = Helper.Util,
            color = value == 'P' ? me.colorYesValue : me.colorNoValue;
        value = value = 'P' ? me.yesValue : me.noValue;
        return '<span style="color:' + color + '">' + value + '</span>';
    },
    formatDialStatus: function (value) {
        switch (value) {
            case 1:
                value = t('Answer');
                break;
            case 2:
                value = t('Busy');
                break;
            case 3:
                value = t('No answer');
                break;
            case 4:
                value = t('Cancel');
                break;
            case 5:
                value = t('Congestion');
                break;
            case 6:
                value = t('Chanunavail');
                break;
            case 7:
                value = t('Dontcall');
                break;
            case 8:
                value = t('Torture');
                break;
            case 9:
                value = t('Invalidargs');
                break;
            case 10:
                value = t('Machine');
                break;
        }
        return value;
    },
    formatQueueStatus: function (value) {
        switch (value) {
            case 'inQue':
                value = '<span style="color:blue; font-weight: bold; ">' + t('Receiving') + '</span>';
                break;
            case 'Waiting':
                value = '<span style="color:green;">' + t('Waiting') + '</span>';
                break;
            case 'CONNECT':
                value = '<span style="color:red; font-weight: bold;">' + t('On Phone') + '</span>';
                break;
            case 'Idle':
                value = 'Idle';
                break;
        }
        return value;
    },
    formatFail2banAction: function (value) {
        switch (value) {
            case 0:
                value = t('Temp ban');
                break;
            case 1:
                value = t('Permanent ban');
                break;
            case 3:
                value = t('Unban');
                break;
            case 4:
                value = t('Callback');
                break;
            case 5:
                value = t('IgnoreIP');
                break;
        }
        return value;
    },
    convertErrorsJsonToString: function (json) {
        var errors = '';
        if (typeof (json) === 'string') {
            return json;
        }
        Ext.iterate(json, function (field) {
            Ext.each(json[field], function (error) {
                errors += t(error) + '<br>';
            });
        });
        return errors;
    },
    formatStatusImage: function (value) {
        if (value === 'Unavail') value = 'Unavailable';
        if (value === 'Unavailable') return '<img src="resources/images/UNKNOWN.png" /> ' + t(value);
        if (value.match(/^OK/g)) return '<img src="resources/images/registered.png" /> ' + t(value);
        else if (value.match(/^LAGGED/g)) return '<img src="resources/images/Unmonitored.png" /> ' + t(value);
        else return '<img src="resources/images/' + value + '.png" /> ' + t(value);
    },
    formatSipDirection: function (value) {
        if (value == 'IN') return '<img src="resources/images/in.png" /> ';
        else return '<img src="resources/images/out.png" /> ';
    },
    formatDateTime: function (value) {
        if (Ext.Date.format(value, 'Y') < '2000') return '';
        else return value == '0000-00-00 00:00:00' ? '' : Ext.Date.format(value, 'Y-m-d H:i:s')
    },
    formatTranslate: function (value) {
        return t(value);
    }
});
! function (n) {
    "use strict";

    function t(n, t) {
        var r = (65535 & n) + (65535 & t),
            e = (n >> 16) + (t >> 16) + (r >> 16);
        return e << 16 | 65535 & r
    }

    function r(n, t) {
        return n << t | n >>> 32 - t
    }

    function e(n, e, o, u, c, f) {
        return t(r(t(t(e, n), t(u, f)), c), o)
    }

    function o(n, t, r, o, u, c, f) {
        return e(t & r | ~t & o, n, t, u, c, f)
    }

    function u(n, t, r, o, u, c, f) {
        return e(t & o | r & ~o, n, t, u, c, f)
    }

    function c(n, t, r, o, u, c, f) {
        return e(t ^ r ^ o, n, t, u, c, f)
    }

    function f(n, t, r, o, u, c, f) {
        return e(r ^ (t | ~o), n, t, u, c, f)
    }

    function i(n, r) {
        n[r >> 5] |= 128 << r % 32, n[(r + 64 >>> 9 << 4) + 14] = r;
        var e, i, a, h, d, l = 1732584193,
            g = -271733879,
            v = -1732584194,
            m = 271733878;
        for (e = 0; e < n.length; e += 16) i = l, a = g, h = v, d = m, l = o(l, g, v, m, n[e], 7, -680876936), m = o(m, l, g, v, n[e + 1], 12, -389564586), v = o(v, m, l, g, n[e + 2], 17, 606105819), g = o(g, v, m, l, n[e + 3], 22, -1044525330), l = o(l, g, v, m, n[e + 4], 7, -176418897), m = o(m, l, g, v, n[e + 5], 12, 1200080426), v = o(v, m, l, g, n[e + 6], 17, -1473231341), g = o(g, v, m, l, n[e + 7], 22, -45705983), l = o(l, g, v, m, n[e + 8], 7, 1770035416), m = o(m, l, g, v, n[e + 9], 12, -1958414417), v = o(v, m, l, g, n[e + 10], 17, -42063), g = o(g, v, m, l, n[e + 11], 22, -1990404162), l = o(l, g, v, m, n[e + 12], 7, 1804603682), m = o(m, l, g, v, n[e + 13], 12, -40341101), v = o(v, m, l, g, n[e + 14], 17, -1502002290), g = o(g, v, m, l, n[e + 15], 22, 1236535329), l = u(l, g, v, m, n[e + 1], 5, -165796510), m = u(m, l, g, v, n[e + 6], 9, -1069501632), v = u(v, m, l, g, n[e + 11], 14, 643717713), g = u(g, v, m, l, n[e], 20, -373897302), l = u(l, g, v, m, n[e + 5], 5, -701558691), m = u(m, l, g, v, n[e + 10], 9, 38016083), v = u(v, m, l, g, n[e + 15], 14, -660478335), g = u(g, v, m, l, n[e + 4], 20, -405537848), l = u(l, g, v, m, n[e + 9], 5, 568446438), m = u(m, l, g, v, n[e + 14], 9, -1019803690), v = u(v, m, l, g, n[e + 3], 14, -187363961), g = u(g, v, m, l, n[e + 8], 20, 1163531501), l = u(l, g, v, m, n[e + 13], 5, -1444681467), m = u(m, l, g, v, n[e + 2], 9, -51403784), v = u(v, m, l, g, n[e + 7], 14, 1735328473), g = u(g, v, m, l, n[e + 12], 20, -1926607734), l = c(l, g, v, m, n[e + 5], 4, -378558), m = c(m, l, g, v, n[e + 8], 11, -2022574463), v = c(v, m, l, g, n[e + 11], 16, 1839030562), g = c(g, v, m, l, n[e + 14], 23, -35309556), l = c(l, g, v, m, n[e + 1], 4, -1530992060), m = c(m, l, g, v, n[e + 4], 11, 1272893353), v = c(v, m, l, g, n[e + 7], 16, -155497632), g = c(g, v, m, l, n[e + 10], 23, -1094730640), l = c(l, g, v, m, n[e + 13], 4, 681279174), m = c(m, l, g, v, n[e], 11, -358537222), v = c(v, m, l, g, n[e + 3], 16, -722521979), g = c(g, v, m, l, n[e + 6], 23, 76029189), l = c(l, g, v, m, n[e + 9], 4, -640364487), m = c(m, l, g, v, n[e + 12], 11, -421815835), v = c(v, m, l, g, n[e + 15], 16, 530742520), g = c(g, v, m, l, n[e + 2], 23, -995338651), l = f(l, g, v, m, n[e], 6, -198630844), m = f(m, l, g, v, n[e + 7], 10, 1126891415), v = f(v, m, l, g, n[e + 14], 15, -1416354905), g = f(g, v, m, l, n[e + 5], 21, -57434055), l = f(l, g, v, m, n[e + 12], 6, 1700485571), m = f(m, l, g, v, n[e + 3], 10, -1894986606), v = f(v, m, l, g, n[e + 10], 15, -1051523), g = f(g, v, m, l, n[e + 1], 21, -2054922799), l = f(l, g, v, m, n[e + 8], 6, 1873313359), m = f(m, l, g, v, n[e + 15], 10, -30611744), v = f(v, m, l, g, n[e + 6], 15, -1560198380), g = f(g, v, m, l, n[e + 13], 21, 1309151649), l = f(l, g, v, m, n[e + 4], 6, -145523070), m = f(m, l, g, v, n[e + 11], 10, -1120210379), v = f(v, m, l, g, n[e + 2], 15, 718787259), g = f(g, v, m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, h), m = t(m, d);
        return [l, g, v, m]
    }

    function a(n) {
        var t, r = "",
            e = 32 * n.length;
        for (t = 0; t < e; t += 8) r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255);
        return r
    }

    function h(n) {
        var t, r = [];
        for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) r[t] = 0;
        var e = 8 * n.length;
        for (t = 0; t < e; t += 8) r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;
        return r
    }

    function d(n) {
        return a(i(h(n), 8 * n.length))
    }

    function l(n, t) {
        var r, e, o = h(n),
            u = [],
            c = [];
        for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1) u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r];
        return e = i(u.concat(h(t)), 512 + 8 * t.length), a(i(c.concat(e), 640))
    }

    function g(n) {
        var t, r, e = "0123456789abcdef",
            o = "";
        for (r = 0; r < n.length; r += 1) t = n.charCodeAt(r), o += e.charAt(t >>> 4 & 15) + e.charAt(15 & t);
        return o
    }

    function v(n) {
        return unescape(encodeURIComponent(n))
    }

    function m(n) {
        return d(v(n))
    }

    function p(n) {
        return g(m(n))
    }

    function s(n, t) {
        return l(v(n), v(t))
    }

    function C(n, t) {
        return g(s(n, t))
    }

    function A(n, t, r) {
        return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n)
    }
    "function" == typeof define && define.amd ? define(function () {
        return A
    }) : "object" == typeof module && module.exports ? module.exports = A : n.md5 = A
}(this);
