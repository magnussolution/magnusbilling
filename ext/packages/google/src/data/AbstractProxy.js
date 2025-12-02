/**
 * Base proxy for accessing **[Google API](https://developers.google.com/apis-explorer/#p/)** resources.
 */
Ext.define('Ext.google.data.AbstractProxy', {
    extend: 'Ext.data.proxy.Server',

    mixins: [ 'Ext.google.ux.Client' ],

    // TODO: Batch actions
    // https://developers.google.com/api-client-library/javascript/features/batch
    batchActions: false,

    reader: {
        type: 'json',
        rootProperty: 'items',
        messageProperty : 'error'
    },

    /**
     * @method buildApiRequests
     * Returns a list of API request(s), **not executed**.
     * @param {Ext.data.Request} request The data request
     * @return {Object[]} API request(s)
     * @abstract
     */

    /**
     * @protected
     * @inheritdoc
     */
    doRequest: function(operation) {
        var me = this,
            request = me.buildRequest(operation),
            writer  = me.getWriter(),
            error = false;

        if (writer && operation.allowWrite()) {
            request = writer.write(request);
        }

        me.execute(me.buildApiRequests(request))
            .then(function(response) {
                me.processApiResponse(operation, request, response);
            });

        return request;
    },

    /**
     * @protected
     * @inheritdoc
     */
    buildUrl: function(request) {
        return '';
    },

    privates: {

        execute: function(requests) {
            requests = [].concat(requests);

            // BUG: when using the gapi batch feature and trying to modify the same event
            // more than one time, the request partially fails and returns a 502 error.
            // See https://code.google.com/a/google.com/p/apps-api-issues/issues/detail?id=4528
            // TODO: use the following code once fixed! also check that it doesn't break
            // maxResults limit for event list requests.
            //var batch = gapi.client.newBatch();
            //Ext.Array.each(requests, function(r, i) { batch.add(r, { id: i }); });
            //return batch.execute();

            // WORKAROUND for the issue above (REMOVE ME)
            var results = [];
            return Ext.Array.reduce(requests, function(sequence, r) {
                return sequence.then(function() {
                    return r.then(function(result) {
                        results.push(result);
                    })
                });
            }, Ext.Deferred.resolved()).then(function() {
                return { result: results };
            });
        },

        processApiResponse: function(operation, request, responses) {
            var error = false,
                results = [];

            // responses.result is not a regular Object, can't iterate with Ext.Object.each()
            Ext.each(Object.keys(responses.result), function(index) {
                var result = responses.result[index].result;
                if (result.error) {
                    error = result.error.message;
                    return false;
                }

                results.push(result);
            });

            this.processResponse(true, operation, request, {
                results: error? [] : results,
                success: !error,
                error: error
            });
        },

        sanitizeItems: function(items) {
            var results = [],
                ids = [];

            // Batch can return different versions of the same record, only keep the last one.
            Ext.Array.each(items, function(item) {
                if (!Ext.Array.contains(ids, item.id)) {
                    results.push(item);
                    ids.push(item.id);
                }
            }, this, true);

            return results;
        }
    }
});
