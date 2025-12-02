
.. _diddestination-id-did:

DID
---

| Selecione o DID para criar o novo destino.




.. _diddestination-id-user:

Usuário
--------

| Usuário que será o dono deste DID.




.. _diddestination-activated:

Status
------

| Somente destinos ativos serão usados.




.. _diddestination-priority:

Prioridade
----------

| Você pode criar até 5 destino para o mesmo DID. Se a chamada não completa no 1º tenta o 2º, até completar. .




.. _diddestination-voip-call:

Tipo
----

| Tipo de destinos. Esta opção vai redirecionar a chamada para o destino selecionado conforme o tipo escolhido.




.. _diddestination-destination:

Destino
-------

| Usado para seu controle interno.




.. _diddestination-id-ivr:

URA
---

| Selecione uma URA para enviar a chamada, a URA precisa ser do mesmo usuário dono do DID.




.. _diddestination-id-queue:

Fila de espera
--------------

| Selecione uma fila de espera para enviar a chamada, a fila de espera precisa ser do mesmo usuário dono do DID.




.. _diddestination-id-sip:

Conta SIP
---------

| Selecione uma conta SIP para enviar a chamada, a conta SIP precisa ser do mesmo usuário dono do DID.




.. _diddestination-context:

Contexto
--------

| Nesta opção poderá ser usado um contexto no formato aceito pelo Asterisk
| Como por exemplo:
| 
| _X. => 1,Dial(SIP/contavoip,45)
|     same => n,Goto(s-\${DIALSTATUS},1)
| 
| 
| exten => s-NOANSWER,1,Hangup
| exten => s-CONGESTION,1,Congestion
| exten => s-CANCEL,1,Hangup
| exten => s-BUSY,1,Busy
| exten => s-CHANUNAVAIL,1,SetCallerId(4545454545)
| exten => s-CHANUNAVAIL,2,Dial(SIP/contavoip2,,T)
| 
| 
| NÃO deve ser colocado o nome para o context, pois o nome do contexto será [did-numero-do-did]
| 
| Você pode verificar o contexto no arquivo /etc/asterisk/extensions_magnus_did.conf
| 
| 
|     .



