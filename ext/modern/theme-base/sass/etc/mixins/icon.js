exports.init = function(runtime) {
    runtime.register({
        // This function parses arguments from all formats accepted by the icon()
        // sass mixin and returns an array that always contains 3 elements in the following
        // order: character, font-family, rotation
        parseIconArgs: function(glyph) {
            var newItems = [null, null, null],
                items, item, len;

            if (glyph.$isFashionList) {
                items = glyph.items;
                len = items.length;

                newItems[0] = items[0];

                if (len === 2) {
                    item = items[1];

                    if (item.$isFashionNumber) {
                        newItems[2] = item;
                    } else {
                        newItems[1] = item;
                    }
                } else if (len > 2) {
                    newItems[1] = items[1];
                    newItems[2] = items[2];
                }
            } else {
                newItems[0] = glyph;
            }

            return new Fashion.List(newItems);
        }
    });
};