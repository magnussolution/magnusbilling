/* MagnusBilling Webphone. SIP signaling: JsSIP (MIT). */
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const t = message => window.PhoneI18n.t(message);
    let statusMessage = 'Desconectado', callMessage = 'Nenhuma chamada';
    let ua = null, session = null, pcConfig = null, domain = '', timer = null;
    let audioContext = null, ringTimer = null;
    const audio = $('remoteAudio');
    const storageKey = 'mbilling.webphone.credentials';
    let restoreTimer = null;
    function restoreAccount() {
        if (ua) return;
        try {
            const saved = JSON.parse(window.localStorage.getItem(storageKey));
            if (!saved || typeof saved.username !== 'string' || typeof saved.password !== 'string' || !saved.username || !saved.password) return;
            $('authUser').value = saved.username;
            $('password').value = saved.password;
        } catch (_) { return; }
        connect();
    }
    // Derive signaling configuration from the HTTPS host; users enter only their SIP username.
    $('server').value = 'wss://' + window.location.hostname + ':8089/ws';
    const status = message => { statusMessage = message; $('status').textContent = t(message); };
    const callStatus = message => { callMessage = message; $('callStatus').textContent = t(message); };
    window.addEventListener('webphone-language', () => { status(statusMessage); callStatus(callMessage); });
    function render() {
        const active = !!session, established = active && session.isEstablished();
        const registered = !!ua && ua.isRegistered();
        $('dialer').hidden = !registered && !active;
        $('settings').hidden = registered;
        $('connect').hidden = registered;
        $('settings').disabled = !!ua;
        $('connect').disabled = !!ua;
        $('disconnect').disabled = !ua;
        $('call').disabled = active || !ua || !ua.isRegistered();
        $('answer').hidden = !active || session.direction !== 'incoming' || session.isEstablished() || session.isInProgress() === false;
        $('hangup').disabled = !active;
        $('mute').disabled = !established;
        $('hold').disabled = !established;
        $('mute').setAttribute('aria-pressed', String(!!(active && session.isMuted().audio)));
        $('hold').setAttribute('aria-pressed', String(!!(active && session.isOnHold().local)));
    }
    function unlockAudio() {
        try {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.resume().catch(() => {});
        } catch (_) { /* Incoming call is still announced visually. */ }
    }
    function beep() {
        if (!audioContext || audioContext.state !== 'running') return;
        const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
        oscillator.frequency.value = 440;
        gain.gain.value = 0.06;
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(); oscillator.stop(audioContext.currentTime + 0.25);
    }
    function stopRing() { clearInterval(ringTimer); ringTimer = null; }
    function playRemote() {
        if (!audio.srcObject) return;
        audio.play().then(() => { $('play').hidden = true; }).catch(() => { $('play').hidden = false; });
    }
    function attachConnection(connection) {
        const remote = new MediaStream();
        audio.srcObject = remote;
        function add(track) {
            if (track.kind === 'audio' && !remote.getTracks().includes(track)) remote.addTrack(track);
            playRemote();
        }
        connection.getReceivers().forEach(receiver => { if (receiver.track) add(receiver.track); });
        connection.addEventListener('track', event => add(event.track));
    }
    function cleanup(current, message) {
        if (session !== current) return;
        stopRing(); clearInterval(timer); timer = null;
        audio.pause(); audio.srcObject = null; $('play').hidden = true;
        session = null; callStatus(message); render();
    }
    function bindSession(current) {
        session = current;
        current.on('peerconnection', event => attachConnection(event.peerconnection));
        if (current.connection) attachConnection(current.connection);
        current.on('progress', () => callStatus(current.direction === 'incoming' ? 'Chamada recebida: ' + current.remote_identity.uri.user : 'Chamando…'));
        current.on('confirmed', () => {
            stopRing(); const started = Date.now();
            const tick = () => { const seconds = Math.floor((Date.now() - started) / 1000); callStatus('Em chamada · ' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')); };
            tick(); timer = setInterval(tick, 1000); render(); playRemote();
        });
        current.on('accepted', () => { stopRing(); $('answer').hidden = true; });
        current.on('ended', () => cleanup(current, 'Chamada encerrada'));
        current.on('failed', event => cleanup(current, 'Chamada não completada: ' + event.cause));
        current.on('getusermediafailed', () => callStatus('Não foi possível acessar o microfone. Verifique a permissão do navegador.'));
        ['muted', 'unmuted', 'hold', 'unhold'].forEach(event => current.on(event, render));
        if (current.direction === 'incoming') {
            callStatus('Chamada recebida: ' + current.remote_identity.uri.user);
            beep(); ringTimer = setInterval(beep, 1800);
        } else callStatus('Iniciando chamada…');
        render();
    }
    function options() { return { mediaConstraints: { audio: true, video: false }, pcConfig: pcConfig }; }
    function connect() {
        clearTimeout(restoreTimer);
        if (ua) return;
        if (!window.isSecureContext || !navigator.mediaDevices || !window.RTCPeerConnection) {
            status('Abra esta página por HTTPS em um navegador com WebRTC.'); return;
        }
        unlockAudio();
        try {
            const server = new URL($('server').value.trim());
            if (server.protocol !== 'wss:' || server.username || server.password) throw new Error('Informe um servidor wss:// válido, sem credenciais na URL.');
            const username = $('authUser').value.trim();
            if (!username || /[\s@]/.test(username)) throw new Error('Informe apenas o usuário SIP, sem domínio.');
            $('uri').value = 'sip:' + encodeURIComponent(username) + '@' + window.location.hostname;
            const uri = JsSIP.URI.parse($('uri').value);
            if (!uri || !uri.user || uri.scheme !== 'sip') throw new Error('Informe um endereço sip:usuario@dominio válido.');
            const iceServers = [];
            const stun = $('stun').value.trim(), turn = $('turn').value.trim();
            if (stun) {
                if (!/^stuns?:[^\s]+$/i.test(stun)) throw new Error('Servidor STUN inválido.');
                iceServers.push({ urls: stun });
            }
            if (turn) {
                if (!/^turns?:[^\s]+$/i.test(turn)) throw new Error('Servidor TURN inválido.');
                iceServers.push({ urls: turn, username: $('turnUser').value, credential: $('turnPassword').value });
            }
            if ($('relay').checked && !turn) throw new Error('Informe um servidor TURN para usar somente relay.');
            pcConfig = { iceServers: iceServers, iceTransportPolicy: $('relay').checked ? 'relay' : 'all' };
            domain = uri.host + (uri.port ? ':' + uri.port : '');
            if (!$('password').value) throw new Error('Informe a senha SIP.');
            const config = { sockets: [new JsSIP.WebSocketInterface(server.href)], uri: uri.toString(), password: $('password').value, session_timers: false };
            if ($('authUser').value.trim()) config.authorization_user = $('authUser').value.trim();
            const current = new JsSIP.UA(config);
            ua = current;
            const on = (name, callback) => current.on(name, event => { if (ua === current) callback(event); });
            on('connecting', () => status('Conectando…'));
            on('connected', () => status('Conectado. Registrando conta SIP…'));
            on('registered', () => {
                try { window.localStorage.setItem(storageKey, JSON.stringify({ username: username, password: config.password })); } catch (_) { /* Login also works when storage is unavailable. */ }
                status('Registrado · pronto para chamadas'); render();
            });
            on('unregistered', () => { status('Conta SIP sem registro'); render(); });
            on('registrationFailed', event => {
                ua = null; current.stop();
                status('Falha no registro: ' + event.cause); render();
            });
            on('disconnected', () => { status('Conexão perdida. Tentando reconectar…'); render(); });
            on('newRTCSession', event => {
                if (session) { event.session.terminate({ status_code: 486, reason_phrase: 'Busy Here' }); return; }
                bindSession(event.session);
            });
            current.start(); render();
        } catch (error) {
            if (ua) { ua.stop(); ua = null; }
            status(error.message); render();
        }
    }
    $('connectForm').addEventListener('submit', event => { event.preventDefault(); connect(); });
    $('disconnect').onclick = () => {
        clearTimeout(restoreTimer);
        const old = ua; ua = null;
        if (session) { const current = session; current.terminate(); cleanup(current, 'Chamada encerrada'); }
        if (old) old.stop();
        pcConfig = null; $('password').value = ''; $('turnPassword').value = '';
        status('Desconectado'); render();
    };
    $('call').onclick = () => {
        if (!ua || !ua.isRegistered() || session) return;
        unlockAudio();
        const target = $('destination').value.trim();
        if (!target) { callStatus('Digite o número de destino.'); return; }
        const destination = /^sip:/i.test(target) ? target : 'sip:' + encodeURIComponent(target) + '@' + domain;
        if (!JsSIP.URI.parse(destination)) { callStatus('Destino SIP inválido.'); return; }
        try { ua.call(destination, options()); } catch (_) { callStatus('Não foi possível iniciar a chamada. Verifique o destino e o microfone.'); }
    };
    $('answer').onclick = () => {
        if (!session) return;
        unlockAudio(); stopRing(); $('answer').hidden = true;
        try { session.answer(options()); } catch (_) { callStatus('Não foi possível atender a chamada.'); render(); }
    };
    $('hangup').onclick = () => { if (session) session.terminate(); };
    $('mute').onclick = () => { if (session && session.isEstablished()) { session.isMuted().audio ? session.unmute({ audio: true }) : session.mute({ audio: true }); render(); } };
    $('hold').onclick = () => {
        if (!session || !session.isEstablished()) return;
        const ok = session.isOnHold().local ? session.unhold() : session.hold();
        if (!ok) callStatus('Aguarde a negociação da chamada e tente novamente.');
    };
    $('play').onclick = () => { unlockAudio(); playRemote(); };
    '123456789*0#'.split('').forEach(digit => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = digit;
        button.setAttribute('data-i18n-aria', 'Tecla ' + digit);
        button.setAttribute('aria-label', t('Tecla ' + digit));
        button.onclick = () => {
            if (session && session.isEstablished()) {
                try { session.sendDTMF(digit, { transportType: 'RFC2833' }); } catch (_) { callStatus('Não foi possível enviar DTMF.'); }
            } else $('destination').value += digit;
        };
        $('keypad').appendChild(button);
    });
    window.addEventListener('pagehide', () => { if (ua) $('disconnect').click(); });
    if (window.opener) {
        const receiveAccount = event => {
            if (event.origin !== window.location.origin || event.source !== window.opener || !event.data || event.data.type !== 'mbilling-webphone-account') return;
            if (!ua) {
                const account = JsSIP.URI.parse(String(event.data.uri || ''));
                if (!account || !account.user) return;
                try { $('authUser').value = decodeURIComponent(account.user); } catch (_) { return; }
                $('uri').value = 'sip:' + encodeURIComponent($('authUser').value) + '@' + window.location.hostname;
                $('password').value = String(event.data.password || '');
                clearTimeout(restoreTimer);
                status('Conta carregada. Clique em Conectar.');
                if ($('password').value) connect();
            }
            window.removeEventListener('message', receiveAccount);
        };
        window.addEventListener('message', receiveAccount);
        window.opener.postMessage({ type: 'mbilling-webphone-ready' }, window.location.origin);
    }
    render();
    // Give the selected panel account precedence over a previous saved account.
    if (window.opener) restoreTimer = setTimeout(restoreAccount, 2000);
    else restoreAccount();
})();
