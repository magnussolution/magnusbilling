const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(protocol = 'https:', hostname = 'sip.example.com') {
    let controller, request, socket;
    const alerts = [];
    const popup = { document: { body: {} }, closed: false, close() { this.closed = true; }, location: { replace(url) { popup.url = url; } } };
    const window = { location: { protocol, hostname, origin: protocol + '//' + hostname, href: protocol + '//' + hostname + '/painel/' }, open() { return popup; }, addEventListener() {}, removeEventListener() {} };
    const context = { App: { lang: 'en' }, window, URL, t: s => s, setTimeout: () => 1, clearTimeout() {}, WebSocket: class { constructor(url, subprotocol) { this.url = url; this.subprotocol = subprotocol; socket = this; } close() {} }, Ext: { define(name, value) { controller = value; }, Msg: { alert(title, message) { alerts.push(message); } }, decode: s => { try { return JSON.parse(s); } catch (_) { return null; } }, Ajax: { request(value) { request = value; } } } };
    vm.runInNewContext(fs.readFileSync(__dirname + '/../../classic/src/view/sip/Controller.js', 'utf8'), context);
    controller.list = { getSelectionModel: () => ({ getSelection: () => [{ get: key => ({ webrtc: 'yes', name: 'test' })[key] }] }) };
    return { run: () => controller.onWebphone(), request: () => request, socket: () => socket, alerts, popup };
}
test('blocks HTTP, IPv4, IPv6 and localhost before querying Asterisk', () => {
    for (const [protocol, host] of [['http:', 'sip.example.com'], ['https:', '206.189.178.48'], ['https:', '[::1]'], ['https:', 'localhost']]) {
        const p = setup(protocol, host); p.run(); assert.equal(p.alerts.length, 1); assert.equal(p.request(), undefined);
    }
});
test('does not open phone when Asterisk modules are missing', () => {
    const p = setup(); p.run(); p.request().success({ responseText: JSON.stringify({ success: false, reason: 'modules', message: 'Enable the HTTP WebSocket and PJSIP WebSocket modules in Asterisk.' }) });
    assert.equal(p.popup.closed, true); assert.match(p.alerts[0], /modules/); assert.equal(p.socket(), undefined);
});
test('requires successful WSS probe before navigating to phone', () => {
    const p = setup(); p.run(); p.request().success({ responseText: '{"success":true}' });
    assert.equal(p.socket().url, 'wss://sip.example.com:8089/ws'); assert.equal(p.popup.url, undefined);
    p.socket().onopen(); assert.equal(p.popup.url, 'https://sip.example.com/painel/index.php/webphone');
});
test('closes reserved window on WSS failure', () => {
    const p = setup(); p.run(); p.request().success({ responseText: '{"success":true}' }); p.socket().onerror();
    assert.equal(p.popup.closed, true); assert.match(p.alerts[0], /certificate/);
});
