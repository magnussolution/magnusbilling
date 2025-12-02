/**
 * See https://developers.google.com/api-client-library/javascript/
 * See https://developers.google.com/apis-explorer/#p/
 *
 *  googleApis: { 'calendar': { version: 'v3' } }
 */
Ext.define('Ext.google.ux.Client', {
    extend: 'Ext.Mixin',

    mixins: [ 'Ext.mixin.Mashup' ],

    requiredScripts: [
        '//apis.google.com/js/client.js?onload=_ext_google_ux_client_initialize_'
    ],

    statics: {
        getApiVersion: function(api) {
            var library = this.libraries[api];
            return library && library.state == 2?
                library.version :
                null;
        }
    },

    mixinConfig: {
        extended: function (baseClass, derivedClass, classBody) {
            this.load(classBody.googleApis);
        }
    },

    onClassMixedIn: function(cls) {
        this.load(cls.prototype.googleApis);
    },

     privates: {
        statics: {
            /**
             * @property {Boolean} initialized
             * `true` if the google client has been loaded and initialized.
             * @private
             */
            initialized: false,

            /**
             * @property {Boolean} blocked
             * `true` if this class has blocked Ext.env.Ready, else false.
             * @private
             */
            blocked: false,

            /**
             * @property {Number} loading
             * Keep track of how many libraries are loading.
             * @private
             */
            loading: 0,

            /**
             * @property {Object} libraries
             * Information about required libraries.
             * { `api_name`: { version: string, state: int }
             * state: 0 (pending), 1 (loading), 2 (loaded)
             * Example: { calendar: { version: 'v1', state: 1 } }
             * @private
             */
            libraries: {},

            load: function(apis) {
                var libraries = this.libraries,
                    version, library;

                if (!Ext.isObject(apis)) {
                    return;
                }

                Ext.Object.each(apis, function(api, cfg) {
                    version = cfg.version || 'v1';
                    library = libraries[api];
                    if (!Ext.isDefined(library)) {
                        libraries[api] = { version: version, state: 0 };
                    } else if (library.version !== version) {
                        Ext.log.error(
                            'Google API: failed to load version "' + version + '" of the',
                            '"' + api + '" API: "' + library.version + '" already loaded.')
                    }
                });

                this.refresh();
            },

            refresh: function() {
                var me = this;

                if (!me.blocked) {
                    Ext.env.Ready.block();
                    me.blocked = true;
                }

                if (!me.initialized) {
                    return;
                }

                Ext.Object.each(me.libraries, function(api, library) {
                    if (library.state == 0) {
                        library.state = 1; // loading
                        gapi.client.load(api, library.version, function() {
                            library.state = 2; // loaded
                            if (!--me.loading) {
                                me.refresh();
                            }
                        });
                    }
                    if (library.state == 1) {
                        me.loading++;
                    }
                });

                if (!me.loading && me.blocked) {
                    Ext.env.Ready.unblock();
                    me.blocked = false;
                }
            },

            initialize: function() {
                this.initialized = true;
                this.refresh();
            }
        }
    }
});

// See https://developers.google.com/api-client-library/javascript/features/authentication
_ext_google_ux_client_initialize_ = function() {
    gapi.auth.init(function() {
        Ext.google.ux.Client.initialize();
    });
}
