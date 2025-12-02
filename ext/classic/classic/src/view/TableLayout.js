/**
 *  Component layout for {@link Ext.view.Table}
 *  @private
 *
 */
Ext.define('Ext.view.TableLayout', {
    extend: 'Ext.layout.component.Auto',

    alias: 'layout.tableview',
    type: 'tableview',

    beginLayout: function (ownerContext) {
        var me = this,
            owner = me.owner,
            ownerGrid = owner.ownerGrid,
            partner = owner.lockingPartner,
            partnerContext = ownerContext.lockingPartnerContext,
            partnerVisible = partner && partner.grid.isVisible() && !partner.grid.collapsed,
            context = ownerContext.context;

        // Flag whether we need to do row height synchronization.
        // syncRowHeightOnNextLayout is a one time flag used when some code knows it has changed data height
        // and that the upcoming layout must sync row heights even if the grid is configured not to for
        // general row rendering.
        ownerContext.doSyncRowHeights = partnerVisible && (ownerGrid.syncRowHeight || ownerGrid.syncRowHeightOnNextLayout);

        if (!me.columnFlusherId) {
            me.columnFlusherId = me.id + '-columns';
            me.rowHeightFlusherId = me.id + '-rows';
        }

        me.callParent([ ownerContext ]);

        // If we are in a twinned grid (locked view) then set up bidirectional links with
        // the other side's layout context. If the locked or normal side is hidden then
        // we should treat it as though we were laying out a single grid, so don't setup the partners.
        // This is typically if a grid is configured with locking but starts with no locked columns.
        if (partnerVisible) {
            if (!partnerContext && partner.componentLayout.isRunning()) {
                (partnerContext = ownerContext.lockingPartnerContext = context.getCmp(partner)).lockingPartnerContext = ownerContext;

                // Set up opposite side's link if not already aware.
                if (!partnerContext.lockingPartnerContext) {
                    partnerContext.lockingPartnerContext = ownerContext;
                }
            }
            if (ownerContext.doSyncRowHeights) {
                if (partnerContext && !partnerContext.rowHeightSynchronizer) {
                    partnerContext.rowHeightSynchronizer = partnerContext.target.syncRowHeightBegin();
                }
                ownerContext.rowHeightSynchronizer = me.owner.syncRowHeightBegin();
            }
        }

        // Grab a ContextItem for the header container (and make sure the TableLayout can
        // reach us as well):
        (ownerContext.headerContext = context.getCmp(me.headerCt)).viewContext = ownerContext;
    },

    beginLayoutCycle: function (ownerContext, firstCycle) {
        this.callParent([ ownerContext, firstCycle ]);

        if (ownerContext.syncRowHeights) {
            ownerContext.target.syncRowHeightClear(ownerContext.rowHeightSynchronizer);
            ownerContext.syncRowHeights = false;
        }
    },

    calculate: function (ownerContext) {
        var me = this,
            context = ownerContext.context,
            lockingPartnerContext = ownerContext.lockingPartnerContext,
            headerContext = ownerContext.headerContext,
            ownerCtContext = ownerContext.ownerCtContext,
            owner = me.owner,
            columnsChanged = headerContext.getProp('columnsChanged'),
            state = ownerContext.state,
            columnFlusher, otherSynchronizer, synchronizer, rowHeightFlusher,
            bodyDom = owner.body.dom,
            bodyHeight, ctSize, overflowY;

        // Shortcut when empty grid - let the base handle it.
        // EXTJS-14844: Even when no data rows (all.getCount() === 0) there may be summary rows to size.
        if (!owner.all.getCount() && (!bodyDom || !owner.body.child('table'))) {
            ownerContext.setProp('viewOverflowY', false);
            me.callParent([ ownerContext ]);
            return;
        }

        // BufferedRenderer#beforeTableLayout reads, so call it in a read phase.
        if (me.calcCount === 1 && me.owner.bufferedRenderer) {
            me.owner.bufferedRenderer.beforeTableLayout(ownerContext);
        }

        if (columnsChanged === undefined) {
            // We cannot proceed when we have rows but no columnWidths determined...
            me.done = false;
            return;
        }

        if (columnsChanged) {
            if (!(columnFlusher = state.columnFlusher)) {
                // Since the columns have changed, we need to write the widths to the DOM.
                // Queue (and possibly replace) a pseudo ContextItem, who's flush method
                // routes back into this class.
                context.queueFlush(state.columnFlusher = columnFlusher = {
                    ownerContext: ownerContext,
                    columnsChanged: columnsChanged,
                    layout: me,
                    id: me.columnFlusherId,
                    flush: me.flushColumnWidths
                }, true);
            }

            if (!columnFlusher.flushed) {
                // We have queued the columns to be written, but they are still pending, so
                // we cannot proceed.
                me.done = false;
                return;
            }
        }

        // They have to turn row height synchronization on, or there may be variable row heights
        // Either no columns changed, or we have flushed those changes.. which means the
        // column widths in the DOM are correct. Now we can proceed to syncRowHeights (if
        // we are locking) or wrap it up by determining our vertical overflow.
        if (ownerContext.doSyncRowHeights) {
            if (!(rowHeightFlusher = state.rowHeightFlusher)) {
                // When we are locking, both sides need to read their row heights in a read
                // phase (i.e., right now).
                if (!(synchronizer = state.rowHeights)) {
                    state.rowHeights = synchronizer = ownerContext.rowHeightSynchronizer;
                    me.owner.syncRowHeightMeasure(synchronizer);
                    ownerContext.setProp('rowHeights', synchronizer);
                }

                if (!(otherSynchronizer = lockingPartnerContext.getProp('rowHeights'))) {
                    me.done = false;
                    return;
                }

                // Queue (and possibly replace) a pseudo ContextItem, who's flush method
                // routes back into this class.
                context.queueFlush(state.rowHeightFlusher = rowHeightFlusher = {
                    ownerContext: ownerContext,
                    synchronizer: synchronizer,
                    otherSynchronizer: otherSynchronizer,
                    layout: me,
                    id: me.rowHeightFlusherId,
                    flush: me.flushRowHeights
                }, true);
            }

            if (!rowHeightFlusher.flushed) {
                me.done = false;
                return;
            }
        }

        me.callParent([ ownerContext ]);

        if (!ownerContext.heightModel.shrinkWrap) {
            // If the grid is shrink wrapping, we can't be overflowing
            overflowY = false;
            if (!ownerCtContext.heightModel.shrinkWrap) {
                // We are placed in a fit layout of the gridpanel (our ownerCt), so we need to
                // consult its containerSize when we are not shrink-wrapping to see if our
                // content will overflow vertically.
                ctSize = ownerCtContext.target.layout.getContainerSize(ownerCtContext);
                if (!ctSize.gotHeight) {
                    me.done = false;
                    return;
                }

                bodyHeight = bodyDom.offsetHeight;
                overflowY = bodyHeight > ctSize.height;
            }
            ownerContext.setProp('viewOverflowY', overflowY);
        }

        // Adjust the presence of X scrollability depending upon whether the headers
        // overflow, and scrollbars take up space.
        // This has two purposes.
        //
        // For lockable assemblies, if there is horizontal overflow in the normal side,
        // The locked side (which shrinkwraps the columns) must be set to overflow: scroll
        // in order that it has acquires a matching horizontal scrollbar.
        //
        // If no locking, then if there is no horizontal overflow, we set overflow-x: hidden
        // This avoids "pantom" scrollbars which are only caused by the presence of another scrollbar.
        if (me.done && Ext.getScrollbarSize().height) {
            // No locking sides, ensure X scrolling is on if there is overflow, but not if there is no overflow
            // This eliminates "phantom" scrollbars which are only caused by other scrollbars.
            // Locking horizontal scrollbars are handled in Ext.grid.locking.Lockable#afterLayout
            if (!owner.lockingPartner) {
                ownerContext.setProp('overflowX', !!ownerContext.headerContext.state.boxPlan.tooNarrow);
            }
        }
    },

    measureContentHeight: function (ownerContext) {
        var owner = this.owner,
            bodyDom = owner.body.dom,
            emptyEl = owner.emptyEl,
            bodyHeight = 0;

        if (emptyEl) {
            bodyHeight += emptyEl.offsetHeight;
        }

        if (bodyDom){
            bodyHeight += bodyDom.offsetHeight;
        }

        // This will have been figured out by now because the columnWidths have been
        // published...
        if (ownerContext.headerContext.state.boxPlan.tooNarrow) {
            bodyHeight += Ext.getScrollbarSize().height;
        }

        return bodyHeight;
    },

    flushColumnWidths: function () {
        // NOTE: The "this" pointer here is the flusher object that was queued.
        var flusher = this,
            me = flusher.layout,
            ownerContext = flusher.ownerContext,
            columnsChanged = flusher.columnsChanged,
            owner = ownerContext.target,
            len = columnsChanged.length,
            column, i, colWidth, lastBox;

        if (ownerContext.state.columnFlusher !== flusher) {
            return;
        }

        // Set column width corresponding to each header
        for (i = 0; i < len; i++) {
            if (!(column = columnsChanged[i])) {
                continue;
            }

            colWidth = column.props.width;
            owner.body.select(owner.getColumnSizerSelector(column.target)).setWidth(colWidth);

            // Allow columns which need to perform layouts on resize queue a layout
            if (column.target.onCellsResized) {
                column.target.onCellsResized(colWidth);
            }

            // Enable the next go-round of headerCt's ColumnLayout change check to
            // read true, flushed lastBox widths that are in the Table
            lastBox = column.lastBox;
            if (lastBox) {
                lastBox.width = colWidth;
            }
        }

        flusher.flushed = true;

        if (!me.pending) {
            ownerContext.context.queueLayout(me);
        }
    },

    flushRowHeights: function () {
        // NOTE: The "this" pointer here is the flusher object that was queued.
        var flusher = this,
            me = flusher.layout,
            ownerContext = flusher.ownerContext;

        if (ownerContext.state.rowHeightFlusher !== flusher) {
            return;
        }

        ownerContext.target.syncRowHeightFinish(flusher.synchronizer,
                                                flusher.otherSynchronizer);

        flusher.flushed = true;

        ownerContext.syncRowHeights = true;
        if (!me.pending) {
            ownerContext.context.queueLayout(me);
        }
    },

    finishedLayout: function(ownerContext) {
        var me = this,
            ownerGrid = me.owner.ownerGrid,
            nodeContainer = Ext.fly(me.owner.getNodeContainer());

        me.callParent([ ownerContext ]);

        if (nodeContainer) {
            nodeContainer.setWidth(ownerContext.headerContext.props.contentWidth);
        }

        // Inform any buffered renderer about completion of the layout of its view
        if (me.owner.bufferedRenderer) {
            me.owner.bufferedRenderer.afterTableLayout(ownerContext);
        }
        
        if (ownerGrid) {
            ownerGrid.syncRowHeightOnNextLayout = false;
        }
    },

    getLayoutItems: function() {
        return this.owner.getRefItems();
    },

    isValidParent: function() {
        return true;
    }
});
