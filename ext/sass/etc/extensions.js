exports.init = function (runtime) {
    runtime.register({
        file_join: function (value1, value2) {
            value1 = this.unbox(value1);
            value2 = this.unbox(value2);
            if (value1 && /\/$/.test(value1)) {
                value1 = value1.substring(0, value1.length - 1);
            }
            
            if (value2 && /^\//.test(value2)) {
                value2 = value2.substring(1);
            }
            
            var joined = value1 ? value1 + '/' + value2 : value2;
            return new Fashion.Text(joined, '');
        }
    });
};