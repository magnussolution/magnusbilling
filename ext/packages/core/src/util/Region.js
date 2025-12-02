/**
 * This class represents a rectangular region in X,Y space, and performs geometric
 * transformations or tests upon the region.
 *
 * This class may be used to compare the document regions occupied by elements.
 */
Ext.define('Ext.util.Region', function() {
    var ExtUtil = Ext.util,
        constrainRe = /([^\?!]*)(!|\?)?$/,
        alignRe = /^(?:(?:([trbl])(\d+))|(tl|t|tc|tr|l|c|r|bl|b|bc|br))(?:-(?:(?:([trbl])(\d+))|(tl|t|tc|tr|l|c|r|bl|b|bc|br)))?$/i,
        // Each side has the first letter as the main align side, so [tlbr]
        // The next optional component is a offset factor, so [tb] may be followed by [lr] and vice versa
        // The offset factor may also be a number along that edge from 0 to 100.
        // So 'tl-br' is equal to 't0-b100'.
        // The offset factor defaults to 'c' or 50 meaning the 't-b' is equivalent to
        // 't50-b50' or 'tc-bc'
        
        LTROffsetFactors =  {l:0, r:100, t:0, b: 100, c: 50},
        RTLOffsetFactors =  {l:100, r:0, t:0, b: 100, c: 50},
        relativePositions = {b: 0, l:1, t: 2, r: 3},
        alignMap =    {"tl-tr": "l0-r0", "tl-r": "l0-r50", "bl-r": "l100-r50", "bl-br": "l100-r100",
                       "tr-tl": "r0-l0", "tr-l": "r0-l50", "br-l": "r100-l50", "br-bl": "r100-l100"},
        rtlAlignMap = {"tl-tr": "r0-l0", "tl-r": "r0-l50", "bl-r": "r100-l50", "bl-br": "r100-l100",
                       "tr-tl": "l0-r0", "tr-l": "l0-r50", "br-l": "l100-r50", "br-bl": "l100-r100"},
        adjustParams = [],
        zeroOffset = new ExtUtil.Offset(0, 0),

        parseRegion = function (box) {
            var Region = ExtUtil.Region,
                type = typeof box,
                top, right, bottom, left;

            if (box == null) {
                return Region.EMPTY;
            }
            if (box.isRegion) {
                return box;
            }
            if (box.isElement || box.nodeType === 1) {
                return this.getRegion(box);
            }

            if (type === 'string') {
                box = box.split(' ');

                switch (box.length) {
                    case 1:
                        box[1] = box[2] = box[3] = box[0];
                        break;
                    case 2:
                        box[2] = box[0];
                        box[3] = box[1];
                        break;
                    case 3:
                        box[3] = box[1];
                }

                top    = parseInt(box[0], 10) || 0;
                right  = parseInt(box[1], 10) || 0;
                bottom = parseInt(box[2], 10) || 0;
                left   = parseInt(box[3], 10) || 0;
            }
            else if (type === 'number') {
                top = right = bottom = left = box;
            }
            else if (typeof box.x === 'number') {
                top = box.y;
                left = box.x;

                if (typeof box.right === 'number') {
                    right = box.right;
                    bottom = box.bottom;
                } else {
                    right = left + box.width;
                    bottom = top + box.height;
                }
            }
            //<debug>
            else {
                Ext.raise('Not convertible to a Region: ' + box);
            }
            //</debug>

            return new Region(top, right, bottom, left);
        },

        magnitude = [-1, 1, 1, -1],
        
        // Depending on the "relativePosition" which will be 0,1,2 or 3 for T,R,B,L
        // extend the adjacent edge of the target to account for the offset.
        // Also, shrink the adjacent edge to create overlap for the anchor to center in.
        addAnchorOffset = function(target, anchorSize, relativePosition) {
            // Expand the adjacent edge by the anchor HEIGHT.
            if (relativePosition != null && anchorSize) {                
                adjustParams[0] = adjustParams[1] = adjustParams[2] = adjustParams[3] = 0;
                adjustParams[relativePosition] = anchorSize.y * magnitude[relativePosition];
                target = ExtUtil.Region.from(target);
                target.adjust.apply(target, adjustParams);
            }
            return target;
        },

        // Shrink the adjacent edge to create overlap for the anchor to center in.
        calculateAnchorPosition = function(target, result, relativePosition, anchorSize, inside) {
            var minOverlap = Math.ceil(anchorSize.x / 2) + 2,
                anchorPos,
                isBefore,
                overlapLine,
                overlapLength,
                beforeStart,
                x, y;

            // target is out of bounds. We can't show an anchor
            if (inside && !inside.intersect(target)) {
                return;
            }

            if (relativePosition != null) {
                // The result is to the left or right of the target
                if (relativePosition & 1) {
                    anchorPos = new ExtUtil.Region(0, 0, 0, 0).setWidth(anchorSize.y).setHeight(anchorSize.x);
                    isBefore = relativePosition === 3;
                    x = isBefore ? result.right : result.left;
                    overlapLine = new ExtUtil.Region(Math.max(result.top, target.top), x, Math.min(result.bottom, target.bottom), x);

                    if (target.getHeight() > minOverlap) {
                        overlapLength = overlapLine.getHeight();

                        // Not enough vertical intersection to make the anchor display correctly
                        if (overlapLength < target.width && overlapLength < anchorSize.x + 4) {
                            if (overlapLength < minOverlap) {
                                if (overlapLine.getAnchorPoint_c()[1] > target.getAnchorPoint_c()[1]) {
                                    y = target.bottom - minOverlap;
                                } else {
                                    beforeStart = true;
                                    y = target.top + minOverlap - result.getHeight();
                                }
                                if (inside) {
                                    y = Math.min(Math.max(y, inside.top), inside.bottom - result.getHeight());
                                }

                                // Move result, within constraints to attempt to create enough overlap.
                                result.setPosition(result.x, y);
                                overlapLine = new ExtUtil.Region(Math.max(result.top, target.top), x, Math.min(result.bottom, target.bottom), x);
                                overlapLength = overlapLine.getHeight();

                                // Not created enough overlap to display the anchor.
                                if (overlapLength < minOverlap) {
                                    return;
                                }

                                if (beforeStart) {
                                    overlapLine.setPosition(x, target.y - anchorSize.x / 2 - 2);
                                }
                            }
                            overlapLine.setHeight(Math.max(overlapLength, anchorSize.x + 4));

                            // Arrow would be off the edge
                            if (inside && !inside.contains(overlapLine)) {
                                return;
                            }
                        }
                    }
                    result.anchor = anchorPos.alignTo({
                        target: overlapLine,
                        align: isBefore ? 'l-r' : 'r-l',
                        overlap: true
                    });
                    result.anchor.position = isBefore ? 'right' : 'left';
                }
                // The result is above or below the target.
                else {
                    anchorPos = new ExtUtil.Region(0, 0, 0, 0).setWidth(anchorSize.x).setHeight(anchorSize.y);
                    isBefore = relativePosition === 0;
                    y = isBefore ? result.bottom : result.top;
                    overlapLine = new ExtUtil.Region(y, Math.min(result.right, target.right), y, Math.max(result.left, target.left));

                    if (target.getWidth() > minOverlap) {
                        overlapLength = overlapLine.getWidth();

                        // Not enough horizontal intersection to make the anchor display correctly
                        if (overlapLength < target.height && overlapLength < anchorSize.x + 4) {
                            if (overlapLength < minOverlap) {
                                if (overlapLine.getAnchorPoint_c()[0] > target.getAnchorPoint_c()[0]) {
                                    x = target.right - minOverlap;
                                } else {
                                    beforeStart = true;
                                    x = target.left + minOverlap - result.getWidth();
                                }
                                if (inside) {
                                    x = Math.min(Math.max(x, inside.left), inside.right - result.getWidth());
                                }

                                // Move result, within constraints to attempt to create enough overlap.
                                result.setPosition(x, result.y);
                                overlapLine = new ExtUtil.Region(y, Math.min(result.right, target.right), y, Math.max(result.left, target.left));
                                overlapLength = overlapLine.getWidth();

                                // We could not move the target into enough overlap because of constraints
                                if (overlapLength < minOverlap) {
                                    return;
                                }

                                if (beforeStart) {
                                    overlapLine.setPosition(target.x - anchorSize.x / 2 - 2, y);
                                }
                            }
                            overlapLine.setWidth(Math.max(overlapLength, anchorSize.x + 4));

                            // Arrow would be off the edge
                            if (inside && !inside.contains(overlapLine)) {
                                return;
                            }
                        }
                    }
                    result.anchor = anchorPos.alignTo({
                        target: overlapLine,
                        align: isBefore ? 't-b' : 'b-t',
                        overlap: true
                    });
                    result.anchor.position = isBefore ? 'bottom' : 'top';
                }
                result.anchor.align = relativePosition;
            }
            return result;
        },
        checkMinHeight = function(minHeight, result, target, inside) {
            var newHeight;

            if (minHeight && inside) {
                // Overflows the bottom of the target
                if (result.top >= target.bottom && result.bottom > inside.bottom) {
                    result.setHeight(Math.max(result.getHeight() + inside.bottom - result.bottom, minHeight));
                    result.constrainHeight = true;
                }
                // Overflows the top of the target
                else if (result.bottom <= target.top && result.top < inside.top) {
                    newHeight = Math.max(result.getHeight() + result.top - inside.top, minHeight);
                    result.adjust(result.getHeight() - newHeight);
                    result.constrainHeight = true;
                }
                // Just too high
                else if (result.getHeight() > inside.getHeight()) {
                    result.setHeight(Math.max(minHeight, inside.getHeight()));
                    result.setPosition(result.x, 0);
                    result.constrainHeight = true;
                }
            }
        },
        checkMinWidth = function(minWidth, result, target, inside) {
            var newWidth;

            if (minWidth && inside) {
                // Overflows the right of the target
                if (result.left >= target.right && result.right > inside.right) {
                    result.setWidth(Math.max(result.getWidth() + inside.right - result.right, minWidth));
                    result.constrainWidth = true;
                }
                // Overflows the left of the target
                else if (result.right <= target.left && result.left < inside.left) {
                    newWidth = Math.max(result.getWidth() + result.left - inside.left, minWidth);
                    result.adjust(0, 0, 0, result.getWidth() - newWidth);
                    result.constrainWidth = true;
                }
                // Just too wide
                else if (result.getWidth() > inside.getWidth()) {
                    result.setWidth(Math.max(minWidth, inside.getWidth()));
                    result.setPosition(0, result.y);
                    result.constrainWidth = true;
                }
            }
        };

    return {
    requires: ['Ext.util.Offset'],

    isRegion: true,

    statics: {
        /**
         * @static
         * Retrieves an Ext.util.Region for a particular element.
         * @param {String/HTMLElement/Ext.dom.Element} el An element ID, htmlElement or Ext.Element representing an element in the document.
         * @return {Ext.util.Region} region
         */
        getRegion: function(el) {
            return Ext.fly(el).getRegion();
        },

        /**
         * @static
         * Creates a Region from a "box" Object which contains four numeric properties `top`, `right`, `bottom` and `left`.
         * @param {Object} o An object with `top`, `right`, `bottom` and `left` properties.
         * @return {Ext.util.Region} region The Region constructed based on the passed object
         */
        from: function(o) {
            return new this(o.top, o.right, o.bottom, o.left);
        },

        /**
         * This function converts a legacy alignment string such as 't-b' into a
         * pair of edge, offset objects which describe the alignment points of
         * the two regions.
         *
         * So tl-br becomes {myEdge:'t', offset:0}, {otherEdge:'b', offset:100}
         *
         * This not only allows more flexibility in the alignment possibilities,
         * but it also resolves any ambiguity as to chich two edges are desired
         * to be adjacent if an anchor pointer is required.
         * 
         * @param {String} align The align spec, eg `"tl-br"`
         * @param {Boolean} [rtl] Pass `true` to use RTL calculations.
         */
        getAlignInfo: function(align, rtl) {
            if (typeof align === 'object') {
                return align;
            }

            align = align ? ((align.indexOf('-') < 0) ? 'tl-' + align : align) : 'tl-bl';

            // Snip any constraint modifier off so that we can match the alignMaps
            constrain = constrainRe.exec(align);
            align = constrain[1];

            // Convert left to right alignments which are specified using top/bottom corner definitions.
            align = (rtl ? rtlAlignMap : alignMap)[align] || align;
            
            var offsetFactors = rtl ? RTLOffsetFactors : LTROffsetFactors,
                constrain,
                parts = alignRe.exec(align),
                result;

            //<debug>
            if (!parts) {
                Ext.raise({
                    sourceClass: 'Ext.util.Region',
                    sourceMethod: 'getAlignInfo',
                    position: align,
                    msg: 'Attemmpted to align an element with an invalid position: "' + align + '"'
                });
            }
            //</debug>

            result = {
                myEdge: parts[1],
                myOffset: parts[2],
                otherEdge: parts[4],
                otherOffset: parts[5],
                constrain: constrain[2]
            };

            // t-l, b-r etc.
            // Convert points to egde and offset.
            if (parts[3]) {
                result.myEdge = parts[3][0];
                result.myOffset = offsetFactors[parts[3][1]];
                if (result.myOffset == null) {
                    result.myOffset = 50;
                }
            }
            if (parts[6]) {
                result.otherEdge = parts[6][0];
                result.otherOffset = offsetFactors[parts[6][1]];
                if (result.otherOffset == null) {
                    result.otherOffset = 50;
                }
            }

            // TOP=0, RIGHT=1, BOTTOM=2, LEFT=3, INSIDE=undefined
            result.position = relativePositions[result.myEdge];
            return result;
        }
    },
    /* End Definitions */

    /**
     * Creates a region from the bounding sides.
     * @param {Number} top The topmost pixel of the Region.
     * @param {Number} right The rightmost pixel of the Region.
     * @param {Number} bottom The bottom pixel of the Region.
     * @param {Number} left The leftmost pixel of the Region.
     */
    constructor : function(top, right, bottom, left) {
        var me = this;
        me.y = me.top = me[1] = top;
        me.right = right;
        me.bottom = bottom;
        me.x = me.left = me[0] = left;
        me.height = me.bottom - me.top;
        me.width = me.right - me.left;
    },

    /**
     * Translates this Region to the specified position
     * @param {type} x The new X position.
     * @param {type} y The new Y position.
     * @returns {Ext.util.Region} This region after translation.
     */
    setPosition: function(x, y) {
        // Allow [x, y]
        if (arguments.length === 1) {
            y = x[1];
            x = x[0];
        }

        return this.translateBy(x - this.x, y - this.y);
    },

    /**
     * Checks if this region completely contains the region or point that is passed in.
     * @param {Ext.util.Region/Ext.util.Point} region
     * @return {Boolean}
     */
    contains: function(region) {
        var me = this;

        return (region.x >= me.x &&
                (region.right || region.x) <= me.right &&
                region.y >= me.y &&
                (region.bottom || region.y) <= me.bottom);
    },

    /**
     * Checks if this region intersects the region passed in.
     * @param {Ext.util.Region} region
     * @return {Ext.util.Region/Boolean} Returns the intersected region or false if there is no intersection.
     */
    intersect : function(region) {
        var me = this,
            t = Math.max(me.y, region.y),
            r = Math.min(me.right, region.right),
            b = Math.min(me.bottom, region.bottom),
            l = Math.max(me.x, region.x);

        if (b > t && r > l) {
            return new this.self(t, r, b, l);
        }
        else {
            return false;
        }
    },

    /**
     * Returns the smallest region that contains the current AND targetRegion.
     * @param {Ext.util.Region} region
     * @return {Ext.util.Region} a new region
     */
    union : function(region) {
        var me = this,
            t = Math.min(me.y, region.y),
            r = Math.max(me.right, region.right),
            b = Math.max(me.bottom, region.bottom),
            l = Math.min(me.x, region.x);

        return new this.self(t, r, b, l);
    },

    /**
     * Modifies the current region to be constrained to the targetRegion.
     * @param {Ext.util.Region} targetRegion
     * @return {Ext.util.Region} this
     */
    constrainTo : function(targetRegion) {
        var me = this,
            constrain = Ext.Number.constrain;
        me.top = me.y = constrain(me.top, targetRegion.y, targetRegion.bottom);
        me.bottom = constrain(me.bottom, targetRegion.y, targetRegion.bottom);
        me.left = me.x = constrain(me.left, targetRegion.x, targetRegion.right);
        me.right = constrain(me.right, targetRegion.x, targetRegion.right);
        return me;
    },

    /**
     * Modifies the current region to be adjusted by offsets.
     * @param {Number} top Top offset
     * @param {Number} right Right offset
     * @param {Number} bottom Bottom offset
     * @param {Number} left Left offset
     * @return {Ext.util.Region} this
     */
    adjust : function(top, right, bottom, left) {
        var me = this;
        me.top = me.y += top||0;
        me.left = me.x += left||0;
        me.right += right||0;
        me.bottom += bottom||0;
        return me;
    },

    /**
     * Get the offset amount of a point outside the region
     * @param {String} [axis]
     * @param {Ext.util.Point} [p] the point
     * @return {Ext.util.Offset}
     */
    getOutOfBoundOffset: function(axis, p) {
        if (!Ext.isObject(axis)) {
            if (axis === 'x') {
                return this.getOutOfBoundOffsetX(p);
            } else {
                return this.getOutOfBoundOffsetY(p);
            }
        } else {
            p = axis;
            var d = new ExtUtil.Offset();
            d.x = this.getOutOfBoundOffsetX(p.x);
            d.y = this.getOutOfBoundOffsetY(p.y);
            return d;
        }
    },

    /**
     * Get the offset amount on the x-axis
     * @param {Number} p the offset
     * @return {Number}
     */
    getOutOfBoundOffsetX: function(p) {
        if (p <= this.x) {
            return this.x - p;
        } else if (p >= this.right) {
            return this.right - p;
        }

        return 0;
    },

    /**
     * Get the offset amount on the y-axis
     * @param {Number} p the offset
     * @return {Number}
     */
    getOutOfBoundOffsetY: function(p) {
        if (p <= this.y) {
            return this.y - p;
        } else if (p >= this.bottom) {
            return this.bottom - p;
        }

        return 0;
    },

    /**
     * Check whether the point / offset is out of bound
     * @param {String} [axis]
     * @param {Ext.util.Point/Number} [p] the point / offset
     * @return {Boolean}
     */
    isOutOfBound: function(axis, p) {
        if (!Ext.isObject(axis)) {
            if (axis === 'x') {
                return this.isOutOfBoundX(p);
            } else {
                return this.isOutOfBoundY(p);
            }
        } else {
            p = axis;
            return (this.isOutOfBoundX(p.x) || this.isOutOfBoundY(p.y));
        }
    },

    /**
     * Check whether the offset is out of bound in the x-axis
     * @param {Number} p the offset
     * @return {Boolean}
     */
    isOutOfBoundX: function(p) {
        return (p < this.x || p > this.right);
    },

    /**
     * Check whether the offset is out of bound in the y-axis
     * @param {Number} p the offset
     * @return {Boolean}
     */
    isOutOfBoundY: function(p) {
        return (p < this.y || p > this.bottom);
    },

    /**
     * Restrict a point within the region by a certain factor.
     * @param {String} [axis]
     * @param {Ext.util.Point/Ext.util.Offset/Object} [p]
     * @param {Number} [factor]
     * @return {Ext.util.Point/Ext.util.Offset/Object/Number}
     * @private
     */
    restrict: function(axis, p, factor) {
        if (Ext.isObject(axis)) {
            var newP;

            factor = p;
            p = axis;

            if (p.copy) {
                newP = p.copy();
            }
            else {
                newP = {
                    x: p.x,
                    y: p.y
                };
            }

            newP.x = this.restrictX(p.x, factor);
            newP.y = this.restrictY(p.y, factor);
            return newP;
        } else {
            if (axis === 'x') {
                return this.restrictX(p, factor);
            } else {
                return this.restrictY(p, factor);
            }
        }
    },

    /**
     * Restrict an offset within the region by a certain factor, on the x-axis
     * @param {Number} p
     * @param {Number} [factor=1] The factor.
     * @return {Number}
     * @private
     */
    restrictX : function(p, factor) {
        if (!factor) {
            factor = 1;
        }

        if (p <= this.x) {
            p -= (p - this.x) * factor;
        }
        else if (p >= this.right) {
            p -= (p - this.right) * factor;
        }
        return p;
    },

    /**
     * Restrict an offset within the region by a certain factor, on the y-axis
     * @param {Number} p
     * @param {Number} [factor] The factor, defaults to 1
     * @return {Number}
     * @private
     */
    restrictY : function(p, factor) {
        if (!factor) {
            factor = 1;
        }

        if (p <= this.y) {
            p -= (p - this.y) * factor;
        }
        else if (p >= this.bottom) {
            p -= (p - this.bottom) * factor;
        }
        return p;
    },

    /**
     * Returns the Region to which this rectangle should be moved in order to
     * have the desired alignment with the specified target while remaining within the
     * constraint.
     *
     * The `align` option can be one of these forms:
     *
     * - **Blank**: Defaults to aligning the region's top-left corner to the target's
     *   bottom-left corner ("tl-bl").
     * - **Two anchors**: If two values from the table below are passed separated by a dash,
     *   the first value is used as this region's anchor point, and the second value is
     *   used as the target's anchor point.
     * - **One anchor**: The passed anchor position is used as the target's anchor point.
     *   This region will position its top-left corner (tl) to that point.
     * - **Two edge/offset descriptors:** An edge/offset descriptor is an edge initial
     *   (`t`/`r`/`b`/`l`) followed by a percentage along that side. This describes a
     *   point to align with a similar point in the target. So `'t0-b0'` would be
     *   the same as `'tl-bl'`, `'l0-r50'` would place the top left corner of this item
     *   halfway down the right edge of the target item. This allows more flexibility
     *   and also describes which two edges are considered adjacent when positioning an anchor. 
     *
     * If the `inside` option is passed, the Region will attempt to align as specified,
     * but the position will be adjusted to constrain to the `inside` Region if necessary.
     * Note that the Region being aligned might be swapped to align to a different position
     * than that specified in order to enforce the constraints. Following are all of the
     * supported anchor positions:
     *
     *      Value  Description
     *      -----  -----------------------------
     *      tl     The top left corner
     *      t      The center of the top edge
     *      tr     The top right corner
     *      l      The center of the left edge
     *      c      The center
     *      r      The center of the right edge
     *      bl     The bottom left corner
     *      b      The center of the bottom edge
     *      br     The bottom right corner
     *
     * Example Usage:
     *
     *      var xy = comp.getRegion().alignTo({
     *          align: 't-b',  // align comp's top/center to el's bottom/center
     *          target: el.getRegion(),
     *          anchorSize: new Ext.util.Point(10, 10),
     *          inside: new Ext.util.Region(0, Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight(), 0)
     *      });
     *
     * @param {Object} options The alignment options.
     * @param {Ext.util.Region} options.target The rectangle to which this rectangle
     * should align.
     * @param {String} [options.align=tl-bl] The alignment descriptor for positioning this
     * rectangle with respect to the `target`. See {@link Ext.util.Positionable#alignTo}.
     * Note that if the requested alignment results in violation of the `inside` constraint,
     * the result will be flipped align to the closest edge which conforms to the constraint.
     * 
     * @param {Array/Ext.util.Position} [options.position] The position at which to place the
     * resulting region before being excluded from the target area and aligned to the closest
     * edge which allows conformity with any passed `inside` option. Used instead of the `align` option.
     * @param {Ext.util.Offset/Number[]} [options.offset] An extra exclusion zone round the target.
     * @param {Ext.util.Offset/Number[]} [options.anchorSize] The width and height of any external anchor
     * element. This is used to calculate the true bounds of the Region inclusive of the anchor.
     * The `x` dimension is the height of the arrow in all orientations, and the `y` dimension
     * is the width of the baseline of the arrow in all dimensions.
     * If this option is used, and the returned region successfully clears the 
     * bounds of the target, then the anchor region will be returned in the return value
     * as the `anchor` property. This will in turn have a `position` property which will
     * be `'top'`, `'left`, `'right'`, or `'bottom'`.
     * @param {Boolean} [options.overlap] Pass `true` to allow this rectangle to overlap
     * the target.
     * @param {Boolean} [options.rtl] Pass `true` to swap left/right alignment.
     * @param {Ext.util.Region} [options.inside] The rectangle to which this rectangle is
     * constrained.
     * @param {Number} [options.minHeight] Used when this Region is to be aligned directly
     * below or above  the target. Gives the option to reduce the height to fit in the
     * available space.
     * @param {Boolean} [options.axisLock] If `true`, then fallback on constraint violation will
     * only take place along the major align axis. That is, if `align: "l-r"` is being used, and
     * `axisLock: true` is used, then if constraints fail, only fallback to `r-l` is considered.
     * @return {Ext.util.Region} The Region that will align this rectangle. Note that if
     * a `minHeight` option was passed, and aligment is either above or below the target,
     * the Region might be reduced to fit within the space.
     */
    alignTo: function (options) {
        var me = this,
            Region = me.self,
            Offset = ExtUtil.Offset,
            target = parseRegion(options.target),
            targetPlusAnchorOffset,
            rtl = options.rtl,
            overlap = options.overlap,
            align = options.align,
            anchorSize = options.anchorSize,
            offset = options.offset,
            inside = options.inside,
            position = options.position,
            allowXTranslate = options.allowXTranslate,
            allowYTranslate = options.allowYTranslate,
            wasConstrained,
            result;

        if (offset) {
            offset = Offset.fromObject(offset);
            //<debug>
            if (!(offset instanceof Offset)) {
                Ext.raise('offset option must be an Ext.util.Offset');
            }
            //</debug>
        }
        if (anchorSize) {
            anchorSize = Offset.fromObject(anchorSize);
            //<debug>
            if (!(anchorSize instanceof Offset)) {
                Ext.raise('anchorSize option must be an Ext.util.Offset');
            }
            //</debug>
        }

        // Position the region using an exact position.
        // Our purpose is then to constrain within the inside
        // Region, while probably not occluding the target.
        if (position) {
            if (position.length === 2) {
                position = new ExtUtil.Point(position[0], position[1]);
            }

            // Calculate the unconstrained position.
            result = new Region().copyFrom(me).setPosition(position.x, position.y);
        } else {
            // Convert string align spec to informational object
            align = me.getAlignInfo(align, rtl);

            // target is out of bounds.
            // Move it so that it's 1px inside to that the alignment points
            if (inside) {
                if (target.x >= inside.right) {
                    target.setPosition(inside.right - 1, target.y);
                    if (align.position !== 3) {
                        align = me.getAlignInfo('r-l', rtl);
                    }
                }
                else if (target.right < inside.x) {
                    target.setPosition(inside.x - target.getWidth() + 1, target.y);
                    if (align.position !== 1) {
                        align = me.getAlignInfo('l-r', rtl);
                    }
                }
                if (target.y >= inside.bottom) {
                    target.setPosition(target.x, inside.bottom - 1);
                    if (align.position !== 0) {
                        align = me.getAlignInfo('b-t', rtl);
                    }
                }
                else if (target.bottom < inside.y) {
                    target.setPosition(target.x, inside.y - target.getHeight() + 1);
                    if (align.position !== 2) {
                        align = me.getAlignInfo('t-b', rtl);
                    }
                }
            }

            // Adjust the adjacent edge to account for the anchor height.
            targetPlusAnchorOffset = anchorSize ? addAnchorOffset(target, anchorSize, align.position) : target;

            // Start with requested position.
            result = Region.from(me).translateBy(me.getAlignToVector(targetPlusAnchorOffset, align));

            // If they ASKED for it to intersect (eg: c-c, tl-c). we must honour that, and not exclude it.
            overlap = !!result.intersect(targetPlusAnchorOffset);
            if (offset && (overlap || !anchorSize)) {
                result.translateBy(offset);
            }

            // Calculate the anchor position.
            // This also forces the adjacent edges to overlap enough to create space for the anchor arrow.
            if (anchorSize) {
                calculateAnchorPosition(target, result, align.position, anchorSize, inside);
            }
        }

        // If we are constraining Region...
        if (inside) {
            // Constrain to within left boundary
            if (result.left < inside.left) {
                result.translateBy(inside.left - result.left, 0);
                wasConstrained = true;
            }
            // If it overflows right, and there is space to move it left, then do so.
            if (result.right > inside.right && result.left > inside.left) {
                result.translateBy(inside.right - result.right, 0);
                wasConstrained = true;
            }

            // Constrain to within top boundary
            if (result.top < inside.top) {
                result.translateBy(0, inside.top - result.top);
                wasConstrained = true;
            }
            // If it overflows bottom, and there is space to move it up, then do so.
            if (result.bottom > inside.bottom && result.top > inside.top) {
                result.translateBy(0, inside.bottom - result.bottom);
                wasConstrained = true;
            }

            // If we've budged the result to within the constrain bounds,
            // ensure the result region does not overlay the target
            if (wasConstrained && !overlap) {
                // Recalculate it. We must return null if anchoring is not possible.
                result.anchor = null;

                // axisLock means that only flipping in the align axis is allowed, not fallback
                // to all other sides.
                //
                // That is, if align is l-r, and the result won't fit, it only
                // falls back to r-l.
                //
                // This will be used for BoundLists which must only flip from t0-b0 to b0-t0
                if (options.axisLock) {
                    if (align.position & 1) {
                        allowYTranslate = false;
                    } else {
                        allowXTranslate = false;
                    }
                }

                // If using an [X,Y] position, then only total occlusion causes exclusion
                if (position) {
                    if (result.contains(position)) {
                        position.exclude(result, {
                            inside: inside,
                            centerOnSideChange: false
                        });
                    }
                }

                // If edge aligning, we must completely exclude the region
                else {
                    if (result.intersect(targetPlusAnchorOffset)) {
                        // This will also exclude any additional anchor even if the region itself
                        // does not intersect.
                        align.position = target.exclude(result, {
                            defaultPosition: align.position,
                            inside: inside,
                            minHeight: options.minHeight,
                            minWidth: options.minWidth,
                            allowX: allowXTranslate,
                            allowY: allowYTranslate,
                            offset: offset,
                            anchorHeight: anchorSize ? anchorSize.y : 0,
                            centerOnSideChange: !!anchorSize
                        });
                    } else if (options.minWidth && result.getWidth() > inside.getWidth()) {
                        result.setPosition(0, result.y);
                        result.setWidth(Math.max(inside.getWidth(), options.minWidth));
                        result.constrainWidth = true;
                    } else if (options.minHeight && result.getHeight() > inside.getHeight()) {
                        result.setPosition(result.x, 0);
                        result.setHeight(Math.max(inside.getHeight(), options.minHeight));
                        result.constrainHeight = true;
                    }
                    result.align = align;

                    // Calculate the anchor position.
                    // This also forces the adjacent edges to overlap enough to create space for the anchor arrow.
                    if (anchorSize) {
                        calculateAnchorPosition(target, result, align.position, anchorSize, inside);
                    }
                }
            }
        }

        return result;
    },

    /**
     * This method pushes the "other" Region out of this region via the shortest
     * translation. If an "inside" Region is passed, the exclusion also honours
     * that constraint.
     * @param {Region} other The Region to move so that it does not intersect this Region.
     * @param {Region} inside A Region into which the other Region must be constrained.
     * @param {Number} [minHeight] If passed, indicates that the height may be reduced up
     * to a point to fit the "other" region below or above the target but within the "inside" Region.
     * @param {Boolean} [allowX=true] Pass `false` to disallow translation along the X axis.
     * @param {Boolean} [allowY=true] Pass `false` to disallow translation along the Y axis.
     * @return {Number} The edge it is now aligned to, 0=top, 1=right, 2=bottom, 3=left.
     */
    exclude: function(other, options) {
        options = options || {};

        var me = this,
            inside = options.inside,
            defaultPosition = options.defaultPosition,
            centerOnSideChange = options.centerOnSideChange,
            minHeight = options.minHeight,
            minWidth = options.minWidth,
            allowX = options.allowX !== false,
            allowY = options.allowY !== false,
            anchorHeight = options.anchorHeight,
            offset = options.offset,
            translations = [],
            testRegion, t, i, sizeConstrainedSolution, leastBadSolution, intersection,
            result;

        // Create adjustments for each dimension so we can also exclude any anchor
        if (!offset) {
            offset = zeroOffset;
        }

        if (allowY) {
            translations.push([0, t = me.top - other.bottom - anchorHeight + offset.y, 'b-t', 0, Math.abs(t)]);
            translations.push([0, t = me.bottom - other.top + anchorHeight + offset.y, 't-b', 2, Math.abs(t)]);
        } else {
            centerOnSideChange = false;
        }
        if (allowX) {
            translations.push([t = me.left - other.right - anchorHeight + offset.x, 0, 'r-l', 3, Math.abs(t)]);
            translations.push([t = me.right - other.left + anchorHeight + offset.x, 0, 'l-r', 1, Math.abs(t)]);
        } else {
            centerOnSideChange = false;
        }

        // Sort the exclusion vectors into order, shortest first
        Ext.Array.sort(translations, function(l, r) {
            var result = l[4] - r[4];

            // If equidistant, prefer the translation which moves to the defaultPosition
            if (!result) {
                if (l[3] === defaultPosition) {
                    return -1;
                }
                if (r[3] === defaultPosition) {
                    return 1;
                }
            }
            return result;
        });

        // We might have to fall back through the choices of direction
        // until we find one which doesn't violate the constraints.
        if (inside) {
            for (i = 0; i < translations.length; i++) {
                t = translations[i];

                testRegion = ExtUtil.Region.from(other);
                testRegion.translateBy.apply(testRegion, t);

                // When we find a translation that satisfies the constraint, we're done
                if (inside.contains(testRegion)) {
                    other.copyFrom(testRegion);
                    result = {
                        align: t[2],
                        position: t[3],
                        distance: t[4]
                    };
                    break;
                }

                // If we are directly above or below and we are allowed to shrink the
                // height, and it's too high, then calculate a height constrained solution
                // to which we can fall back if no translations are fully successful.
                if (minHeight) {
                    checkMinHeight(minHeight, testRegion, me, inside);
                    if (inside.contains(testRegion)) {
                        if (!sizeConstrainedSolution || testRegion.getArea() > sizeConstrainedSolution.region.getArea()) {
                            sizeConstrainedSolution = {
                                region: testRegion,
                                align: t[2],
                                position: t[3],
                                distance: t[4]
                            };
                        }
                    }
                }
                if (minWidth) {
                    checkMinWidth(minWidth, testRegion, me, inside);
                    if (inside.contains(testRegion)) {
                        if (!sizeConstrainedSolution || testRegion.getArea() > sizeConstrainedSolution.region.getArea()) {
                            sizeConstrainedSolution = {
                                region: testRegion,
                                align: t[2],
                                position: t[3],
                                distance: t[4]
                            };
                        }
                    }
                }

                // If all else fails, keep track of the translation which yields the largest intersection
                // with the "inside" region. If there's no translation which satisfies the constraint, 
                // use this least bad one.
                intersection = inside.intersect(testRegion);
                if (intersection) {
                    intersection = intersection.getArea();
                    if (!leastBadSolution || (intersection && leastBadSolution.area < intersection)) {
                        leastBadSolution = {
                            region: testRegion,
                            align: t[2],
                            position: t[3],
                            distance: t[4],
                            area: intersection
                        };
                    }
                }
            }

            if (!result) {
                // Only constrain height if other translations fail.
                if (sizeConstrainedSolution) {
                    other.copyFrom(sizeConstrainedSolution.region);
                    result = sizeConstrainedSolution;
                    other.constrainWidth = sizeConstrainedSolution.region.constrainWidth;
                    other.constrainHeight = sizeConstrainedSolution.region.constrainHeight;
                }
                // Only use the least bad failed solution as a last resort.
                else if (leastBadSolution) {
                    other.copyFrom(leastBadSolution.region);
                    result = leastBadSolution;
                }
            }
            if (result) {
                // The exclude switched align axis (t/b to l/r), flip it to a center align on
                // the new side.
                if ((result.position & 1) !== (defaultPosition & 1)) {
                    if (result.distance && centerOnSideChange) {
                        t = other.alignTo({
                            align: result.align,
                            target: me,
                            anchorSize: anchorHeight,
                            offset: offset,
                            axisLock: true,
                            inside: inside,
                            minHeight: options.minHeight,
                            minWidth: options.minWidth
                        });
                        if (inside.contains(t)) {
                            other.setPosition(t.x, t.y);
                        }
                    }
                }
                return result.position;
            }
        }
        // No external constraint
        else {
            // Move by the shortest path
            other.translateBy.apply(other, translations[0]);
            return translations[0][3];
        }
        return defaultPosition;
    },

    getAlignToXY: function(target, align, rtl) {
        var alignVector = this.getAlignToVector(target, align, rtl);

        return [
            this.x + alignVector[0],
            this.y + alignVector[1]
        ];
    },

    getAnchorPoint: function(align, rtl) {
        align = (typeof align === 'string') ? this.getAlignInfo(align + '-tl', rtl) : align;

        return this['getAnchorPoint_' + align.myEdge](align.myOffset);
    },

    getAlignToVector: function(target, align, rtl) {
        align = (typeof align === 'string') ? this.getAlignInfo(align, rtl) : align;

        var myAnchorPoint = this['getAnchorPoint_' + align.myEdge](align.myOffset),
            targetAnchorPoint = target['getAnchorPoint_' + align.otherEdge](align.otherOffset);

        return [
            targetAnchorPoint[0] - myAnchorPoint[0],
            targetAnchorPoint[1] - myAnchorPoint[1]
        ];
    },

    getAnchorPoint_t: function(offset) {
        return [this.x + Math.round(this.getWidth() * (offset / 100)), this.y];
    },
    getAnchorPoint_b: function(offset) {
        return [this.x + Math.round(this.getWidth() * (offset / 100)), this.bottom];
    },
    getAnchorPoint_l: function(offset) {
        return [this.x, this.y + Math.round(this.getHeight() * (offset / 100))];
    },
    getAnchorPoint_r: function(offset) {
        return [this.right, this.y + Math.round(this.getHeight() * (offset / 100))];
    },
    getAnchorPoint_c: function() {
        return [this.x + Math.round(this.getWidth() / 2), this.y + Math.round(this.getHeight() / 2)];
    },

    getHeight: function () {
        return this.bottom - this.y;
    },

    getWidth: function () {
        return this.right - this.x;
    },

    getArea: function() {
        return this.getHeight() * this.getWidth();
    },

    setHeight: function(h) {
        this.bottom = this.top + h;
        return this;
    },

    setWidth: function(w) {
        this.right = this.left + w;
        return this;
    },

    /**
     * Get the width / height of this region
     * @return {Object} an object with width and height properties
     * @private
     */
    getSize: function() {
        return {
            width: this.right - this.x,
            height: this.bottom - this.y
        };
    },

    /**
     * Create a copy of this Region.
     * @return {Ext.util.Region}
     */
    copy: function() {
        return new this.self(this.y, this.right, this.bottom, this.x);
    },

    /**
     * Copy the values of another Region to this Region
     * @param {Ext.util.Region} p The region to copy from.
     * @return {Ext.util.Region} This Region
     */
    copyFrom: function(p) {
        var me = this;
        me.top = me.y = me[1] = p.y;
        me.right = p.right;
        me.bottom = p.bottom;
        me.left = me.x = me[0] = p.x;

        return this;
    },

    /*
     * Dump this to an eye-friendly string, great for debugging
     * @return {String}
     */
    toString: function() {
        return "Region[" + this.top + "," + this.right + "," + this.bottom + "," + this.left + "]";
    },

    /**
     * Translate this Region by the given offset amount
     * @param {Ext.util.Offset/Object} x Object containing the `x` and `y` properties.
     * Or the x value is using the two argument form.
     * @param {Number} y The y value unless using an Offset object.
     * @return {Ext.util.Region} this This Region
     */
    translateBy: function(x, y) {
        if (x.length) {
            y = x[1];
            x = x[0];
        }
        else if (arguments.length === 1) {
            y = x.y;
            x = x.x;
        }
        var me = this;
        me.top = me.y += y;
        me.right += x;
        me.bottom += y;
        me.left = me.x += x;

        return me;
    },

    /**
     * Round all the properties of this region
     * @return {Ext.util.Region} this This Region
     */
    round: function() {
        var me = this;
        me.top = me.y = Math.round(me.y);
        me.right = Math.round(me.right);
        me.bottom = Math.round(me.bottom);
        me.left = me.x = Math.round(me.x);

        return me;
    },

    /**
     * Check whether this region is equivalent to the given region
     * @param {Ext.util.Region} region The region to compare with
     * @return {Boolean}
     */
    equals: function(region) {
        return (this.top === region.top && this.right === region.right && this.bottom === region.bottom && this.left === region.left);
    },

    /**
     * Returns the offsets of this region from the passed region or point.
     * @param {Ext.util.Region/Ext.util.Point} offsetsTo The region or point to get get
     * the offsets from.
     * @return {Object} The XY page offsets
     * @return {Number} return.x The x offset
     * @return {Number} return.y The y offset
     */
    getOffsetsTo: function(offsetsTo) {
        return {
            x: this.x - offsetsTo.x,
            y: this.y - offsetsTo.y
        };
    }
};
},
function (Region) {
    Region.prototype.getAlignInfo = Region.getAlignInfo;
    Region.EMPTY = new Region(0,0,0,0);

    //<debug>
    if (Object.freeze) {
        Object.freeze(Region.EMPTY);
    }
    //</debug>
});
