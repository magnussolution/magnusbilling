Ext.define('Overrides.form.field.VTypes', {
    override: 'Ext.form.field.VTypes',
    comparePasswordText: t('Passwords not match'),
    comparePassword: function (value, field) {
        var password = field.up('form').down('field[password=true]').getValue();
        return (value === password);
    },
    // custom Vtype for vtype:'IPAddress'
    numberfield: function (v) {
        return /^\d{6}$/.test(v);
    },
    // custom Vtype for vtype:'IPAddress'
    IPAddress: function (v) {
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
    },
    IPAddressText: 'Must be a numeric IP address',
    IPAddressMask: /[\d\.]/i,

    IPOrCIDR: function (v) {
        // Matches plain IP
        var ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

        // Matches IP/CIDR, like 192.168.1.0/24
        var cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;

        if (ipRegex.test(v)) {
            return true;
        }

        if (cidrRegex.test(v)) {
            // Additionally validate that each octet is <= 255
            var ipPart = v.split('/')[0];
            var parts = ipPart.split('.');
            return parts.every(function (part) {
                var num = parseInt(part, 10);
                return num >= 0 && num <= 255;
            });
        }

        return false;
    },
    IPOrCIDRText: 'Must be a valid IP address or IP/mask in CIDR format (e.g., 192.168.0.1 or 192.168.0.0/24)'

});