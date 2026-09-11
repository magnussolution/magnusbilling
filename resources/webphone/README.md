# Webphone do MBilling 8

Na lista SIP, selecione uma conta com WebRTC = yes e clique em Webphone.
O telefone abre em janela própria. O usuário e a senha já autorizados pelo painel
são enviados por postMessage com validação da origem e da janela. Não são gravados em URL. Após registro bem-sucedido, usuário e senha são salvos
no localStorage deste domínio, conforme solicitado, para conectar automaticamente
ao recarregar. Desconectar preserva os dados salvos. O endereço SIP e o servidor WSS são definidos automaticamente pelo domínio da página
e ficam ocultos. No acesso direto, informe somente usuário SIP e senha e clique em Conectar. Permita o microfone ao ligar/atender.

Recursos: registro, chamadas de entrada e saída, DTMF RTP, mudo, espera, uma chamada
por janela, resposta 486 para chamada concorrente, reconexão de sinalização,
STUN/TURN configuráveis e botão de liberação do áudio bloqueado por autoplay.
A reconexão de sinalização não recupera uma chamada perdida.

## Requisitos do servidor

- HTTPS e WSS com certificados confiáveis.
- Listener WebSocket do Asterisk e transporte PJSIP WSS ou proxy SIP compatível.
  Exemplo de endereço: wss://pbx.exemplo.com:8089/ws.
- WebRTC habilitado na conta SIP. O gerador existente já emite webrtc=yes e
  dtls_auto_generate_cert=yes, mas não configura o listener WSS.
- ICE, DTLS-SRTP, RTCP mux, codecs Opus e/ou G.711 alaw/ulaw; DTMF RFC4733/RFC2833.
- NAT/firewall configurados e TURN quando necessário. Não há STUN público implícito.
- Verificar max_contacts se outro aparelho utilizar a mesma conta.

Nenhuma configuração do servidor é alterada automaticamente pelo webphone.

## Validação

Destinado às versões atuais de Firefox, Safari e Chrome, usando APIs WebRTC padrão
e webrtc-adapter. Safari/iOS pode suspender páginas em segundo plano ou com a tela
bloqueada; não há recebimento por push. Mantenha a janela aberta para receber.

Testes locais: node --test resources/webphone/phone.test.cjs

Ainda é necessário validar em cada navegador com servidor/conta de teste:
registro; chamadas de entrada, saída e recusa; áudio bidirecional; DTMF em URA;
mudo; espera/retomada; desligamento local e remoto; recusa de microfone;
interrupção WSS; TURN entre redes distintas. Não confundir testes locais de estado
com homologação de mídia nos navegadores.

## Dependências

JsSIP 3.13.8 (MIT), publicado no npm em maio de 2026, e webrtc-adapter 9.0.6
(BSD-3-Clause). Bundle local sem CDN em runtime; versões fixadas no package-lock.

- https://github.com/versatica/JsSIP
- https://github.com/versatica/JsSIP/blob/master/CHANGELOG.md
- https://github.com/webrtcHacks/adapter

Na pasta resources/webphone, executar npm ci e npm run build para reconstruir.
Preservar licenças. Remover node_modules antes da distribuição: o build copia
resources inteiro. A integração altera classic/, portanto requer build completo
conforme AGENTS.md.

## Teste no servidor em 2026-09-09

URL: https://webphone.magnusbilling.org/painel/resources/webphone/index.html
WSS: wss://webphone.magnusbilling.org:8089/ws

Certificados HTTPS/WSS validados, handshake WebSocket SIP com resposta 101,
registro da conta de teste confirmado no navegador e no Asterisk e chamada
interna recebida. O teste não confirmou estabelecimento de mídia/áudio.
A sessão de teste foi desconectada ao terminar. Nenhuma chamada externa foi feita.

O servidor WSS usa o hostname da página e a porta 8089. O endereço SIP combina
o usuário informado com esse hostname. Ambos os campos ficam ocultos.

## Idioma

O webphone segue a chave lang do localStorage usada pelo painel MagnusBilling
na mesma origem. Suporta pt_BR, en, es, fr, de, it, pl e ru. Uma mudança no painel
é aplicada também à janela do telefone. Sem preferência salva, usa o idioma da
janela de origem ou do navegador; idiomas não suportados usam inglês.

Testes: node --test resources/webphone/phone.test.cjs resources/webphone/i18n.test.cjs

## Rota e organização

A página é servida por index.php/webphone. WebphoneController estende CController
para expor somente a página, sem herdar ações CRUD. A autenticação continua sendo
feita diretamente no SIP; o controller não recebe nem consulta senhas SIP.
O HTML está em protected/views/webphone/index.php. JS, CSS e bibliotecas continuam
em resources/webphone. O index.html antigo apenas redireciona para a nova rota.
O botão da lista SIP usa a nova rota. O localStorage é preservado na mesma origem.
Para distribuir o telefone, incluir o controller, a view e os assets.

## Validação ao abrir pelo painel

O botão traduzido com t() exige HTTPS, domínio DNS e WebRTC habilitado na conta.
Antes de enviar a conta à janela, consulta index.php/webphone/check, que exige
sessão do painel e permissão de leitura do módulo SIP. A consulta verifica via
AMI os módulos res_http_websocket e res_pjsip_transport_websocket, o listener
HTTPS na porta 8089 e o endpoint /ws. Não retorna configuração bruta ou segredos.
O navegador também testa WSS para detectar certificado inválido ou porta inacessível.
A integração do painel requer rebuild completo porque altera classic/.
