exports.init = function(runtime) {
    runtime.register({
        // This function parses arguments from all formats accepted by the font-icon()
        // sass mixin and returns an array that always contains 4 elements in the following
        // order: character, font-size, font-family, rotation
        pxToEmHelper: function pxToEmHelper(value, divisor, unit) {
            var multiplier, items, newItems, i, ln;

            if (divisor && divisor.unit && divisor.unit !== 'px') {
                Fashion.warn('Invalid unit for px-to-em: ' + divisor.unit);
            } else if (!divisor || !divisor.value) {
                Fashion.warn('Divisor for px-to-em is required');
            }

            if (value.$isFashionList) {
                items = value.items;
                newItems = [];

                for (i = 0, ln = items.length; i < ln; i++) {
                    newItems.push(pxToEmHelper(items[i], divisor, unit));
                }

                value = new Fashion.List(newItems);
            } else if (value.$isFashionNumber) {
                divisor = Fashion.Numeric.unbox(divisor);
                unit = Fashion.Numeric.unbox(unit);
                multiplier = 100000;

                value = Fashion.Numeric.unbox(value);
                divisor = Fashion.Numeric.unbox(divisor);

                // Chrome tends to size things down to even numbers, so here we round up.
                value = new Fashion.Numeric(Math.ceil(value / divisor * multiplier) / multiplier, unit);
            }

            return value;
        },
        pxToRootPct: function(value, browserFontSize) {
            browserFontSize  = browserFontSize && browserFontSize.value || 16;
            value = Fashion.Numeric.unbox(value);

            return new Fashion.Numeric((value / browserFontSize) * 100, '%');
        }
    });
};
