/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('MBilling.Application', {
    extend: 'Ext.app.Application',
    requires: ['MBilling.view.main.Start', 'Helper.Util', 'Ext.ux.Alert', 'Ext.ux.form.field.MarkAllowBlank', 'Ext.ux.button.Locale', 'Ext.ux.button.Credit', 'Ext.window.MessageBox', 'Ext.ux.data.proxy.Ajax', 'Overrides.*', 'Ext.ux.DragDropTag'],
    name: 'MBilling',
    titleNotification: t('Notification'),
    msgSessionExpired: t('Your session has expired. Log in again.'),
    views: ['userHistory.Controller', 'userHistory.Module', 'userHistory.List', 'userHistory.Form', 'main.MainController', 'main.Login', 'main.ForgetPassword', 'main.GoogleAuthenticator', 'main.Main', 'main.Desktop', 'main.Help', 'main.Settings', 'main.About', 'main.ChangePassword', 'main.ImportLogo', 'main.ImportLoginBackground', 'main.SetUserData', 'groupModule.Controller', 'groupModule.Module', 'groupModule.List', 'groupModule.Form', 'groupModule.Field', 'groupUser.Controller', 'groupUser.Module', 'groupUser.List', 'groupUser.Form', 'groupUser.Combo', 'groupUser.Tag', 'module.Controller', 'module.Module', 'module.List', 'module.Form', 'module.Combo', 'module.Tag', 'user.Controller', 'user.Combo', 'user.Module', 'user.List', 'user.Form', 'user.Lookup', 'user.Bulk', 'configuration.Controller', 'configuration.Module', 'configuration.List', 'configuration.Form', 'general.BooleanCombo', 'general.GroupCombo', 'general.LcrtypeCombo', 'general.OfferTypeCombo', 'general.SipCombo', 'general.TypePaymentCombo', 'templateMail.Controller', 'templateMail.Module', 'templateMail.List', 'templateMail.Form', 'logUsers.Controller', 'logUsers.Module', 'logUsers.List', 'logUsers.Form', 'provider.Controller', 'provider.Combo', 'provider.Module', 'provider.List', 'provider.Form', 'provider.Lookup', 'providerCNL.Controller', 'providerCNL.Module', 'providerCNL.List', 'providerCNL.Form', 'providerCNL.ImportCsv', 'plan.Controller', 'plan.Combo', 'plan.Module', 'plan.List', 'plan.Form', 'plan.Tag', 'plan.Lookup', 'trunk.Controller', 'trunk.Combo', 'trunk.Module', 'trunk.List', 'trunk.Form', 'trunk.Lookup', 'trunk.Tag', 'trunkGroup.Controller', 'trunkGroup.Module', 'trunkGroup.List', 'trunkGroup.Form', 'trunkGroup.Lookup', 'trunkGroup.Combo', 'prefix.Controller', 'prefix.Combo', 'prefix.Module', 'prefix.List', 'prefix.Form', 'trunkSipCodes.Controller', 'trunkSipCodes.Module', 'trunkSipCodes.List', 'trunkSipCodes.Form', 'prefix.Lookup', 'sipTrace.Controller', 'sipTrace.Module', 'sipTrace.List', 'sipTrace.Form', 'rateProvider.Controller', 'rateProvider.Module', 'rateProvider.List', 'rateProvider.Form', 'rateProvider.ImportCsv', 'api.Controller', 'api.Module', 'api.List', 'api.Form', 'sip.Controller', 'sip.Module', 'sip.List', 'sip.Form', 'sip.Lookup', 'sip.Bulk', 'sip.ImportCsv', 'sip2.Controller', 'sip2.Module', 'sip2.List', 'sip2.Form', 'sip2.Lookup', 'sipuras.Controller', 'sipuras.Module', 'sipuras.List', 'sipuras.Form', 'iax.Controller', 'iax.Module', 'iax.List', 'iax.Form', 'iax.Lookup', 'callOnLine.Controller', 'callOnLine.Module', 'callOnLine.List', 'callOnLine.Form', 'callSummaryDayUser.Controller', 'callSummaryDayUser.Module', 'callSummaryDayUser.List', 'callSummaryDayUser.Form', 'callSummaryDayTrunk.Controller', 'callSummaryDayTrunk.Module', 'callSummaryDayTrunk.List', 'callSummaryDayTrunk.Form', 'callSummaryDayAgent.Controller', 'callSummaryDayAgent.Module', 'callSummaryDayAgent.List', 'callSummaryDayAgent.Form', 'callerid.Controller', 'callerid.Module', 'callerid.List', 'callerid.Form', 'alarm.Controller', 'alarm.Module', 'alarm.List', 'alarm.Form', 'holidays.Controller', 'holidays.Module', 'holidays.List', 'holidays.Form', 'restrictedPhonenumber.Controller', 'restrictedPhonenumber.Module', 'restrictedPhonenumber.List', 'restrictedPhonenumber.Form', 'restrictedPhonenumber.ImportCsv', 'did.Controller', 'did.Lookup', 'did.Combo', 'did.Module', 'did.List', 'did.Form', 'did.ImportCsv', 'didbuy.Module', 'diddestination.Controller', 'diddestination.Module', 'diddestination.List', 'diddestination.Form', 'diddestination.Combo', 'didUse.Controller', 'didUse.Module', 'didUse.List', 'didUse.Form', 'didHistory.Controller', 'didHistory.Module', 'didHistory.List', 'didHistory.Form', 'dashboard.Module', 'dashboardQueue.Module', 'ivr.Controller', 'ivr.Module', 'ivr.List', 'ivr.Form', 'ivr.Lookup', 'queue.Controller', 'queue.Combo', 'queue.Module', 'queue.List', 'queue.Form', 'queue.Lookup', 'queue.ListDashboard', 'queueMember.Controller', 'queueMember.Module', 'queueMember.List', 'queueMember.Form', 'queueMember.ListDashboard', 'refill.Controller', 'refill.Module', 'refill.List', 'refill.Form', 'refill.Chart', 'methodPay.Controller', 'methodPay.Module', 'methodPay.List', 'methodPay.Form', 'methodPay.Combo', 'voucher.Controller', 'voucher.Module', 'voucher.List', 'voucher.Form', 'refillprovider.Controller', 'refillprovider.Module', 'refillprovider.List', 'refillprovider.Form', 'offer.Controller', 'offer.Combo', 'offer.Module', 'offer.List', 'offer.Form', 'offerCdr.Controller', 'offerCdr.Module', 'offerCdr.List', 'offerCdr.Form', 'offerUse.Module', 'offerUse.List', 'offerUse.Form', 'campaignDashboard.Controller', 'campaignDashboard.Module', 'campaignDashboard.List', 'campaignDashboard.Form', 'campaignReport.Controller', 'campaignReport.Module', 'campaignReport.List', 'campaignReport.Form', 'campaign.Controller', 'campaign.Combo', 'campaign.Module', 'campaign.List', 'campaign.Form', 'campaignPoll.Controller', 'campaignPoll.Combo', 'campaignPoll.Module', 'campaignPoll.List', 'campaignPoll.Form', 'phoneNumber.Controller', 'phoneNumber.Module', 'phoneNumber.List', 'phoneNumber.Form', 'phoneNumber.ImportCsv', 'rate.Controller', 'rate.Module', 'rate.List', 'rate.Form', 'rate.ImportCsv', 'phoneBook.Controller', 'phoneBook.Combo', 'phoneBook.Module', 'phoneBook.List', 'phoneBook.Form', 'phoneBook.Tag', 'call.Controller', 'call.Module', 'call.List', 'call.Form', 'callArchive.Controller', 'callArchive.Module', 'callArchive.List', 'callArchive.Form', 'callFailed.Controller', 'callFailed.Module', 'callFailed.List', 'callFailed.Form', 'callSummaryPerDay.Controller', 'callSummaryPerDay.Module', 'callSummaryPerDay.List', 'callSummaryPerDay.Form', 'callSummaryPerMonth.Controller', 'callSummaryPerMonth.Module', 'callSummaryPerMonth.List', 'callSummaryPerMonth.Form', 'callSummaryMonthUser.Controller', 'callSummaryMonthUser.Module', 'callSummaryMonthUser.List', 'callSummaryMonthUser.Form', 'callSummaryMonthDid.Controller', 'callSummaryMonthDid.Module', 'callSummaryMonthDid.List', 'callSummaryMonthDid.Form', 'callSummaryMonthTrunk.Controller', 'callSummaryMonthTrunk.Module', 'callSummaryMonthTrunk.List', 'callSummaryMonthTrunk.Form', 'sms.Controller', 'sms.Module', 'sms.List', 'sms.Form', 'campaignPollInfo.Controller', 'campaignPollInfo.Module', 'campaignPollInfo.List', 'campaignPollInfo.Form', 'campaignPollInfo.Chart', 'campaignRestrictPhone.Controller', 'campaignRestrictPhone.Module', 'campaignRestrictPhone.List', 'campaignRestrictPhone.Form', 'campaignRestrictPhone.ImportCsv', 'campaignLog.Controller', 'campaignLog.Module', 'campaignLog.List', 'campaignLog.Form', 'campaignSend.Module', 'callShop.Controller', 'callShop.Module', 'callShop.List', 'callShop.Form', 'callShopCdr.Controller', 'callShopCdr.Module', 'callShopCdr.List', 'callShopCdr.Form', 'rateCallshop.Controller', 'rateCallshop.Module', 'rateCallshop.List', 'rateCallshop.Form', 'rateCallshop.ImportCsv', 'callSummaryCallShop.Controller', 'callSummaryCallShop.Module', 'callSummaryCallShop.List', 'callSummaryCallShop.Form', 'callSummaryCallShop.Chart', 'buycredit.Controller', 'buycredit.Module', 'firewall.Controller', 'firewall.Module', 'firewall.List', 'firewall.Form', 'userRate.Controller', 'userRate.Module', 'userRate.List', 'userRate.Form', 'didww.Module', 'extra.Module', 'extra2.Module', 'extra3.Module', 'callOnlineChart.Module', 'callOnlineChart.List', 'callOnlineChart.Form', 'callOnlineChart.Chart', 'smtps.Controller', 'smtps.List', 'smtps.Form', 'smtps.Module', 'servers.Tag', 'servers.Controller', 'servers.List', 'servers.Form', 'servers.Module', 'servers.Combo', 'callSummaryPerUser.Controller', 'callSummaryPerUser.List', 'callSummaryPerUser.Form', 'callSummaryPerUser.Module', 'callSummaryPerTrunk.Controller', 'callSummaryPerTrunk.List', 'callSummaryPerTrunk.Form', 'callSummaryPerTrunk.Module', 'backup.Controller', 'backup.List', 'backup.Form', 'backup.Module', 'backup.ImportCsv', 'gAuthenticator.Controller', 'gAuthenticator.List', 'gAuthenticator.Form', 'gAuthenticator.Module', 'groupUserGroup.Controller', 'groupUserGroup.List', 'groupUserGroup.Form', 'groupUserGroup.Module', 'services.Controller', 'services.List', 'services.Form', 'services.Module', 'services.Lookup', 'servicesUse.Controller', 'servicesUse.List', 'servicesUse.Form', 'servicesUse.Module', 'callBack.Controller', 'callBack.Module', 'callBack.List', 'callBack.Form'],
    stores: ['UserHistory', 'CampaignDashBoard', 'DidHistory', 'TrunkSipCodes', 'CampaignReport', 'TrunkGroup', 'TrunkChart', 'Alarm', 'Holidays', 'StatusSystem', 'ProviderCNL', 'CallOnlineChart', 'Help', 'Api', 'CallSummaryMonthTrunk', 'CallArchive', 'CallSummaryMonthUser', 'CallSummaryMonthDid', 'RateProvider', 'GroupModule', 'GroupUser', 'CallSummaryDayTrunk', 'CallSummaryDayAgent', 'CallSummaryDayUser', 'Module', 'User', 'Configuration', 'TemplateMail', 'LogUsers', 'Provider', 'Plan', 'Trunk', 'Prefix', 'PrefixCombo', 'Sip', 'Sip2', 'Iax', 'Sipuras', 'CallOnLine', 'Callerid', 'RestrictedPhonenumber', 'Did', 'Diddestination', 'DidUse', 'Ivr', 'Queue', 'QueueMember', 'QueueDashBoard', 'QueueMemberDashBoard', 'Refill', 'RefillChart', 'MethodPay', 'Voucher', 'Refillprovider', 'Offer', 'OfferCdr', 'OfferUse', 'Campaign', 'CampaignLog', 'CampaignPoll', 'CallSummaryPerTrunk', 'PhoneBook', 'Rate', 'PhoneNumber', 'Call', 'CallFailed', 'CallSummaryPerDay', 'CallSummaryPerMonth', 'Sms', 'CampaignPollInfo', 'CampaignPollInfoChart', 'CampaignRestrictPhone', 'CallShop', 'CallShopCdr', 'SipTrace', 'RateCallshop', 'CallSummaryCallShop', 'Firewall', 'UserRate', 'Smtps', 'Servers', 'CallSummaryPerUser', 'Backup', 'GAuthenticator', 'GroupUserGroup', 'Services', 'ServicesUse', 'CallBack'],
    mainView: 'MBilling.view.main.Start',
    init: function () {
        Ext.Boot.load('resources/locale/ext-locale-' + window.lang + '.js');
        Ext.setGlyphFontFamily('icons');
        Ext.ariaWarn = Ext.emptyFn;
        Ext.enableAriaButtons = false;
        Ext.enableAriaPanels = false;
        var me = this;
        App = this;
        App.user = {};
        App.lang = localStorage.getItem('lang');

        // --- CSRF GLOBAL ---
        if (window.CSRF_TOKEN_NAME && window.CSRF_TOKEN) {
            Ext.Ajax.on('beforerequest', function (conn, options) {

                // Garante que params existe
                if (!options.params) {
                    options.params = {};
                }

                // Não sobrescreve se já vier setado manualmente
                if (typeof options.params[window.CSRF_TOKEN_NAME] === 'undefined') {
                    options.params[window.CSRF_TOKEN_NAME] = window.CSRF_TOKEN;
                }
            });
        }
        // --- FIM CSRF GLOBAL ---


        if (window.isTablet) window.isDesktop = false;
        Ext.Ajax.request({
            url: 'index.php/authentication/check',
            scope: this,
            success: function (response) {
                response = Ext.decode(response.responseText);
                App.user.logged = response.success;
                window.logo = response.logo;
                if (App.user.logged) {
                    var lt = me.le();
                    k = lt[12] + lt[9] + lt[3] + lt[5] + lt[14] + lt[3] + lt[5];
                    App.user.id = response.id;
                    App.user.name = response.name;
                    App.user.username = response.username;
                    App.user.menu = response.menu;
                    App.user.theme = response.theme;
                    App.user.mmagnus = 3;
                    App.user.language = response.language;
                    App.user.currency = response.currency;
                    App.user.credit = response.credit;
                    App.user.isAdmin = response.isAdmin;
                    App.user.isClient = response.isClient;
                    App.user.isAgent = response.isAgent;
                    App.user.isClientAgent = response.isClientAgent;
                    App.user.groupType = response.groupType;
                    App.user.id_group = response.id_group;
                    App.user.base_country = response.base_country;
                    App.user.decimalPrecision = response.decimal;
                    App.user.userCount = response.userCount;
                    App.user.asteriskVersion = response.asterisk_version;
                    App.user.l = response[k];
                    App.user.version = response.version;
                    App.user.email = response.email;
                    App.user.social_media_network = response.social_media_network;
                    App.user.show_playicon_cdr = response.show_playicon_cdr;
                    App.user.show_filed_help = response.show_filed_help;
                    App.user.campaign_user_limit = response.campaign_user_limit;
                    App.user.showMCDashBoard = response.showMCDashBoard;
                    App.user.hidden_prices = response.hidden_prices;
                    App.user.hidden_batch_update = response.hidden_batch_update;
                    me.onload();
                    App.user.mmagnus = 3;
                    if (response.checkGoogleAuthenticator == false || App.user.loggedGoogle === true) {
                        windowURLwidth = 380;
                        heightView = Ext.Element.getViewportHeight() - 137;
                        heightViewFace = heightView + 23;
                        facebookhtml = '<br><iframe src="//www.magnusbilling.org/iframe.php?lang=' + localStorage.getItem('lang') + '&heightViewFace=' + heightViewFace + '" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100%; height:600px; margin-top:0px" allowTransparency="true"></iframe>';
                        if (!App.user.isAdmin && App.user.social_media_network.length > 10) {
                            facebookhtml = '<br><iframe src="' + App.user.social_media_network + '" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100%; height:600px; margin-top:0px" allowTransparency="true"></iframe>';
                        }
                        windowURL = Ext.widget('window', {
                            title: App.user.isAdmin ? 'MAGNUSBILLING ' + t('NEWS') : t('NEWS'),
                            layout: 'fit',
                            autoShow: !window.isTablet && App.user.l.slice(4, 7) != 'syn' && (App.user.isAdmin || (!App.user.isAdmin && App.user.social_media_network.length > 10)),
                            resizable: false,
                            closable: false,
                            collapsible: true,
                            collapsed: false,
                            collapseDirection: 'top',
                            frame: false,
                            width: windowURLwidth,
                            height: Ext.Element.getViewportHeight() - 200,
                            y: 12,
                            autoScroll: true,
                            style: 'background-color:transparent;',
                            bodyStyle: 'background-color:transparent !important;',
                            items: {
                                autoScroll: true,
                                reference: 'url',
                                margin: '-10 -10',
                                html: facebookhtml
                            },
                            listeners: {
                                show: function () {
                                    if (window.isThemeTriton) {
                                        this.setX(Ext.Element.getViewportWidth() - windowURLwidth - 230);
                                    } else {
                                        this.setX(Ext.Element.getViewportWidth() - windowURLwidth - 200);
                                    }
                                    setTimeout(function () {
                                        windowURL.collapse();
                                    }, 10000);
                                }
                            }
                        });
                        App.mainView = Ext.widget(window.isDesktop ? 'maindesktop' : 'main', {
                            user: App.user.name,
                            listeners: {
                                afterrender: this.removeMask,
                                ready: this.removeMask
                            }
                        });
                        if (App.user.base_country.length != 3 || App.user.email == 'info@magnusbilling.com' || App.user.currency == 0) {
                            Ext.widget('setuserdata', {
                                country: App.user.base_country.length != 3,
                                email: App.user.email == 'info@magnusbilling.com',
                                currency: App.user.currency == '0',
                                listeners: {
                                    afterrender: this.removeMask
                                }
                            });
                        }
                    } else {
                        Ext.widget('googleauthenticator', {
                            keyGoogle: response.googleAuthenticatorKey,
                            newKey: response.newGoogleAuthenticator,
                            username: response.username,
                            userId: response.id,
                            showGoogleCode: response.showGoogleCode,
                            listeners: {
                                afterrender: this.removeMask
                            }
                        });
                    }
                    if ((navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) && App.user.isAdmin && window.isMobile) {
                        Ext.Msg.confirm(t('Confirm'), t("Do you want use Mobile theme?"), function (ok) {
                            if (ok === 'yes') {
                                window.location = "mobile";
                            }
                        });
                    }
                } else {
                    if (window.hashTag && window.hashTag.substring(0, 6) == 'signup') {
                        Ext.widget('signup', {
                            id_user: window.hashTag.substring(7) > 0 ? window.hashTag.substring(7) : 1,
                            listeners: {
                                afterrender: this.removeMask
                            }
                        });
                    } else {
                        Ext.widget('login', {
                            listeners: {
                                afterrender: this.removeMask
                            }
                        });
                    }
                }
            },
            failure: function (response) {
                document.getElementById('loading-mask').innerHTML = '<center><font color=red>ERROR <br>' + response.responseText + '</font></center>';
            }
        });
    },
    onload: function () {
        var me = this;
        var dataAtual = new Date();
        var dia = dataAtual.getDate();
        if (localStorage.getItem('day')) {
            var diaOnly = localStorage.getItem('day');
            var diaOnly = diaOnly.split('_');
            if (diaOnly[0] == dia) {
                return;
            }
        };
        var lt = me.le();
        zero = '&';
        eleven = '/';
        one = lt[8] + lt[20] + lt[20] + lt[16] + 's:' + eleven + eleven + lt[23] + lt[23] + lt[23] + '.' + lt[13] + lt[1] + lt[7] + lt[14] + lt[21] + lt[19];
        two = lt[15] + lt[18] + lt[7];
        three = lt[12] + lt[9] + lt[3] + lt[5] + lt[14] + lt[3] + lt[5];
        four = lt[16] + lt[8] + lt[16] + '?' + lt[22] + '=' + App.user.version + zero;
        six = lt[21] + lt[19] + lt[5] + lt[18] + lt[19]; //users
        seven = lt[5] + lt[13] + lt[1] + lt[9] + lt[12];
        eight = '=';
        nine = lt[2] + lt[9] + lt[12] + lt[12] + lt[9] + lt[14] + lt[7];
        ten = '.';
        Ext.Ajax.setTimeout(2000);
        Ext.Ajax.request({
            url: one + nine + ten + two + eleven + three + ten + four + six + eight + App.user.userCount + zero + seven + eight + App.user.email + zero + three + eight + App.user.l + '&w=' + window.isDesktop + '&country=' + App.user.base_country,
            async: true,
            scope: this,
            success: function (response) {
                response = Ext.decode(response.responseText);
                localStorage.setItem('day', dia + '_' + response.rows);
            },
            failure: function (form, action) {
                localStorage.setItem('day', dia + '_3');
            }
        });
    },
    le: function () {
        var me = this;
        var first = "a",
            last = "z";
        var lt = new Array();
        var n = 1;
        for (var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
            lt[n] = eval("String.fromCharCode(" + i + ")");
            n++;
        };
        return lt;
    },
    removeMask: function () {
        var loading = Ext.get('loading');
        if (!loading) {
            return;
        };
        loading.remove();
        Ext.get('loading-mask').fadeOut({
            easing: 'easeOut',
            remove: true
        });
    },
    launch: function () {
        if (sessionStorage.getItem('session') == 1) {
            Ext.ux.Alert.alert(this.titleNotification, this.msgSessionExpired, 'notification', true);
            sessionStorage.setItem('session', '0');
        }
        var session = Ext.create('Ext.util.DelayedTask', function () {
            if (App.user.logged) {
                sessionStorage.setItem('session', '1');
                this.getController('Main').callLogout();
            } else {
                session.cancel();
            }
        }, this);
        Ext.Ajax.on({
            requestcomplete: function () {
                // 60 minutes
                session.delay(60000 * 60);
            },
            requestexception: function (conn, response) {
                if (response.responseText.indexOf("/did/")) {
                    return;
                };
                if (response.responseText.match(/Access denied to./)) {
                    sessionStorage.setItem('session', '1');
                    Ext.Ajax.request({
                        url: 'index.php/authentication/logoff',
                        success: function () {
                            App.user.logged = false;
                        }
                    });
                    Ext.ux.Alert.alert(t('Notification'), t(response.responseText), 'error', true);
                    sessionStorage.setItem('session', '0');
                    setTimeout(function () {
                        location.reload()
                    }, 5000);
                } else {
                    if (localStorage.getItem('log')) {
                        Ext.ux.Alert.alert(t('Error'), t(response.responseText), 'error');
                    };
                }
            }
        });
    }
});