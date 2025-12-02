/**
 * Proxy to access Google **[calendar resources](https://developers.google.com/google-apps/calendar/v3/reference/calendarList)**.
 */
Ext.define('Ext.google.data.CalendarsProxy', {
    extend: 'Ext.google.data.AbstractProxy',
    alias: 'proxy.google-calendars',

    requires: [
        'Ext.google.data.EventsProxy'
    ],

    googleApis: { 'calendar': { version: 'v3' } },

    /**
     * @protected
     * @inheritdoc
     */
    buildApiRequests: function(request) {
        var me = this,
            action = request.getAction();

        switch (action) {
        case 'read':
            return me.buildReadApiRequests(request);
        case 'update':
            return me.buildUpdateApiRequests(request);
        default:
            Ext.raise('unsupported request: calendars.' + action);
            return null;
        }
    },

    /**
     * @protected
     * @inheritdoc
     */
    extractResponseData: function(response) {
        var me = this,
            data = me.callParent(arguments),
            items = [];

        // We assume that the response contains only results of the same kind.
        Ext.each(data.results, function(result) {
            switch (result.kind) {
            case 'calendar#calendarList':
                items = items.concat(result.items.map(me.fromApiCalendar.bind(me)));
                break;
            default:
                break;
            }
        });

        return {
            items: me.sanitizeItems(items),
            success: data.success,
            error: data.error
        };
    },

    privates: {
        // https://developers.google.com/google-apps/calendar/v3/reference/calendarList#resource
        toApiCalendar: function(data) {
            var res = {};

            Ext.Object.each(data, function(key, value) {
                switch (key) {
                case 'id':
                    res.calendarId = value;
                    break;
                case 'hidden':
                    res.selected = !value;
                    break;
                default:
                    break;
                }
            });

            return res;
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/calendarList#resource
        fromApiCalendar: function(data) {
            var record = {
                    hidden: !data.selected,
                    editable: false,
                    eventStore: {
                        autoSync: true,
                        proxy: {
                            type: 'google-events',
                            resourceTypes: 'events'
                        }
                    }
                };

            Ext.Object.each(data, function(key, value) {
                switch (key) {
                case 'id':
                case 'description':
                    record[key] = value;
                    break;
                case 'backgroundColor':
                    record.color = value;
                    break;
                case 'summary':
                    record.title = value;
                    break;
                case 'accessRole':
                    record.editable = (value == 'owner' || value == 'writer');
                    break;
                default:
                    break;
                }
            });

            return record;
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/calendarList/list
        buildReadApiRequests: function(request) {
            return gapi.client.calendar.calendarList.list();
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/calendarList/patch
        buildUpdateApiRequests: function(request) {
            var data = this.toApiCalendar(request.getJsonData());
            return gapi.client.calendar.calendarList.patch(data);
        }
    }
});
