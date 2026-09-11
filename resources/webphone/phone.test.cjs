const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { EventEmitter } = require('node:events');
function setup(options = {}) {
    const elements = new Map();
    function element(id) {
        if (!elements.has(id)) elements.set(id, { value: '', hidden: false, checked: false, children: [], addEventListener(name, cb) { this[name] = cb; }, setAttribute() {}, appendChild(child) { this.children.push(child); }, pause() {}, play() { return Promise.resolve(); }, click() { this.onclick(); } });
        return elements.get(id);
    }
    let current;
    class UA extends EventEmitter {
        constructor(config) { super(); this.config = config; this.registered = false; current = this; }
        start() {}
        stop() { this.stopped = true; }
        isRegistered() { return this.registered; }
        call(target, options) { this.target = target; this.options = options; }
    }
    const listeners = {};
    const opener = options.direct ? null : { postMessage() {} };
    const storage = new Map(options.saved ? [['mbilling.webphone.credentials', options.saved]] : []);
    const window = { PhoneI18n: { t: value => value }, localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }, isSecureContext: true, RTCPeerConnection: function () {}, opener, location: { origin: 'https://billing.test', hostname: 'billing.test' }, addEventListener(name, cb) { listeners[name] = cb; }, removeEventListener(name) { delete listeners[name]; } };
    const context = { window, navigator: { mediaDevices: {} }, document: { getElementById: element, createElement: () => ({ setAttribute() {} }) }, JsSIP: { UA, WebSocketInterface: function () {}, URI: { parse(value) { return /^sip:[^@]+@[^\s]+$/.test(value) ? { user: value.slice(4).split('@')[0], host: value.split('@')[1], scheme: 'sip', toString: () => value } : null; } } }, URL, MediaStream: class {}, setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, Date };
    vm.runInNewContext(fs.readFileSync(__dirname + '/phone.js', 'utf8'), context);
    element('server').value = 'wss://pbx.test/ws'; element('authUser').value = '1001'; element('password').value = 'secret';
    const connect = () => element('connectForm').submit({ preventDefault() {} });
    return { element, connect, current: () => current, listeners, opener, storage };
}
function session() {
    const value = new EventEmitter();
    Object.assign(value, { direction: 'incoming', remote_identity: { uri: { user: 'caller' } }, isEstablished: () => false, isInProgress: () => true, isMuted: () => ({ audio: false }), isOnHold: () => ({ local: false }), terminate(options) { this.terminated = options || true; this.emit('ended'); }, sendDTMF(digit, options) { this.dtmf = { digit, options }; } });
    return value;
}
test('rejects insecure SIP transport and relay without TURN', () => {
    const p = setup(); p.element('server').value = 'ws://pbx.test/ws'; p.connect(); assert.equal(p.current(), undefined);
    p.element('server').value = 'wss://pbx.test/ws'; p.element('relay').checked = true; p.connect(); assert.equal(p.current(), undefined);
});
test('registration enables dialing and disconnect clears passwords', () => {
    const p = setup(); p.connect(); const ua = p.current(); assert.equal(p.element('call').disabled, true);
    ua.registered = true; ua.emit('registered'); assert.equal(p.element('call').disabled, false); assert.equal(p.element('settings').hidden, true); assert.equal(p.element('connect').hidden, true); assert.equal(p.element('disconnect').disabled, false);
    p.element('destination').value = '123#'; p.element('call').click(); assert.equal(ua.target, 'sip:123%23@billing.test');
    p.element('disconnect').click(); assert.equal(ua.stopped, true); assert.equal(p.element('settings').hidden, false); assert.equal(p.element('connect').hidden, false); assert.equal(p.element('password').value, ''); assert.equal(p.element('call').disabled, true);
    ua.emit('registered'); assert.equal(p.element('status').textContent, 'Desconectado');
});
test('rejects a second call, sends RTP DTMF, and cleans up ended calls', () => {
    const p = setup(); p.connect(); const ua = p.current(), first = session(), second = session();
    ua.emit('newRTCSession', { session: first }); assert.equal(p.element('answer').hidden, false);
    ua.emit('newRTCSession', { session: second }); assert.equal(second.terminated.status_code, 486);
    first.isEstablished = () => true; first.emit('confirmed');
    p.element('keypad').children[0].onclick(); assert.equal(first.dtmf.digit, '1'); assert.equal(first.dtmf.options.transportType, 'RFC2833');
    first.emit('ended'); assert.equal(p.element('hangup').disabled, true); assert.equal(p.element('answer').hidden, true);
});
test('account handoff accepts only the opener on the same origin', () => {
    const p = setup(); const receive = p.listeners.message;
    receive({ origin: 'https://evil.test', source: p.opener, data: { type: 'mbilling-webphone-account', password: 'bad' } }); assert.equal(p.element('password').value, 'secret');
    receive({ origin: 'https://billing.test', source: {}, data: { type: 'mbilling-webphone-account', password: 'bad' } }); assert.equal(p.element('password').value, 'secret');
    receive({ origin: 'https://billing.test', source: p.opener, data: { type: 'mbilling-webphone-account', uri: 'sip:2@pbx.test', password: 'good' } }); assert.equal(p.element('password').value, 'good'); assert.equal(p.element('authUser').value, '2'); assert.equal(p.listeners.message, undefined);
});

test('successful login persists credentials and a fresh page logs in automatically', () => {
    const p = setup(); p.connect(); p.current().registered = true; p.current().emit('registered');
    const saved = p.storage.get('mbilling.webphone.credentials');
    assert.deepEqual(JSON.parse(saved), { username: '1001', password: 'secret' });
    p.element('disconnect').click(); assert.equal(p.storage.get('mbilling.webphone.credentials'), saved);
    const reloaded = setup({ direct: true, saved });
    assert.equal(reloaded.current().config.uri, 'sip:1001@billing.test');
    assert.equal(reloaded.current().config.password, 'secret');
});
test('invalid saved data does not connect and rejected login allows correction', () => {
    assert.equal(setup({ direct: true, saved: '{broken' }).current(), undefined);
    assert.equal(setup({ direct: true, saved: '{"username":"1001"}' }).current(), undefined);
    const p = setup(); p.connect(); p.current().emit('registrationFailed', { cause: 'Rejected' });
    assert.equal(p.element('settings').disabled, false);
    assert.equal(p.element('connect').disabled, false);
    assert.equal(p.storage.size, 0);
});
