
.. _sip-id-user:

Usuário
--------

| Usuário ao qual esta conta SIP está vinculada.




.. _sip-defaultuser:

Conta SIP
---------

| Usuário que será usado para logar nos softphones ou qualquer dispositivo SIP.




.. _sip-secret:

Senha SIP
---------

| Senha que será usado para logar nos softphones ou qualquer dispositivo SIP.




.. _sip-callerid:

CallerID
--------

| Este é o CallerID que será mostrado no destino, em chamadas externas o provedor precisa permitir CLI para que seja identificado corretamente no destino.




.. _sip-alias:

Alias
-----

| Alias é um número para facilitar a discagem, pode colocar qualquer número. Pode repetir os mesmos números para contas diferente.




.. _sip-disallow:

Disallow
--------

| Nesta opção é possível desativar codecs. Use all para desativar todos os codecs e deixar disponível para o usuário somente os que você selecionar abaixo.




.. _sip-allow:

Codec
-----

| Selecione os codecs que o tronco aceita.




.. _sip-host:

Host
----

| Dynamic é a opção para deixar o usuário registrar sua conta em qualquer IP. Se você deseja autenticar o usuário por IP, coloque aqui o IP do cliente, deixe a senha em branco e coloque insecure para port/invite na TAB Informaçōes Adicionais.




.. _sip-sip-group:

Grupo
-----

| Quando enviar um chamada de um DID, ou campanha para um grupo, será chamado todas as contas SIP que estiverem no grupo. Você pode criar os grupos com qualquer nome.
| 
| 
| Também usado para capturar chamada com *8, deve ser configurada a opção pickupexten = *8  no arquivo feature.conf.
| .




.. _sip-videosupport:

Suporte a vídeo
----------------

| Ativa chamadas de vídeo.




.. _sip-block-call-reg:

REGEX para bloqueio de chamadas
-------------------------------

| Bloquear chamadas usando REGEX. Para bloquear chamadas para celular é so colocar ^55\\d\\d9. Você pode ver mais detalhes no link `https://regex101.com.  <https://regex101.com.>`_.




.. _sip-record-call:

Gravar chamadas
---------------

| Grava as chamadas saintes desta conta SIP.




.. _sip-techprefix:

Tech prefix
-----------

| Opção útil para quando for necessário autenticar mais de um cliente via IP que usa o mesmo IP. Comum em BBX multi tenant.




.. _sip-description:

Descrição
-----------

| Descrição




.. _sip-nat:

NAT
---

| O cliente está atrás de NAT. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _sip-directmedia:

Directmedia
-----------

| Se ativado, Asterisk vai tentar enviar a mídia RTP direto entre seu cliente e seu provedor. Precisa ativar no tronco também. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-canreinvite/.  <https://www.voip-info.org/asterisk-sip-canreinvite/.>`_.




.. _sip-qualify:

Qualify
-------

| Enviar pacote OPTION para verificar se o usuário está online.
| Sintaxe:
| 
| qualify = xxx | no | yes
| 
| onde XXX é o número de milissegundos usados. Se sim, o tempo configurado no sip.conf é usado, padrão é usado 2 segundos.
| 
| Se você ativar o qualify, o Asterisk enviará um comando OPTION o SIP peer regularmente para verificar se o dispositivo ainda está online. 
| Se o dispositivo não responder o OPTION dentro do período configurado (ou padrão) (em ms), o Asterisk considera o dispositivo off-line para chamadas futuras.
| 
| Este status pode ser verificado pela função sip show peer XXXX, esta função somente fornecerá informações de status para SIP peer que possuem qualify = yes.




.. _sip-id-trunk-group:

Grupo de Troncos
----------------

| ::::::ATENÇÃO::::::. Selecionando um grupo de tronco aqui, será ignorado o grupo de tronco das tarifas e sempre será usado este grupo de tronco. Somente selecione um grupo de troncos aqui se você realmente desaja que todas as chamadas desta conta SIP sejam enviadas para este grupo de troncos




.. _sip-context:

Contexto
--------

| Este é o contexto que a chamada será processada, por padrão é billing. Somente alterar se tiver conhecimento sobre Asterisk.




.. _sip-dtmfmode:

Dtmfmode
--------

| Tipo de DTMF. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-dtmfmode/.  <https://www.voip-info.org/asterisk-sip-dtmfmode/.>`_.




.. _sip-insecure:

Insecure
--------

| Se o host estiver dynamic está opção precisa estar como NO, para o IP authentication alterar para port,invite.




.. _sip-deny:

Deny
----

| Você pode limitar o tráfego SIP de um determinado IP ou rede.




.. _sip-permit:

Permit
------

| Você pode permitir o tráfego SIP de um determinado IP ou rede.




.. _sip-type:

Tipo
----

| Tipo padrão é friend, ou seja pode fazer e receber chamadas. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _sip-allowtransfer:

Permitir transferência
-----------------------

| Permite esta conta VOIP fazer transferência. O código para transferência é *2 + ramal. É necessário ativar a opção atxfer => *2 no arquivo features.conf do Asterisk.




.. _sip-ringfalse:

Ring falso
----------

| Ativa ring falso. Adiciona rR do comando Dial.




.. _sip-calllimit:

Limite de chamada
-----------------

| Total de chamadas simultâneas permitida para esta conta SIP.




.. _sip-mohsuggest:

MOH
---

| Música de espera para esta conta SIP.




.. _sip-url-events:

URL notificaçōes de eventos
-----------------------------

| .




.. _sip-addparameter:

Adicionar parâmetro
--------------------

| Os parâmetros colocado aqui irão substituir os parâmetros padrão do sistema, e também os do tronco, caso houver.




.. _sip-amd:

AMD
---

| .




.. _sip-type-forward:

Tipo de encaminhamento
----------------------

| Tipo de destino do reenvio. Este reenvio não funciona em fila de espera.




.. _sip-id-ivr:

URA
---

| Selecione a URA que deseja enviar para as chamadas caso a conta SIP não atender.




.. _sip-id-queue:

Fila de espera
--------------

| Selecione a fila de espera que deseja enviar para as chamadas caso a conta SIP não atender.




.. _sip-id-sip:

Conta SIP
---------

| Selecione a conta SIP que deseja enviar para as chamadas caso a conta SIP não atender.




.. _sip-extension:

Destino
-------

| Clique para mais detalhes
| Temos três opcōes, conforme o tipo selecionado, grupo, número ou personalizado.
| 
| * Grupo, o nome do grupo colocado aqui, deve ser exatamente o mesmo do grupo das contas SIP que deseja receber as chamadas, vai chamar todas as contas SIP do grupo. 
| * Personalizado, é possível a execução de qualquer opção válida do comando DIAL do Asterisk, exemplo: SIP/contaSIP,45,tTr
| * Número, pode ser um número fixo ou celular, deve estar no formato 55 DDD número.
| .




.. _sip-dial-timeout:

Tocar por quantos seg.
----------------------

| Tempo em segundos que será aguardado para atender a chamada. Após este tempo será executado o encaminhamento caso for configurado.




.. _sip-voicemail:

Habilitar voicemail
-------------------

| Ativar voicemail. É necessário a configuração do SMTP no Linux para receber o email com a mensagem. Você pode ver mais detalhes no link `https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no-asterisk.html.  <https://www.magnusbilling.org/br/blog-br/9-novidades/25-configurar-ssmtp-para-enviar-voicemail-no-asterisk.html.>`_.




.. _sip-voicemail-email:

Email
-----

| Email que será enviado o email com a gravação.




.. _sip-voicemail-password:

Senha
-----

| Senha do VOICEMAIL. É possível entrar no VOICEMAIL digitando *111.




.. _sip-sip-config:

Parâmetros
-----------

| Nós ainda não escrevemos a descrição deste campo.




.. _sip-sipshowpeer:

Peer
----

| sip show peer.




.. _sip-cnl:

Zona CNL
--------

| Nós ainda não escrevemos a descrição deste campo.



