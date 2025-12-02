/**
 * Proxy to access Google **[event resources](https://developers.google.com/google-apps/calendar/v3/reference/events)**.
 */
Ext.define('Ext.google.data.EventsProxy', {
    extend: 'Ext.google.data.AbstractProxy',
    alias: 'proxy.google-events',

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
        case 'create':
            return me.buildCreateApiRequests(request);
        case 'update':
            return me.buildUpdateApiRequests(request);
        case 'destroy':
            return me.buildDestroyApiRequests(request);
        default:
            Ext.raise('unsupported request: events.' + action);
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

        Ext.each(data.results, function(result) {
            switch (result.kind) {
            case 'calendar#events':
                items = items.concat(result.items.map(me.fromApiEvent.bind(me)));
                break;
            case 'calendar#event':
                items.push(me.fromApiEvent(result));
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
        // https://developers.google.com/google-apps/calendar/v3/reference/events
        toApiEvent: function(data, allDay) {
            var res = {};

            Ext.Object.each(data, function(key, value) {
                var dateTime = null,
                    date = null;

                switch (key) {
                case 'calendarId':
                case 'description':
                    res[key] = value;
                    break;
                case 'id':
                    res.eventId = value;
                    break;
                case 'title':
                    res.summary = value;
                    break;
                case 'startDate':
                case 'endDate':
                    if (allDay) {
                        date = new Date(value);
                        date.setHours(0, -date.getTimezoneOffset());
                        date = Ext.Date.format(date, 'Y-m-d');
                    } else {
                        dateTime = Ext.Date.format(new Date(value), 'c');
                    }

                    // Need to explicitly set unused date field to null
                    // http://stackoverflow.com/a/35658479
                    res[key.slice(0, -4)] = { date: date, dateTime: dateTime };
                    break;
                default:
                    break;
                }
            });

            return res;
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/events
        fromApiEvent: function(data) {
            var res = { allDay: true };

            Ext.Object.each(data, function(key, value) {
                var date, offset, allDay;

                switch (key) {
                case 'id':
                case 'description':
                    res[key] = value;
                    break;
                case 'summary':
                    res.title = value;
                    break;
                case 'start':
                case 'end':
                    date = Ext.Date.parse(value.dateTime || value.date, 'C');
                    offset = date.getTimezoneOffset();
                    allDay = !!value.date;

                    // IMPORTANT: all day events must have their time equal to 00:00 GMT
                    if (allDay && offset !== 0) {
                        date.setHours(0, -offset);
                    }

                    res[key + 'Date'] = date;
                    res.allDay = res.allDay && allDay;
                    break;
                default:
                    break;
                }
            });

            return res;
        },

        // See https://developers.google.com/google-apps/calendar/v3/reference/events/list
        buildReadApiRequests: function(request) {
            // by default, the API returns max 250 events per request, up to 2500. Since we
            // don't have control on the min & max requested times, and don't know how many
            // events will be returned, let's split requests per 3 months and set maxResults
            // to 2500 (~26 events per day - should be enough!?).
            var rparams = request.getParams(),
                start = new Date(rparams.startDate),
                end = new Date(rparams.endDate),
                requests = [],
                next;

            while (start < end) {
                next = Ext.Date.add(start, Ext.Date.MONTH, 3);
                if (next > end) {
                    next = end;
                }

                requests.push(gapi.client.calendar.events.list({
                    calendarId: rparams.calendar,
                    timeMin: Ext.Date.format(start, 'C'),
                    timeMax: Ext.Date.format(next, 'C'),
                    singleEvents: true,
                    maxResults: 2500
                }));

                start = next;
            }

            return requests;
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/events/insert
        buildCreateApiRequests: function(request) {
            var record = request.getRecords()[0];       // batch not currently supported!
            return gapi.client.calendar.events.insert(
                this.toApiEvent(
                    request.getJsonData(),
                    record.get('allDay')));
        },

         // https://developers.google.com/google-apps/calendar/v3/reference/events/patch
         // https://developers.google.com/google-apps/calendar/v3/reference/events/move
        buildUpdateApiRequests: function(request) {
            var record = request.getRecords()[0],       // batch not currently supported!
                params = this.toApiEvent(request.getJsonData(), record.get('allDay')),
                prevCalendarId = record.getModified('calendarId'),
                currCalendarId = record.get('calendarId'),
                eventId = record.getId(),
                requests = [];

            // REQUIRED fields for the patch API
            params.calendarId = currCalendarId;
            params.eventId = eventId;

            if (prevCalendarId && prevCalendarId !== currCalendarId) {
                // The event has been moved to another calendar
                requests.push(gapi.client.calendar.events.move({
                    destination: currCalendarId,
                    calendarId: prevCalendarId,
                    eventId: eventId
                }));
            }

            if (Object.keys(params).length > 2) {
                // There is fields to update other than the calendarId + eventId
                requests.push(gapi.client.calendar.events.patch(params));
            }

            return requests;
        },

        // https://developers.google.com/google-apps/calendar/v3/reference/events/delete
        buildDestroyApiRequests: function(request) {
            var record = request.getRecords()[0];      // batch not currently supported!
                data = request.getJsonData();

            // The current calendar implementation nullifies the calendar ID before deleting
            // it, so let's get it from the previous values if not anymore in data.
            data.calendarId = data.calendarId ||
                record.get('calendarId') ||
                record.getPrevious('calendarId');

            // ['delete'] to make YUI happy
            return gapi.client.calendar.events['delete']({
                'calendarId': data.calendarId,
                'eventId': data.id
            });
        }
    }
});
