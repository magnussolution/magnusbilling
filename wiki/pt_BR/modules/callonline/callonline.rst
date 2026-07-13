
.. _callOnLine-idUserusername:

Usuário
--------

| Usuário principal da conta SIP que iniciou a chamada.




.. _callOnLine-sip-account:

Conta SIP
---------

| Conta SIP que solicitou a chamada.




.. _callOnLine-idUsercredit:

Crédito
--------

| Crédito do usuário.




.. _callOnLine-ndiscado:

Número
-------

| Número no formato que o usuário discou.




.. _callOnLine-codec:

Codec
-----

| Codec usado na chamada.




.. _callOnLine-callerid:

CallerID
--------

| Número enviado para o tronco como identificador de chamada.
| 
| Caso o tronco aceite o envio de callerid, então este número será usado como identificador de chamada.
| 
| Você pode confirmar este valor no campo abaixo onde mostra o resultado do comando core show channel, no valor [Caller ID] => 3341185338
| Para funcionar é necessário deixar o campo Fromuser no tronco em branco.




.. _callOnLine-tronco:

Tronco
------

| Tronco que foi utilizado para completar a chamada.




.. _callOnLine-reinvite:

Reinvite
--------

| Reinvite informa se o áudio está passando pelo Asterisk ou diretamente entre o cliente e o tronco. Você pode ver mais detalhes no link `https://wiki.magnusbilling.org/pt_BR/source/asterisk_options/directmedia.html.  <https://wiki.magnusbilling.org/pt_BR/source/asterisk_options/directmedia.html.>`_.




.. _callOnLine-from-ip:

From IP
-------

| IP do terminal SIP que iniciou a chamada.




.. _callOnLine-description:

Descrição
-----------

| Dados do comando sip show channel.



