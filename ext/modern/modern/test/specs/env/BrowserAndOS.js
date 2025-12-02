xdescribe("Ext.env.Browser and Ext.env.OS", function() {

    var profiles = {
        Safari_502_Mac: {
            platform: 'MacIntel',
            userAgent: 'Safari_5533.18.5Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-us) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari5', 'Safari502', 'WebKit', 'WebKit533', 'WebKit533181'],
                    version: '5.0.2'
                },
                os: {
                    name: 'MacOS',
                    flags: ['MacOS', 'MacIntel'],
                    version: ''
                }
            }
        },

        Chrome_70517_Mac: {
            platform: 'MacIntel',
            userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7',
            expect: {
                browser: {
                    name: 'Chrome',
                    flags: ['Chrome', 'Chrome7', 'Chrome7051744', 'WebKit', 'WebKit5347', 'WebKit534'],
                    version: '7.0.517.44'
                },
                os: {
                    name: 'MacOS',
                    flags: ['MacOS', 'MacIntel'],
                    version: ''
                }
            }
        },

        iPad_32: {
            platform: 'iPad',
            userAgent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari404', 'WebKit', 'WebKit531', 'WebKit5312110'],
                    version: '4.0.4'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS32', 'iPad'],
                    version: '3.2'
                }
            }
        },

        iPad_43: {
            platform: 'iPad',
            userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190 Safari/6533.18.5',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari5', 'Safari502', 'WebKit', 'WebKit533', 'WebKit533179'],
                    version: '5.0.2'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS4', 'iOS43', 'iPad'],
                    version: '4.3'
                }
            }
        },

        iPhone_31: {
            platform: 'iPhone',
            userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit528', 'WebKit52818'],
                    version: '4.0'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS313', 'iPhone'],
                    version: '3.1.3'
                }
            }
        },

        iPod_41: {
            platform: 'iPod',
            userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B118 Safari/6531.22.7',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari405', 'WebKit', 'WebKit532', 'WebKit5329'],
                    version: '4.0.5'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS4', 'iOS41', 'iPod'],
                    version: '4.1'
                }
            }
        },

        iPod_31: {
            platform: 'iPod',
            userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit528', 'WebKit52818'],
                    version: '4.0'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS313', 'iPod'],
                    version: '3.1.3'
                }
            }
        },

        Android_22_G2: {
            platform: 'Linux armv7l',
            userAgent: ' Mozilla/5.0 (Linux; U; Android 2.2; en-us; T-Mobile G2 Build/ FRF91) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22', 'Linux armv7l'],
                    version: '2.2'
                }
            }
        },

        Android_22_Desire: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-vn; Desire_A8181 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22', 'Linux armv7l'],
                    version: '2.2'
                }
            }
        },

        Android_22_NexusOne: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/ FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22', 'Linux armv7l'],
                    version: '2.2'
                }
            }
        },

        Android_21_GalaxyS: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; fr-fr; GT-I9000 Build/ECLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit530', 'WebKit53017', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android21', 'Linux armv7l'],
                    version: '2.1update1'
                }
            }
        },

        BlackBerry_Torch: {
            platform: 'BlackBerry',
            userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.246 Mobile Safari/534.1+',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['WebKit', 'WebKit534', 'WebKit5341', 'Safari', 'Safari6', 'Safari600246'],
                    version: '6.0.0.246'
                },
                os: {
                    name: 'BlackBerry',
                    flags: ['BlackBerry', 'BlackBerry6', 'BlackBerry600246'],
                    version: '6.0.0.246'
                }
            }
        },

        RIM_Tablet_PlayBook: {
            platform: 'BlackBerry',
            userAgent: 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.7 Safari/534.11+',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['WebKit', 'WebKit534', 'WebKit53411', 'Safari', 'Safari7', 'Safari7107'],
                    version: '7.1.0.7'
                },
                os: {
                    name: 'RIMTablet',
                    flags: ['BlackBerry', 'RIMTablet', 'RIMTablet1', 'RIMTablet100'],
                    version: '1.0.0'
                }
            }
        },

        "Android 3.0.1 / Samsung Galaxy Tab 10.1": {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 3.0.1; en-us; GT-P7510 Build/HRI83) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['WebKit', 'WebKit534', 'WebKit53413', 'Safari', 'Safari4', 'Safari40', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android3', 'Android301', 'Linux armv7l'],
                    version: '3.0.1'
                }
            }
        },

        "Android 2.3.3 / Motorola Droid X": {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.3.3; en-us; DROIDX Build/4.5.1_57_DX5-26) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['WebKit', 'WebKit533', 'WebKit5331', 'Safari', 'Safari4', 'Safari40', 'AndroidStock'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android233', 'Linux armv7l'],
                    version: '2.3.3'
                }
            }
        },

        "HTC_Sensation_Z710e with OSX userAgent": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; HTC_Sensation_Z710e; en-gb) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari5', 'Safari50', 'WebKit', 'WebKit533', 'WebKit53316', 'safari', 'safari5', 'safari50', 'webkit', 'webkit533', 'webkit53316', 'AndroidStock'],
                    version: '5.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android23', 'android', 'android2', 'android23'],
                    version: '2.3'
                }
            }
        },

        "Amazon Kindle Fire": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.0.13.81_10003810) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true',
            expect: {
                browser: {
                    name: 'Silk',
                    flags: [ 'Silk', 'Silk1', 'Silk10138110003810', 'WebKit', 'WebKit533', 'WebKit53316', 'silk', 'silk1', 'silk10138110003810', 'webkit', 'webkit533', 'webkit53316', 'AndroidStock'],
                    version: '1.0.13.81.10003810'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android23', 'android', 'android2', 'android23'],
                    version: '2.3'
                }
            }
        },

        "Amazon Kindle Fire Pro": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; U; en-us; KFTT Build/IML74K) AppleWebKit/535.19 (KHTML, like Gecko) Silk/2.1 Safari/535.19 Silk-Accelerated=true',
            expect: {
                browser: {
                    name: 'Silk',
                    flags: [ 'Silk', 'Silk2', 'Silk21', 'WebKit', 'WebKit535', 'WebKit53519', 'silk', 'silk2', 'silk21', 'webkit', 'webkit535', 'webkit53519', 'AndroidStock'],
                    version: '2.1'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android23', 'android', 'android2', 'android23'],
                    version: '2.3'
                }
            }
        },

        "Motorola Xoom ICS Chrome": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; Xoom Build/IML77) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.75  Safari/535.7',
            expect: {
                browser: {
                    name: 'ChromeMobile',
                    flags: [ 'ChromeMobile', 'ChromeMobile16', 'ChromeMobile16091275', 'WebKit', 'WebKit535', 'WebKit5357', 'chromemobile', 'chromemobile16', 'chromemobile16091275', 'webkit', 'webkit535', 'webkit5357'],
                    version: '16.0.912.75'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android4', 'Android403', 'android', 'android4', 'android403'],
                    version: '4.0.3'
                }
            }
        },

        "Asus Transformer Prime ICS Chrome": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; Transformer Prime TF201 Build/IML74K) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.75  Safari/535.7',
            expect: {
                browser: {
                    name: 'ChromeMobile',
                    flags: [ 'ChromeMobile', 'ChromeMobile16', 'ChromeMobile16091275', 'WebKit', 'WebKit535', 'WebKit5357', 'chromemobile', 'chromemobile16', 'chromemobile16091275', 'webkit', 'webkit535', 'webkit5357'],
                    version: '16.0.912.75'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android4', 'Android403', 'android', 'android4', 'android403'],
                    version: '4.0.3'
                }
            }
        },

        "Galaxy Nexus ICS Chrome": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/535.7 (KHTML, like Gecko) CrMo/16.0.912.75 Mobile Safari/535.7',
            expect: {
                browser: {
                    name: 'ChromeMobile',
                    flags: [ 'ChromeMobile', 'ChromeMobile16', 'ChromeMobile16091275', 'WebKit', 'WebKit535', 'WebKit5357', 'chromemobile', 'chromemobile16', 'chromemobile16091275', 'webkit', 'webkit535', 'webkit5357'],
                    version: '16.0.912.75'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android4', 'Android403', 'android', 'android4', 'android403'],
                    version: '4.0.3'
                }
            }
        },

        Facebook_iPhone: {
            platform: 'iPad',
            // userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 4_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190 Safari/6533.18.5',
            userAgent: 'Mozilla/5.0 (iPad; U; CPU iPhone OS 4_3_3 like Mac OS X; en_US) AppleWebKit (KHTML, like Gecko) Mobile [FBAN/FBForIPhone;FBAV/4.1;FBBV/4100.0;FBDV/iPad2,1;FBMD/iPad;FBSN/iPhone OS;FBSV/4.3.3;FBSS/1; FBCR/;FBID/tablet;FBLC/en_US;FBSF/1.0]',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'WebKit'],
                    version: ''
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS4', 'iOS433', 'iPad'],
                    version: '4.3.3'
                }
            }
        },

        UIWebView: {
            platform: 'iPad',
            userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile',
            expect: {
                browser: {
                    name: 'Other',
                    flags: ['WebKit', 'WebKit533', 'WebKit533179', 'WebView', 'webkit', 'webkit533', 'webkit533179', 'webview'],
                    version: ''
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS4', 'iOS432', 'iPad', 'ios', 'ios4', 'ios432', 'ipad'],
                    version: '4.3.2'
                }
            }
        },

        "Samsung Galaxy S3 w/Opera Mobile": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; Android 4.1.2; GT-I9300 Build/JZO54K) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.123 Mobile Safari/537.22 OPR/14.0.1025.53005',
            expect: {
                browser: {
                    name: 'Opera',
                    flags: ['Opera', 'Opera14', 'Opera140', 'WebKit', 'WebKit537', 'WebKit53722', 'opera', 'opera14', 'opera140', 'webkit', 'webkit537', 'webkit53722'],
                    version: '14.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android4', 'Android412', 'android', 'android4', 'android412'],
                    version: '4.1.2'
                }
            }
        },


        "Motorola Droid Bionic w/Opera Mobile": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; Android 2.3.4; DROID BIONIC Build/5.5.1_84_DBN-74) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.123 Mobile Safari/537.22 OPR/14.0.1025.53005',
            expect: {
                browser: {
                    name: 'Opera',
                    flags: ['Opera', 'Opera14', 'Opera140', 'WebKit', 'WebKit537', 'WebKit53722', 'opera', 'opera14', 'opera140', 'webkit', 'webkit537', 'webkit53722'],
                    version: '14.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android234', 'android', 'android2', 'android234'],
                    version: '2.3.4'
                }
            }
        },

        "Tizen SDK 2.0": {
            platform: '',
            userAgent: 'Mozilla/5.0 (Linux; U; Tizen 2.0; en-us) AppleWebKit/537.1 (KHTML, like Gecko) Version/2.0 Mobile',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari2', 'Safari20', 'WebKit', 'WebKit537', 'WebKit5371', 'safari', 'safari2', 'safari20', 'webkit', 'webkit537', 'webkit5371'],
                    version: '2.0'
                },
                os: {
                    name: 'Tizen',
                    flags: ['Tizen', 'Tizen2', 'Tizen20', 'tizen', 'tizen2', 'tizen20'],
                    version: '2.0'
                }
            }
        }
    };

    Ext.Object.each(profiles, function(device, profile) {
        describe(device, function(){
            it("Ext.env.Browser", function() {
                var expected = profile.expect.browser,
                    expectedFlags = expected.flags,
                    env = new Ext.env.Browser(profile.userAgent),
                    flags = [],
                    i, k, ln, flag;

                new Ext.env.OS(profile.userAgent, profile.platform, env);

                expect(env.name).toBe(expected.name);

                expect(env.version.toString()).toBe(expected.version);

                for (i = 0,ln = expectedFlags.length; i < ln; i++) {
                    flag = expectedFlags[i];
                    Ext.Array.include(expectedFlags, flag.toLowerCase());
                }

                for (k in env.is) {
                    if (!env.is.hasOwnProperty(k)) {
                        continue;
                    }

                    if (env.is[k] === true) {
                        flags.push(k);
                    }
                }

                expect(flags.sort()).toEqual(expected.flags.sort());
            });

            it("Ext.env.OS", function() {
                var expected = profile.expect.os,
                    expectedFlags = expected.flags,
                    env = new Ext.env.OS(profile.userAgent, profile.platform),
                    flags = [], i, k, ln, flag;

                for (i = 0,ln = expectedFlags.length; i < ln; i++) {
                    flag = expectedFlags[i];
                    Ext.Array.include(expectedFlags, flag.toLowerCase());
                }

                expect(env.name).toBe(expected.name);

                expect(env.version.toString()).toBe(expected.version);

                for (k in env.is) {
                    if (!env.is.hasOwnProperty(k)) {
                        continue;
                    }

                    if (env.is[k] === true) {
                        flags.push(k);
                    }
                }

                expect(flags.sort()).toEqual(expected.flags.sort());
            });
        });
    });
});
