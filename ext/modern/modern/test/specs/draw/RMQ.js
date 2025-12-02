//describe('Ext.draw.RMQ', function() {
//    var seed = 1.24;
//    var random = function() {
//        seed *= 29;
//        seed = seed - Math.floor(seed);
//        return seed;
//    };
//
//    var data = new Float32Array(100000), i, cross = 100;
//    data[0] = 0;
//    for (i = 1; i < data.length; i++) {
//        data[i] = data[i - 1] + Math.floor(random() * 2) * 2 - 1;
//    }
//    function rmqOracle(a, b) {
//        var min = Math.min(a, b);
//        for (var i = Math.min(a, b); i <= Math.max(a, b); i++) {
//            if (data[i] < data[min]) {
//                min = i;
//            }
//        }
//        return min;
//    }
//
//    var oracle = [], as = [], bs = [];
//    as[0] = 0;
//    bs[0] = data.length - 1;
//    oracle[0] = 0;
//    for (i = 1; i < data.length; i++) {
//        if (data[i] < data[oracle[0]]) {
//            oracle[0] = i;
//        }
//    }
//    for (i = 1; i < cross; i++) {
//        as[i] = Math.floor(random() * data.length);
//        bs[i] = Math.floor(random() * data.length);
//        oracle[i] = rmqOracle(as[i], bs[i]);
//    }
//
//    it('CartesianTree', function() {
//        Ext.create("Ext.draw.RMQ", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
//        var data0 = new Float32Array(data);
//        new Ext.draw.CartesianTree(data0);
//    });
//
//    it('RMQ Sparse Tree', function() {
//        var data0 = new Float32Array(data);
//        var rmq = new Ext.draw.RMQSparse(data0);
//        for (var i = 0; i < cross; i++) {
//            var min = i;
//            for (var j = i; j < cross; j++) {
//                if (data0[min] > data0[j]) {
//                    min = j;
//                }
//                expect(rmq.queryIndex(i, j)).toEqual(min);
//            }
//        }
//    });
//
//    it('RMQ SegTree', function() {
//        var data0 = new Float32Array(data);
//        var rmq = new Ext.draw.RMQSegTree(data0);
//        for (var i = 0; i < cross; i++) {
//            var min = i;
//            for (var j = i; j < cross; j++) {
//                if (data0[min] > data0[j]) {
//                    min = j;
//                }
//                expect(rmq.queryIndex(i, j).min).toEqual(min);
//            }
//        }
//    });
//
//    it('RMQ +-1', function() {
//        var data0 = new Float32Array(data);
//        var rmq = new Ext.draw.RMQPM(data0);
//        for (var i = 0; i < cross; i++) {
//            var min = i;
//            for (var j = i; j < cross; j++) {
//                if (data0[min] > data0[j]) {
//                    min = j;
//                }
//                expect(rmq.queryIndex(i, j)).toEqual(min);
//            }
//        }
//    });
//
//    it('RMQ Linear', function() {
//        var data0 = new Float32Array(data);
//        var rmq = new Ext.draw.RMQLinear(data0);
//        for (var i = 0; i < cross; i++) {
//            var min = i;
//            for (var j = i; j < cross; j++) {
//                if (data0[min] > data0[j]) {
//                    min = j;
//                }
//                if (rmq.queryIndex(i, j).min != min) {
//                    expect(rmq.queryIndex(i, j).min).toEqual(min);
//                }
//            }
//        }
//    });
//});
