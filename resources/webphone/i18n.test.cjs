const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(saved, browserLanguage = 'en', blocked = false) {
    const events = {};
    let preference = saved;
    const label = { getAttribute: () => 'Conectar', textContent: '' };
    const document = { documentElement: {}, querySelectorAll: selector => selector === '[data-i18n]' ? [label] : [] };
    const window = { localStorage: { getItem() { if (blocked) throw Error('unavailable'); return preference; } }, addEventListener(name, cb) { events[name] = cb; }, dispatchEvent(event) { if (events[event.type]) events[event.type](event); } };
    vm.runInNewContext(fs.readFileSync(__dirname + '/i18n.js', 'utf8'), { window, document, navigator: { language: browserLanguage }, Event: class { constructor(type) { this.type = type; } } });
    return { t: window.PhoneI18n.t, label, document, change(lang) { preference = lang; events.storage({ key: 'lang' }); } };
}
test('uses all eight MagnusBilling language preferences instead of browser language', () => {
    for (const [language, button] of Object.entries({ pt_BR: 'Conectar', en: 'Connect', es: 'Conectar', fr: 'Connecter', de: 'Verbinden', it: 'Connetti', pl: 'Połącz', ru: 'Подключиться' })) {
        const p = setup(language, 'ja');
        assert.equal(p.label.textContent, button);
        assert.equal(p.t('Connect'), button);
        assert.equal(p.t('Use HTTPS and enable WebRTC on the SIP account. Keep this page open to receive calls.'), p.t('Use HTTPS e habilite WebRTC na conta SIP. Mantenha esta página aberta para receber chamadas.'));
        assert.equal(p.document.documentElement.lang, language.replace('_', '-'));
    }
});
test('language changes update controls and preserve caller and duration data', () => {
    const p = setup('pt_BR'); p.change('en');
    assert.equal(p.label.textContent, 'Connect');
    assert.equal(p.t('Chamada recebida: 1001'), 'Incoming call: 1001');
    assert.equal(p.t('Em chamada · 2:05'), 'In call · 2:05');
    p.change('es'); assert.equal(p.t('Desconectado'), 'Desconectado');
});
test('handles region variants, unsupported languages and blocked storage', () => {
    assert.equal(setup('pt-BR').document.documentElement.lang, 'pt-BR');
    assert.equal(setup('en-US').label.textContent, 'Connect');
    assert.equal(setup('unknown').label.textContent, 'Connect');
    assert.equal(setup(null, 'fr-FR', true).label.textContent, 'Connecter');
});
