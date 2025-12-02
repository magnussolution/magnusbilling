
.. _trunk-id-provider:

Provedor
--------

| Provedor ao qual este tronco pertence.




.. _trunk-trunkcode:

Nome
----

| Nome para o tronco, deve ser único.




.. _trunk-user:

Usuário
--------

| Somente coloque usuário se seu tronco for autenticado por usuário e senha.




.. _trunk-secret:

Senha
-----

| Somente coloque senha se seu tronco for autenticado por usuário e senha.




.. _trunk-host:

Host
----

| IP ou Domínio do tronco.




.. _trunk-trunkprefix:

Adicionar prefixo
-----------------

| Adiciona um prefixo no inicio do número to enviar para o tronco. Também usado para quando você precisa enviar um techprefix. EX: Se você tem que enviar o número no formato 0DDD número, coloque aqui 0 e no campo abaixo 55. Isso vai remover o 55 e adiconar o 0 .




.. _trunk-removeprefix:

Remover prefixo
---------------

| Remove este prefixo do número.




.. _trunk-allow:

Codec
-----

| Selecione os codecs que o tronco aceita.




.. _trunk-providertech:

Tipo sinalização
------------------

| Protocolo do tronco. Alguns protocolos como Dahdi, Dongle, DGV, khomp, precisam ser instalado no Asterisk antes de usar.




.. _trunk-status:

Status
------

| Se o tronco for inativado, Magnusbilling enviara a chamada para o tronco backup.




.. _trunk-allow-error:

Enviar para backup se 404
-------------------------

| Envia a chamada para o próximo tronco  se receber error 404.




.. _trunk-register:

Registrar tronco
----------------

| Somente ative se seu tronco for por usuário e senha.




.. _trunk-register-string:

Linha de registro
-----------------

| <usuario>:<senha>@<host>/contact.
| usuário é a id de usuário para este servidor SIP (ex 2345).
| senha é a senha do usuário.
| host é o domínio ou nome do host do servidor SIP.
| port envia a solicitação de registro para esta porta no host. Padrões para 5060
| contact é a extensão de contato do Asterisk. Exemplo 1234 é colocado no cabeçalho do contato na mensagem de registro SIP. O ramal de contato é usado pelo servidor SIP remoto quando ele precisa enviar uma chamada para o Asterisk.
| 
| .




.. _trunk-fromuser:

Fromuser
--------

| Muitos provedores exigem esta opção para autenticar, principalmente quando é autenticado via USER/SENHA. Deixe em branco para enviar o CallerID da conta SIP no From.




.. _trunk-fromdomain:

Fromdomain
----------

| Define o domínio no FROM: nas mensagens SIP ao atuar como um SIP UAC (cliente).




.. _trunk-language:

Idioma
------

| Idioma padrão usado para qualquer Playback()/Background().




.. _trunk-context:

Contexto
--------

| Somente altere se você souber o que está fazendo.




.. _trunk-dtmfmode:

Dtmfmode
--------

| Tipo de DTMF. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-dtmf/.  <https://www.voip-info.org/asterisk-dtmf/.>`_.




.. _trunk-insecure:

Insecure
--------

| Insecure. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-insecure/.  <https://www.voip-info.org/asterisk-sip-insecure/.>`_.




.. _trunk-maxuse:

Limite de chamadas
------------------

| Número máximo de chamadas simultâneas para este tronco.




.. _trunk-nat:

NAT
---

| O tronco está atrás de NAT. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-nat/.  <https://www.voip-info.org/asterisk-sip-nat/.>`_.




.. _trunk-directmedia:

Directmedia
-----------

| Se ativado, Asterisk vai tentar enviar a mídia RTP direto entre seu cliente e seu provedor. Precisa ativar no tronco também. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-canreinvite/.  <https://www.voip-info.org/asterisk-sip-canreinvite/.>`_.




.. _trunk-qualify:

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
| .




.. _trunk-type:

Tipo
----

| Tipo padrão é friend, ou seja pode fazer e receber chamadas. Você pode ver mais detalhes no link `https://www.voip-info.org/asterisk-sip-type/.  <https://www.voip-info.org/asterisk-sip-type/.>`_.




.. _trunk-disallow:

Disallow
--------

| Nesta opção é possível desativar codecs. Use all para desativar todos os codecs e deixar disponível para o usuário somente os que você selecionar abaixo.




.. _trunk-sendrpid:

Sendrpid
--------

| Define se um cabeçalho SIP Remote-Party-ID deve ser enviado.
| O padrão é não.
| 
| Este campo é frequentemente usado por provedores VoIP de atacado para fornecer a identidade do chamador, independentemente das configurações de privacidade (o From SIP header).




.. _trunk-addparameter:

Adicionar parâmetro
--------------------

| Estes parâmetros serão adicionados no final do comando AGI - Comando Dial, que está no menu configurações ajustes.
| Por padrão o comando DIAL é:
| ,60,L(%timeout%:61000:30000)
| 
| Digamos que queira adicionar um MACRO no tronco, estão neste campo, adicionar parâmetro, só colocar M(nome_do_macro) e criar seu MACRO nos extensions do Asterisk.
|     .




.. _trunk-port:

Porta
-----

| Porta do tronco. Se você precisar usar outra porta diferente da 5060, lembre-se de liberar a porta no IPTABLES.




.. _trunk-link-sms:

Link SMS
--------

| URL para enviar SMS. Substituir o número por %number% e o texto por %text%. EX. a URL enviada pelo seu provedor de SMS é http://trunkWebSite.com.br/sendsms.php?usuário=magnus&senha=billing&numero=XXXXXX&texto=SSSSSSSSSSS. altere XXXXXX per %number% e SSSSSSSSSSS por %text% .




.. _trunk-sms-res:

SMS Resposta esperada
---------------------

| Deixe em branco para não aguardar resposta do provedor. Ou coloque o texto que deve constar na resposta do provedor para ser considerado ENVIADO.




.. _trunk-sip-config:

Parâmetros
-----------

| Formato válido no Asterisk sip.conf, uma opção por linha.
| Exemplo, digamos que você precise colocar o parâmetro useragent então coloque neste campo:
| 
| useragent=meu agente
| 
| .




.. _trunk-cnl:

Ativar CNL
----------

| Nós ainda não escrevemos a descrição deste campo.



