/* global Ext, expect, spyOn, jasmine, xit, MockAjaxManager */

describe("grid-general-buffered-no-preserv-scroll", function() {
    var grid, store,
        synchronousLoad = true,
        proxyStoreLoad = Ext.data.ProxyStore.prototype.load,
        loadStore = function() {
            proxyStoreLoad.apply(this, arguments);
            if (synchronousLoad) {
                this.flushLoad.apply(this, arguments);
            }
            return this;
        };

    beforeEach(function() {
        // Override so that we can control asynchronous loading
        Ext.data.ProxyStore.prototype.load = loadStore;
    });

    afterEach(function() {
        // Undo the overrides.
        Ext.data.ProxyStore.prototype.load = proxyStoreLoad;

        grid = store = Ext.destroy(grid, store);
    });

    var scrollbarWidth = Ext.getScrollbarSize().width,
        transformStyleName = 'webkitTransform' in document.documentElement.style ? 'webkitTransform' : 'transform',
        scrollbarsTakeSpace = !!scrollbarWidth,
        // Some tests should only be run if the UI shows space-taking scrollbars.
        // Specifically, those tests which test that the presence or not of a scrollbar in one dimension
        // affects the presence of a scrollbar in the other dimension.
        visibleScrollbarsIt = scrollbarsTakeSpace ? it : xit;

        function getViewTop(el) {
            var dom = Ext.getDom(el),
                transform;

            if (Ext.supports.CssTransforms && !Ext.isIE9m) {
                transform = dom.style[transformStyleName];
                return transform ? parseInt(transform.split(',')[1], 10) : 0;
            } else {
                return parseInt(dom.style.top || '0', 10);
            }
        }

    describe("BufferedStore asynchronous loading timing with rendering and preserveScrollOnReload: false", function() {
        var view,
            bufferedRenderer,
            scroller,
            scrollSize,
            scrollEventCount,
            scrollRequestCount,
            TestModel = Ext.define(null, {
                extend: 'Ext.data.Model',
                fields: [
                    'title', 'forumtitle', 'forumid', 'username', {
                        name: 'replycount',
                        type: 'int'
                    }, {
                        name: 'lastpost',
                        mapping: 'lastpost',
                        type: 'date',
                        dateFormat: 'timestamp'
                    },
                    'lastposter', 'excerpt', 'threadid'
                ],
                idProperty: 'threadid'
            });

        function getData(start, limit) {
            var end = start + limit,
                recs = [],
                i;

            for (i = start; i < end; ++i) {
                recs.push({
                    threadid: i,
                    title: 'Title' + i
                });
            }
            return recs;
        }

        function satisfyRequests(total) {
            var requests = Ext.Ajax.mockGetAllRequests(),
                request, params, data;

            while (requests.length) {
                request = requests[0];

                params = request.options.params;
                data = getData(params.start, params.limit);

                Ext.Ajax.mockComplete({
                    status: 200,
                    responseText: Ext.encode({
                        total: total || 5000,
                        data: data
                    })
                });

                requests = Ext.Ajax.mockGetAllRequests();
            }
        }

        beforeEach(function() {
            MockAjaxManager.addMethods();

            store = new Ext.data.BufferedStore({
                model: TestModel,
                pageSize: 50,
                trailingBufferZone: 50,
                leadingBufferZone: 50,
                proxy: {
                    type: 'ajax',
                    url: 'fakeUrl',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            });
            store.loadPage(1);
            satisfyRequests();

            scrollEventCount = 0;
            grid = new Ext.grid.Panel({
                columns: [{
                    text: 'Title',
                    dataIndex: 'title'
                }],
                store: store,
                width: 600,
                height: 300,
                border: false,
                viewConfig: {
                    preserveScrollOnReload: false,
                    mouseOverOutBuffer: 0,
                    listeners: {
                        scroll: function() {
                            scrollEventCount++;
                        }
                    }
                },
                renderTo: document.body,
                selModel: {
                    pruneRemoved: false
                }
            });
            view = grid.getView();
            bufferedRenderer = view.bufferedRenderer;
            scroller = view.getScrollable();
            scrollSize = (bufferedRenderer.viewSize * 2 + store.leadingBufferZone + store.trailingBufferZone) * bufferedRenderer.rowHeight;

            // Load inline in the scroll event
            bufferedRenderer.scrollToLoadBuffer = 0;
            
            scrollRequestCount = 0;
        });

        afterEach(function() {
            MockAjaxManager.removeMethods();
        });

        it("should refresh from page 1 on buffered store reload with preserveScrollOnReload: false", function() {
            var scrollDone,
                refreshed,
                startRow, endRow;

            expect(view.refreshCounter).toBe(1);

            bufferedRenderer.scrollTo(1000, {
                select: true,
                focus: true,
                callback: function() {
                    scrollDone = true;
                }
            });

            waitsFor(function() {
                satisfyRequests();
                return scrollDone;
            }, 'scroll to finish');

            runs(function() {
                startRow = view.all.startIndex;
                endRow = view.all.endIndex;
                store.on({
                    refresh: function() {
                        refreshed = true;
                    },
                    single: true
                });
                store.reload();
            });

            waitsFor(function() {
                satisfyRequests();
                return refreshed;
            }, 'store to reload');

            runs(function() {
                expect(view.refreshCounter).toBe(2);
                expect(view.all.startIndex).toBe(0);
                expect(view.all.endIndex).toBe(bufferedRenderer.viewSize - 1);
            });
        });
    });

});
