describe('Modern Ext.draw.Matrix', function () {
    it('Matrix creation', function () {
        var matrix = Ext.create("Ext.draw.Matrix", 1, 2, 3, 4, 5, 6);
        expect(matrix.getXX()).toEqual(1);
        expect(matrix.getXY()).toEqual(2);
        expect(matrix.getYX()).toEqual(3);
        expect(matrix.getYY()).toEqual(4);
        expect(matrix.getDX()).toEqual(5);
        expect(matrix.getDY()).toEqual(6);
        expect(matrix.clone().elements).toEqual(matrix.elements);
    });
    it('Matrix inverse', function () {
        var matrix = Ext.create("Ext.draw.Matrix", 1, 2, 3, 4, 5, 6);
        expect(matrix.inverse().elements).toEqual([-2, 1, 1.5, -0.5, 1, -2]);
        expect(matrix.inverse().inverse().equals(matrix)).toBeTruthy();
        expect(matrix.inverse().appendMatrix(matrix).elements).toEqual([1, 0, 0, 1, 0, 0]);
        expect(matrix.clone().appendMatrix(matrix.inverse()).elements).toEqual([1, 0, 0, 1, 0, 0]);
        expect(matrix.inverse().prependMatrix(matrix.clone()).elements).toEqual([1, 0, 0, 1, 0, 0]);
        expect(matrix.clone().prependMatrix(matrix.inverse()).elements).toEqual([1, 0, 0, 1, 0, 0]);
    });
});
